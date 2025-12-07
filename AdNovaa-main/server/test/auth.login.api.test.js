import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { expect } from 'chai';
import express from 'express';
import bodyParser from 'body-parser';
import authRoutes from '../routes/auth.js';
import User from '../models/User.js';

describe('Auth API - Login', function() {
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

  it('should login a registered user', async function() {
    // First, signup a user
    const signupRes = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Login User',
        email: 'login@example.com',
        password: 'password123',
        role: 'business',
        businessName: 'Login Brand',
        ownerName: 'Owner',
        phone: '1234567890'
      });
    expect(signupRes.status).to.equal(200);
    // Now, login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@example.com',
        password: 'password123'
      });
    expect(loginRes.status).to.equal(200);
    expect(loginRes.body.success).to.be.true;
    expect(loginRes.body.email).to.equal('login@example.com');
  });

  it('should not login with wrong password', async function() {
    // Signup a user
    await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Login User',
        email: 'loginfail@example.com',
        password: 'password123',
        role: 'business',
        businessName: 'Login Brand',
        ownerName: 'Owner',
        phone: '1234567890'
      });
    // Try wrong password
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'loginfail@example.com',
        password: 'wrongpassword'
      });
    expect(loginRes.status).to.equal(401);
    expect(loginRes.body.success).to.be.false;
  });
});
