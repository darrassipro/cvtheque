import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
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

let superadminToken: string;
let adminToken: string;
let userToken: string;
let superadminId: string;
let adminId: string;
let userId: string;
let testCVId: string;

// Test credentials
const superadminCreds = {
  email: 'superadmin@test.com',
  password: 'SuperAdmin123!',
  firstName: 'Super',
  lastName: 'Admin',
};

const adminCreds = {
  email: 'admin@test.com',
  password: 'Admin123!',
  firstName: 'Test',
  lastName: 'Admin',
};

const userCreds = {
  email: 'user@test.com',
  password: 'User123!',
  firstName: 'Test',
  lastName: 'User',
};

beforeAll(async () => {
  // Connect and sync database
  await connectDatabase();
  await syncDatabase(true); // Force sync to clean database

  // Create test users
  const superadmin = await User.create({
    ...superadminCreds,
    role: UserRole.SUPERADMIN,
    status: UserStatus.ACTIVE,
  });
  superadminId = superadmin.id;

  const admin = await User.create({
    ...adminCreds,
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
  });
  adminId = admin.id;

  const user = await User.create({
    ...userCreds,
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
  });
  userId = user.id;

  // Create default LLM configuration
  await LLMConfiguration.create({
    name: 'Test Gemini',
    provider: LLMProvider.GEMINI,
    model: 'gemini-1.5-flash',
    isDefault: true,
    isActive: true,
    temperature: 0.1,
    maxTokens: 4096,
    topP: 0.95,
    extractionStrictness: 'strict',
  });

  // Login to get tokens
  const superadminLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: superadminCreds.email, password: superadminCreds.password });
  superadminToken = superadminLogin.body.data.accessToken;

  const adminLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: adminCreds.email, password: adminCreds.password });
  adminToken = adminLogin.body.data.accessToken;

  const userLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: userCreds.email, password: userCreds.password });
  userToken = userLogin.body.data.accessToken;
});

afterAll(async () => {
  await closeDatabase();
});

describe('Authentication Tests', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@test.com',
          password: 'NewUser123!',
          firstName: 'New',
          lastName: 'User',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('newuser@test.com');
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('should fail with duplicate email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: userCreds.email,
          password: 'Password123!',
          firstName: 'Duplicate',
          lastName: 'User',
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'Password123!',
          firstName: 'Test',
          lastName: 'User',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail with weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'weak@test.com',
          password: 'weak',
          firstName: 'Test',
          lastName: 'User',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userCreds.email,
          password: userCreds.password,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
    });

    it('should fail with wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userCreds.email,
          password: 'WrongPassword123!',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should fail with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'Password123!',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh access token', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: userCreds.email, password: userCreds.password });

      const refreshToken = loginRes.body.data.refreshToken;

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('should fail with invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(userCreds.email);
      expect(response.body.data.password).toBeUndefined();
    });

    it('should fail without token', async () => {
      const response = await request(app).get('/api/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});

describe('User Management Tests', () => {
  describe('GET /api/users', () => {
    it('should list users for moderator', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.pagination).toBeDefined();
    });

    it('should fail for regular user', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should filter by role', async () => {
      const response = await request(app)
        .get('/api/users?role=SUPERADMIN')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.every((u: any) => u.role === 'SUPERADMIN')).toBe(true);
    });

    it('should search by email', async () => {
      const response = await request(app)
        .get(`/api/users?search=${userCreds.email}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/users', () => {
    it('should create user as admin', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'created@test.com',
          password: 'Created123!',
          firstName: 'Created',
          lastName: 'User',
          role: 'USER',
          status: 'ACTIVE',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('created@test.com');
    });

    it('should fail to create user as regular user', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          email: 'fail@test.com',
          password: 'Fail123!',
          firstName: 'Fail',
          lastName: 'User',
        });

      expect(response.status).toBe(403);
    });
  });

  describe('PATCH /api/users/:id/role', () => {
    it('should update user role as admin', async () => {
      const response = await request(app)
        .patch(`/api/users/${userId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'MODERATOR' });

      expect(response.status).toBe(200);
      expect(response.body.data.role).toBe('MODERATOR');
    });

    it('should fail to update own role', async () => {
      const response = await request(app)
        .patch(`/api/users/${adminId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'SUPERADMIN' });

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/users/:id/suspend', () => {
    it('should suspend user as admin', async () => {
      const response = await request(app)
        .post(`/api/users/${userId}/suspend`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('SUSPENDED');
    });

    it('should fail to suspend self', async () => {
      const response = await request(app)
        .post(`/api/users/${adminId}/suspend`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/users/:id/activate', () => {
    it('should activate user as admin', async () => {
      const response = await request(app)
        .post(`/api/users/${userId}/activate`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('ACTIVE');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete user as admin', async () => {
      const tempUser = await User.create({
        email: 'todelete@test.com',
        password: 'Delete123!',
        firstName: 'To',
        lastName: 'Delete',
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
      });

      const response = await request(app)
        .delete(`/api/users/${tempUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);

      const deleted = await User.findByPk(tempUser.id);
      expect(deleted).toBeNull();
    });

    it('should fail to delete self', async () => {
      const response = await request(app)
        .delete(`/api/users/${adminId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(403);
    });
  });
});

describe('CV Management Tests', () => {
  describe('POST /api/cvs/upload', () => {
    it('should upload PDF CV successfully', async () => {
      const testPdfPath = path.join(__dirname, 'fixtures', 'test-cv.pdf');
      
      // Create test PDF if it doesn't exist
      if (!fs.existsSync(testPdfPath)) {
        fs.mkdirSync(path.dirname(testPdfPath), { recursive: true });
        fs.writeFileSync(testPdfPath, '%PDF-1.4\nTest CV Content');
      }

      const response = await request(app)
        .post('/api/cvs/upload')
        .set('Authorization', `Bearer ${userToken}`)
        .attach('cv', testPdfPath);

      expect(response.status).toBe(202);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.status).toBe('PENDING');

      testCVId = response.body.data.id;
    });

    it('should fail without file', async () => {
      const response = await request(app)
        .post('/api/cvs/upload')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(400);
    });

    it('should fail without authentication', async () => {
      const testPdfPath = path.join(__dirname, 'fixtures', 'test-cv.pdf');
      
      const response = await request(app)
        .post('/api/cvs/upload')
        .attach('cv', testPdfPath);

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/cvs', () => {
    beforeEach(async () => {
      // Create test CVs
      await CV.create({
        userId,
        originalFileName: 'test1.pdf',
        documentType: 'PDF',
        fileSize: 1000,
        status: CVStatus.COMPLETED,
      });

      await CV.create({
        userId: adminId,
        originalFileName: 'test2.pdf',
        documentType: 'PDF',
        fileSize: 2000,
        status: CVStatus.PENDING,
      });
    });

    it('should list own CVs for regular user', async () => {
      const response = await request(app)
        .get('/api/cvs')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.every((cv: any) => cv.userId === userId)).toBe(true);
    });

    it('should list all CVs for admin', async () => {
      const response = await request(app)
        .get('/api/cvs')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/cvs?status=COMPLETED')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.every((cv: any) => cv.status === 'COMPLETED')).toBe(true);
    });

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/api/cvs?page=1&limit=1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.pagination.totalPages).toBeGreaterThan(0);
    });
  });

  describe('GET /api/cvs/:id', () => {
    it('should get own CV', async () => {
      const cv = await CV.findOne({ where: { userId } });
      
      const response = await request(app)
        .get(`/api/cvs/${cv!.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(cv!.id);
    });

    it('should fail to get other user CV', async () => {
      const cv = await CV.findOne({ where: { userId: adminId } });
      
      const response = await request(app)
        .get(`/api/cvs/${cv!.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });

    it('should get any CV as admin', async () => {
      const cv = await CV.findOne({ where: { userId } });
      
      const response = await request(app)
        .get(`/api/cvs/${cv!.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
    });

    it('should return 404 for non-existent CV', async () => {
      const response = await request(app)
        .get('/api/cvs/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/cvs/:id/status', () => {
    it('should get CV processing status', async () => {
      const cv = await CV.findOne({ where: { userId } });
      
      const response = await request(app)
        .get(`/api/cvs/${cv!.id}/status`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBeDefined();
    });
  });

  describe('DELETE /api/cvs/:id', () => {
    it('should delete own CV', async () => {
      const cv = await CV.create({
        userId,
        originalFileName: 'to-delete.pdf',
        documentType: 'PDF',
        fileSize: 1000,
        status: CVStatus.COMPLETED,
      });

      const response = await request(app)
        .delete(`/api/cvs/${cv.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);

      const deleted = await CV.findByPk(cv.id);
      expect(deleted).toBeNull();
    });

    it('should fail to delete other user CV', async () => {
      const cv = await CV.findOne({ where: { userId: adminId } });
      
      const response = await request(app)
        .delete(`/api/cvs/${cv!.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });
  });
});

describe('LLM Configuration Tests', () => {
  describe('GET /api/llm-config', () => {
    it('should list configurations as admin', async () => {
      const response = await request(app)
        .get('/api/llm-config')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should fail for regular user', async () => {
      const response = await request(app)
        .get('/api/llm-config')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/llm-config', () => {
    it('should create configuration as superadmin', async () => {
      const response = await request(app)
        .post('/api/llm-config')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          name: 'Test OpenAI',
          provider: 'OPENAI',
          model: 'gpt-4o-mini',
          isDefault: false,
          isActive: true,
          temperature: 0.1,
          maxTokens: 4096,
        });

      expect(response.status).toBe(201);
      expect(response.body.data.name).toBe('Test OpenAI');
    });

    it('should fail as admin (not superadmin)', async () => {
      const response = await request(app)
        .post('/api/llm-config')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Should Fail',
          provider: 'GEMINI',
          model: 'gemini-1.5-flash',
        });

      expect(response.status).toBe(403);
    });
  });
});

describe('Admin Dashboard Tests', () => {
  describe('GET /api/admin/dashboard', () => {
    it('should get dashboard stats as admin', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.totalCVs).toBeDefined();
      expect(response.body.data.totalUsers).toBeDefined();
    });

    it('should fail for regular user', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/admin/audit-logs', () => {
    it('should get audit logs as admin', async () => {
      const response = await request(app)
        .get('/api/admin/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.pagination).toBeDefined();
    });

    it('should filter by action', async () => {
      const response = await request(app)
        .get('/api/admin/audit-logs?action=LOGIN')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.every((log: any) => log.action === 'LOGIN')).toBe(true);
    });
  });

  describe('GET /api/admin/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/admin/health')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.server).toBe('healthy');
      expect(response.body.data.database).toBe('healthy');
    });
  });
});

describe('Edge Cases and Error Handling', () => {
  it('should handle invalid UUID in params', async () => {
    const response = await request(app)
      .get('/api/users/invalid-uuid')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(400);
  });

  it('should handle SQL injection attempts', async () => {
    const response = await request(app)
      .get('/api/users?search=' + encodeURIComponent("'; DROP TABLE users; --"))
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('should handle XSS attempts', async () => {
    const response = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: 'xss@test.com',
        password: 'Password123!',
        firstName: '<script>alert("xss")</script>',
        lastName: 'Test',
      });

    expect(response.status).toBe(201);
    const user = await User.findOne({ where: { email: 'xss@test.com' } });
    expect(user?.firstName).toBe('<script>alert("xss")</script>');
  });

  it('should rate limit excessive requests', async () => {
    const requests = Array(150).fill(null).map(() => 
      request(app).get('/api/auth/profile').set('Authorization', `Bearer ${userToken}`)
    );

    const responses = await Promise.all(requests);
    const rateLimited = responses.some(r => r.status === 429);
    expect(rateLimited).toBe(true);
  });

  it('should handle concurrent user creation', async () => {
    const requests = Array(5).fill(null).map((_, i) =>
      request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: `concurrent${i}@test.com`,
          password: 'Password123!',
          firstName: 'Concurrent',
          lastName: `User${i}`,
        })
    );

    const responses = await Promise.all(requests);
    const successful = responses.filter(r => r.status === 201);
    expect(successful.length).toBe(5);
  });

  it('should handle large pagination', async () => {
    const response = await request(app)
      .get('/api/cvs?page=9999&limit=100')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);
  });

  it('should handle malformed JSON', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"email": "test@test.com", "password":');

    expect(response.status).toBe(400);
  });

  it('should handle missing required fields', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'incomplete@test.com',
        // Missing password, firstName, lastName
      });

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });

  it('should handle database connection errors gracefully', async () => {
    // This would require mocking the database connection
    // For now, we just verify the health check works
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
  });
});