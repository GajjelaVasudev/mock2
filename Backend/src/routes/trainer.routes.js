const express = require('express');
const router = express.Router();
const {
  getTrainerOverview,
  getAssignedStudents,
  recordAttendance,
  getAttendanceByDate,
  submitAssessment,
  assignTask,
  getTasks,
  getAtRiskLearners,
  resolveAtRisk,
} = require('../controllers/trainer.controller');

// Overview & KPIs
router.get('/overview', getTrainerOverview);

// Manage Assigned Students & Progress
router.get('/students', getAssignedStudents);

// Record & View Attendance
router.post('/attendance', recordAttendance);
router.get('/attendance', getAttendanceByDate);

// Conduct Soft Skills Assessment
router.post('/assessment', submitAssessment);
router.post('/assessments', submitAssessment);

// Assign & View Tasks
router.post('/tasks', assignTask);
router.get('/tasks', getTasks);

// View & Resolve At-Risk Learners
router.get('/at-risk', getAtRiskLearners);
router.post('/at-risk/resolve', resolveAtRisk);

module.exports = router;
