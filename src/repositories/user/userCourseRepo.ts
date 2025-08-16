import { Types } from 'mongoose';
import CourseModel from '../../models/courseModel';
import userModel from '../../models/studentModel';
import { IStudent, IEnrollment } from '../../interface/IStudent';
import { ICourse, IUserCourseRepository } from '../../interface/IUserCourse';

class UserCourseRepository implements IUserCourseRepository {
  async listPublicCourses(page: number, limit: number, search?: string): Promise<{ courses: ICourse[]; total: number }> {
    try {
      const skip = (page - 1) * limit;
      const query: any = {};
      if (search) {
        query.$or = [
          { courseTitle: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }
      const [courses, total] = await Promise.all([
        CourseModel.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
          .then((docs) =>
            docs.map((doc) => ({
              ...doc,
              _id: doc._id.toString(),
              buyCount: doc.buyCount ?? 0,
            }))
          ),
        CourseModel.countDocuments(query),
      ]);
      return { courses, total };
    } catch (error) {
      console.error('Error listing public courses:', error);
      throw new Error('Failed to list public courses');
    }
  }

  async getPublicCourseById(courseId: string): Promise<ICourse | null> {
    try {
      const course = await CourseModel.findById(courseId).lean();
      if (!course) return null;
      return {
        ...course,
        _id: course._id.toString(),
        buyCount: course.buyCount ?? 0,
      };
    } catch (error) {
      console.error('Error fetching course by ID:', error);
      throw new Error('Failed to fetch course');
    }
  }

  // FIXED: Removed .lean() to return proper Mongoose document
  async findUserById(userId: string): Promise<IStudent | null> {
    try {
      const user = await userModel.findById(userId);
      return user;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw new Error('Failed to find user');
    }
  }

  async updateUserEnrollments(userId: string, enrollments: IEnrollment[]): Promise<IStudent | null> {
    try {
      const user = await userModel.findByIdAndUpdate(
        userId,
        {
          enrollments: enrollments.map((e) => ({
            ...e,
            courseId: new Types.ObjectId(e.courseId), 
          })),
        },
        { new: true }
      );
      return user;
    } catch (error) {
      console.error('Error updating user enrollments:', error);
      throw new Error('Failed to update enrollments');
    }
  }

  async incrementCourseBuyCount(courseId: string): Promise<void> {
    try {
      await CourseModel.findByIdAndUpdate(courseId, { $inc: { buyCount: 1 } });
    } catch (error) {
      console.error('Error incrementing course buy count:', error);
      throw new Error('Failed to increment buy count');
    }
  }

  async enroll(
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
  ): Promise<IEnrollment> {
    try {
      const { courseId, paymentId, orderId, amount, currency, walletTransactionId, razorpay_signature } = payload;
      const courseObjectId = typeof courseId === 'string' ? new Types.ObjectId(courseId) : courseId;

      const user = await this.findUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const course = await this.getPublicCourseById(courseObjectId.toString());
      if (!course) {
        throw new Error('Course not found');
      }

      const enrollment: IEnrollment = {
        courseId: courseObjectId.toString(),
        paymentId,
        orderId,
        amount,
        currency: currency || 'INR',
        enrolledAt: new Date(),
        walletTransactionId,
        razorpay_signature,
      };

      const enrollments = user.enrollments || [];
      enrollments.push(enrollment);

      await this.updateUserEnrollments(userId, enrollments);
      await this.incrementCourseBuyCount(courseObjectId.toString());

      return enrollment;
    } catch (error) {
      console.error('Error enrolling course:', error);
      throw error instanceof Error ? error : new Error('Failed to enroll course');
    }
  }

  async getUserEnrollments(userId: string): Promise<IEnrollment[]> {
    try {
      const user = await userModel
        .findById(userId)
        .populate({
          path: 'enrollments.courseId',
          select: 'courseTitle imageUrl regularPrice description',
        })
        .lean();
      if (!user) {
        throw new Error('User not found');
      }
      return (
        user.enrollments?.map((enrollment) => ({
          ...enrollment,
          courseId: enrollment.courseId.toString(),
        })) || []
      );
    } catch (error) {
      console.error('Error fetching user enrollments:', error);
      throw new Error('Failed to fetch enrollments');
    }
  }
}

export default new UserCourseRepository();