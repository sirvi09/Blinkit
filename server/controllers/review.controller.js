import { pool } from "../config/connectDB.js";

export const addReviewController = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId, rating, comment } = req.body;

    if (!productId || !rating) {
      return res.status(400).json({
        message: "Provide productId and rating",
        error: true,
        success: false,
      });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).json({
            message: "Rating must be between 1 and 5",
            error: true,
            success: false,
        });
    }

    // Insert or update (upsert)
    const query = `
      INSERT INTO reviews (product_id, user_id, rating, comment)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (product_id, user_id) 
      DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment, created_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    const result = await pool.query(query, [productId, userId, rating, comment || ""]);

    return res.json({
      message: "Review submitted successfully",
      data: result.rows[0],
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export const getProductReviewsController = async (req, res) => {
  try {
    const { productId } = req.params;

    const query = `
      SELECT r.id, r.rating, r.comment, r.created_at, u.name, u.avatar
      FROM reviews r
      JOIN users u ON u.id = r.user_id
      WHERE r.product_id = $1
      ORDER BY r.created_at DESC;
    `;
    const result = await pool.query(query, [productId]);

    return res.json({
      data: result.rows,
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};
