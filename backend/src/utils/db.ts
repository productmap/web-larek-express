import mongoose from 'mongoose';
import logger from './logger';

export const connectToDatabase = async () => {
  try {
    if (!process.env.DB_ADDRESS) {
      logger.error('Missing DB_ADDRESS environment variable');
      process.exit(1);
    }

    logger.info('Attempting to connect to MongoDB...');
    await mongoose.connect(process.env.DB_ADDRESS);
    logger.info('Successfully connected to MongoDB');

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.info('MongoDB disconnected');
    });
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};
