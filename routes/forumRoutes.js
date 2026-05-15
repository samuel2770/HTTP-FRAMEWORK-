const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forumController');
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, forumController.createPost);
router.get('/', verifyToken, forumController.getAllPosts);
router.post('/:postId/reply', verifyToken, forumController.replyToPost);
router.post('/:postId/like', verifyToken, forumController.likePost);

module.exports = router;
