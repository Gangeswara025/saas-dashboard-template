require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const clearAll = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // List and delete all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    for (const col of collections) {
      await mongoose.connection.db.collection(col.name).deleteMany({});
      console.log(`🗑️  Cleared: ${col.name}`);
    }

    // Recreate clean default Admin
    const admin = await User.create({
      name: 'Trintz Admin',
      email: 'admin@trintz.com',
      password: 'admin123',
      role: 'admin',
      company: 'Trintz Solutions',
      phone: '+91 98765 43210',
    });

    console.log('\n✅ All mock data cleared successfully!');
    console.log('👑 Created default Admin account:');
    console.log('   Email: admin@trintz.com');
    console.log('   Password: admin123');
    console.log('👉 Log in as admin and start adding real clients & projects.\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

clearAll();
