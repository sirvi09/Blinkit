import { createCategory, getAllCategories, updateCategory } from "../models/category.model.js";
import { pool } from "../config/connectDB.js"

export const AddCategoryController = async (req, res) => {
  try {
    const { name, image } = req.body;

    if (!name || !image) {
      return res.status(400).json({
        message: "Enter required fields",
        error: true,
        success: false,
      });
    }

    const addCategory = await createCategory(name, image);

    const saveCategory = addCategory;

    if (!saveCategory) {
      return res.status(500).json({
        message: "Failed to add category",
        error: true,
        success: false,
      });
    }

    return res.json({
      message: "Add Category",
      data: addCategory,
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export const getCategoryController = async (req, res) => {
  try {
    const data = await getAllCategories();

    return res.json({
      data: data,
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

export const updateCategoryController= async (req, res) => {
  try {
    const { id, name, image } = req.body;

    const update = await updateCategory( id, name, image);

    return res.json({
      message: "Updated Category",
      success: true,
      error: false,
      data: update,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export const deleteCategoryController = async (req,res) =>{
  try{
    const { id } = req.body

    const checkSubCategory = await pool.query(
      "SELECT COUNT(*) FROM subcategories WHERE category_id = $1",
      [id]
    )

    const subCount = parseInt(checkSubCategory.rows[0].count)

    if(subCount > 0){
      return res.status(400).json({
        message : "category is already use can't delete",
        error : true,
        success : false
      })
    }

    const deleteCategory =  await pool.query(
      "DELETE FROM categories WHERE id = $1 RETURNING *",
      [id]
    )

    return res.json({
      message : 'Delete category successfully',
      data : deleteCategory.rows[0],
      error : false,
      success : true
    })

  } catch (error){
    return res.status(500).json({
      message : error.message || error,
      success : false,
      error : true
    })
  }
};