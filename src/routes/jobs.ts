import express, { Router } from "express";
const router: Router = express.Router();

import {
	getAllJobs,
	createJob,
	getJob,
	updateJob,
	deleteJob,
} from "../controllers/jobs";

router.route("/").post(createJob).get(getAllJobs);
router.route("/:id").get(getJob).patch(updateJob).delete(deleteJob);

export default router;
