const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/polling-app', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('\x1b[32m%s\x1b[0m', `🌿 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', `Error: ${error.message}`);
  }
};

module.exports = connectDB; 