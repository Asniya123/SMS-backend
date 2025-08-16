import bcrypt from "bcrypt";
import { ILogin, IStudent, IStudentRepository, IStudentService } from "../../interface/IStudent";
import studentRepo from "../../repositories/student/studentRepo";
import { generateAccessToken, generateRefreshToken } from "../../utils/tokenUtils";

class StudentService implements IStudentService {
  private studentRepo: IStudentRepository;

  constructor(studentRepo: IStudentRepository) {
    this.studentRepo = studentRepo;
  }

  async login(email: string, password: string): Promise<ILogin> {
    try {
      const student = await this.studentRepo.findByEmail(email);
      console.log("Student found:", student ? { email: student.email } : "No student found");

      if (!student) {
        throw new Error("Invalid email");
      }

      // Check if user is blocked (uncomment when needed)
      // if (student.is_blocked) {
      //   const error = new Error("User is blocked by admin") as any;
      //   error.status = 403;
      //   throw error;
      // }

      // Direct plain text password comparison
      console.log("Input password:", password);
      console.log("Stored password:", student.password);
      const isPasswordValid = password === student.password;
      console.log("Password match:", isPasswordValid);

      if (!isPasswordValid) {
        throw new Error("Invalid password");
      }

      const accessToken = generateAccessToken(student._id.toString(), 'student');
      const refreshToken = generateRefreshToken(student._id.toString());

      return {
        accessToken,
        refreshToken,
        userId: student._id.toString(),
      };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  async verifyUser(userId: string): Promise<IStudent | null> {
    try {
      const user = await this.studentRepo.findById(userId);
      return user;
    } catch (error) {
      console.error("Error verifying user:", error);
      throw error;
    }
  }

  async renewAccessToken(userId: string): Promise<string> {
    try {
      const user = await this.studentRepo.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }
      return generateAccessToken(user._id.toString());
    } catch (error) {
      console.error("Error renewing access token:", error);
      throw error;
    }
  }
}

export default new StudentService(studentRepo);