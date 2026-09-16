const express = require('express');
const router = express.Router();
const {
  getAdminOverview,
  getUsers,
  createUser,
  updateUserRole,
  deleteUser,
  getCenters,
  createCenter,
  getCohorts,
  createCohort,
  getEnrollmentAndAttendance,
  getSkillProgression,
  getPlacements,
  recordPlacement,
  getImpactReport,
} = require('../controllers/admin.controller');

// Overview
router.get('/overview', getAdminOverview);

// User Management
router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Training Centers
router.get('/centers', getCenters);
router.post('/centers', createCenter);

// Courses & Cohorts
router.get('/cohorts', getCohorts);
router.post('/cohorts', createCohort);

// Attendance & Enrollment Monitoring
router.get('/enrollment-attendance', getEnrollmentAndAttendance);

// Skill Progression Analytics
router.get('/skill-progression', getSkillProgression);

// Placements
router.get('/placements', getPlacements);
router.post('/placements', recordPlacement);

// Impact & CSR Report
router.get('/impact-report', getImpactReport);

module.exports = router;
