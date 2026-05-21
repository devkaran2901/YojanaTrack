import mongoose from 'mongoose';
import { env } from '../config/env';
import { logger } from './logger';

export const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      retryWrites: true,
      w: 'majority',
    });
    logger.info('✅ Connected to MongoDB');
  } catch (error) {
    logger.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    logger.info('✅ Disconnected from MongoDB');
  } catch (error) {
    logger.error('❌ Failed to disconnect from MongoDB:', error);
  }
};

export default mongoose;
