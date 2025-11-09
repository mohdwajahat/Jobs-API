import { Request, Response } from "express";
import User from "../models/User";
import { StatusCodes } from "http-status-codes";
import { BadRequestError, UnAuthenticatedError } from "../errors";

interface RegisterBody {
	name: string;
	email: string;
	password: string;
}

interface LoginBody {
	email: string;
	password: string;
}

const Register = async (req: Request, res: Response) => {
	const { name, email, password }: RegisterBody = req.body;
	const user = await User.create({ name, email, password });
	const token = user.createToken();
	res.status(StatusCodes.CREATED).json({ user: { name: user.name }, token });
};

const Login = async (req: Request, res: Response) => {
	const { email, password } = req.body as LoginBody;

	if (!email || !password) {
		throw new BadRequestError("Please Provide Email and Password");
	}

	const user = await User.findOne({ email });

	if (!user) {
		throw new UnAuthenticatedError("Invalid Credentials");
	}

	const isMatch = await user.comparePassword(password);

	if (!isMatch) {
		console.log("password didn't match");
		throw new UnAuthenticatedError(
			"Password doesn't match with the provided email"
		);
	}

	const token = user.createToken();

	res.status(StatusCodes.OK).json({ user: { name: user.name }, token });
};

export { Register, Login };
