import mongoose from "mongoose";

const connectDB = (URL: string): Promise<typeof mongoose> => {
	return mongoose.connect(URL);
};

export default connectDB;