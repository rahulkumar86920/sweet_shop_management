import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';

describe('Auth API', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_TEST_URI);
    }
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/auth/register', () => {
    it('should register a regular user successfully', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('name', 'John Doe');
      expect(res.body.user).toHaveProperty('email', 'john@example.com');
      expect(res.body.user).toHaveProperty('isAdmin', false);
    });

    it('should register an admin user with correct adminSecret', async () => {
      const adminData = {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        adminSecret: process.env.ADMIN_SECRET
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(adminData);

      expect(res.statusCode).toBe(201);
      expect(res.body.user).toHaveProperty('isAdmin', true);
    });

    it('should not register admin with incorrect adminSecret', async () => {
      const userData = {
        name: 'Fake Admin',
        email: 'fake@example.com',
        password: 'password123',
        adminSecret: 'wrong_secret'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(res.statusCode).toBe(201);
      expect(res.body.user).toHaveProperty('isAdmin', false);
    });

    it('should not register user with existing email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      // First registration
      await request(app).post('/api/auth/register').send(userData);
      
      // Second registration with same email
      const res = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should validate required fields', async () => {
      const invalidData = {
        name: 'John',
        // Missing email and password
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(invalidData);

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };
      await request(app).post('/api/auth/register').send(userData);
    });

    it('should login successfully with correct credentials', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'password123'
      };

      const res = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
    });

    it('should not login with incorrect password', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'wrongpassword'
      };

      const res = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    it('should not login with non-existent email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const res = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(res.statusCode).toBe(401);
    });
  });
});