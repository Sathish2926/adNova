import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { expect } from 'chai';
import Request from '../models/Request.js';

describe('Request Model', function() {
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
    await Request.deleteMany({});
  });

  it('should not save without required fields', async function() {
    const request = new Request({});
    let err;
    try {
      await request.save();
    } catch (error) {
      err = error;
    }
    expect(err).to.exist;
    expect(err.errors).to.have.property('senderName');
    expect(err.errors).to.have.property('senderEmail');
    expect(err.errors).to.have.property('receiverEmail');
  });

  it('should save a valid request', async function() {
    const request = new Request({
      senderName: 'Alice',
      senderEmail: 'alice@email.com',
      receiverEmail: 'bob@email.com'
    });
    const savedRequest = await request.save();
    expect(savedRequest._id).to.exist;
    expect(savedRequest.senderName).to.equal('Alice');
    expect(savedRequest.senderEmail).to.equal('alice@email.com');
    expect(savedRequest.receiverEmail).to.equal('bob@email.com');
    expect(savedRequest.status).to.equal('pending');
  });
});
