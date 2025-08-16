import mongoose from 'mongoose';
import { ILeave, ILeaveInput, ILeaveRepository } from '../../interface/ILeave';
import leaveModel from '../../models/leaveModel';

export class LeaveRepository implements ILeaveRepository {
  // Student: Apply for leave
  async applyLeave(userId: string, leaveData: ILeaveInput): Promise<ILeave> {
    try {
      if (!userId || !mongoose.isValidObjectId(userId)) {
        throw new Error('Invalid userId');
      }
      const leave = new leaveModel({
        userId: new mongoose.Types.ObjectId(userId),
        ...leaveData,
        status: 'Pending',
      });
      return await leave.save();
    } catch (error: any) {
      console.error('Error in applyLeave:', error.message, error.stack);
      throw new Error(`Failed to apply leave: ${error.message}`);
    }
  }

  // Student: Get own leave list
  async getUserLeaves(userId: string, page: number, limit: number): Promise<{ leaves: ILeave[]; total: number }> {
    try {
      if (!userId || !mongoose.isValidObjectId(userId)) {
        throw new Error('Invalid userId');
      }
      const skip = (page - 1) * limit;
      const leaves = await leaveModel
        .find({ userId: new mongoose.Types.ObjectId(userId) })
        .populate('userId', 'name email')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
      const total = await leaveModel.countDocuments({ userId: new mongoose.Types.ObjectId(userId) });
      return { leaves, total };
    } catch (error: any) {
      console.error('Error in getUserLeaves:', error.message, error.stack);
      throw new Error(`Failed to fetch user leaves: ${error.message}`);
    }
  } // Added missing closing brace

  // Admin: Get all pending leaves
  async getPendingLeaves(page: number, limit: number): Promise<{ leaves: ILeave[]; total: number }> {
    try {
      const skip = (page - 1) * limit;
      const leaves = await leaveModel
        .find({ status: 'Pending' })
        .populate('userId', 'name email')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
      const total = await leaveModel.countDocuments({ status: 'Pending' });
      return { leaves, total };
    } catch (error: any) {
      console.error('Error in getPendingLeaves:', error.message, error.stack);
      throw new Error(`Failed to fetch pending leaves: ${error.message}`);
    }
  }

  // Admin: Approve or reject leave
  async updateLeaveStatus(leaveId: string, status: 'Approved' | 'Rejected', rejectionReason?: string): Promise<ILeave> {
    try {
      if (!mongoose.isValidObjectId(leaveId)) {
        throw new Error('Invalid leaveId');
      }
      const updateData: Partial<ILeave> = { status };
      if (status === 'Rejected' && rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      }
      const leave = await leaveModel.findByIdAndUpdate(leaveId, updateData, { new: true });
      if (!leave) {
        throw new Error('Leave not found');
      }
      return leave;
    } catch (error: any) {
      console.error('Error in updateLeaveStatus:', error.message, error.stack);
      throw new Error(`Failed to update leave status: ${error.message}`);
    }
  }

  // Get all approved leaves for calendar
  async getCalendarLeaves(): Promise<ILeave[]> {
    try {
      return await leaveModel.find({ status: 'Approved' }).populate('userId', 'name');
    } catch (error: any) {
      console.error('Error in getCalendarLeaves:', error.message, error.stack);
      throw new Error(`Failed to fetch calendar leaves: ${error.message}`);
    }
  }
}

export default new LeaveRepository();