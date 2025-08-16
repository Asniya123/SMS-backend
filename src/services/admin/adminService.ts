import { ILogin, IAdmin, IAdminRepository, IAdminService } from "../../interface/IAdmin";
import { generateAccessToken, generateRefreshToken } from "../../utils/tokenUtils";
import adminRepo from "../../repositories/admin/adminRepo";
import studentModel from "../../models/studentModel";
import tutorModel from "../../models/tutorModel";
import courseModel from "../../models/courseModel";
import { IStudentRepository } from "../../interface/IStudent";
import studentRepo from "../../repositories/student/studentRepo";

class AdminService implements IAdminService {
  private adminRepo: IAdminRepository;
  private studentRepository: IStudentRepository

  constructor(adminRepo: IAdminRepository, studentRepository: IStudentRepository) {
    this.adminRepo = adminRepo;
    this.studentRepository = studentRepository
  }

  async login(email: string, password: string): Promise<ILogin> {
    try {
      const admin = await this.adminRepo.findByEmail(email);
      console.log("admin found:", admin ? { email: admin.email } : "No admin found");

      if (!admin) {
        throw new Error("Invalid email");
      }

      

      // Direct plain text password comparison
      console.log("Input password:", password);
      console.log("Stored password:", admin.password);
      const isPasswordValid = password === admin.password;
      console.log("Password match:", isPasswordValid);

      if (!isPasswordValid) {
        throw new Error("Invalid password");
      }

      const accessToken = generateAccessToken(admin._id.toString(), 'admin');
      const refreshToken = generateRefreshToken(admin._id.toString());

      return {
        accessToken,
        refreshToken,
        adminId: admin._id.toString(),
      };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  async verifyUser(adminId: string): Promise<IAdmin | null> {
    try {
      const admin = await this.adminRepo.findById(adminId);
      return admin;
    } catch (error) {
      console.error("Error verifying admin:", error);
      throw error;
    }
  }

  async renewAccessToken(adminId: string): Promise<string> {
    try {
      const admin = await this.adminRepo.findById(adminId);
      if (!admin) {
        throw new Error("admin not found");
      }
      return generateAccessToken(admin._id.toString(), 'admin');
    } catch (error) {
      console.error("Error renewing access token:", error);
      throw error;
    }
  }

  async getUsers(page: number, limit: number, search?: string): Promise<{ users: any[], total: number, totalStudents: number }> {
    try {
      const data = await this.studentRepository.getUsers(page, limit, search);
      return data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Service error: ${errorMessage}`);
    }
  }
  
  async blockUnblock(userId: string, isBlocked: boolean): Promise<any> {
    try {
      const user = await this.studentRepository.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Use Mongoose document save()
      user.is_blocked = isBlocked;
      await user.save();
      return user;
    } catch (error: any) {
      console.error('Error in blockUnblock:', error);
      throw new Error(`Failed to block/unblock user: ${error.message}`);
    }
  }

  async getStudents(): Promise<any[]> {
    try {
      const students = await studentModel.find({}, { password: 0 }).sort({ createdAt: -1 });
      return students;
    } catch (error) {
      console.error("Error fetching students:", error);
      throw error;
    }
  }

  async getTeachers(): Promise<any[]> {
    try {
      const tutors = await tutorModel.find({}, { password: 0 }).sort({ createdAt: -1 });
      return tutors;
    } catch (error) {
      console.error("Error fetching tutors:", error);
      throw error;
    }
  }

  async getCourses(): Promise<any[]> {
    try {
      console.log("Fetching courses from database...");
      const courses = await courseModel.find({}).sort({ createdAt: -1 });
      console.log("Found courses:", courses.length);
      console.log("Sample course:", courses[0]);
      return courses;
    } catch (error) {
      console.error("Error fetching courses:", error);
      throw error;
    }
  }
}

export default new AdminService(adminRepo, studentRepo);