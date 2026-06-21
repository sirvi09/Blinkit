import { pool } from "../config/connectDB.js"

export const createCategory = async (name,image) => {

    const result = await pool.query(
        "INSERT INTO categories (name,image) VALUES ($1,$2) RETURNING *",
        [name,image]
    )

    return result.rows[0]
}


export const getAllCategories = async () => {

    const result = await pool.query(
        "SELECT * FROM categories ORDER BY id ASC"
    )

    return result.rows
}


export const getCategoryById = async (id) => {

    const result = await pool.query(
        "SELECT * FROM categories WHERE id = $1",
        [id]
    )

    return result.rows[0]
}


export const updateCategory = async (id,name,image) => {

    const result = await pool.query(
        "UPDATE categories SET name = $1, image = $2, updated_at = NOW() WHERE id = $3 RETURNING *",
        [name,image,id]
    )

    return result.rows[0]
}