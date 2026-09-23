import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env" });

const connectionString = process.env.DATABASE_URL || "postgresql://user:password@localhost:5432/elvara";
const sql = neon(connectionString);
export const db = drizzle({ client: sql });
