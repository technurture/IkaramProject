import mongoose from 'mongoose';

const MONGODB_URL = process.env.MONGODB_URL || "mongodb+srv://technurture619:EljLBiQMpurchBD1@ikaram.13ysrj8.mongodb.net/?retryWrites=true&w=majority&appName=Ikaram";

if (!MONGODB_URL) {
  throw new Error('MONGODB_URL environment variable is not defined');
}

export async function connectMongoDB() {
  try {
    await mongoose.connect(MONGODB_URL);
    console.log('✅ Connected to MongoDB successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw error;
  }
}

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

export default mongoose;