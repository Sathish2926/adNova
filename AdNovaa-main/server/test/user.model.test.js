import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { expect } from 'chai';
import User from '../models/User.js';

describe('User Model', function() {
  let mongoServer;

  before(async function() {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), { dbName: 'test' });
  });

  after(async function() {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async function() {
    await User.deleteMany({});
  });

  it('should not save without required fields', async function() {
    const user = new User({});
    let err;
    try {
      await user.save();
    } catch (error) {
      err = error;
    }
    expect(err).to.exist;
    expect(err.errors).to.have.property('email');
  });

  it('should save a valid user', async function() {
    const user = new User({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      role: 'business',
      businessProfile: {
        brandName: 'Test Brand'
      }
    });
    const savedUser = await user.save();
    expect(savedUser._id).to.exist;
    expect(savedUser.email).to.equal('test@example.com');
    expect(savedUser.role).to.equal('business');
  });
});
