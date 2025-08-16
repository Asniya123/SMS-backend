import { ICourse, ICourseRepository, CreateCourseDTO } from "../../interface/ICourse";
import courseModel from "../../models/courseModel";

class CourseRepository implements ICourseRepository {
    
    async addCourse(courseData: CreateCourseDTO): Promise<ICourse | null> {
        try {
            const course = new courseModel(courseData);
            const savedCourse = await course.save();
            return savedCourse;
        } catch (error) {
            console.error('Error adding course:', error);
            throw error;
        }
    }

    async listCourses(adminId: string, page: number, limit: number, search?: string): Promise<{ courses: ICourse[]; total: number }> {
        try {
            console.log('CourseRepo.listCourses called with:', { adminId, page, limit, search });
            
            const skip = (page - 1) * limit;
            let query: any = { adminId };
            
            if (search) {
                query.$or = [
                    { courseTitle: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ];
            }

            console.log('MongoDB query:', JSON.stringify(query, null, 2));
            console.log('Pagination:', { skip, limit });

            const [courses, total] = await Promise.all([
                courseModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
                courseModel.countDocuments(query)
            ]);

            console.log('MongoDB results:', { coursesCount: courses.length, total });
            return { courses, total };
        } catch (error: any) {
            console.error('❌ CourseRepo Error listing courses:', error);
            console.error('Error stack:', error.stack);
            throw error;
        }
    }

    async findById(courseId: string): Promise<ICourse | null> {
        try {
            return await courseModel.findById(courseId);
        } catch (error) {
            console.error('Error finding course by ID:', error);
            throw error;
        }
    }

    async editCourse(courseId: string, courseData: Partial<ICourse>): Promise<ICourse | null> {
        try {
            const updatedCourse = await courseModel.findByIdAndUpdate(
                courseId,
                courseData,
                { new: true, runValidators: true }
            );
            return updatedCourse;
        } catch (error) {
            console.error('Error editing course:', error);
            throw error;
        }
    }

    async deleteCourse(courseId: string): Promise<boolean> {
        try {
            const result = await courseModel.findByIdAndDelete(courseId);
            return !!result;
        } catch (error) {
            console.error('Error deleting course:', error);
            throw error;
        }
    }

    async getCourse(page: number, limit: number, search?: string): Promise<{ courses: ICourse[]; total: number }> {
        try {
            const skip = (page - 1) * limit;
            let query: any = {};
            
            if (search) {
                query.$or = [
                    { courseTitle: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ];
            }

            const [courses, total] = await Promise.all([
                courseModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
                courseModel.countDocuments(query)
            ]);

            return { courses, total };
        } catch (error) {
            console.error('Error getting courses:', error);
            throw error;
        }
    }

    async incrementBuyCount(courseId: string): Promise<void> {
        try {
            await courseModel.findByIdAndUpdate(courseId, { $inc: { buyCount: 1 } });
        } catch (error) {
            console.error('Error incrementing buy count:', error);
            throw error;
        }
    }

    async addEnrollmentToStudent(userId: string, enrollmentData: any): Promise<void> {
        try {
            const studentModel = require('../../models/studentModel').default;
            const student = await studentModel.findById(userId);
            
            if (!student) {
                throw new Error('Student not found');
            }

            // Add enrollment to student's enrollments array
            student.enrollments = student.enrollments || [];
            student.enrollments.push(enrollmentData);
            
            await student.save();
        } catch (error) {
            console.error('Error adding enrollment to student:', error);
            throw error;
        }
    }
}

export default new CourseRepository();







       