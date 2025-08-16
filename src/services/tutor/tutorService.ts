import { ILogin, ITutor, ITutorRepository, ITutorService } from "../../interface/ITutor";
import { generateAccessToken, generateRefreshToken } from "../../utils/tokenUtils";
import tutorRepo from "../../repositories/tutor/tutorRepo";

class TutorService implements ITutorService {
  private tutorRepo: ITutorRepository;

  constructor(tutorRepo: ITutorRepository) {
    this.tutorRepo = tutorRepo;
  }

  async login(email: string, password: string): Promise<ILogin> {
    try {
      const tutor = await this.tutorRepo.findByEmail(email);
      console.log("tutor found:", tutor ? { email: tutor.email } : "No tutor found");

      if (!tutor) {
        throw new Error("Invalid email");
      }

      // Check if tutor is blocked (uncomment when needed)
      // if (tutor.is_blocked) {
      //   const error = new Error("tutor is blocked by admin") as any;
      //   error.status = 403;
      //   throw error;
      // }

      // Direct plain text password comparison
      console.log("Input password:", password);
      console.log("Stored password:", tutor.password);
      const isPasswordValid = password === tutor.password;
      console.log("Password match:", isPasswordValid);

      if (!isPasswordValid) {
        throw new Error("Invalid password");
      }

      const accessToken = generateAccessToken(tutor._id.toString());
      const refreshToken = generateRefreshToken(tutor._id.toString());

      return {
        accessToken,
        refreshToken,
        tutorId: tutor._id.toString(),
      };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  async verifyUser(tutorId: string): Promise<ITutor | null> {
    try {
      const tutor = await this.tutorRepo.findById(tutorId);
      return tutor;
    } catch (error) {
      console.error("Error verifying tutor:", error);
      throw error;
    }
  }

  async renewAccessToken(tutorId: string): Promise<string> {
    try {
      const tutor = await this.tutorRepo.findById(tutorId);
      if (!tutor) {
        throw new Error("tutor not found");
      }
      return generateAccessToken(tutor._id.toString());
    } catch (error) {
      console.error("Error renewing access token:", error);
      throw error;
    }
  }
}

export default new TutorService(tutorRepo);