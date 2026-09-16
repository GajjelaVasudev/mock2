const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assesment.controller');
const authenticate = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');

router.post('/', authenticate, requireRole('student', 'alumni'), assessmentController.submitSelfAssessment);

module.exports = router;