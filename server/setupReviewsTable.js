import { pool } from "./config/connectDB.js";

async function createReviewsTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(product_id, user_id)
    );
  `;
  try {
    await pool.query(query);
    console.log("Reviews table created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error creating reviews table:", error);
    process.exit(1);
  }
}

createReviewsTable();
