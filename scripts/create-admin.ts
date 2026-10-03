import { config } from "dotenv";
config({ path: ".env" });

import { auth } from "../lib/auth";
import { db } from "../db/drizzle";
import { user } from "../db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const args = process.argv.slice(2);
  const email = args[0]?.trim().toLowerCase();
  const password = args[1];
  const name = args[2] || "Atelier Admin";

  console.log("\n🌿 Elvara Atelier — Admin Account Creator\n" + "=".repeat(45));

  if (!process.env.DATABASE_URL) {
    console.error("❌ Error: DATABASE_URL is not set in your .env file.");
    console.log("Please create a .env file with your Neon PostgreSQL connection string:");
    console.log('DATABASE_URL="postgresql://user:password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require"\n');
    process.exit(1);
  }

  if (!email || !password) {
    console.error("❌ Error: Missing email or password.\n");
    console.log("Usage:");
    console.log('  npm run admin:create <email> <password> "[Full Name]"\n');
    console.log("Example:");
    console.log('  npm run admin:create admin@elvara.com SecretPass123! "Studio Curator"\n');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("❌ Error: Password must be at least 8 characters long.");
    process.exit(1);
  }

  try {
    // 1. Check if user already exists
    const [existing] = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (existing) {
      console.log(`ℹ️  User with email "${email}" already exists.`);
      console.log(`Promoting to Atelier Administrator...`);
      await db
        .update(user)
        .set({ isAdmin: true, updatedAt: new Date() })
        .where(eq(user.id, existing.id));
      console.log(`✅ ${existing.name} (${email}) has been granted Admin privileges!`);
      console.log(`👉 You can log in at http://localhost:3000/admin/login with your existing password.\n`);
      return;
    }

    // 2. Create the user using Better Auth API (hashes password securely)
    console.log(`Creating new account for ${name} (${email})...`);
    const newUser = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });

    if (!newUser || !newUser.user) {
      throw new Error("Failed to create user via authentication engine.");
    }

    // 3. Ensure isAdmin is set to true
    await db
      .update(user)
      .set({ isAdmin: true, updatedAt: new Date() })
      .where(eq(user.id, newUser.user.id));

    console.log(`\n✨ Administrator account created successfully!`);
    console.log(`• Name:     ${name}`);
    console.log(`• Email:    ${email}`);
    console.log(`• Password: (configured as requested)`);
    console.log(`• Role:     👑 Atelier Administrator`);
    console.log(`\n👉 You can now log in at http://localhost:3000/admin/login\n`);
  } catch (err: any) {
    console.error("\n❌ Failed to create administrator:", err?.message || err);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Execution error:", err);
  process.exit(1);
});
