import { Document, Types} from "mongoose";
import { Request, Response } from "express";

export interface IStudent extends Document {
    _id: string | Types.ObjectId;
    name: string
    email: string
    mobile: number
    password: string
    expiresAt?: Date | null
    isVerified: boolean
    is_blocked?: boolean
    createdAt: Date
    updatedAt?: Date
    enrollments?: IEnrollment[]
}

export interface ILogin{
    accessToken : string
    refreshToken: string
    userId: string
}

export interface IEnrollment {
  courseId: string | Types.ObjectId; // Support both string and ObjectId
  paymentId?: string; // Optional to match controller/repository
  orderId?: string; // Optional to match controller/repository
  amount: number;
  currency: string;
  enrolledAt: Date;
  walletTransactionId?: string;
  razorpay_signature?: string;
}

export interface IStudentRepository{
     findByEmail(email: string): Promise<IStudent | null> 
     findById(id: string): Promise<IStudent | null>
     updateById(id: string, updateData: Partial<IStudent>): Promise<IStudent | null>
     getUsers(page: number, limit: number, search?: string): Promise<{ users: any[], total: number, totalStudents: number }>
}

export interface IStudentService{
    login(email: string, password: string): Promise<ILogin>
    verifyUser(userId: string): Promise<IStudent | null> 
    renewAccessToken(userId: string): Promise<string>
}

export interface IStudentController{
    login(req: Request, res: Response): Promise<void>
    refreshUserAccessToken(req: Request, res: Response): Promise<void>
}