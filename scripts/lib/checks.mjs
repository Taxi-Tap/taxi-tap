// Shared checks used by `npm run setup` and `npm run doctor`.
// Plain Node (no extra packages needed to run the checks themselves),
// so it works on Windows, macOS and Linux the same way.

import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

export const ROOT = process.cwd();
const p = (...parts) => path.join(ROOT, ...parts);

const useColour = process.stdout.isTTY && !process.env.NO_COLOR;
const c = (code) => (s) => (useColour ? `\x1b[${code}m${s}\x1b[0m` : s);
export const green = c(32);
export const red = c(31);
export const yellow = c(33);
export const bold = c(1);

export const ok = (msg) => console.log(`  ${green("✔")} ${msg}`);
export const warn = (msg, fix) =>
  console.log(`  ${yellow("!")} ${msg}${fix ? `\n      ${yellow("→")} ${fix}` : ""}`);
export const fail = (msg, fix) =>
  console.log(`  ${red("✖")} ${msg}${fix ? `\n      ${red("→")} ${fix}` : ""}`);

/** Parse KEY=value lines. Returns { KEY: { value, optional } }. */
export function parseEnvFile(file) {
  const out = {};
  if (!existsSync(file)) return out;
  for (const raw of readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    const optional = /#\s*optional\s*$/i.test(value);
    value = value.replace(/\s+#.*$/, "").replace(/^['"]|['"]$/g, "");
    out[key] = { value, optional };
  }
  return out;
}

/** Keys marked "# optional" on the comment line just above them in .env.example. */
function optionalKeysFromExample(file) {
  const optional = new Set();
  if (!existsSync(file)) return optional;
  const lines = readFileSync(file, "utf8").split(/\r?\n/);
  lines.forEach((line, i) => {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=/);
    if (m && i > 0 && /#.*optional/i.test(lines[i - 1])) optional.add(m[1]);
  });
  return optional;
}

export function checkNode() {
  const wanted = existsSync(p(".nvmrc")) ? readFileSync(p(".nvmrc"), "utf8").trim() : null;
  const have = process.versions.node;
  if (!wanted) {
    warn(`Node ${have} (no .nvmrc to compare against)`);
    return true;
  }
  const wantMajor = wanted.replace(/^v/, "").split(".")[0];
  const haveMajor = have.split(".")[0];
  if (wantMajor === haveMajor) {
    ok(`Node ${have} matches .nvmrc (${wanted})`);
    return true;
  }
  fail(
    `Node ${have}, but the project uses Node ${wanted}`,
    `Install Node ${wanted} LTS (nodejs.org or nvm / nvm-windows), then open a new terminal`,
  );
  return false;
}

export function checkLockfile() {
  if (existsSync(p("package-lock.json"))) {
    ok("package-lock.json present (everyone gets the same package versions)");
    return true;
  }
  fail("package-lock.json missing", "Pull the latest main branch; never delete the lockfile");
  return false;
}

export function checkInstalled() {
  if (existsSync(p("node_modules"))) {
    ok("Packages installed");
    return true;
  }
  fail("Packages not installed", "Run: npm run setup");
  return false;
}

export function checkEnv() {
  const examplePath = p(".env.example");
  const localPath = p(".env.local");
  if (!existsSync(localPath)) {
    fail(".env.local not found", "Copy .env.example to .env.local and fill in your values");
    return false;
  }
  const example = parseEnvFile(examplePath);
  const local = parseEnvFile(localPath);
  const optional = optionalKeysFromExample(examplePath);
  let good = true;
  for (const key of Object.keys(example)) {
    const v = local[key]?.value;
    if (v) continue;
    if (optional.has(key)) warn(`${key} is empty (optional)`);
    else {
      fail(`${key} is missing in .env.local`, "Ask the owner listed in .env.example for the value");
      good = false;
    }
  }
  const url = local.DATABASE_URL?.value;
  if (url && !/^postgres(ql)?:\/\//.test(url)) {
    fail("DATABASE_URL does not look like a Postgres URL", "Copy the full string from the Neon console");
    good = false;
  } else if (url && !/sslmode=require/.test(url)) {
    warn("DATABASE_URL has no sslmode=require", "Neon needs SSL; add ?sslmode=require to the end");
  }
  if (good) ok("All required variables in .env.local are set");
  return good;
}

/** Load .env.local into process.env (Node 20.12+ / 22). */
export function loadEnvLocal() {
  if (existsSync(p(".env.local")) && typeof process.loadEnvFile === "function") {
    process.loadEnvFile(p(".env.local"));
  }
}

export async function checkDatabase() {
  loadEnvLocal();
  const url = process.env.DATABASE_URL;
  if (!url) {
    fail("Cannot test the database: DATABASE_URL is not set");
    return false;
  }
  let neon, ws;
  try {
    neon = await import("@neondatabase/serverless");
    ws = (await import("ws")).default;
  } catch {
    fail("Database driver not installed", "Run: npm run setup");
    return false;
  }
  neon.neonConfig.webSocketConstructor = ws;
  const pool = new neon.Pool({ connectionString: url });
  const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error("timed out after 15 s")), 15000));
  try {
    const res = await Promise.race([
      pool.query("select current_database() as db, version() as v"),
      timeout,
    ]);
    const row = res.rows[0];
    ok(`Connected to Neon database "${row.db}" (${String(row.v).split(" ").slice(0, 2).join(" ")})`);
    return true;
  } catch (err) {
    fail(
      `Could not connect to the database: ${err.message}`,
      "Check DATABASE_URL, your internet connection, and that your Neon branch is not deleted",
    );
    return false;
  } finally {
    pool.end().catch(() => {});
  }
}

export function hasScript(name) {
  try {
    const pkg = JSON.parse(readFileSync(p("package.json"), "utf8"));
    return Boolean(pkg.scripts?.[name]);
  } catch {
    return false;
  }
}

/** Run a command, streaming output. Works on Windows (shell: true). */
export function run(cmd, label) {
  console.log(`\n${bold("›")} ${label ?? cmd}`);
  const r = spawnSync(cmd, { stdio: "inherit", shell: true, cwd: ROOT });
  return r.status === 0;
}
