import mongoose from "mongoose";
import { Request, Response } from "express";

export interface ILeave extends Document {
  userId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILeaveInput {
  startDate: Date;
  endDate: Date;
  reason: string;
}


export interface ILeaveRepository{
    applyLeave(userId: string, leaveData: ILeaveInput): Promise<ILeave>
    getUserLeaves(userId: string, page: number, limit: number): Promise<{ leaves: ILeave[]; total: number }>
    getPendingLeaves(page: number, limit: number): Promise<{ leaves: ILeave[]; total: number }>
    updateLeaveStatus(leaveId: string, status: 'Approved' | 'Rejected', rejectionReason?: string): Promise<ILeave>
    getCalendarLeaves(): Promise<ILeave[]>
}

export interface ILeaveService{
    applyLeave(userId: string, leaveData: ILeaveInput): Promise<ILeave>
    getUserLeaves(userId: string, page: number, limit: number): Promise<{ leaves: ILeave[]; total: number }>
    getPendingLeaves(page: number, limit: number): Promise<{ leaves: ILeave[]; total: number }>
    updateLeaveStatus(leaveId: string, status: 'Approved' | 'Rejected', rejectionReason?: string): Promise<ILeave>
    getCalendarLeaves(): Promise<ILeave[]>
}

export interface ILeaveController{
    applyLeave(req: Request, res: Response): Promise<void>
    getUserLeaves(req: Request, res: Response): Promise<void>
    getPendingLeaves(req: Request, res: Response): Promise<void>
    updateLeaveStatus(req: Request, res: Response): Promise<void>
    getCalendarLeaves(req: Request, res: Response): Promise<void>
}