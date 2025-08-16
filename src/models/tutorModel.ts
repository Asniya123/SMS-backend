import { model, Schema } from "mongoose";
import { ITutor } from "../interface/ITutor";

const TutorSchema = new Schema<ITutor>({
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

const tutorModel = model<ITutor>('Tutor', TutorSchema)
export default tutorModel