import { Router } from "express";
import auth from "../middleware/auth.js";
import { addReviewController, getProductReviewsController } from "../controllers/review.controller.js";

const reviewRouter = Router();

reviewRouter.post("/add", auth, addReviewController);
reviewRouter.get("/:productId", getProductReviewsController);

export default reviewRouter;
