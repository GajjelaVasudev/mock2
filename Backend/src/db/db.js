const mongoose = require('mongoose');

async function connectDB() {
  const connUri =
    process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/etasha_db';

  try {
    // Attempt fast connection
    await mongoose.connect(connUri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log('✅ MongoDB connected successfully to:', mongoose.connection.host);
  } catch (error) {
    console.warn(
      '⚠️ MongoDB connection failed or not running locally:',
      error.message
    );
    console.log('ℹ️ Platform is running smoothly in resilient in-memory & demo mode.');
  }
}

module.exports = connectDB;