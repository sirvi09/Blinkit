import { pool } from "../config/connectDB.js";

export const addAddressController = async (req, res) => {
  try {
    const userId = req.userId;

    const {
      address_line,
      city,
      state,
      pincode,
      country,
      mobile,
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO addresses
      (
        user_id,
        address_line,
        city,
        state,
        country,
        pincode,
        mobile
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *
      `,
      [userId, address_line, city, state, country, pincode, mobile]
    );

    return res.json({
      message: "Address Created Successfully",
      error: false,
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export const getAddressController = async (req, res) => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      `
      SELECT *
      FROM addresses
      WHERE user_id = $1
      AND status = 'active'
      ORDER BY created_at DESC
      `,
      [userId]
    );

    return res.json({
      data: result.rows,
      message: "List of address",
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

export const updateAddressController = async (req, res) => {
  try {
    const userId = req.userId;

    const {
      id,
      address_line,
      city,
      state,
      country,
      pincode,
      mobile,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE addresses
      SET
        address_line = $1,
        city = $2,
        state = $3,
        country = $4,
        pincode = $5,
        mobile = $6,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      AND user_id = $8
      RETURNING *
      `,
      [
        address_line,
        city,
        state,
        country,
        pincode,
        mobile,
        id,
        userId,
      ]
    );

    return res.json({
      message: "Address Updated",
      error: false,
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export const deleteAddressController = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.body;

    const result = await pool.query(
      `
      UPDATE addresses
      SET
        status = 'inactive',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      AND user_id = $2
      RETURNING *
      `,
      [id, userId]
    );

    return res.json({
      message: "Address removed",
      error: false,
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};