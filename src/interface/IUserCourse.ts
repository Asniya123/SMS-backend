import { Types } from 'mongoose';
import { Request, Response } from 'express';
import { IStudent, IEnrollment } from './IStudent'; // Import shared interfaces

export interface ICourse {
  _id: string | Types.ObjectId;
  courseTitle: string;
  imageUrl: string;
  description: string;
  regularPrice: number;
  adminId: string;
  buyCount: number;
}

export interface IUserCourseRepository {
  listPublicCourses(page: number, limit: number, search?: string): Promise<{ courses: ICourse[]; total: number }>;
  getPublicCourseById(courseId: string): Promise<ICourse | null>;
  findUserById(userId: string): Promise<IStudent | null>;
  updateUserEnrollments(userId: string, enrollments: IEnrollment[]): Promise<IStudent | null>;
  incrementCourseBuyCount(courseId: string): Promise<void>;
  enroll(
    userId: string,
    payload: {
      courseId: string | Types.ObjectId;
      paymentId?: string;
      orderId?: string;
      amount: number;
      currency: string;
      walletTransactionId?: string;
      razorpay_signature?: string;
    }
  ): Promise<IEnrollment>;
  getUserEnrollments(userId: string): Promise<IEnrollment[]>;
}

export interface IUserCourseService {
  listPublicCourses(page: number, limit: number, search?: string): Promise<{ courses: ICourse[]; total: number }>;
  getPublicCourseById(courseId: string): Promise<ICourse | null>;
  createOrder(courseId: string, amount: number): Promise<{ orderId: string; amount: number; currency: string }>;
  enrollCourse(
    userId: string,
    courseId: string,
    paymentDetails:
      | {
          paymentMethod: 'razorpay';
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
          walletTransactionId?: string;
        }
      | {
          paymentMethod: 'wallet';
          walletTransactionId: string;
          razorpay_payment_id?: string;
          razorpay_order_id?: string;
          razorpay_signature?: string;
        }
  ): Promise<void>;
  getUserEnrollments(userId: string): Promise<IEnrollment[]>;
}

export interface IUserCourseController {
  listPublicCourses(req: Request, res: Response): Promise<void>;
  getPublicCourseById(req: Request, res: Response): Promise<void>;
  enroll(req: Request, res: Response): Promise<void>;
  createOrder(req: Request, res: Response): Promise<void>;
  getUserEnrollments(req: Request, res: Response): Promise<void>;
}