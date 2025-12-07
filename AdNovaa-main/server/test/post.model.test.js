import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { expect } from 'chai';
import Post from '../models/Post.js';


// Dummy ObjectId for testing
function getObjectId() {
  return new mongoose.Types.ObjectId();
}

describe('Post Model', function() {
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
    await Post.deleteMany({});
  });

  it('should not save without required fields', async function() {
    const post = new Post({});
    let err;
    try {
      await post.save();
    } catch (error) {
      err = error;
    }
    expect(err).to.exist;
    expect(err.errors).to.have.property('authorId');
    expect(err.errors).to.have.property('authorName');
    expect(err.errors).to.have.property('authorRole');
    expect(err.errors).to.have.property('image');
  });

  it('should save a valid post', async function() {
    const post = new Post({
      authorId: getObjectId(),
      authorName: 'Test Author',
      authorRole: 'business',
      image: 'test.jpg'
    });
    const savedPost = await post.save();
    expect(savedPost._id).to.exist;
    expect(savedPost.authorName).to.equal('Test Author');
    expect(savedPost.authorRole).to.equal('business');
    expect(savedPost.image).to.equal('test.jpg');
  });
});
