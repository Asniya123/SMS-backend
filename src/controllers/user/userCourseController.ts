import { Request, Response } from 'express';
import userCourseService from '../../services/user/userCourseService';

class UserCourseController {
  async getCourses(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 9;
      const search = (req.query.search as string) || undefined;
      const result = await userCourseService.listPublicCourses(page, limit, search);
      res.status(200).json({ success: true, courses: result.courses, total: result.total, page, limit });
    } catch (error) {
      console.error('Error fetching courses:', error);
      res.status(500).json({ success: false, message: 'Error fetching courses' });
    }
  }

  async getCourseById(req: Request, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      const course = await userCourseService.getPublicCourseById(courseId);
      if (!course) {
        res.status(404).json({ success: false, message: 'Course not found' });
        return;
      }
      res.status(200).json({ success: true, course });
    } catch (error) {
      console.error('Error fetching course:', error);
      res.status(500).json({ success: false, message: 'Error fetching course' });
    }
  }

  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const { courseId, amount } = req.body;

      if (!courseId || !amount) {
        res.status(400).json({
          success: false,
          message: 'Course ID and amount are required',
        });
        return;
      }

      const orderResponse = await userCourseService.createOrder(courseId, amount);
      res.status(200).json({
        success: true,
        orderId: orderResponse.orderId,
        amount: orderResponse.amount,
        currency: orderResponse.currency,
      });
    } catch (error) {
      console.error('Controller error creating order:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create order',
      });
    }
  }

  async enrollCourse(req: Request, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      const { paymentMethod, paymentId, orderId, signature, walletTransactionId } = req.body;
      const userId = req.user?.id;

      if (!userId || !courseId || !paymentMethod) {
        res.status(400).json({ success: false, message: 'User ID, course ID, and payment method are required' });
        return;
      }

      let paymentDetails:
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
          };

      if (paymentMethod === 'razorpay') {
        if (!paymentId || !orderId || !signature) {
          res.status(400).json({ success: false, message: 'Razorpay payment details are required' });
          return;
        }

        paymentDetails = {
          paymentMethod: 'razorpay',
          razorpay_payment_id: paymentId,
          razorpay_order_id: orderId,
          razorpay_signature: signature,
        };
      } else if (paymentMethod === 'wallet') {
        if (!walletTransactionId) {
          res.status(400).json({ success: false, message: 'Wallet transaction ID is required' });
          return;
        }
        paymentDetails = {
          paymentMethod: 'wallet',
          walletTransactionId,
        };
      } else {
        res.status(400).json({ success: false, message: 'Invalid payment method' });
        return;
      }

      await userCourseService.enrollCourse(userId, courseId, paymentDetails);
      res.status(200).json({ success: true, message: 'Enrollment successful' });
    } catch (error: any) {
      console.error('Controller: Error enrolling course:', error);
      const statusCode = error.message?.includes('Invalid') || error.message?.includes('required') ? 400 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Enrollment failed',
      });
    }
  }

  async getMyEnrollments(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.query as { userId?: string };
      if (!userId) {
        res.status(400).json({ success: false, message: 'userId required' });
        return;
      }
      const enrollments = await userCourseService.getUserEnrollments(userId);
      res.status(200).json({ success: true, enrollments });
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch enrollments' });
    }
  }
}

export default new UserCourseController();