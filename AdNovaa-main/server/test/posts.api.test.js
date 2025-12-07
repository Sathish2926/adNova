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

describe('Posts API', function() {
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
    // Create a user for post creation
    const userRes = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Poster',
        email: 'poster@example.com',
        password: 'password123',
        role: 'business',
        businessName: 'Poster Brand',
        ownerName: 'Owner',
        phone: '1234567890'
      });
    userId = userRes.body.userId;
  });

  after(async function() {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async function() {
    await Post.deleteMany({});
  });

  it('should create a post', async function() {
    const res = await request(app)
      .post('/api/posts/create')
      .send({
        userId,
        role: 'business',
        header: 'Test Header',
        caption: 'Test Caption',
        image: 'test.jpg'
      });
    expect(res.status).to.equal(200);
    expect(res.body.success).to.be.true;
    expect(res.body.post.header).to.equal('Test Header');
  });

  it('should fetch posts feed', async function() {
    // Create a post first
    await request(app)
      .post('/api/posts/create')
      .send({
        userId,
        role: 'business',
        header: 'Feed Header',
        caption: 'Feed Caption',
        image: 'feed.jpg'
      });
    const res = await request(app)
      .get('/api/posts/feed')
      .query({ viewerRole: 'influencer' });
    expect(res.status).to.equal(200);
    expect(res.body.success).to.be.true;
    expect(res.body.posts).to.be.an('array');
    expect(res.body.posts[0].header).to.equal('Feed Header');
  });
});
