import mongoose from 'mongoose'

const connectDB = async (): Promise<void> => {
    try {
        // Connect to the MongoDB database
        const conn = await mongoose.connect(process.env.MONGO_URI as string)
        console.log(`MongoDB connected: ${conn.connection.host}`)
    } catch (error) {
        console.error('MongoDB connection error:', error)
        process.exit(1)
    }
}

export default connectDB