const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const authenticate = require('../middlewares/auth.middleware');

router.get('/me', authenticate, studentController.getMyProfile);

module.exports = router;