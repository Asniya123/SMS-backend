
import { ILeave, ILeaveInput, ILeaveRepository, ILeaveService } from '../../interface/ILeave';
import leaveRepository from '../../repositories/user/leaveRepository';

export class LeaveService implements ILeaveService{ 
  private leaveRepository: ILeaveRepository;

  constructor(leaveRepository: ILeaveRepository) {
    this.leaveRepository = leaveRepository;
  }

  async applyLeave(userId: string, leaveData: ILeaveInput): Promise<ILeave> {
    if (leaveData.startDate > leaveData.endDate) {
      throw new Error('Start date must be before end date');
    }
    return await this.leaveRepository.applyLeave(userId, leaveData);
  }

  async getUserLeaves(userId: string, page: number, limit: number): Promise<{ leaves: ILeave[]; total: number }> {
    return await this.leaveRepository.getUserLeaves(userId, page, limit);
  }

  async getPendingLeaves(page: number, limit: number): Promise<{ leaves: ILeave[]; total: number }> {
    return await this.leaveRepository.getPendingLeaves(page, limit);
  }

  async updateLeaveStatus(leaveId: string, status: 'Approved' | 'Rejected', rejectionReason?: string): Promise<ILeave> {
    return await this.leaveRepository.updateLeaveStatus(leaveId, status, rejectionReason);
  }

  async getCalendarLeaves(): Promise<ILeave[]> {
    return await this.leaveRepository.getCalendarLeaves();
  }
}

export default new LeaveService(leaveRepository)