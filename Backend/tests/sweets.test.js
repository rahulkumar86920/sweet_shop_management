import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Sweet from '../src/models/Sweet.js';

let authToken;
let adminToken;
let regularToken;

describe('Sweets API', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_TEST_URI);
    }
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Sweet.deleteMany({});

    // Create admin user
    const adminRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        adminSecret: process.env.ADMIN_SECRET
      });
    adminToken = adminRes.body.token;

    // Create regular user
    const regularRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Regular User',
        email: 'regular@example.com',
        password: 'password123'
      });
    regularToken = regularRes.body.token;

    authToken = adminToken;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/sweets', () => {
    it('should create a new sweet (admin only)', async () => {
      const sweetData = {
        name: 'Chocolate Bar',
        description: 'Delicious milk chocolate',
        price: 2.99,
        quantity: 100,
        category: 'chocolate'
      };

      const res = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(sweetData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('name', 'Chocolate Bar');
      expect(res.body).toHaveProperty('price', 2.99);
      expect(res.body).toHaveProperty('quantity', 100);
    });

    it('should not allow regular user to create sweet', async () => {
      const sweetData = {
        name: 'Chocolate Bar',
        description: 'Delicious milk chocolate',
        price: 2.99,
        quantity: 100
      };

      const res = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${regularToken}`)
        .send(sweetData);

      expect(res.statusCode).toBe(403);
    });

    it('should validate sweet data', async () => {
      const invalidData = {
        name: '', // Empty name
        price: -10 // Negative price
      };

      const res = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData);

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/sweets', () => {
    beforeEach(async () => {
      // Create test sweets
      const sweets = [
        {
          name: 'Chocolate Bar',
          description: 'Milk chocolate',
          price: 2.99,
          quantity: 50,
          category: 'chocolate'
        },
        {
          name: 'Gummy Bears',
          description: 'Fruit flavored',
          price: 1.99,
          quantity: 100,
          category: 'gummies'
        },
        {
          name: 'Lollipop',
          description: 'Cherry flavor',
          price: 0.99,
          quantity: 200,
          category: 'hard candy'
        }
      ];

      await Sweet.create(sweets);
    });

    it('should get all sweets', async () => {
      const res = await request(app)
        .get('/api/sweets')
        .set('Authorization', `Bearer ${regularToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(3);
    });

    it('should search sweets by name', async () => {
      const res = await request(app)
        .get('/api/sweets/search?q=chocolate')
        .set('Authorization', `Bearer ${regularToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0]).toHaveProperty('name', 'Chocolate Bar');
    });

    it('should require authentication', async () => {
      const res = await request(app).get('/api/sweets');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('PUT /api/sweets/:id', () => {
    let sweetId;

    beforeEach(async () => {
      const sweet = await Sweet.create({
        name: 'Original Sweet',
        description: 'Original description',
        price: 1.99,
        quantity: 50
      });
      sweetId = sweet._id;
    });

    it('should update sweet (admin only)', async () => {
      const updateData = {
        name: 'Updated Sweet',
        price: 2.99,
        quantity: 75
      };

      const res = await request(app)
        .put(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('name', 'Updated Sweet');
      expect(res.body).toHaveProperty('price', 2.99);
    });

    it('should not allow regular user to update', async () => {
      const updateData = { name: 'Hacked Sweet' };

      const res = await request(app)
        .put(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(403);
    });
  });

  describe('DELETE /api/sweets/:id', () => {
    let sweetId;

    beforeEach(async () => {
      const sweet = await Sweet.create({
        name: 'Sweet to Delete',
        description: 'Will be deleted',
        price: 1.99,
        quantity: 10
      });
      sweetId = sweet._id;
    });

    it('should delete sweet (admin only)', async () => {
      const res = await request(app)
        .delete(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Sweet deleted successfully');

      // Verify deletion
      const verify = await Sweet.findById(sweetId);
      expect(verify).toBeNull();
    });

    it('should not allow regular user to delete', async () => {
      const res = await request(app)
        .delete(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${regularToken}`);

      expect(res.statusCode).toBe(403);
    });
  });

  describe('POST /api/sweets/:id/purchase', () => {
    let sweetId;

    beforeEach(async () => {
      const sweet = await Sweet.create({
        name: 'Purchase Test Sweet',
        description: 'For purchase testing',
        price: 1.99,
        quantity: 10
      });
      sweetId = sweet._id;
    });

    it('should purchase sweet successfully', async () => {
      const purchaseData = { quantity: 2 };

      const res = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send(purchaseData);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('quantity', 8); // 10 - 2 = 8
      expect(res.body).toHaveProperty('soldCount', 2);
    });

    it('should not allow purchase with insufficient quantity', async () => {
      const purchaseData = { quantity: 20 }; // Only 10 available

      const res = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send(purchaseData);

      expect(res.statusCode).toBe(400);
    });

    it('should validate purchase quantity', async () => {
      const invalidData = { quantity: 0 };

      const res = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send(invalidData);

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/sweets/:id/restock', () => {
    let sweetId;

    beforeEach(async () => {
      const sweet = await Sweet.create({
        name: 'Restock Test Sweet',
        description: 'For restock testing',
        price: 1.99,
        quantity: 10
      });
      sweetId = sweet._id;
    });

    it('should restock sweet (admin only)', async () => {
      const restockData = { quantity: 50 };

      const res = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(restockData);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('quantity', 60); // 10 + 50 = 60
    });

    it('should not allow regular user to restock', async () => {
      const restockData = { quantity: 50 };

      const res = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send(restockData);

      expect(res.statusCode).toBe(403);
    });
  });
});