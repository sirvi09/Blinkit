import express from "express";
import auth from "../middleware/auth.js";
import { admin } from "../middleware/Admin.js";

import {
  getDashboardStats,
} from "../controllers/dashboard.controller.js";

const router = express.Router();

router.get(
  "/stats",
  auth,
  admin,
  getDashboardStats
);

export default router;