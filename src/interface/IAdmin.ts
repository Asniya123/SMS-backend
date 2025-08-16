import { ObjectId } from "mongoose";
import { Request, Response } from "express";

export interface IAdmin extends Document {
    _id: ObjectId
    name: string
    email: string
    mobile: number
    password: string
    expiresAt: Date
    isVerified: boolean
    is_blocked?: boolean
    createdAt: string
}

export interface ILogin{
    accessToken : string
    refreshToken: string
    adminId: string
}

export interface IAdminRepository{
     findByEmail(email: string): Promise<IAdmin | null> 
     findById(id: string): Promise<IAdmin | null>
}

export interface IAdminService{
    login(email: string, password: string): Promise<ILogin>
    verifyUser(adminId: string): Promise<IAdmin | null> 
    renewAccessToken(adminId: string): Promise<string>
    // getStudents(): Promise<any[]>
    // getTeachers(): Promise<any[]>
    getCourses(): Promise<any[]>
    getUsers(page: number, limit: number, search?: string): Promise<{ users: any[], total: number, totalStudents: number }>
    blockUnblock(userId: string, isBlocked: boolean): Promise<any>
}

export interface IAdminController{
    login(req: Request, res: Response): Promise<void>
    refreshUserAccessToken(req: Request, res: Response): Promise<void>
    // getStudents(req: Request, res: Response): Promise<void>
    // getTeachers(req: Request, res: Response): Promise<void>
    getCourses(req: Request, res: Response): Promise<void>
    getUsers(req: Request, res: Response): Promise<void>
    blockUnblock(req: Request, res: Response): Promise<void>
}