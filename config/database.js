// config/database.js
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // mongoose.connect(process.env.MONGODB_URI, {
    //   // useNewUrlParser: true,
    //   // useUnifiedTopology: true,
    // }); 
    // console.log('MongoDB connected');
    const connect = await mongoose.connect(process.env.MONGODB_URI);
    console.log("Database connected: ",connect.connection.host,connect.connection.name); 
  } catch (error) {
    // console.log('Connecting to')

    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
