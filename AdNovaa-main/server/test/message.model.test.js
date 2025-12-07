import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { expect } from 'chai';
import Message from '../models/Message.js';

describe('Message Model', function() {
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
    await Message.deleteMany({});
  });

  it('should not save without required fields', async function() {
    const message = new Message({});
    let err;
    try {
      await message.save();
    } catch (error) {
      err = error;
    }
    expect(err).to.exist;
    expect(err.errors).to.have.property('room');
    expect(err.errors).to.have.property('author');
    expect(err.errors).to.have.property('message');
    expect(err.errors).to.have.property('time');
  });

  it('should save a valid message', async function() {
    const message = new Message({
      room: 'room1',
      author: 'author1',
      message: 'Hello',
      time: '12:00 PM'
    });
    const savedMessage = await message.save();
    expect(savedMessage._id).to.exist;
    expect(savedMessage.room).to.equal('room1');
    expect(savedMessage.author).to.equal('author1');
    expect(savedMessage.message).to.equal('Hello');
    expect(savedMessage.time).to.equal('12:00 PM');
  });
});
