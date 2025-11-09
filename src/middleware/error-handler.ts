import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";

interface customError {
	statusCode : number,
	msg : string,
}
const errorHandlerMiddleware = (
	err: any,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const customError : customError = {
		statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
		msg: err.message || "Something went wrong, try again later",
	};

	// for the register route 
	if (err instanceof mongoose.Error.ValidationError) {
		customError.msg = Object.values(err.errors)
			.map((item) => item.message)
			.join(",");
		customError.statusCode = StatusCodes.BAD_REQUEST;
	}

	// for incorrect ObjectID
	if(err instanceof mongoose.Error.CastError){
		customError.msg = `No item found with id : ${err.value}`;
		customError.statusCode = StatusCodes.NOT_FOUND;
	}

	// for unique Email
	if (err.code && err.code === 11000 ) {
		customError.msg = `Duplicate value entered for ${Object.values(err.keyValue)}`
		customError.statusCode = StatusCodes.BAD_REQUEST;
	}


	return res.status(customError.statusCode).json({
		msg: customError.msg,
	});
};

export default errorHandlerMiddleware;
