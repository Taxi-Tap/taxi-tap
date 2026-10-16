// npm run setup
// One command to get a laptop ready: checks Node, installs exact package
// versions, checks .env.local, connects to your Neon branch, applies the
// database migrations and loads the demo data.
//
// Flags:
//   --skip-install   don't run npm ci (faster when packages are already installed)
//   --skip-seed      don't load demo data

import { copyFileSync, existsSync } from "node:fs";
import {
  bold, green, red, yellow,
  checkNode, checkLockfile, checkEnv, checkDatabase, hasScript, run,
} from "./lib/checks.mjs";

const args = new Set(process.argv.slice(2));
const stop = (msg) => {
  console.log(red(bold(`\nSetup stopped: ${msg}\n`)));
  process.exit(1);
};

console.log(bold("\nTaxi Tap setup\n"));

// 1. Node version
if (!checkNode()) stop("wrong Node version");

// 2. Exact packages from the lockfile
if (!checkLockfile()) stop("package-lock.json missing");
if (!args.has("--skip-install")) {
  if (!run("npm ci", "Installing packages (npm ci)")) stop("npm ci failed");
}

// 3. Environment variables
if (!existsSync(".env.local")) {
  copyFileSync(".env.example", ".env.local");
  console.log(
    yellow(`\nCreated .env.local from .env.example. Fill in the empty values, then run npm run setup again.\n`),
  );
  process.exit(1);
}
console.log("");
if (!checkEnv()) stop("fill in the missing values in .env.local");

// 4. Database connection (your own Neon branch)
if (!(await checkDatabase())) stop("cannot reach the database");

// 5. Migrations (the SQL files in /drizzle are the schema script)
if (!run("npm run db:migrate", "Applying database migrations")) stop("migrations failed");

// 6. Demo data
if (!args.has("--skip-seed") && hasScript("db:seed")) {
  if (!run("npm run db:seed", "Loading demo data")) stop("seed failed");
}

console.log(green(bold("\nSetup complete. Start the app with: npm run dev\n")));
