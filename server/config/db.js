const mongoose = require('mongoose');
require('dotenv').config();

const connect = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not configured');
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    console.log('MongoDB connected successfully');
    return mongoose.connection;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
};

module.exports = connect;
