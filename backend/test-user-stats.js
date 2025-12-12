// test-user-stats.js
// Place this file in your backend root directory
// Run with: node test-user-stats.js

require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(' MongoDB Connected');
  } catch (error) {
    console.error(' MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

const testUserStats = async () => {
  await connectDB();

  const User = require('./models/User');
  const Score = require('./models/Score');

  console.log('\n========================================');
  console.log('TESTING USER STATS');
  console.log('========================================\n');

  // Get all users
  const users = await User.find().select('username email highestScore gamesPlayed');
  
  console.log(`Total Users: ${users.length}\n`);

  for (const user of users) {
    console.log('─────────────────────────────────────');
    console.log(` User: ${user.username}`);
    console.log(` Email: ${user.email}`);
    console.log(` Highest Score: ${user.highestScore}`);
    console.log(` Games Played: ${user.gamesPlayed}`);
    
    // Get user's actual scores from database
    const userScores = await Score.find({ user: user._id }).sort({ score: -1 });
    
    if (userScores.length > 0) {
      console.log(`\n Score History (${userScores.length} games):`);
      userScores.forEach((score, index) => {
        console.log(`   ${index + 1}. Score: ${score.score}, Bananas: ${score.bananasCollected}, Level: ${score.gameLevel}`);
      });
      
      const actualHighest = Math.max(...userScores.map(s => s.score));
      const actualGamesCount = userScores.length;
      
      console.log(`\n Validation:`);
      console.log(`   Expected Highest Score: ${actualHighest}`);
      console.log(`   Stored Highest Score: ${user.highestScore}`);
      console.log(`   Match: ${actualHighest === user.highestScore ? '' : ''}`);
      
      console.log(`   Expected Games Played: ${actualGamesCount}`);
      console.log(`   Stored Games Played: ${user.gamesPlayed}`);
      console.log(`   Match: ${actualGamesCount === user.gamesPlayed ? '' : ''}`);
      
      // Fix mismatches
      if (actualHighest !== user.highestScore || actualGamesCount !== user.gamesPlayed) {
        console.log(`\n FIXING USER STATS...`);
        user.highestScore = actualHighest;
        user.gamesPlayed = actualGamesCount;
        await user.save();
        console.log(`    User stats updated!`);
      }
    } else {
      console.log(`\n No games played yet`);
      
      // Ensure defaults are set
      if (user.highestScore === undefined || user.gamesPlayed === undefined) {
        console.log(`\n SETTING DEFAULT STATS...`);
        user.highestScore = user.highestScore ?? 0;
        user.gamesPlayed = user.gamesPlayed ?? 0;
        await user.save();
        console.log(`    Default stats set!`);
      }
    }
    
    console.log('─────────────────────────────────────\n');
  }

  // Check for users missing stats fields
  console.log('\n========================================');
  console.log('🔍 CHECKING FOR MISSING FIELDS');
  console.log('========================================\n');

  const usersWithMissingFields = await User.find({
    $or: [
      { highestScore: { $exists: false } },
      { gamesPlayed: { $exists: false } }
    ]
  });

  if (usersWithMissingFields.length > 0) {
    console.log(`  Found ${usersWithMissingFields.length} users with missing fields`);
    console.log(` FIXING...`);
    
    for (const user of usersWithMissingFields) {
      user.highestScore = user.highestScore ?? 0;
      user.gamesPlayed = user.gamesPlayed ?? 0;
      await user.save();
      console.log(`    Fixed ${user.username}`);
    }
  } else {
    console.log(` All users have required fields`);
  }

  console.log('\n========================================');
  console.log(' TEST COMPLETE');
  console.log('========================================\n');

  mongoose.connection.close();
  process.exit(0);
};

testUserStats().catch(error => {
  console.error(' Test Error:', error);
  process.exit(1);
});