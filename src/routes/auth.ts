import express, { Router } from "express";
import { Login,Register } from "../controllers/auth";

const router : Router = express.Router();

router.post("/login",Login);
router.post("/register",Register);

export default router;