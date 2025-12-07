import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { expect } from 'chai';
import express from 'express';
import bodyParser from 'body-parser';
import authRoutes from '../routes/auth.js';
import postRoutes from '../routes/posts.js';
import User from '../models/User.js';
import Post from '../models/Post.js';

describe('Integration Flow', function() {
  let mongoServer;
  let app;
  let userId;

  before(async function() {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), { dbName: 'test' });
    app = express();
    app.use(bodyParser.json());
    app.use('/api/auth', authRoutes);
    app.use('/api/posts', postRoutes);
  });

  after(async function() {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async function() {
    await User.deleteMany({});
    await Post.deleteMany({});
  });

  it('should signup, login, create post, and fetch feed', async function() {
    // Signup
    const signupRes = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Flow User',
        email: 'flow@example.com',
        password: 'password123',
        role: 'business',
        businessName: 'Flow Brand',
        ownerName: 'Owner',
        phone: '1234567890'
      });
    expect(signupRes.status).to.equal(200);
    userId = signupRes.body.userId;

    // Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'flow@example.com',
        password: 'password123'
      });
    expect(loginRes.status).to.equal(200);
    expect(loginRes.body.success).to.be.true;

    // Create Post
    const postRes = await request(app)
      .post('/api/posts/create')
      .send({
        userId,
        role: 'business',
        header: 'Integration Header',
        caption: 'Integration Caption',
        image: 'integration.jpg'
      });
    expect(postRes.status).to.equal(200);
    expect(postRes.body.success).to.be.true;

    // Fetch Feed
    const feedRes = await request(app)
      .get('/api/posts/feed')
      .query({ viewerRole: 'influencer' });
    expect(feedRes.status).to.equal(200);
    expect(feedRes.body.success).to.be.true;
    expect(feedRes.body.posts).to.be.an('array');
    expect(feedRes.body.posts[0].header).to.equal('Integration Header');
  });
});
