import jwt from "jsonwebtoken"
import { pool } from "../config/connectDB.js"

const generatedRefreshToken = async(userId) => {

    const token = jwt.sign(
        { id : userId },
        process.env.SECRET_KEY_REFRESH_TOKEN,
        { expiresIn : '7d' }
    )

    await pool.query(
        "UPDATE users SET refresh_token = $1 WHERE id = $2",
        [token, userId]
    )

    return token
}

export default generatedRefreshToken