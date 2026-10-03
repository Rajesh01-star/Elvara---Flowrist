import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env" });

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  console.log("Creating testimonials table if not exists...");
  await sql`
    CREATE TABLE IF NOT EXISTS testimonials (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      author text NOT NULL,
      location text,
      quote text NOT NULL,
      rating integer NOT NULL DEFAULT 5,
      is_approved boolean NOT NULL DEFAULT true,
      order_index integer NOT NULL DEFAULT 0,
      created_at timestamp DEFAULT now() NOT NULL,
      updated_at timestamp DEFAULT now() NOT NULL
    );
  `;

  // Check if any exist
  const existing = await sql`SELECT count(*) as count FROM testimonials;`;
  const count = parseInt(existing[0].count, 10);
  console.log(`Current testimonials count: ${count}`);

  if (count === 0) {
    console.log("Seeding initial testimonials...");
    await sql`
      INSERT INTO testimonials (author, location, quote, rating, order_index)
      VALUES 
      (
        'Elena & Marcus',
        'Jubilee Hills, Hyderabad',
        'Elvara provided the florals for our wedding celebration. Guests are still talking about the scent of the garden roses and the sculptural tablescape. Truly unforgettable.',
        5,
        1
      ),
      (
        'Claire D.',
        'Madhapur, Hyderabad',
        'The Saturday floral masterclass was peaceful, inspiring, and so thorough. Learning foam-free mechanics at the Madhapur atelier was the highlight of my month.',
        5,
        2
      ),
      (
        'Julian Hayes',
        'Banjara Hills, Hyderabad',
        'I ordered the Autumn Peony bouquet for my anniversary. The white-glove delivery arrived precisely on time in flawless condition. The blooms lasted almost two weeks!',
        5,
        3
      );
    `;
    console.log("Initial testimonials successfully seeded!");
  }

  console.log("Testimonials setup complete!");
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
