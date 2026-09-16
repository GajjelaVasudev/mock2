const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const authenticate = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');

// Protect these routes to logged-in users.
// Note: We're not restricting by role strictly here, but could limit certain tools to Trainers/Admins.
router.post('/evaluate-interview', authenticate, requireRole('student', 'alumni'), aiController.evaluateInterview);
router.post('/generate-scenario', authenticate, requireRole('student', 'alumni'), aiController.generateScenario);

module.exports = router;
