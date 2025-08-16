import { Request, Response } from "express";

export interface ICourse{
    _id: string
    courseTitle: string
    imageUrl: string
    description: string
    regularPrice: number
    adminId: string
    buyCount?: number
    createdAt?: Date
    updatedAt?: Date
}

export type CreateCourseDTO = Omit<ICourse, "_id" | "createdAt" | "updatedAt" >;

export interface ICourseRepository{
    addCourse(courseData: CreateCourseDTO): Promise<ICourse | null>
    listCourses(adminId: string,page: number, limit: number, search?: string): Promise<{ courses: ICourse[]; total: number }>;
    findById(courseId: string): Promise<ICourse | null>
    editCourse(courseId: string, courseData: Partial<ICourse>): Promise<ICourse | null>;
    deleteCourse(courseId: string): Promise<boolean>;
    getCourse(page: number, limit: number, search?: string): Promise<{ courses: ICourse[]; total: number; }>
}

export interface ICourseService {
    addCourse(courseData: { courseTitle: string; imageUrl: string;  description: string; regularPrice: number; adminId: string; }): Promise<ICourse | null>;
    listCourses(adminId: string,page: number, limit: number, search ?: string): Promise<{ courses: ICourse[]; total: number }>;
    getCourse(courseId: string): Promise<ICourse | null>
    editCourse(courseId: string, courseData: Partial<ICourse>): Promise<ICourse | null>;
    deleteCourse(courseId: string): Promise<boolean>; 
  }
  

  export interface ICourseController {
    addCourse(req: Request, res: Response): Promise<void>;
    listCourses(req: Request, res: Response): Promise<void>;
    getCourse(req: Request, res: Response): Promise<void>
    editCourse(req: Request, res: Response): Promise<void>;
    deleteCourse(req: Request, res: Response): Promise<void>
  }