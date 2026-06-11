import { Router } from "express";
import { login, logout, profile, signUp } from "../controllers/userControllers";
import { verifyToken } from "../middleware/authMiddleware";

const router = Router();

router.post("/signup", signUp);
router.post("/login", login);
router.post("/profile", verifyToken, profile);
router.get("/logout", logout);

export default router;
