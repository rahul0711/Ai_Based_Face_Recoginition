import { Router } from "express";
import { scanFace } from "../controllers/scanController.js";
import { upload } from "../config/multerconfig.js";
import { getUserFaceForManualCheck } from "../controllers/adminController.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

// User face scan (event)
// POST /api/scan
router.post("/welcome", upload.single("image"), scanFace);
router.get("/manual-face/:userId", requireAdmin, getUserFaceForManualCheck);
export default router;
