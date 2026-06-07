import { Router } from "express";
import { verifyToken } from "../middleware/authMiddleware";
import {
  analyzeResume,
  deleteResume,
  getAllResume,
  getHistory,
  getOneAnalysis,
  uploadResume,
} from "../controllers/resumeControllers";
const router = Router();

router.use(verifyToken);

router.post("/upload", uploadResume);
router.get("/all", getAllResume);
router.delete("/:id", deleteResume);

// analysis — one route does the full flow
router.post("/analyze", analyzeResume);

// history
router.get("/history", getHistory);
router.get("/history/:id", getOneAnalysis);

export default router;
