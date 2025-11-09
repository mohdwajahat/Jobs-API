import { Request, Response } from "express";
import Job from "../models/Jobs";
import { AuthRequest } from "../middleware/authentication";
import {
	BadRequestError,
	NotFoundError,
	UnAuthenticatedError,
} from "../errors";
import { StatusCodes } from "http-status-codes";

interface createJobBody {
	company: string;
	position: string;
	status?: string;
}

const getAllJobs = async (req: AuthRequest, res: Response) => {
	const userId = req.user?.userId;
	const jobs = await Job.find({ createdBy: userId }).sort("createdAt");

	res.status(StatusCodes.OK).json({
		jobs,
		nbHits: jobs.length,
	});
};

const getJob = async (req: AuthRequest, res: Response) => {
	const userId = req.user?.userId;
	const { id: jobId } = req.params as { id: string };

	const job = await Job.findOne({ createdBy: userId, _id: jobId });

	if (!job) {
		throw new NotFoundError(`No Job with id : ${jobId}`);
	}

	res.status(StatusCodes.OK).json({
		job,
	});
};

const createJob = async (req: AuthRequest, res: Response) => {
	const { company, position, status } = req.body as createJobBody;
	const userId = req.user?.userId;

	if (!userId) {
		throw new UnAuthenticatedError("Unauthorized Access : no user found");
	}

	const job = await Job.create({
		company,
		position,
		status,
		createdBy: userId,
	});

	res.status(StatusCodes.CREATED).json({ job });
};

const updateJob = async (req: AuthRequest, res: Response) => {
	const userId = req.user?.userId;
	const { id: jobId } = req.params as { id: string };
	const { company, position } = req.body as {
		company: string;
		position: string;
	};

	if (company === "" || position === "") {
		throw new BadRequestError(
			"company and position fields cannot be empty"
		);
	}

	const job = await Job.findByIdAndUpdate(
		{ _id: jobId, createdBy: userId },
		{ company, position },
		{
			new: true,
			runValidators: true,
		}
	);

	if (!job) {
		throw new NotFoundError(`No Job with id : ${jobId}`);
	}

	res.status(StatusCodes.OK).json({ job });
};

const deleteJob = async (req: AuthRequest, res: Response) => {
	const userId = req.user?.userId;
	const { id: jobId } = req.params as { id: string };

	const job = await Job.findByIdAndDelete({ _id: jobId, createdBy: userId });

	if (!job) {
		throw new NotFoundError(`No Job with id : ${jobId}`);
	}

	res.status(StatusCodes.OK).send();
};

export { getAllJobs, createJob, getJob, updateJob, deleteJob };
