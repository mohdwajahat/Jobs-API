import mongoose, { Document, Schema } from "mongoose";

export interface IJob extends Document {
	company: string;
	position: string;
	status: string;
	jobLocation: string;
	jobType: string;
	createdBy: mongoose.Schema.Types.ObjectId;
	createdAt?: Date;
	updatedAt?: Date;
}

const JobsSchema: Schema<IJob> = new mongoose.Schema(
	{
		company: {
			type: String,
			required: [true, "please provide company"],
			maxlength: 50,
		},
		position: {
			type: String,
			required: [true, "Please provide position "],
		},
		jobType: {
			type: String,
			enum: ["full-time", "part-time", "intern", "remote"],
			default: "full-time",
		},
		jobLocation: {
			type: String,
			default: "my city",
			required: true,
		},
		status: {
			type: String,
			enum: ["pending", "interview", "denied"],
			default: "pending",
		},
		createdBy: {
			type: mongoose.Schema.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

const Job = mongoose.model<IJob>("Job", JobsSchema);

export default Job;
