import mongoose from 'mongoose';
import { env } from '../config/env';

const dropDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('Dropping database...');
    await mongoose.connection.dropDatabase();
    console.log('✅ Database dropped');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

dropDatabase();
