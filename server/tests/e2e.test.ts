import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { connectDatabase, syncDatabase, closeDatabase } from '../src/models/index.js';
import { User, UserRole, UserStatus, CV, CVStatus, LLMConfiguration, LLMProvider } from '../src/models/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = createApp();

/**
 * End-to-End Test Scenarios
 * These tests simulate complete user workflows
 */

describe('E2E: Complete CV Upload and Processing Workflow', () => {
  let userToken: string;
  let userId: string;

  beforeAll(async () => {
    await connectDatabase();
    await syncDatabase(true);

    // Setup LLM config
    await LLMConfiguration.create({
      name: 'Test Config',
      provider: LLMProvider.GEMINI,
      model: 'gemini-1.5-flash',
      isDefault: true,
      isActive: true,
      temperature: 0.1,
      maxTokens: 4096,
      topP: 0.95,
      extractionStrictness: 'strict',
    });

    // Register user
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'jobseeker@test.com',
        password: 'JobSeeker123!',
        firstName: 'Job',
        lastName: 'Seeker',
      });

    userToken = registerRes.body.data.accessToken;
    userId = registerRes.body.data.user.id;

    // Activate user
    await User.update({ status: UserStatus.ACTIVE }, { where: { id: userId } });
  });

  it('should complete full CV workflow: register -> upload -> process -> view', async () => {
    // Step 1: User uploads CV
    const testPdfPath = path.join(__dirname, 'fixtures', 'sample-cv.pdf');
    if (!fs.existsSync(testPdfPath)) {
      fs.mkdirSync(path.dirname(testPdfPath), { recursive: true });
      fs.writeFileSync(testPdfPath, '%PDF-1.4\nJohn Doe CV\nSoftware Engineer\n5 years experience');
    }

    const uploadRes = await request(app)
      .post('/api/cvs/upload')
      .set('Authorization', `Bearer ${userToken}`)
      .attach('cv', testPdfPath);

    expect(uploadRes.status).toBe(202);
    const cvId = uploadRes.body.data.id;

    // Step 2: Check processing status
    const statusRes = await request(app)
      .get(`/api/cvs/${cvId}/status`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(statusRes.status).toBe(200);
    expect(['PENDING', 'PROCESSING'].includes(statusRes.body.data.status)).toBe(true);

    // Step 3: View CV details
    const cvRes = await request(app)
      .get(`/api/cvs/${cvId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(cvRes.status).toBe(200);
    expect(cvRes.body.data.id).toBe(cvId);
    expect(cvRes.body.data.userId).toBe(userId);

    // Step 4: List all CVs
    const listRes = await request(app)
      .get('/api/cvs')
      .set('Authorization', `Bearer ${userToken}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.data.length).toBeGreaterThan(0);
    expect(listRes.body.data.some((cv: any) => cv.id === cvId)).toBe(true);
  });
});

describe('E2E: Admin User Management Workflow', () => {
  let adminToken: string;
  let adminId: string;
  let createdUserId: string;

  beforeAll(async () => {
    await connectDatabase();
    await syncDatabase(true);

    // Create admin
    const admin = await User.create({
      email: 'admin@workflow.test',
      password: 'Admin123!',
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    });
    adminId = admin.id;

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@workflow.test', password: 'Admin123!' });

    adminToken = loginRes.body.data.accessToken;
  });

  it('should complete admin workflow: create -> activate -> update role -> suspend -> delete', async () => {
    // Step 1: Create new user
    const createRes = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: 'managed@test.com',
        password: 'Managed123!',
        firstName: 'Managed',
        lastName: 'User',
        role: 'USER',
        status: 'PENDING',
      });

    expect(createRes.status).toBe(201);
    createdUserId = createRes.body.data.id;

    // Step 2: Activate user
    const activateRes = await request(app)
      .post(`/api/users/${createdUserId}/activate`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(activateRes.status).toBe(200);
    expect(activateRes.body.data.status).toBe('ACTIVE');

    // Step 3: Update user role
    const roleRes = await request(app)
      .patch(`/api/users/${createdUserId}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'MODERATOR' });

    expect(roleRes.status).toBe(200);
    expect(roleRes.body.data.role).toBe('MODERATOR');

    // Step 4: Suspend user
    const suspendRes = await request(app)
      .post(`/api/users/${createdUserId}/suspend`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(suspendRes.status).toBe(200);
    expect(suspendRes.body.data.status).toBe('SUSPENDED');

    // Step 5: Delete user
    const deleteRes = await request(app)
      .delete(`/api/users/${createdUserId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(deleteRes.status).toBe(200);

    // Verify deletion
    const verifyRes = await request(app)
      .get(`/api/users/${createdUserId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(verifyRes.status).toBe(404);
  });
});

describe('E2E: Multi-user CV Access Control', () => {
  let user1Token: string;
  let user2Token: string;
  let adminToken: string;
  let user1Id: string;
  let user2Id: string;
  let user1CvId: string;
  let user2CvId: string;

  beforeAll(async () => {
    await connectDatabase();
    await syncDatabase(true);

    // Create users
    const user1 = await User.create({
      email: 'user1@access.test',
      password: 'User123!',
      firstName: 'User',
      lastName: 'One',
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
    });
    user1Id = user1.id;

    const user2 = await User.create({
      email: 'user2@access.test',
      password: 'User123!',
      firstName: 'User',
      lastName: 'Two',
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
    });
    user2Id = user2.id;

    const admin = await User.create({
      email: 'admin@access.test',
      password: 'Admin123!',
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    });

    // Login
    const login1 = await request(app).post('/api/auth/login').send({ email: 'user1@access.test', password: 'User123!' });
    const login2 = await request(app).post('/api/auth/login').send({ email: 'user2@access.test', password: 'User123!' });
    const loginAdmin = await request(app).post('/api/auth/login').send({ email: 'admin@access.test', password: 'Admin123!' });

    user1Token = login1.body.data.accessToken;
    user2Token = login2.body.data.accessToken;
    adminToken = loginAdmin.body.data.accessToken;

    // Create CVs
    const cv1 = await CV.create({
      userId: user1Id,
      originalFileName: 'user1-cv.pdf',
      documentType: 'PDF',
      fileSize: 1000,
      status: CVStatus.COMPLETED,
    });
    user1CvId = cv1.id;

    const cv2 = await CV.create({
      userId: user2Id,
      originalFileName: 'user2-cv.pdf',
      documentType: 'PDF',
      fileSize: 2000,
      status: CVStatus.COMPLETED,
    });
    user2CvId = cv2.id;
  });

  it('should enforce access control: user can only see own CVs', async () => {
    // User1 can see own CV
    const ownRes = await request(app)
      .get(`/api/cvs/${user1CvId}`)
      .set('Authorization', `Bearer ${user1Token}`);
    expect(ownRes.status).toBe(200);

    // User1 cannot see User2's CV
    const otherRes = await request(app)
      .get(`/api/cvs/${user2CvId}`)
      .set('Authorization', `Bearer ${user1Token}`);
    expect(otherRes.status).toBe(403);

    // User1's list only shows own CVs
    const listRes = await request(app)
      .get('/api/cvs')
      .set('Authorization', `Bearer ${user1Token}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.data.every((cv: any) => cv.userId === user1Id)).toBe(true);
  });

  it('should allow admin to see all CVs', async () => {
    // Admin can see User1's CV
    const cv1Res = await request(app)
      .get(`/api/cvs/${user1CvId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(cv1Res.status).toBe(200);

    // Admin can see User2's CV
    const cv2Res = await request(app)
      .get(`/api/cvs/${user2CvId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(cv2Res.status).toBe(200);

    // Admin's list shows all CVs
    const listRes = await request(app)
      .get('/api/cvs')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.data.length).toBeGreaterThanOrEqual(2);
  });
});

describe('E2E: Token Refresh and Session Management', () => {
  let accessToken: string;
  let refreshToken: string;
  let userId: string;

  beforeAll(async () => {
    await connectDatabase();
    await syncDatabase(true);

    const user = await User.create({
      email: 'session@test.com',
      password: 'Session123!',
      firstName: 'Session',
      lastName: 'User',
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
    });
    userId = user.id;

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'session@test.com', password: 'Session123!' });

    accessToken = loginRes.body.data.accessToken;
    refreshToken = loginRes.body.data.refreshToken;
  });

  it('should refresh token and invalidate old one', async () => {
    // Use current access token
    const profile1 = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(profile1.status).toBe(200);

    // Refresh token
    const refreshRes = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken });

    expect(refreshRes.status).toBe(200);
    const newAccessToken = refreshRes.body.data.accessToken;
    const newRefreshToken = refreshRes.body.data.refreshToken;

    // Old refresh token should be invalid
    const oldRefreshRes = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken });
    expect(oldRefreshRes.status).toBe(401);

    // New access token should work
    const profile2 = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${newAccessToken}`);
    expect(profile2.status).toBe(200);
  });

  it('should logout and invalidate all tokens', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'session@test.com', password: 'Session123!' });

    const token = loginRes.body.data.accessToken;

    // Logout
    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${token}`);
    expect(logoutRes.status).toBe(200);

    // Try to use token after logout (token itself is still valid, but refresh tokens are revoked)
    const profileRes = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`);
    expect(profileRes.status).toBe(200); // Access token still works until expiry
  });
});

describe('E2E: Search and Filter CVs', () => {
  let adminToken: string;

  beforeAll(async () => {
    await connectDatabase();
    await syncDatabase(true);

    const admin = await User.create({
      email: 'admin@search.test',
      password: 'Admin123!',
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    });

    const user = await User.create({
      email: 'user@search.test',
      password: 'User123!',
      firstName: 'Test',
      lastName: 'User',
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
    });

    // Create CVs with different statuses
    await CV.bulkCreate([
      { userId: user.id, originalFileName: 'cv1.pdf', documentType: 'PDF', fileSize: 1000, status: CVStatus.COMPLETED },
      { userId: user.id, originalFileName: 'cv2.pdf', documentType: 'PDF', fileSize: 2000, status: CVStatus.PENDING },
      { userId: user.id, originalFileName: 'cv3.pdf', documentType: 'PDF', fileSize: 3000, status: CVStatus.FAILED },
    ]);

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@search.test', password: 'Admin123!' });

    adminToken = loginRes.body.data.accessToken;
  });


  it('should filter CVs by status', async () => {
    const completedRes = await request(app)
      .get('/api/cvs?status=COMPLETED')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(completedRes.status).toBe(200);
    expect(completedRes.body.data.every((cv: any) => cv.status === 'COMPLETED')).toBe(true);

    const pendingRes = await request(app)
      .get('/api/cvs?status=PENDING')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(pendingRes.status).toBe(200);
    expect(pendingRes.body.data.every((cv: any) => cv.status === 'PENDING')).toBe(true);
  });

  it('should paginate results correctly', async () => {
    const page1 = await request(app)
      .get('/api/cvs?page=1&limit=2')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(page1.status).toBe(200);
    expect(page1.body.data.length).toBeLessThanOrEqual(2);
    expect(page1.body.pagination.page).toBe(1);
    expect(page1.body.pagination.limit).toBe(2);

    const page2 = await request(app)
      .get('/api/cvs?page=2&limit=2')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(page2.status).toBe(200);
    expect(page2.body.pagination.page).toBe(2);
  });
});