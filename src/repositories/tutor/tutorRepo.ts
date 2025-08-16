import { ITutor, ITutorRepository, } from "../../interface/ITutor";
import tutorModel from "../../models/tutorModel";

class tutorRepository implements ITutorRepository{

    async findByEmail(email: string): Promise<ITutor | null> {
        try {
            const tutor = await tutorModel.findOne({email})
            return tutor
        } catch (error) {
            console.error('Error finding tutor by email:', error)
            throw error
        }
    }

    async findById(id: string): Promise<ITutor | null> {
        try {
            return await tutorModel.findById(id)
        } catch (error) {
            console.error("Error finding tutor by ID", error)
            throw error
        }
    }
}

export default new tutorRepository()