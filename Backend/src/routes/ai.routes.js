const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const authenticate = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');

// Protect these routes to logged-in users.
// AI interview and scenario tools are available to students and alumni.
router.post('/evaluate-interview', authenticate, requireRole('student', 'alumni'), aiController.evaluateInterview);
router.post('/generate-scenario', authenticate, requireRole('student', 'alumni'), aiController.generateScenario);

module.exports = router;
