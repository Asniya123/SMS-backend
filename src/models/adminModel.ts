import { model, Schema } from "mongoose";
import { IAdmin } from "../interface/IAdmin";

const AdminSchema = new Schema<IAdmin>({
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
    
},
{
        timestamps: true
})

const adminModel = model<IAdmin>('Admin', AdminSchema)
export default adminModel