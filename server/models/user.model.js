import { pool } from "../config/connectDB.js"

export const createUser = async (userData) => {
    const {
        name,
        email,
        password,
        avatar = "",
        mobile = null,
        refresh_token = "",
        verify_email = false,
        last_login_date = null,
        status = "Active",
        forget_password_otp = null,
        forget_password_expiry = null,
        role = "USER"
    } = userData

    const query = `
        INSERT INTO users (
            name,
            email,
            password,
            avatar,
            mobile,
            refresh_token,
            verify_email,
            last_login_date,
            status,
            forget_password_otp,
            forget_password_expiry,
            role
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
        RETURNING *
    `

    const values = [
        name,
        email,
        password,
        avatar,
        mobile,
        refresh_token,
        verify_email,
        last_login_date,
        status,
        forget_password_otp,
        forget_password_expiry,
        role
    ]

    const result = await pool.query(query, values)

    return result.rows[0]
}


export const findUserByEmail = async (email) => {

    const result = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
    )

    return result.rows[0]
}


export const findUserById = async (id) => {

    const result = await pool.query(
        "SELECT * FROM users WHERE id = $1",
        [id]
    )

    return result.rows[0]
}