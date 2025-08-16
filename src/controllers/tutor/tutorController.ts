import { Request, Response } from "express";
import { ITutorController, ITutorService } from "../../interface/ITutor";
import jwt from "jsonwebtoken";
import { JwtPayload } from "jsonwebtoken";

export default class TutorController implements ITutorController {
  private tutorService: ITutorService;

  constructor(tutorService:ITutorService) {
    this.tutorService = tutorService;
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        res.status(400).json({ error: "Email and password are required" });
        return;
      }

      const { accessToken, refreshToken, tutorId} = await this.tutorService.login(email, password);

      res.status(200).json({
        message: "Login successful",
        tutorId,
        accessToken,
        refreshToken,
      });
    } catch (error: any) {
      console.error("Login Error:", error);
      
      if (error.message.includes("Invalid email")) {
        res.status(404).json({ error: "Tutor not found" });
      } else if (error.message.includes("Invalid password")) {
        res.status(401).json({ error: "Invalid password" });
      } else if (error.message.includes("Tutor is blocked")) {
        res.status(403).json({ error: "Account is blocked" });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }

  async refreshUserAccessToken(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers["authorization"];
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(400).json({ message: "Authorization header missing or malformed" });
        return;
      }

      const refreshToken = authHeader.split(" ")[1];
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as JwtPayload;

      if (!decoded?.id) {
        res.status(400).json({ message: "Invalid refresh token structure" });
        return;
      }

      const tutor = await this.tutorService.verifyUser(decoded.id);
      if (!tutor) {
        res.status(403).json({ message: "tutor not found" });
        return;
      }

      const newAccessToken = await this.tutorService.renewAccessToken(decoded.id);
      res.status(200).json({
        accessToken: newAccessToken,
        message: "Token refreshed successfully",
      });
    } catch (error) {
      console.error("Refresh Token Error:", error);
      if (error instanceof jwt.TokenExpiredError) {
        res.status(403).json({ message: "Refresh token expired. Please log in again." });
      } else {
        res.status(403).json({ message: "Invalid refresh token" });
      }
    }
  }
}