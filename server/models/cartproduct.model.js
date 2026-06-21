import { pool } from "../config/connectDB.js"

export const addToCart = async (user_id, product_id, quantity) => {

    const result = await pool.query(
        "INSERT INTO cart_items (user_id,product_id,quantity) VALUES ($1,$2,$3) RETURNING *",
        [user_id,product_id,quantity]
    )

    return result.rows[0]
}

export const getUserCart = async (user_id) => {

    const result = await pool.query(
        "SELECT * FROM cart_items WHERE user_id = $1",
        [user_id]
    )

    return result.rows
}

export const removeCartItem = async (id) => {

    await pool.query(
        "DELETE FROM cart_items WHERE id = $1",
        [id]
    )
}