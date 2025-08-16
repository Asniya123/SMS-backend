import { IAdmin, IAdminRepository, } from "../../interface/IAdmin";
import adminModel from "../../models/adminModel";

class adminRepository implements IAdminRepository{

    async findByEmail(email: string): Promise<IAdmin | null> {
        try {
            const admin = await adminModel.findOne({email})
            return admin
        } catch (error) {
            console.error('Error finding admin by email:', error)
            throw error
        }
    }

    async findById(id: string): Promise<IAdmin | null> {
        try {
            return await adminModel.findById(id)
        } catch (error) {
            console.error("Error finding admin by ID", error)
            throw error
        }
    }
}

export default new adminRepository()