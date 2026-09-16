const express = require('express');
const router = express.Router();
const communityController = require('../controllers/community.controller');
const authenticate = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');

router.get('/posts', authenticate, requireRole('student', 'alumni'), communityController.getPosts);
router.post('/posts', authenticate, requireRole('student', 'alumni'), communityController.createPost);
router.get('/posts/:id/replies', authenticate, requireRole('student', 'alumni'), communityController.getReplies);
router.post('/posts/:id/replies', authenticate, requireRole('student', 'alumni'), communityController.createReply);
router.get('/success-stories', authenticate, communityController.getSuccessStories);

module.exports = router;