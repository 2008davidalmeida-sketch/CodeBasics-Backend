import mongoose from 'mongoose'

async function connectDB(): Promise<void> {
    const mongoUri = process.env.MONGO_URI as string;

    const options: mongoose.ConnectOptions = {
        maxPoolSize: 10, // Maintain up to 10 socket connections
        minPoolSize: 2,  // Maintain at least 2 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    };

    try {
        const conn = await mongoose.connect(mongoUri, options)
        console.log(`MongoDB connected: ${conn.connection.host}`)
    } catch (error) {
        console.error('MongoDB connection error:', error)
        // If initial connection fails, exit
        process.exit(1)
    }

    // Monitor connection for errors after initial connection
    mongoose.connection.on('error', (err) => {
        console.error('Mongoose runtime error:', err);
    });

    mongoose.connection.on('disconnected', () => {
        console.warn('Mongoose disconnected. Attempting to reconnect...');
    });
}


export default connectDB