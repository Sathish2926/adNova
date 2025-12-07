import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { expect } from 'chai';
import express from 'express';
import bodyParser from 'body-parser';
import authRoutes from '../routes/auth.js';
import User from '../models/User.js';

describe('Auth API', function() {
  let mongoServer;
  let app;

  before(async function() {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), { dbName: 'test' });
    app = express();
    app.use(bodyParser.json());
    app.use('/api/auth', authRoutes);
  });

  after(async function() {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async function() {
    await User.deleteMany({});
  });

  it('should signup a new business user', async function() {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Business User',
        email: 'business@example.com',
        password: 'password123',
        role: 'business',
        businessName: 'Test Brand',
        ownerName: 'Owner',
        phone: '1234567890'
      });
    expect(res.status).to.equal(200);
    expect(res.body.success).to.be.true;
    const user = await User.findOne({ email: 'business@example.com' });
    expect(user).to.exist;
    expect(user.role).to.equal('business');
  });
});
