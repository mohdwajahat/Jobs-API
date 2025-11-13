import { Request, Response } from "express";
import Job from "../models/Jobs";
import { AuthRequest } from "../middleware/authentication";
import moment from "moment";
import {
	BadRequestError,
	NotFoundError,
	UnAuthenticatedError,
} from "../errors";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";

interface createJobBody {
	company: string;
	position: string;
	status?: string;
	jobType?: string;
	jobLocation?: string;
}

interface queryObject {
	createdBy: string;
	position?: Object;
	status?: string;
	jobType?: string;
}

const getAllJobs = async (req: AuthRequest, res: Response) => {
	const { search, status, jobType, sort } = req.query;
	const userId = req.user?.userId as string;

	const queryObject: queryObject = {
		createdBy: userId,
	};

	if (search) {
		queryObject.position = {
			$regex: search,
			$options: "i",
		};
	}

	if (status && status !== "all") {
		queryObject.status = status as string;
	}

	if (jobType && jobType !== "all") {
		queryObject.jobType = jobType as string;
	}

	let result = Job.find(queryObject);

	if (sort === "latest") {
		result = result.sort("-createdAt");
	} else if (sort === "oldest") {
		result = result.sort("createdAt");
	} else if (sort === "a-z") {
		result = result.sort("position");
	} else if (sort === "z-a") {
		result = result.sort("-position");
	}

	const page = Number(req.query.page) || 1;
	const limit = Number(req.query.limit) || 10;
	const skip = (page - 1) * limit;

	result = result.skip(skip).limit(limit);

	const totalJobs = await Job.countDocuments(queryObject);
	const noOfPages = Math.ceil(totalJobs / limit);

	const jobs = await result;
	res.status(StatusCodes.OK).json({
		jobs,
		totalJobs,
		noOfPages,
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
	const { company, position, status, jobType, jobLocation } =
		req.body as createJobBody;
	const userId = req.user?.userId;

	if (!userId) {
		throw new UnAuthenticatedError("Unauthorized Access : no user found");
	}

	const job = await Job.create({
		company,
		position,
		status,
		jobLocation,
		jobType,
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

const showStats = async (req: AuthRequest, res: Response) => {
	const aggStats = await Job.aggregate([
		{
			$match: {
				createdBy: new mongoose.Types.ObjectId(req.user?.userId),
			},
		},
		{
			$group: {
				_id: "$status",
				count: { $sum: 1 },
			},
		},
	]);

	// Convert aggregation result into a keyed object
	const stats = aggStats.reduce((acc: Record<string, number>, curr: any) => {
		const { _id, count } = curr;
		acc[_id] = count;
		return acc;
	}, {});

	// Create default stats with fallbacks
	const defaultStats: Record<string, number> = {
		interview: stats?.interview || 0,
		pending: stats?.pending || 0,
		denied: stats?.denied || 0,
	};

	let monthlyApplications = await Job.aggregate([
		{
			$match: {
				createdBy: new mongoose.Types.ObjectId(req.user?.userId),
			},
		},
		{
			$group: {
				_id: {
					year: { $year: "$createdAt" },
					month: { $month: "$createdAt" },
				},
				count: { $sum: 1 },
			},
		},
		{
			$sort: {
				"_id.year": -1,
				"_id.month": -1,
			},
		},
		{
			$limit: 6,
		},
	]);
	monthlyApplications = monthlyApplications.map((item) => {
		const {
			_id: { year, month },
			count,
		} = item;
		const date = moment()
			.month(month - 1)
			.year(year)
			.format("MMM Y");
		return { date, count };
	}).reverse();


	res.status(StatusCodes.OK).json({
		defaultStats,
		monthlyApplications,
	});
};
export { getAllJobs, createJob, getJob, updateJob, deleteJob, showStats };
