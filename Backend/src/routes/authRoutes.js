const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  getDemoUsers,
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/demo-users', getDemoUsers);

module.exports = router;
