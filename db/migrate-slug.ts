import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DB_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const db = drizzle(pool);

async function migrate() {
  try {
    await pool.query(`
      ALTER TABLE chats 
      ADD COLUMN IF NOT EXISTS slug VARCHAR(100) UNIQUE
    `);
    
    const result = await pool.query(`
      UPDATE chats 
      SET slug = LOWER(REGEXP_REPLACE(
        REGEXP_REPLACE(title, '[^a-zA-Z0-9\\s]', '', 'g'),
        '\\s+', '-', 'g'
      )) || '-' || SUBSTRING(id::text, 1, 8)
      WHERE slug IS NULL
    `);
    
    console.log(`Updated ${result.rowCount} chats with slugs`);
    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await pool.end();
  }
}

migrate();
