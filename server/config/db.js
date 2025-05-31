const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb+srv://bt20cse160:GRgF5I1dh4Pf2OV7@cluster0.v4v4b.mongodb.net/live-polling?retryWrites=true&w=majority', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('\x1b[32m%s\x1b[0m', `🌿 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', `Error: ${error.message}`);
  }
};

module.exports = connectDB; 