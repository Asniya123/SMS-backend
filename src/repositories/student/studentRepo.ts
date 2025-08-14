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
}

export default new StudentRepository()