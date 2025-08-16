import { ICourse, ICourseService, ICourseRepository, CreateCourseDTO } from "../../interface/ICourse";
import courseRepo from "../../repositories/course/courseRepo";

export class CourseService implements ICourseService {
    private courseRepo: ICourseRepository;

    constructor(courseRepo: ICourseRepository) {
        this.courseRepo = courseRepo;
    } 

    async addCourse(courseData: { 
        courseTitle: string; 
        imageUrl: string; 
        description: string; 
        regularPrice: number;
        adminId: string;
    }): Promise<ICourse | null> {
        try {
            const courseToAdd: CreateCourseDTO = {
                courseTitle: courseData.courseTitle,
                imageUrl: courseData.imageUrl,
                description: courseData.description,
                regularPrice: courseData.regularPrice,
                adminId: courseData.adminId,
                buyCount: 0
            };

            const savedCourse = await this.courseRepo.addCourse(courseToAdd);
            return savedCourse;
        } catch (error) {
            console.error('Error adding course:', error);
            throw error;
        }
    }

    async listCourses(adminId: string, page: number, limit: number, search?: string): Promise<{ courses: ICourse[]; total: number }> {
        try {
            console.log('CourseService.listCourses called with:', { adminId, page, limit, search });
            const result = await this.courseRepo.listCourses(adminId, page, limit, search);
            console.log('CourseService.listCourses result:', result);
            return result;
        } catch (error: any) {
            console.error('❌ CourseService Error listing courses:', error);
            console.error('Error stack:', error.stack);
            throw error;
        }
    }

    async getCourse(courseId: string): Promise<ICourse | null> {
        try {
            return await this.courseRepo.findById(courseId);
        } catch (error) {
            console.error('Error getting course:', error);
            throw error;
        }
    }

    async editCourse(courseId: string, courseData: Partial<ICourse>): Promise<ICourse | null> {
        try {
            // Remove fields that shouldn't be updated
            const { _id, createdAt, updatedAt, ...updateData } = courseData;
            
            const updatedCourse = await this.courseRepo.editCourse(courseId, updateData);
            return updatedCourse;
        } catch (error) {
            console.error('Error editing course:', error);
            throw error;
        }
    }

    async deleteCourse(courseId: string): Promise<boolean> {
        try {
            return await this.courseRepo.deleteCourse(courseId);
        } catch (error) {
            console.error('Error deleting course:', error);
            throw error;
        }
    }
}

export default new CourseService(courseRepo);