import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import Redis from 'ioredis-mock';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  // Start the in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Connect Mongoose to the in-memory instance
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  // Disconnect and stop the in-memory MongoDB instance
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  // Clear the database after each test so tests don't interfere with each other
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Mock the Redis module to use ioredis-mock instead of connecting to a real Redis server
jest.mock('ioredis', () => require('ioredis-mock'));

// Mock the rate limiter middleware so it doesn't fail during tests due to missing Redis features
jest.mock('../src/middleware/rateLimiter', () => {
  return {
    submissionLimiter: (req: any, res: any, next: any) => next()
  };
});
