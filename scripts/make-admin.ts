import { config } from "dotenv";
config({ path: ".env" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { user } from "../db/schema";

if (!process.env.DATABASE_URL) {
  console.error("\n🌿 Elvara Atelier — Admin Access Manager\n" + "=".repeat(45));
  console.error("❌ Error: DATABASE_URL is not set in your .env file.");
  console.log("Please create a .env file with your Neon PostgreSQL connection string:");
  console.log('DATABASE_URL="postgresql://user:password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require"\n');
  process.exit(1);
}

const connectionString = process.env.DATABASE_URL;
const sql = neon(connectionString);
const db = drizzle({ client: sql });

async function main() {
  const args = process.argv.slice(2);
  const isList = args.includes("--list");
  const isRevoke = args.includes("--revoke");
  const email = args.find((a) => !a.startsWith("--"))?.trim().toLowerCase();

  console.log("\n🌿 Elvara Atelier — Admin Access Manager\n" + "=".repeat(45));

  if (isList) {
    console.log("Fetching registered atelier users...\n");
    const users = await db.select({
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
    }).from(user);

    if (users.length === 0) {
      console.log("No registered users found in database.");
      return;
    }

    console.table(
      users.map((u) => ({
        ID: u.id.slice(0, 8) + "...",
        Name: u.name,
        Email: u.email,
        Role: u.isAdmin ? "👑 Admin" : "Customer",
        Registered: u.createdAt ? new Date(u.createdAt).toISOString().split("T")[0] : "N/A",
      }))
    );
    return;
  }

  if (!email) {
    console.error("❌ Error: Missing email address.\n");
    console.log("Usage:");
    console.log("  bun scripts/make-admin.ts <email>          # Grant admin rights");
    console.log("  bun scripts/make-admin.ts <email> --revoke # Revoke admin rights");
    console.log("  bun scripts/make-admin.ts --list           # List all users\n");
    process.exit(1);
  }

  // Find user
  const [existingUser] = await db
    .select()
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  if (!existingUser) {
    console.error(`❌ User not found with email: ${email}`);
    console.log("Tip: Run `bun scripts/make-admin.ts --list` to view all registered users.");
    process.exit(1);
  }

  const targetAdminStatus = !isRevoke;

  await db
    .update(user)
    .set({
      isAdmin: targetAdminStatus,
      updatedAt: new Date(),
    })
    .where(eq(user.id, existingUser.id));

  console.log(`\n✨ Successfully updated permissions!`);
  console.log(`User:   ${existingUser.name} (${existingUser.email})`);
  console.log(`Status: ${targetAdminStatus ? "👑 Granted Atelier Administrator" : "Customer (Admin Privileges Revoked)"}\n`);
}

main().catch((err) => {
  console.error("Execution error:", err);
  process.exit(1);
});
