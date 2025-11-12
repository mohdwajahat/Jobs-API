import { Request, Response } from "express";
import User, { IUser } from "../models/User";
import { StatusCodes } from "http-status-codes";
import { BadRequestError, UnAuthenticatedError } from "../errors";
import { AuthRequest } from "../middleware/authentication";

interface RegisterBody {
	name: string;
	email: string;
	password: string;
	lastname: string;
	location: string;
}

interface LoginBody {
	email: string;
	password: string;
}

interface UpdateBody {
	email: string;
	lastname: string;
	location: string;
	name: string;
}

const Register = async (req: Request, res: Response) => {
	const { name, email, password, lastname, location }: RegisterBody =
		req.body;
	const user = await User.create({
		name,
		email,
		password,
		lastname,
		location,
	});
	const token = user.createToken();
	res.status(StatusCodes.CREATED).json({
		user: {
			name: user.name,
			email: user.email,
			lastname: user.lastname,
			location: user.location,
			token,
		},
	});
};

const Login = async (req: Request, res: Response) => {
	const { email, password }: LoginBody = req.body;
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

const updateUser = async (req: AuthRequest, res: Response) => {
	const { email, name, lastname, location }: UpdateBody = req.body;
	const userId = req.user?.userId;
	if (!email || !name || !lastname || !location) {
		throw new BadRequestError("please enter email,name,lastname,location");
	}

	const user = await User.findOne({ _id: userId });

	if (!user) {
		throw new BadRequestError("No such User Exists");
	}

	user.email = email;
	user.name = name;
	user.lastname = lastname;
	user.location = location;

	await user.save();

	const token = user.createToken();

	res.status(StatusCodes.OK).json({
		user: {
			name: user.name,
			email: user.email,
			lastname: user.lastname,
			location: user.location,
			token,
		},
	});
};

export { Register, Login, updateUser };
