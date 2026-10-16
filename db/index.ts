// One database client for the whole app.
// neon-serverless (WebSockets) is used instead of neon-http because the
// ledger needs interactive transactions: db.transaction(async (tx) => { ... }).
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "./schema";
import * as authSchema from "./auth-schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Run: npm run doctor");
}

export const db = drizzle({
  connection: process.env.DATABASE_URL,
  ws,
  schema: { ...schema, ...authSchema },
});
