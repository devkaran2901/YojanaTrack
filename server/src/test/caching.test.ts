import { redis } from '../lib/redis';
import { SchemeService } from '../features/schemes/scheme.service';
import { Scheme } from '../models/Scheme';
import mongoose from 'mongoose';

// Access the mocked redis instance
const mockedRedis = redis as jest.Mocked<typeof redis>;

describe('Redis Caching Behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should hit the database on cache miss and save to Redis, then hit cache on subsequent call', async () => {
    // 1. Mock Redis cache miss (returns null)
    mockedRedis.get.mockResolvedValueOnce(null);

    // Spy on Mongoose Scheme.find query execution
    const findSpy = jest.spyOn(Scheme, 'find');

    const filters = { page: '1', limit: '10' };

    // First call: Expect cache miss, calls Mongoose find
    const res1 = await SchemeService.getSchemes(filters);
    expect(mockedRedis.get).toHaveBeenCalledTimes(1);
    expect(findSpy).toHaveBeenCalledTimes(1);
    expect(mockedRedis.setex).toHaveBeenCalledTimes(1);

    // Save the mock serialized data returned in first call
    const cachedData = JSON.stringify(res1);

    // 2. Mock Redis cache hit (returns the cached string)
    mockedRedis.get.mockResolvedValueOnce(cachedData);

    // Reset Mongoose spy count
    findSpy.mockClear();

    // Second call: Expect cache hit, does NOT call Mongoose find
    const res2 = await SchemeService.getSchemes(filters);
    expect(mockedRedis.get).toHaveBeenCalledTimes(2);
    expect(findSpy).not.toHaveBeenCalled();
    expect(res2).toEqual(res1);

    findSpy.mockRestore();
  });

  it('should invalidate cache when creating, updating, or deleting a scheme', async () => {
    // Mock keys response
    mockedRedis.keys.mockResolvedValueOnce(['schemes:page=1&limit=10']);

    // Create mock scheme parameters
    const mockSchemePayload = {
      title: 'Cache Invalidation Test Scheme',
      description: 'A test scheme description long enough.',
      category: 'Finance',
      benefits: 'Test benefits',
      documentsRequired: ['Aadhaar'],
    };

    // 1. Invalidation on create
    const created = await SchemeService.createScheme(mockSchemePayload);
    expect(mockedRedis.keys).toHaveBeenCalledWith('schemes:*');
    expect(mockedRedis.del).toHaveBeenCalledWith('schemes:page=1&limit=10');

    // 2. Invalidation on update
    mockedRedis.keys.mockResolvedValueOnce(['schemes:page=1&limit=10']);
    await SchemeService.updateScheme(created._id.toString(), { title: 'Updated Cache Invalidation Scheme' });
    expect(mockedRedis.keys).toHaveBeenCalledTimes(2);

    // 3. Invalidation on delete
    mockedRedis.keys.mockResolvedValueOnce(['schemes:page=1&limit=10']);
    await SchemeService.deleteScheme(created._id.toString());
    expect(mockedRedis.keys).toHaveBeenCalledTimes(3);
  });
});
