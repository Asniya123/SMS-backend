import { ObjectId } from "mongoose";
import { Request, Response } from "express";

export interface IStudent extends Document {
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
    userId: string
}

export interface IStudentRepository{
     findByEmail(email: string): Promise<IStudent | null> 
     findById(id: string): Promise<IStudent | null>
}

export interface IStudentService{
    login(email: string, password: string): Promise<ILogin>
    verifyUser(userId: string): Promise<IStudent | null> 
    renewAccessToken(userId: string): Promise<string>
}

export interface IStudentController{
    login(req: Request, res: Response): Promise<void>
    refreshUserAccessToken(req: Request, res: Response): Promise<void>
}