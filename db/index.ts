// One database client for the whole app.
// neon-serverless (WebSockets) is used instead of neon-http because the
// ledger needs interactive transactions: db.transaction(async (tx) => { ... }).
import dns from "node:dns";
import net from "node:net";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "./schema";
import * as authSchema from "./auth-schema";

// Node 20+ races IPv6 and IPv4 with a 250 ms timeout. On networks where IPv6
// is slow this randomly fails with ETIMEDOUT when connecting to Neon, so try
// IPv4 first and wait longer per attempt.
dns.setDefaultResultOrder("ipv4first");
net.setDefaultAutoSelectFamilyAttemptTimeout(2000);

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Run: npm run doctor");
}

export const db = drizzle({
  connection: process.env.DATABASE_URL,
  ws,
  schema: { ...schema, ...authSchema },
});
