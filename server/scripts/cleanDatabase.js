const mongoose = require('mongoose');
const Pothole = require('../models/Pothole');
require('dotenv').config();

const cleanDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Delete all potholes (you can modify this query to be more selective)
    const result = await Pothole.deleteMany({});
    
    console.log(`✅ Successfully deleted ${result.deletedCount} pothole records`);
    console.log('Database cleaned successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error cleaning database:', error);
    process.exit(1);
  }
};

cleanDatabase();
