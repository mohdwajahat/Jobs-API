import { Request, Response, NextFunction } from "express";
import { UnAuthenticatedError } from "../errors";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface AuthRequest extends Request {
	user?: {
		userId: string;
		name: string;
	};
}
const authenticatinoMiddleware = (
	req: AuthRequest,
	res: Response,
	next: NextFunction
) => {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		throw new UnAuthenticatedError("No token Provided");
	}

	const token = authHeader.split(" ")[1];
	try {
		const decoded = jwt.verify(
			token,
			process.env.JWT_SECRET!
		) as JwtPayload;
		const { userId, name } = decoded as { userId: string; name: string };
		req.user = {
			userId,
			name,
		};
		next();
	} catch (error) {
		throw new UnAuthenticatedError("Not authorized to access the route");
	}
};

export default authenticatinoMiddleware;
