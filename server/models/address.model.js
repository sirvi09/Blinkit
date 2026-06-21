import { pool } from "../config/connectDB.js"

export const createAddress = async (addressData) => {

    const {
        user_id,
        address_line,
        city,
        state,
        pincode,
        country,
        mobile,
        status
    } = addressData

    const query = `
        INSERT INTO addresses
        (user_id,address_line,city,state,pincode,country,mobile)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        RETURNING *
    `

    const values = [
        user_id,
        address_line,
        city,
        state,
        pincode,
        country,
        mobile,
        status
    ]

    const result = await pool.query(query, values)

    return result.rows[0]
}


export const getUserAddresses = async (user_id) => {

    const result = await pool.query(
        "SELECT * FROM addresses WHERE user_id = $1",
        [user_id]
    )

    return result.rows
}