import { ObjectId } from "mongoose";
import { Request, Response } from "express";

export interface ITutor extends Document {
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
    tutorId: string
}

export interface ITutorRepository{
     findByEmail(email: string): Promise<ITutor | null> 
     findById(id: string): Promise<ITutor | null>
}

export interface ITutorService{
    login(email: string, password: string): Promise<ILogin>
    verifyUser(tutorId: string): Promise<ITutor | null> 
    renewAccessToken(tutorId: string): Promise<string>
}

export interface ITutorController{
    login(req: Request, res: Response): Promise<void>
    refreshUserAccessToken(req: Request, res: Response): Promise<void>
}