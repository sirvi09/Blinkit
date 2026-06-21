import { pool } from "../config/connectDB.js";

export const addToCartItemController = async (req, res) => {
  try {

    const userId = req.userId;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        message: "Provide productId",
        error: true,
        success: false,
      });
    }

    const checkItemCart = await pool.query(
      `
      SELECT *
      FROM cart_items
      WHERE user_id = $1
      AND product_id = $2
      `,
      [userId, productId]
    );

    if (checkItemCart.rows.length > 0) {
      return res.status(400).json({
        message: "Item already in cart",
        error: true,
        success: false,
      });
    }

    const result = await pool.query(
      `
      INSERT INTO cart_items
      (user_id, product_id, quantity)
      VALUES ($1,$2,$3)
      RETURNING *
      `,
      [userId, productId, 1]
    );

    return res.json({
      data: result.rows[0],
      message: "Item add successfully",
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

export const getCartItemController = async (req, res) => {
  try {

    const userId = req.userId;

    const result = await pool.query(
      `
      SELECT
        c.id,
        c.quantity,

        json_build_object(
          'id', p.id,
          'name', p.name,
          'price', p.price,
          'discount', p.discount,
          'stock', p.stock,
          'unit', p.unit,
          'image',
          (
            SELECT COALESCE(
              json_agg(image_url),
              '[]'
            )
            FROM product_images
            WHERE product_id = p.id
          )
        ) AS "productId"

      FROM cart_items c
      JOIN products p
        ON p.id = c.product_id
      WHERE c.user_id = $1
      `,
      [userId]
    );

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

export const updateCartItemQtyController = async (req, res) => {
  try {

    const userId = req.userId;

    const { id, qty } = req.body;

    if (!id || !qty) {
      return res.status(400).json({
        message: "Provide id and qty",
        error: true,
        success: false,
      });
    }

    const result = await pool.query(
      `
      UPDATE cart_items
      SET quantity = $1
      WHERE id = $2
      AND user_id = $3
      RETURNING *
      `,
      [qty, id, userId]
    );

    return res.json({
      message: "Update cart",
      success: true,
      error: false,
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

export const deleteCartItemQtyController = async (req, res) => {
  try {

    const userId = req.userId;

    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        message: "Provide id",
        error: true,
        success: false,
      });
    }

    await pool.query(
      `
      DELETE FROM cart_items
      WHERE id = $1
      AND user_id = $2
      `,
      [id, userId]
    );

    return res.json({
      message: "Item remove",
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

