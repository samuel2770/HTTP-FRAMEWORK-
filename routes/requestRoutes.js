const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, requestController.createRequest);
router.get('/', verifyToken, requestController.getAllRequests);
router.post('/:requestId/accept', verifyToken, requestController.acceptRequest);

module.exports = router;
