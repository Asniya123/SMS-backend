import { model, Schema } from "mongoose"
import { ICourse } from "../interface/ICourse"

const CourseSchema = new Schema<ICourse>(
    {
        courseTitle: {
            type: String,
            required: true,
        },
        imageUrl: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        regularPrice: {
            type: Number,
            required: true,
            min: 0
        },
        adminId: {
            type: String,
            required: true
        },
        buyCount: {
            type: Number,
            default: 0
        },
       
    },{
        timestamps: true
    }
)

const CourseModel = model<ICourse>('Course', CourseSchema)
export default CourseModel