import { Response,NextFunction } from "express"
import { AuthRequest } from "./authentication"
import { BadRequestError } from "../errors"


const testUser = (req:AuthRequest,res:Response,next:NextFunction) => {
    if (req.user?.isTestUser) {
        throw new BadRequestError("Not Allowed to edit the jobs in test user mode");
    }
    next();
}
export default testUser;