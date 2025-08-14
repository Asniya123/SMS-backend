import { model, Schema } from "mongoose";
import { IStudent } from "../interface/IStudent";

const UserSchema = new Schema<IStudent>({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    mobile: {
        type: Number
    },
    password: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: false
    },
    isVerified: {
        type: Boolean,
        default: false,
        required: true
    },
    is_blocked: {
        type: Boolean,
        default: false
    },
    
},
{
        timestamps: true
})

const userModel = model<IStudent>('Student', UserSchema)
export default userModel