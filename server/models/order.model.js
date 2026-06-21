import { pool } from "../config/connectDB.js"

export const createOrder = async (orderData) => {

    const {
        user_id,
        order_id,
        product_id,
        product_details,
        payment_id,
        payment_status,
        delivery_address,
        subtotal_amt,
        total_amt,
        invoice_receipt
    } = orderData

    const query = `
        INSERT INTO orders
        (user_id,order_id,product_id,product_details,payment_id,payment_status,delivery_address,subtotal_amt,total_amt,invoice_receipt)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        RETURNING *
    `

    const values = [
        user_id,
        order_id,
        product_id,
        product_details,
        payment_id,
        payment_status,
        delivery_address,
        subtotal_amt,
        total_amt,
        invoice_receipt
    ]

    const result = await pool.query(query, values)

    return result.rows[0]
}


export const getOrdersByUser = async (user_id) => {

    const result = await pool.query(
        "SELECT * FROM orders WHERE user_id = $1",
        [user_id]
    )

    return result.rows
}


export const getOrderById = async (order_id) => {

    const result = await pool.query(
        "SELECT * FROM orders WHERE order_id = $1",
        [order_id]
    )

    return result.rows[0]
}