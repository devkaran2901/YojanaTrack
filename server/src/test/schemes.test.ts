import request from 'supertest';
import { app } from '../app';
import { User } from '../models/User';
import { Scheme } from '../models/Scheme';
import { AuthService } from '../features/auth/auth.service';
import bcrypt from 'bcryptjs';

describe('Schemes and Eligibility Flow', () => {
  let adminToken: string;
  let userToken: string;
  let normalUser: any;
  let testScheme: any;

  beforeEach(async () => {
    // Create admin user and get token
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash: await bcrypt.hash('admin123', 10),
      role: 'ADMIN',
    });
    const adminTokens = await AuthService.generateTokens(admin._id.toString(), 'ADMIN');
    adminToken = adminTokens.accessToken;

    // Create normal user and get token
    normalUser = await User.create({
      name: 'Normal User',
      email: 'user@example.com',
      passwordHash: await bcrypt.hash('user123', 10),
      role: 'USER',
    });
    const userTokens = await AuthService.generateTokens(normalUser._id.toString(), 'USER');
    userToken = userTokens.accessToken;

    // Seed a test scheme
    testScheme = await Scheme.create({
      title: 'Pradhan Mantri Awas Yojana',
      slug: 'pradhan-mantri-awas-yojana',
      description: 'Provides housing for all in urban areas.',
      category: 'Housing',
      state: 'National',
      minAge: 18,
      maxAge: 70,
      maxIncome: 600000,
      gender: 'ALL',
      benefits: 'Financial subsidy on home loans',
      documentsRequired: ['Aadhaar', 'Income Certificate'],
      isActive: true,
    });
  });

  describe('GET /api/schemes', () => {
    it('should list active schemes', async () => {
      const res = await request(app).get('/api/schemes');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.schemes).toHaveLength(1);
      expect(res.body.data.schemes[0].title).toBe(testScheme.title);
    });

    it('should filter schemes by category', async () => {
      // Get schemes matching existing category
      const res = await request(app)
        .get('/api/schemes')
        .query({ category: 'Housing' });

      expect(res.status).toBe(200);
      expect(res.body.data.schemes).toHaveLength(1);

      // Get schemes matching non-existent category
      const resEmpty = await request(app)
        .get('/api/schemes')
        .query({ category: 'Agriculture' });

      expect(resEmpty.status).toBe(200);
      expect(resEmpty.body.data.schemes).toHaveLength(0);
    });

    it('should search schemes by title', async () => {
      const res = await request(app)
        .get('/api/schemes')
        .query({ search: 'Awas' });

      expect(res.status).toBe(200);
      expect(res.body.data.schemes).toHaveLength(1);
    });
  });

  describe('GET /api/schemes/:slug', () => {
    it('should get a single scheme by slug', async () => {
      const res = await request(app).get(`/api/schemes/${testScheme.slug}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe(testScheme.title);
    });

    it('should return 404 for non-existent slug', async () => {
      const res = await request(app).get('/api/schemes/non-existent-slug');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/schemes (Admin)', () => {
    const newScheme = {
      title: 'New Student Scheme',
      description: 'Scholarships for students.',
      category: 'Education',
      state: 'National',
      minAge: 15,
      maxAge: 25,
      maxIncome: 250000,
      gender: 'ALL',
      benefits: 'Full tuition coverage',
      documentsRequired: ['Aadhaar', 'School ID'],
    };

    it('should allow admin to create a new scheme', async () => {
      const res = await request(app)
        .post('/api/schemes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newScheme);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe(newScheme.title);
    });

    it('should forbid non-admin from creating a scheme', async () => {
      const res = await request(app)
        .post('/api/schemes')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newScheme);

      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/schemes/match', () => {
    it('should successfully match eligible schemes based on profile', async () => {
      const res = await request(app)
        .post('/api/schemes/match')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          age: 25,
          income: 300000,
          gender: 'MALE',
          state: 'National',
          occupation: 'STUDENT',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toBe(testScheme.title);
    });

    it('should filter out schemes where user is ineligible', async () => {
      // User is ineligible because income is too high (700000 > 600000)
      const res = await request(app)
        .post('/api/schemes/match')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          age: 25,
          income: 700000,
          gender: 'MALE',
          state: 'National',
          occupation: 'STUDENT',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(0);
    });
  });
});
