import { Router } from "express";
import type { Request, Response } from "express";
import { login, signUp } from "../controllers/userControllers";

const router = Router();

router.post("/signup", signUp);
router.post("/login", login);

export default router;
