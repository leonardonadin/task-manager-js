const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongod;

// Connect to the in-memory database before running tests
beforeAll(async () => {
  // Increase timeout for MongoDB setup
  jest.setTimeout(30000);
  
  // Create new instance of MongoDB Memory Server
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  
  // Disconnect from any existing connection
  await mongoose.disconnect();
  
  // Connect to the in-memory database
  await mongoose.connect(uri);
}, 30000);

// Clear all test data after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

// Disconnect and stop server after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
}, 30000);

// Mock console.error to keep test output clean
global.console.error = jest.fn(); 