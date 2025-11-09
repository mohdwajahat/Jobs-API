import express from "express";
import "dotenv/config";
import authenticatinoMiddleware from "./middleware/authentication";
// extra security packages
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import cors from "cors";
import { xss } from "express-xss-sanitizer";

const app = express();

// connectDb
import connectDB from "./db/connect";

// routes
import authRouter from "./routes/auth";
import jobsRouter from "./routes/jobs";

// importing middlewares
import notFoundMiddleware from "./middleware/not-found";
import errorHandlerMiddleware from "./middleware/error-handler";

app.use(express.json());
app.use(
	rateLimit({
		windowMs: 15 * 60 * 1000, // 15 minutes
		limit: 100,
	})
);
app.use(helmet());
app.use(cors());
app.use(xss());

const PORT: number = Number(process.env.PORT) || 5000;

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/jobs", authenticatinoMiddleware, jobsRouter);

// middleware
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const start = async () => {
	try {
		const mongoURL = process.env.MONGO_URL;

		if (!mongoURL) {
			throw new Error(
				"Mongo URL is not defined in the environment variables"
			);
		}
		await connectDB(mongoURL);
		console.log("Successfully connected to Database");
		app.listen(PORT, () => {
			console.log(`Server is running on PORT: ${PORT}`);
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.log("server start failed", message);
	}
};

start();
