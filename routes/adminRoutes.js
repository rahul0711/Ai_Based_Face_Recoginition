import express from "express";
import { registerUser } from "../controllers/adminController.js";

import { upload } from "../config/multerconfig.js";

const router = express.Router();

// 🔐 TEMP ADMIN ONLY
router.post(
  "/register",

  upload.single("image"),
  registerUser
);

export default router;
