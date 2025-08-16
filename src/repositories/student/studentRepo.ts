import { IStudent, IStudentRepository } from "../../interface/IStudent";
import studentModel from "../../models/studentModel";

class StudentRepository implements IStudentRepository{

    async findByEmail(email: string): Promise<IStudent | null> {
        try {
            const student = await studentModel.findOne({email})
            return student
        } catch (error) {
            console.error('Error finding student by email:', error)
            throw error
        }
    }

    async findById(id: string): Promise<IStudent | null> {
        try {
            return await studentModel.findById(id)
        } catch (error) {
            console.error("Error finding student by ID", error)
            throw error
        }
    }

    async updateById(id: string, updateData: Partial<IStudent>): Promise<IStudent | null> {
        try {
            return await studentModel.findByIdAndUpdate(id, updateData, { new: true })
        } catch (error) {
            console.error("Error updating student by ID", error)
            throw error
        }
    }

    async getUsers(page: number, limit: number, search?: string): Promise<{ users: any[], total: number, totalStudents: number }> {
        try {
          const skip = (page - 1) * limit;
          const matchStage = search
            ? {
                $or: [
                  { name: { $regex: search, $options: 'i' } },
                  { email: { $regex: search, $options: 'i' } },
                ],
              }
            : {};
      
          const [users, total, totalStudents] = await Promise.all([
            studentModel.aggregate([
              { $match: matchStage },
              { $skip: skip },
              { $limit: limit },
              {
                $project: {
                  _id: 1,
                  name: 1,
                  email: 1,
                  is_blocked: 1,
                  createdAt: 1,
                  role: { $literal: 'Student' },
                  joinDate: '$createdAt'
                },
              },
            ]),
            studentModel.countDocuments(matchStage),
            studentModel.countDocuments({}),
          ]);
      
          return {
            users: users || [],
            total: total || 0,
            totalStudents: totalStudents || 0,
          };
        } catch (error: any) {
          console.error('Error in StudentRepository.getUsers:', error);
          throw new Error('Failed to fetch users from database');
        }
      }
}

export default new StudentRepository()