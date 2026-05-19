const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/.env' });

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = require('./models/User');
  await User.updateMany({ email: { $ne: 'admin@yourapp.com' } }, { role: 'user' });
  console.log('Done! All other accounts reverted to regular users.');
  process.exit(0);
});
