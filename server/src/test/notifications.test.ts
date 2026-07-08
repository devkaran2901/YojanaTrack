import request from 'supertest';
import { app } from '../app';
import { User } from '../models/User';
import { Scheme } from '../models/Scheme';
import { Notification } from '../models/Notification';
import { SchemeService } from '../features/schemes/scheme.service';
import { AuthService } from '../features/auth/auth.service';
import bcrypt from 'bcryptjs';

describe('Notifications Feature', () => {
  let userToken: string;
  let adminToken: string;
  let userId: string;
  let matchingUserId: string;
  let nonMatchingUserId: string;
  let incompleteUserId: string;

  beforeEach(async () => {
    // 1. Create a test admin user and token directly
    const admin = await User.create({
      name: 'Admin Tester',
      email: 'admin_notify@example.com',
      passwordHash: await bcrypt.hash('password123', 10),
      role: 'ADMIN',
    });
    const adminTokens = await AuthService.generateTokens(admin._id.toString(), 'ADMIN');
    adminToken = adminTokens.accessToken;

    // 2. Create a test user with a completed, matching profile
    const matchingUser = await User.create({
      name: 'Matching User',
      email: 'matching@example.com',
      passwordHash: await bcrypt.hash('password123', 10),
      role: 'USER',
      age: 25,
      income: 100000,
      gender: 'FEMALE',
      state: 'Maharashtra',
      occupation: 'Student',
    });
    matchingUserId = matchingUser._id.toString();
    const userTokens = await AuthService.generateTokens(matchingUserId, 'USER');
    userToken = userTokens.accessToken;

    // 3. Create a test user with a completed, non-matching profile (e.g., wrong gender and state)
    const nonMatchingUser = await User.create({
      name: 'Non Matching User',
      email: 'nonmatching@example.com',
      passwordHash: await bcrypt.hash('password123', 10),
      role: 'USER',
      age: 50,
      income: 600000,
      gender: 'MALE',
      state: 'Delhi',
      occupation: 'Salaried',
    });
    nonMatchingUserId = nonMatchingUser._id.toString();

    // 4. Create a test user with an incomplete profile (missing state and income)
    const incompleteUser = await User.create({
      name: 'Incomplete User',
      email: 'incomplete@example.com',
      passwordHash: await bcrypt.hash('password123', 10),
      role: 'USER',
      age: 25,
      gender: 'FEMALE',
      occupation: 'Student',
      // state and income are undefined
    });
    incompleteUserId = incompleteUser._id.toString();
  });

  describe('Bulk Matching & Asynchronous Dispatch', () => {
    it('should generate notifications on scheme creation only for matching complete profiles', async () => {
      // Create a scheme that only fits FEMALE, age limit 18-35, state Maharashtra, maxIncome 300000
      const schemeData = {
        title: 'Special Women Support Scheme',
        description: 'Financial assistance program for female students in Maharashtra.',
        category: 'Social Welfare',
        state: 'Maharashtra',
        minAge: 18,
        maxAge: 35,
        maxIncome: 300000,
        gender: 'FEMALE',
        occupation: 'Student',
        benefits: 'Monthly allowance of Rs. 2000.',
        documentsRequired: ['Aadhaar Card', 'Income Certificate'],
        applicationUrl: 'https://scheme-test.gov.in',
        ministry: 'Welfare Ministry',
        isActive: true,
      };

      // Create scheme via SchemeService (triggers async notifyUsersForNewScheme)
      const createdScheme = await SchemeService.createScheme(schemeData);
      
      // Wait briefly for asynchronous notification fan-out promise to resolve
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 1. Verify matching user got a notification
      const matchingUserNotifications = await Notification.find({ userId: matchingUserId });
      expect(matchingUserNotifications.length).toBe(1);
      expect(matchingUserNotifications[0].schemeId.toString()).toBe(createdScheme._id.toString());
      expect(matchingUserNotifications[0].message).toContain('Special Women Support');

      // 2. Verify non-matching user did NOT get a notification
      const nonMatchingUserNotifications = await Notification.find({ userId: nonMatchingUserId });
      expect(nonMatchingUserNotifications.length).toBe(0);

      // 3. Verify user with incomplete profile did NOT get a notification
      const incompleteUserNotifications = await Notification.find({ userId: incompleteUserId });
      expect(incompleteUserNotifications.length).toBe(0);
    });
  });

  describe('Notification API Endpoints', () => {
    let dummyNotificationId: string;

    beforeEach(async () => {
      // Seed a couple of dummy notifications for testing endpoints
      const scheme = await Scheme.create({
        title: 'Dummy Scheme',
        slug: 'dummy-scheme',
        description: 'Dummy desc',
        category: 'Health',
        benefits: 'Dummy benefit',
        documentsRequired: ['Aadhaar'],
        isActive: true,
      });

      const notification = await Notification.create({
        userId: matchingUserId,
        schemeId: scheme._id,
        message: 'Alert: dummy matching scheme is live!',
        type: 'NEW_SCHEME_MATCH',
        isRead: false,
      });

      dummyNotificationId = notification._id.toString();
    });

    it('should retrieve a paginated list of notifications for the current user', async () => {
      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.notifications.length).toBe(1);
      expect(res.body.data.notifications[0].message).toBe('Alert: dummy matching scheme is live!');
      expect(res.body.data.notifications[0].schemeId).toBeDefined();
    });

    it('should retrieve the count of unread notifications', async () => {
      const res = await request(app)
        .get('/api/notifications/unread-count')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.count).toBe(1);
    });

    it('should mark a specific notification as read', async () => {
      const res = await request(app)
        .patch(`/api/notifications/${dummyNotificationId}/read`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isRead).toBe(true);

      // Verify in DB
      const dbNotif = await Notification.findById(dummyNotificationId);
      expect(dbNotif?.isRead).toBe(true);
    });

    it('should mark all notifications as read', async () => {
      const res = await request(app)
        .patch('/api/notifications/read-all')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify unread count is 0
      const countRes = await request(app)
        .get('/api/notifications/unread-count')
        .set('Authorization', `Bearer ${userToken}`);
      expect(countRes.body.data.count).toBe(0);
    });
  });
});
