import { Request, Response } from "express";
import { ICourseController, ICourseService } from "../../interface/ICourse";


export class CourseController implements ICourseController {
    private courseService: ICourseService;

    constructor(courseService: ICourseService) {
        this.courseService = courseService;
    }

    async addCourse(req: Request, res: Response): Promise<void> {
        try {
            const { courseTitle, imageUrl, description, regularPrice, adminId } = req.body;

            console.log("Extracted fields:", { courseTitle, imageUrl, description, regularPrice, adminId });

            // Validate required fields
            if (!courseTitle) {
                console.log(" Missing courseTitle");
                res.status(400).json({ error: "courseTitle is required" });
                return;
            }
            if (!imageUrl) {
                console.log("Missing imageUrl");
                res.status(400).json({ error: "imageUrl is required" });
                return;
            }
            if (!description) {
                console.log("Missing description");
                res.status(400).json({ error: "description is required" });
                return;
            }
            if (!regularPrice) {
                console.log(" Missing regularPrice");
                res.status(400).json({ error: "regularPrice is required" });
                return;
            }
            if (!adminId) {
                console.log("Missing adminId");
                res.status(400).json({ error: "adminId is required" });
                return;
            }

            // Validate price
            if (regularPrice <= 0) {
                console.log(" Invalid price:", regularPrice);
                res.status(400).json({ error: "Regular price must be greater than 0" });
                return;
            }

            console.log("All validations passed, creating course...");

            const course = await this.courseService.addCourse({
                courseTitle,
                imageUrl,
                description,
                regularPrice,
                adminId
            });

            if (course) {
                console.log("✅ Course created successfully:", course._id);
                res.status(201).json({
                    message: "Course created successfully",
                    course
                });
            } else {
                console.log("❌ Service returned null");
                res.status(500).json({ error: "Failed to create course" });
            }
        } catch (error: any) {
            console.error("❌ Add Course Error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    async listCourses(req: Request, res: Response): Promise<void> {
        try {
            console.log("=== LIST COURSES REQUEST ===");
            console.log("Request params:", req.params);
            console.log("Request query:", req.query);
            
            const { adminId } = req.params;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string;

            console.log("Extracted values:", { adminId, page, limit, search });

            if (!adminId) {
                console.log("❌ Missing adminId");
                res.status(400).json({ error: "Admin ID is required" });
                return;
            }

            console.log("Calling courseService.listCourses...");
            const result = await this.courseService.listCourses(adminId, page, limit, search);
            console.log("✅ Service result:", result);
            
            res.status(200).json({
                message: "Courses retrieved successfully",
                courses: result.courses,
                total: result.total,
                page,
                limit,
                totalPages: Math.ceil(result.total / limit)
            });
        } catch (error: any) {
            console.error("❌ List Courses Error:", error);
            console.error("Error stack:", error.stack);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    async getCourse(req: Request, res: Response): Promise<void> {
        try {
            const { courseId } = req.params;

            if (!courseId) {
                res.status(400).json({ error: "Course ID is required" });
                return;
            }

            const course = await this.courseService.getCourse(courseId);

            if (course) {
                res.status(200).json({
                    message: "Course retrieved successfully",
                    course
                });
            } else {
                res.status(404).json({ error: "Course not found" });
            }
        } catch (error: any) {
            console.error("Get Course Error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    async editCourse(req: Request, res: Response): Promise<void> {
        try {
            const { courseId } = req.params;
            const updateData = req.body;

            if (!courseId) {
                res.status(400).json({ error: "Course ID is required" });
                return;
            }

            if (Object.keys(updateData).length === 0) {
                res.status(400).json({ error: "No update data provided" });
                return;
            }

            // Validate price if it's being updated
            if (updateData.regularPrice !== undefined && updateData.regularPrice <= 0) {
                res.status(400).json({ error: "Regular price must be greater than 0" });
                return;
            }

            const updatedCourse = await this.courseService.editCourse(courseId, updateData);

            if (updatedCourse) {
                res.status(200).json({
                    message: "Course updated successfully",
                    course: updatedCourse
                });
            } else {
                res.status(404).json({ error: "Course not found" });
            }
        } catch (error: any) {
            console.error("Edit Course Error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    async deleteCourse(req: Request, res: Response): Promise<void> {
        try {
            const { courseId } = req.params;

            if (!courseId) {
                res.status(400).json({ error: "Course ID is required" });
                return;
            }

            const isDeleted = await this.courseService.deleteCourse(courseId);

            if (isDeleted) {
                res.status(200).json({
                    message: "Course deleted successfully"
                });
            } else {
                res.status(404).json({ error: "Course not found" });
            }
        } catch (error: any) {
            console.error("Delete Course Error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
}

