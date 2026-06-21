import { pool } from "../config/connectDB.js";
import {
  createSubCategory,
  getAllSubCategories,
  getSubCategoryByCategory
} from "../models/subCategory.model.js";

export const AddSubCategoryController = async (req,res)=>{
    try{
        const { name , image , category_id } = req.body

        if(!name || !image || !category_id){
            return res.status(400).json({
                message : "Provide name, image, category_id",
                error : true,
                success : false
            })
        }

        const addSubCategory = await createSubCategory(name, image, category_id)

        const saveSubCategory = addSubCategory

        if(!saveSubCategory){
            return res.status(500).json({
                message : "Failed to add sub category",
                error : true,
                success : false
            })
        }

        return res.json({
            message : "Add SubCategory",
            data : addSubCategory,
            success : true,
            error : false
        })

    } catch(error){
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const getSubCategoryController = async(req,res)=>{
    try{

        const result = await pool.query(`
            SELECT 
                subcategories.*,
                categories.name AS category_name
            FROM subcategories
            LEFT JOIN categories 
            ON subcategories.category_id = categories.id
            ORDER BY subcategories.created_at DESC
        `)

        return res.json({
            message : "Sub Category data",
            data : result.rows,
            error : false,
            success : true
        })

    } catch(error){
        return res.status(500).json({
            message : error.message || error,
            error : true,
        })
    }
}

export const updateSubCategoryController = async(req,res)=>{
    try{
        const { id,name,image,category_id } = req.body

        const checkSub = await pool.query(
            "SELECT * FROM subcategories WHERE id = $1",
            [id]
        )

        if(checkSub.rows.length === 0){
            return res.status(400).json({
                message : "Check your id",
                error : true,
                success : false
            })
        }

        const updateSubCategory = await pool.query(
            `UPDATE subcategories 
             SET name = $1, image = $2, category_id = $3, updated_at = CURRENT_TIMESTAMP
             WHERE id = $4
             RETURNING *`,
            [name,image,category_id,id]
        )
        
        return res.json({
            message : 'Updated Successfully',
            data : updateSubCategory.rows[0],
            error : false,
            success : true
        })
    } catch(error){
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const deleteSubCategoryController = async(req,res)=>{
    try{
        const { id } = req.body

        const deleteSub = await pool.query(
            "DELETE FROM subcategories WHERE id = $1 RETURNING *",
            [id]
        )

        if(deleteSub.rows.length === 0){
            return res.status(400).json({
                message : "SubCategory not found",
                error : true,
                success : false
            })
        }

        return res.json({
            message : "Delete successfully",
            data : deleteSub.rows[0],
            error : false,
            success : true
        })

    }catch(error){
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}