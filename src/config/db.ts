import mongoose from "mongoose"

const mongoConnect = async () : Promise<void> => {
    try{
        if(!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is not defined in environment variables")
        }

        await mongoose.connect(process.env.MONGO_URI)
        console.log('✅ Database connected successfully')
        console.log('MongoDB URI:', process.env.MONGO_URI ? 'Set' : 'Not set')
    }catch(error){
        console.error('❌ Database connection failed:', error)
        process.exit(1) // Exit if database connection fails
    }
}

export default mongoConnect