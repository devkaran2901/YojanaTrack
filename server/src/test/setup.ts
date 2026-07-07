// Override environment variables for testing
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost:27017/yojanatrack_test';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.JWT_SECRET = 'testjwtsecretlongenoughforzodvalidation';
process.env.JWT_REFRESH_SECRET = 'testjwtrefreshsecretlongenoughforzodvalidation';
process.env.CLIENT_URL = 'http://localhost:5173';

import mongoose from 'mongoose';

// Mock Redis to prevent connection errors and test caching behavior
jest.mock('../lib/redis', () => ({
  redis: {
    get: jest.fn(),
    setex: jest.fn(),
    keys: jest.fn().mockResolvedValue([]),
    del: jest.fn(),
    on: jest.fn(),
  },
}));

beforeAll(async () => {
  // Connect to the test database
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI!);
  }
});

afterEach(async () => {
  // Clear collections between tests to keep them isolated
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  // Disconnect after all tests
  await mongoose.disconnect();
});
