const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const authenticate = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');

router.post('/evaluate-interview', authenticate, requireRole('student', 'alumni'), aiController.evaluateInterview);

module.exports = router;