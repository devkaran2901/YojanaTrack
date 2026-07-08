import request from 'supertest';
import { app } from '../app';
import { User } from '../models/User';

describe('Profile Management Flow', () => {
  let accessToken: string;
  let userId: string;

  beforeEach(async () => {
    // Register a test user to get access token
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Profile Tester',
        email: 'profiletest@example.com',
        password: 'password123',
      });

    accessToken = registerRes.body.data.accessToken;
    userId = registerRes.body.data.user.id;
  });

  describe('GET /api/profile', () => {
    it('should return 401 if unauthorized', async () => {
      const res = await request(app).get('/api/profile');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return user profile details', async () => {
      const res = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Profile Tester');
      expect(res.body.data.email).toBe('profiletest@example.com');
      expect(res.body.data.age).toBeNull();
      expect(res.body.data.income).toBeNull();
    });
  });

  describe('PUT /api/profile', () => {
    it('should return 401 if unauthorized', async () => {
      const res = await request(app)
        .put('/api/profile')
        .send({
          age: 30,
          income: 200000,
          gender: 'FEMALE',
          state: 'Maharashtra',
          occupation: 'Salaried',
        });
      expect(res.status).toBe(401);
    });

    it('should successfully update user profile details', async () => {
      const updateData = {
        age: 30,
        income: 200000,
        gender: 'FEMALE',
        state: 'Maharashtra',
        occupation: 'Salaried',
      };

      const res = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.age).toBe(30);
      expect(res.body.data.income).toBe(200000);
      expect(res.body.data.gender).toBe('FEMALE');
      expect(res.body.data.state).toBe('Maharashtra');
      expect(res.body.data.occupation).toBe('Salaried');

      // Verify in DB
      const userInDb = await User.findById(userId);
      expect(userInDb?.age).toBe(30);
      expect(userInDb?.gender).toBe('FEMALE');
    });

    it('should return 400 validation error for invalid age', async () => {
      const res = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          age: 150, // invalid: max 120
          income: 200000,
          gender: 'FEMALE',
          state: 'Maharashtra',
          occupation: 'Salaried',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('age');
    });

    it('should return 400 validation error for negative income', async () => {
      const res = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          age: 30,
          income: -500, // invalid: must be non-negative
          gender: 'FEMALE',
          state: 'Maharashtra',
          occupation: 'Salaried',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('income');
    });

    it('should return 400 validation error for invalid gender enum', async () => {
      const res = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          age: 30,
          income: 200000,
          gender: 'INVALID_GENDER', // invalid enum
          state: 'Maharashtra',
          occupation: 'Salaried',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('gender');
    });
  });
});
