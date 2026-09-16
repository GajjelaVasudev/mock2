const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const assessmentController = require('../controllers/assesment.controller');
const authenticate = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');

router.get('/me', authenticate, requireRole('student', 'alumni'), studentController.getMyProfile);
router.put('/me', authenticate, requireRole('student', 'alumni'), studentController.updateMyProfile);
router.get('/me', authenticate, requireRole('student', 'alumni'), assessmentController.getMyAssessments);


module.exports = router;