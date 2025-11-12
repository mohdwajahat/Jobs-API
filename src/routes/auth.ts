import express, { Router } from "express";
import { Login, Register, updateUser } from "../controllers/auth";
import authenticatinoMiddleware from "../middleware/authentication";
import testUser from "../middleware/testUser";
import rateLimit from "express-rate-limit";

const router: Router = express.Router();

const apiLimiter = rateLimit({
	windowMs: 1000 * 60 * 15,
	limit: 10,
	message: {
		msg: "Too many request from this Ip. Please try again after 15 minutes",
	},
});

router.post("/login", apiLimiter, Login);
router.post("/register", apiLimiter, Register);
router.post("/updateUser", authenticatinoMiddleware, testUser, updateUser);

export default router;
