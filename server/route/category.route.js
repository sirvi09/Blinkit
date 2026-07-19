import { Router } from 'express'
import auth from '../middleware/auth.js'
import  { AddCategoryController, deleteCategoryController, getCategoryController, updateCategoryController } from '../controllers/category.controller.js'
import { admin } from '../middleware/Admin.js'

const categoryRouter = Router()

categoryRouter.post("/add-category",auth,admin,AddCategoryController)
categoryRouter.get('/get',getCategoryController)
categoryRouter.put('/update',auth,admin,updateCategoryController)
categoryRouter.delete('/delete',auth,admin,deleteCategoryController)


export default categoryRouter