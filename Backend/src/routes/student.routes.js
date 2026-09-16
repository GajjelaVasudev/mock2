const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const assessmentController = require('../controllers/assesment.controller');
const attendanceController = require('../controllers/attendance.controller');
const mockInterviewController = require('../controllers/mockInterview.controller');
const badgeController = require('../controllers/badge.controller');
const authenticate = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');

router.get('/me', authenticate, requireRole('student', 'alumni'), studentController.getMyProfile);
router.put('/me', authenticate, requireRole('student', 'alumni'), studentController.updateMyProfile);
router.get('/me/assessments', authenticate, requireRole('student', 'alumni'), assessmentController.getMyAssessments);
router.get('/me/attendance', authenticate, requireRole('student', 'alumni'), attendanceController.getMyAttendance);
router.post('/me/mock-interview', authenticate, requireRole('student', 'alumni'), mockInterviewController.submitMockInterview);
router.get('/me/mock-interview/history', authenticate, requireRole('student', 'alumni'), mockInterviewController.getMockInterviewHistory);
router.get('/me/badges', authenticate, requireRole('student', 'alumni'), badgeController.getMyBadges);

module.exports = router;