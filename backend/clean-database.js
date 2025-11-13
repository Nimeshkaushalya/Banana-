// clean-database.js
// Place this file in your backend root directory
// Run with: node clean-database.js

require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

const cleanDatabase = async () => {
  await connectDB();

  const User = require('./models/User');
  const Score = require('./models/Score');

  console.log('\n========================================');
  console.log('🗑️  DATABASE CLEANUP TOOL');
  console.log('========================================\n');

  // Count current data
  const userCount = await User.countDocuments();
  const scoreCount = await Score.countDocuments();

  console.log(`📊 Current Database Status:`);
  console.log(`   👤 Users: ${userCount}`);
  console.log(`   🎮 Scores: ${scoreCount}\n`);

  if (userCount === 0 && scoreCount === 0) {
    console.log('✅ Database is already empty!');
    rl.close();
    mongoose.connection.close();
    process.exit(0);
    return;
  }

  console.log('⚠️  WARNING: This will delete ALL data from the database!');
  console.log('⚠️  This action CANNOT be undone!\n');

  const answer = await askQuestion('Are you sure you want to delete all data? (yes/no): ');

  if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
    console.log('\n🔄 Deleting data...\n');

    try {
      // Delete all scores
      const scoresDeleted = await Score.deleteMany({});
      console.log(`✅ Deleted ${scoresDeleted.deletedCount} scores`);

      // Delete all users
      const usersDeleted = await User.deleteMany({});
      console.log(`✅ Deleted ${usersDeleted.deletedCount} users`);

      console.log('\n========================================');
      console.log('✅ DATABASE CLEANED SUCCESSFULLY');
      console.log('========================================\n');
      console.log('You can now register new users with fresh data!\n');

    } catch (error) {
      console.error('\n❌ Error cleaning database:', error.message);
    }
  } else {
    console.log('\n❌ Cleanup cancelled. No data was deleted.\n');
  }

  rl.close();
  mongoose.connection.close();
  process.exit(0);
};

cleanDatabase().catch(error => {
  console.error('❌ Error:', error);
  rl.close();
  process.exit(1);
});