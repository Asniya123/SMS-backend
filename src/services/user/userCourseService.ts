import { IUserCourseService, IUserCourseRepository, ICourse } from '../../interface/IUserCourse';
import { IEnrollment } from '../../interface/IStudent';
import userCourseRepository from '../../repositories/user/userCourseRepo';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { Types } from 'mongoose';
import dotenv from "dotenv";

dotenv.config();

class UserCourseService implements IUserCourseService {
  private userCourseRepository: IUserCourseRepository;
  private razorpay: Razorpay;

  constructor(userCourseRepository: IUserCourseRepository) {
    this.userCourseRepository = userCourseRepository;
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID ,
      key_secret: process.env.RAZORPAY_KEY_SECRET ,
    });
  }

  async listPublicCourses(page: number, limit: number, search?: string): Promise<{ courses: ICourse[]; total: number }> {
    try {
      return await this.userCourseRepository.listPublicCourses(page, limit, search);
    } catch (error) {
      console.error('Error listing public courses:', error);
      throw new Error('Failed to list public courses');
    }
  }

  async getPublicCourseById(courseId: string): Promise<ICourse | null> {
    try {
      return await this.userCourseRepository.getPublicCourseById(courseId);
    } catch (error) {
      console.error('Error fetching course by ID:', error);
      throw new Error('Failed to fetch course');
    }
  }

  async createOrder(courseId: string, amount: number): Promise<{ orderId: string; amount: number; currency: string }> {
    try {
      const course = await this.userCourseRepository.getPublicCourseById(courseId);
      if (!course) {
        throw new Error('Course not found');
      }

      if (amount !== course.regularPrice * 100) {
        throw new Error('Amount does not match course price');
      }

      const shortCourseId = course._id?.toString().slice(0, 10);
      const shortTimestamp = Date.now().toString().slice(-6);
      const receipt = `r_${shortCourseId}_${shortTimestamp}`;

      if (receipt.length > 40) {
        throw new Error('Generated receipt exceeds 40 characters');
      }

      const options = {
        amount: course.regularPrice * 100, // Amount in paise
        currency: 'INR',
        receipt: receipt,
      };

      const order = await this.razorpay.orders.create(options);
      return {
        orderId: order.id,
        amount: Number(order.amount),
        currency: order.currency,
      };
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      if (error instanceof Error && 'error' in error) {
        const razorpayError = (error as any).error;
        throw new Error(`Failed to create Razorpay order: ${razorpayError.description || 'Unknown error'}`);
      }
      throw new Error(`Failed to create Razorpay order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async enrollCourse(
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
  ): Promise<void> {
    try {
      const course = await this.userCourseRepository.getPublicCourseById(courseId);
      if (!course) {
        throw new Error('Course not found');
      }

      if (paymentDetails.paymentMethod === 'razorpay') {
        // Verify Razorpay signature
        const generatedSignature = crypto
          .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'your_key_secret')
          .update(`${paymentDetails.razorpay_order_id}|${paymentDetails.razorpay_payment_id}`)
          .digest('hex');

        if (generatedSignature !== paymentDetails.razorpay_signature) {
          throw new Error('Invalid Razorpay signature');
        }
      }

      const enrollmentData: IEnrollment = {
        courseId: courseId,
        paymentId:
          paymentDetails.paymentMethod === 'razorpay'
            ? paymentDetails.razorpay_payment_id
            : paymentDetails.walletTransactionId || `wallet_${Date.now()}`,
        orderId:
          paymentDetails.paymentMethod === 'razorpay'
            ? paymentDetails.razorpay_order_id
            : `wallet_order_${Date.now()}`,
        amount: course.regularPrice,
        currency: 'INR',
        enrolledAt: new Date(),
        walletTransactionId: paymentDetails.walletTransactionId,
        razorpay_signature: paymentDetails.razorpay_signature,
      };

      await this.userCourseRepository.enroll(userId, enrollmentData);
    } catch (error) {
      console.error('Service error enrolling course:', error);
      throw new Error(`Failed to enroll course: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getUserEnrollments(userId: string): Promise<IEnrollment[]> {
    try {
      return await this.userCourseRepository.getUserEnrollments(userId);
    } catch (error) {
      console.error('Error fetching user enrollments:', error);
      throw new Error('Failed to fetch enrollments');
    }
  }
}

export default new UserCourseService(userCourseRepository);