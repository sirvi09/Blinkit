import { pool } from "../config/connectDB.js";

export const admin = async (req, res, next) => {
  try {

    const userId = req.userId;

    const result = await pool.query(
      `
      SELECT *
      FROM users
      WHERE id = $1
      `,
      [userId]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    if (user.role !== "ADMIN") {
      return res.status(400).json({
        message: "Permission denial",
        error: true,
        success: false,
      });
    }

    next();

  } catch (error) {

    return res.status(500).json({
      message: "Permission denial",
      error: true,
      success: false,
    });

  }
};

