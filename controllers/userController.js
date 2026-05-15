const { db } = require('../config/firebase');

const getUserProfile = async (req, res) => {
  const userId = req.params.userId || req.user.uid;

  try {
    let userData;
    if (db) {
      const doc = await db.collection('users').doc(userId).get();
      if (!doc.exists) {
        // Create a default profile if it doesn't exist
        userData = {
          uid: userId,
          displayName: req.user.name || 'Anonymous Student',
          email: req.user.email,
          rating: 5.0,
          points: 0,
          sessionsHelped: 0,
          joinedAt: new Date().toISOString()
        };
        await db.collection('users').doc(userId).set(userData);
      } else {
        userData = doc.data();
      }
    } else {
      userData = {
        uid: userId,
        displayName: 'Dev User',
        email: 'dev@example.com',
        rating: 4.8,
        points: 120,
        sessionsHelped: 12,
        joinedAt: new Date().toISOString()
      };
    }
    res.status(200).json({ success: true, data: userData });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

const getLeaderboard = async (req, res) => {
  try {
    let leaderboard = [];
    if (db) {
      const snapshot = await db.collection('users')
        .orderBy('points', 'desc')
        .limit(10)
        .get();
      snapshot.forEach(doc => leaderboard.push(doc.data()));
    } else {
      leaderboard = [
        { displayName: 'David Lee', points: 450, rating: 4.9, sessionsHelped: 45 },
        { displayName: 'Sarah Khan', points: 420, rating: 4.8, sessionsHelped: 40 },
        { displayName: 'Alex Chen', points: 380, rating: 4.7, sessionsHelped: 35 }
      ];
    }
    res.status(200).json({ success: true, data: leaderboard });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

module.exports = { getUserProfile, getLeaderboard };
