import mongoose from "mongoose";
import { IUser } from "../types/index.ts";

const userSchema = new mongoose.Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    clerkId: { type: String, required: true, unique: true },
    image: { type: String, required: true },
    role: { type: String, required: true, enum: ["user", "admin"], default: "user" },
},
    { timestamps: true }
);

const User = mongoose.model<IUser>("User", userSchema);
export default User;