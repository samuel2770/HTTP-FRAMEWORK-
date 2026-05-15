const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');

router.get('/profile', verifyToken, userController.getUserProfile);
router.get('/profile/:userId', verifyToken, userController.getUserProfile);
router.get('/leaderboard', verifyToken, userController.getLeaderboard);

module.exports = router;
