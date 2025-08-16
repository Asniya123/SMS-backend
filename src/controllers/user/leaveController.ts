import { Request, Response } from 'express';
import { ILeaveController, ILeaveInput, ILeaveService } from '../../interface/ILeave';


export class LeaveController implements ILeaveController{
  private leaveService: ILeaveService;

  constructor(leaveService: ILeaveService) {
    this.leaveService = leaveService;
  }

  async applyLeave(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    console.log('req.user:', req.user); // Debug log
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: User not authenticated' });
      return;
    }
    const leaveData: ILeaveInput = req.body;
    const leave = await this.leaveService.applyLeave(userId, leaveData);
    res.status(201).json(leave);
  } catch (error: any) {
    console.error('Error in applyLeave:', error); // Debug log
    res.status(400).json({ message: error.message });
  }
}
  

  async getUserLeaves(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized: User not authenticated' });
        return;
      }
      const { page = 1, limit = 10 } = req.query;
      const leaves = await this.leaveService.getUserLeaves(userId, Number(page), Number(limit));
      res.json(leaves);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getPendingLeaves(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10 } = req.query;
      const leaves = await this.leaveService.getPendingLeaves(Number(page), Number(limit));
      res.json(leaves);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async updateLeaveStatus(req: Request, res: Response): Promise<void> {
    try {
      const { leaveId } = req.params;
      const { status, rejectionReason } = req.body;
      if (!['Approved', 'Rejected'].includes(status)) {
        throw new Error('Invalid status');
      }
      const leave = await this.leaveService.updateLeaveStatus(leaveId, status, rejectionReason);
      res.json(leave);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async getCalendarLeaves(req: Request, res: Response): Promise<void> {
    try {
      const leaves = await this.leaveService.getCalendarLeaves();
      res.json(leaves);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}