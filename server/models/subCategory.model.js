import { pool } from "../config/connectDB.js"

export const createSubCategory = async (name, image, category_id) => {

    const result = await pool.query(
        "INSERT INTO subcategories (name,image,category_id) VALUES ($1,$2,$3) RETURNING *",
        [name,image,category_id]
    )

    return result.rows[0]
}


export const getAllSubCategories = async () => {

    const result = await pool.query(
        "SELECT * FROM subcategories"
    )

    return result.rows
}


export const getSubCategoryByCategory = async (category_id) => {

    const result = await pool.query(
        "SELECT * FROM subcategories WHERE category_id = $1",
        [category_id]
    )

    return result.rows
}