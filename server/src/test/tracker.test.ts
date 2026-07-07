import request from 'supertest';
import { app } from '../app';
import { User } from '../models/User';
import { Scheme } from '../models/Scheme';
import { ApplicationTrack } from '../models/ApplicationTrack';
import { AuthService } from '../features/auth/auth.service';
import bcrypt from 'bcryptjs';

describe('Application Tracker and Upcoming Deadlines', () => {
  let userToken: string;
  let normalUser: any;
  let nearDeadlineScheme: any;
  let farDeadlineScheme: any;

  beforeEach(async () => {
    // Create normal user and get token
    normalUser = await User.create({
      name: 'Normal User',
      email: 'user@example.com',
      passwordHash: await bcrypt.hash('user123', 10),
      role: 'USER',
    });
    const userTokens = await AuthService.generateTokens(normalUser._id.toString(), 'USER');
    userToken = userTokens.accessToken;

    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const tenDaysFromNow = new Date();
    tenDaysFromNow.setDate(tenDaysFromNow.getDate() + 10);

    // Seed schemes
    nearDeadlineScheme = await Scheme.create({
      title: 'Scheme Near Deadline',
      slug: 'scheme-near-deadline',
      description: 'Deadline is in 3 days.',
      category: 'Education',
      benefits: 'Tuition waiver',
      documentsRequired: ['Aadhaar'],
      deadline: threeDaysFromNow,
    });

    farDeadlineScheme = await Scheme.create({
      title: 'Scheme Far Deadline',
      slug: 'scheme-far-deadline',
      description: 'Deadline is in 10 days.',
      category: 'Finance',
      benefits: 'Subsidy support',
      documentsRequired: ['Aadhaar'],
      deadline: tenDaysFromNow,
    });
  });

  it('should successfully track upcoming deadlines in the 7-day window', async () => {
    // 1. Track both schemes
    await request(app)
      .post('/api/tracker')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        schemeId: nearDeadlineScheme._id.toString(),
        status: 'INTERESTED',
      });

    await request(app)
      .post('/api/tracker')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        schemeId: farDeadlineScheme._id.toString(),
        status: 'INTERESTED',
      });

    // 2. Query upcoming deadlines
    const res = await request(app)
      .get('/api/tracker/upcoming-deadlines')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    
    // Should ONLY return the one with deadline in 3 days, not 10 days
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].schemeId._id.toString()).toBe(nearDeadlineScheme._id.toString());
  });
});
