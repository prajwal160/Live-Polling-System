const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Log the MongoDB URI (but mask sensitive parts for security)
    const maskedUri = process.env.MONGODB_URI 
      ? process.env.MONGODB_URI.replace(/:\/\/(.[^:]+):(.+)@/, '://***:***@')
      : 'undefined';
    console.log('\x1b[33m%s\x1b[0m', `Attempting to connect to MongoDB with URI: ${maskedUri}`);

    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('\x1b[32m%s\x1b[0m', `🌿 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', `MongoDB Connection Error: ${error.message}`);
    console.error('\x1b[31m%s\x1b[0m', 'Please check your environment variables and MongoDB connection string');
    process.exit(1);
  }
};

module.exports = connectDB; 