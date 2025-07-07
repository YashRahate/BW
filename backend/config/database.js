const mongoose = require('mongoose');
const setupNotificationCronJobs = require('../cron/cornJobs'); // Adjust path
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    setupNotificationCronJobs(); // Start the cron jobs

  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;