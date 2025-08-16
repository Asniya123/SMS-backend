import { Request, Response } from "express";
import { IAdminController, IAdminService } from "../../interface/IAdmin";
import jwt from "jsonwebtoken";
import { JwtPayload } from "jsonwebtoken";

export default class AdminController implements IAdminController {
  private adminService: IAdminService;

  constructor(adminService:IAdminService) {
    this.adminService = adminService;
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        res.status(400).json({ error: "Email and password are required" });
        return;
      }

      const { accessToken, refreshToken, adminId} = await this.adminService.login(email, password);

      // Get the full admin data to return
      const admin = await this.adminService.verifyUser(adminId);

      console.log('Login successful - Token generated:', { 
        adminId, 
        tokenLength: accessToken?.length,
        tokenPreview: accessToken ? `${accessToken.substring(0, 20)}...` : 'No token'
      });

      res.status(200).json({
        message: "Login successful",
        admin,
        token: accessToken,
        refreshToken,
      });
    } catch (error: any) {
      console.error("Login Error:", error);
      
      if (error.message.includes("Invalid email")) {
        res.status(404).json({ error: "admin not found" });
      } else if (error.message.includes("Invalid password")) {
        res.status(401).json({ error: "Invalid password" });
      } else if (error.message.includes("admin is blocked")) {
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

      const tutor = await this.adminService.verifyUser(decoded.id);
      if (!tutor) {
        res.status(403).json({ message: "tutor not found" });
        return;
      }

      const newAccessToken = await this.adminService.renewAccessToken(decoded.id);
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

  // Add these new methods to your AdminController class

async getUsers(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const search = (req.query.search as string) || '';

    if (page < 1 || limit < 1) {
      res.status(400).json({
        success: false,
        error: 'Invalid pagination parameters. Page and limit must be positive numbers',
      });
      return;
    }

    const { users, total, totalStudents } = await this.adminService.getUsers(page, limit, search);

    res.status(200).json({
      success: true,
      data: {
        users,
        totalStudents,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
        },
      },
    });
  } catch (error) {
    console.error('Error in getUsers controller:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async blockUnblock(req: Request, res: Response): Promise<void> {
  try {
    const { isBlocked } = req.body;
    const { userId } = req.params;

    if (typeof isBlocked !== "boolean") {
      res.status(400).json({ message: "Invalid isBlocked value. It must be a boolean." });
      return;
    }

    const updatedUser = await this.adminService.blockUnblock(userId, isBlocked);

    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      message: isBlocked ? "User blocked successfully" : "User unblocked successfully",
      updatedUser,
    });
  } catch (error: any) {
    console.error("Error in blockUnblock:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}


  async getCourses(req: Request, res: Response): Promise<void> {
    try {
      const courses = await this.adminService.getCourses();
      res.status(200).json({
        message: "Courses retrieved successfully",
        courses
      });
    } catch (error: any) {
      console.error("Get Courses Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}