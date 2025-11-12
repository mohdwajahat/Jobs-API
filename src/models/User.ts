import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import ms from "ms";

export interface IUser extends Document {
	name: string;
	email: string;
	password: string;
	lastname: string;
	location: string;
	createToken(): string;
	comparePassword(userPassword: string): Promise<boolean>;
}

const UserSchema: Schema<IUser> = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "Please provide Name"],
		minlength: 3,
		maxLength: 50,
	},
	email: {
		type: String,
		required: [true, "please provide email"],
		match: [
			/^[^\s@]+@[^\s@]+\.[^\s@]+$/,
			"Please enter a valid email address",
		],
		unique: true,
	},
	password: {
		type: String,
		required: [true, "please provide a valid Password "],
		minLength: 6,
	},
	lastname: {
		type: String,
		trim: true,
		default: "lastname",
		maxLength: 20,
	},
	location: {
		type: String,
		trim: true,
		maxLength: 20,
		default: "my city",
	},
});

UserSchema.pre("save", async function () {
	if (!this.isModified("password")) {
		return;
	}
	const genSalt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, genSalt);
});

UserSchema.methods.createToken = function (this: IUser) {
	const payLoad = { userId: this._id, name: this.name };
	const secret = process.env.JWT_SECRET as string;
	const options: SignOptions = {
		expiresIn: (process.env.JWT_LIFE as ms.StringValue) || "1d",
	}; // default fallback

	return jwt.sign(payLoad, secret, options);
};

UserSchema.methods.comparePassword = async function (userPassword: string) {
	return await bcrypt.compare(userPassword, this.password);
};

const User = mongoose.model<IUser>("User", UserSchema);

export default User;
