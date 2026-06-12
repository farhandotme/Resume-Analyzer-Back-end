import { Router } from "express";
import {
  login,
  logout,
  profile,
  verifyEmail,
} from "../controllers/userControllers";
import { verifyToken } from "../middleware/authMiddleware";

const router = Router();

router.post("/verify-email", verifyEmail);
router.post("/login", login);
router.post("/profile", verifyToken, profile);
router.get("/logout", logout);

export default router;
