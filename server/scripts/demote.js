const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = require('./models/User');
  await User.updateMany({ email: { $ne: 'admin@yourapp.com' } }, { role: 'user' });
  console.log('Reverted other users to regular roles.');
  process.exit(0);
});
