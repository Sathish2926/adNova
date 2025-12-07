import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { expect } from 'chai';
import Conversation from '../models/Conversation.js';

describe('Conversation Model', function() {
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
    await Conversation.deleteMany({});
  });

  it('should not save without participants', async function() {
    const conversation = new Conversation({});
    let err;
    try {
      await conversation.save();
    } catch (error) {
      err = error;
    }
    expect(err).to.exist;
    expect(err.errors).to.have.property('participants');
  });

  it('should save a valid conversation', async function() {
    const conversation = new Conversation({
      participants: ['user1@email.com', 'user2@email.com']
    });
    const savedConversation = await conversation.save();
    expect(savedConversation._id).to.exist;
    expect(savedConversation.participants).to.include('user1@email.com');
  });
});
