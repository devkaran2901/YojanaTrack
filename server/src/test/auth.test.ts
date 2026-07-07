import request from 'supertest';
import { app } from '../app';
import { User } from '../models/User';

describe('Authentication Flow', () => {
  it('should successfully register a new user', async () => {
    const testUser = {
      name: 'Test Tester 1',
      email: 'tester1@example.com',
      password: 'password123',
    };

    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.name).toBe(testUser.name);
    expect(res.body.data.user.role).toBe('USER');
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.headers['set-cookie']).toBeDefined();

    // Verify user is in MongoDB
    const userInDb = await User.findOne({ email: testUser.email });
    expect(userInDb).toBeTruthy();
    expect(userInDb?.name).toBe(testUser.name);
  });

  it('should fail registration with invalid input', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'T',
        email: 'invalid-email',
        password: '123',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should successfully login a registered user', async () => {
    const testUser = {
      name: 'Test Tester 2',
      email: 'tester2@example.com',
      password: 'password123',
    };

    // Register first
    await request(app)
      .post('/api/auth/register')
      .send(testUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.name).toBe(testUser.name);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('should fail login with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'wrong@example.com',
        password: 'wrongpassword',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should successfully get current user profile (me) using accessToken', async () => {
    const testUser = {
      name: 'Test Tester 3',
      email: 'tester3@example.com',
      password: 'password123',
    };

    const regRes = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    const token = regRes.body.data.accessToken;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role).toBe('USER');
    expect(res.body.data.id).toBeDefined();
  });

  it('should fail getting profile with expired or missing token', async () => {
    const res = await request(app)
      .get('/api/auth/me');

    expect(res.status).toBe(401);
  });

  it('should successfully refresh access tokens using refresh cookie', async () => {
    const testUser = {
      name: 'Test Tester 4',
      email: 'tester4@example.com',
      password: 'password123',
    };

    const regRes = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    // Extract cookie
    const cookies = regRes.headers['set-cookie'];
    
    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', cookies);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('should fail token refresh with missing or invalid refresh token', async () => {
    const res = await request(app)
      .post('/api/auth/refresh');

    expect(res.status).toBe(401);
  });
});
