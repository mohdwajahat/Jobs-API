import express, { Router } from "express";
const router: Router = express.Router();

import {
	getAllJobs,
	createJob,
	getJob,
	updateJob,
	deleteJob,
	showStats,
} from "../controllers/jobs";
import testUser from "../middleware/testUser";

router.route("/").post(testUser, createJob).get(getAllJobs);
router.route("/stats").get(showStats);
router
	.route("/:id")
	.get(getJob)
	.patch(testUser, updateJob)
	.delete(testUser, deleteJob);

export default router;
