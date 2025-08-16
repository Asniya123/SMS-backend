import { model, Schema } from "mongoose";
import { IStudent, IEnrollment } from '../interface/IStudent';

const UserSchema = new Schema({
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
		type: Number,
		required: true
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
	enrollments: [
		{
			courseId: {
				type: Schema.Types.ObjectId,
				ref: 'Course',
				required: true,
			},
			paymentId: {
				type: String,
				required: true,
			},
			orderId: {
				type: String,
				required: true,
			},
			amount: {
				type: Number,
				required: true,
			},
			currency: {
				type: String,
				default: 'INR',
			},
			enrolledAt: {
				type: Date,
				default: Date.now,
			},
		},
	],
}, {
	timestamps: true
});

const userModel = model('Student', UserSchema);
export default userModel;