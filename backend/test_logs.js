require('dotenv').config();
const mongoose = require('mongoose');
const RequestLog = require('./src/models/RequestLog');
const ApiKey = require('./src/models/ApiKey');
const User = require('./src/models/User');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');
  
  const logs = await RequestLog.find({}).limit(5).sort({timestamp:-1});
  console.log('Recent Logs:', logs);
  
  const user = await User.findOne({ email: 'test@example.com' }); // Or just any user
  if(user) {
     const logsForUser = await RequestLog.countDocuments({userId: user._id});
     console.log('Logs for user:', logsForUser);
  }
  
  process.exit(0);
}
test();
