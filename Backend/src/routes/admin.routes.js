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
  deleteCenter,
  getCohorts,
  createCohort,
  deleteCohort,
  getEnrollmentAndAttendance,
  getSkillProgression,
  getPlacements,
  recordPlacement,
  deletePlacement,
  getImpactReport,
} = require('../controllers/admin.controller');

// 1. Overview
router.get('/overview', getAdminOverview);

// 2. User Management
router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// 3. Training Centers (CDCs)
router.get('/centers', getCenters);
router.post('/centers', createCenter);
router.delete('/centers/:id', deleteCenter);

// 4. Courses & Cohorts
router.get('/cohorts', getCohorts);
router.post('/cohorts', createCohort);
router.delete('/cohorts/:id', deleteCohort);

// 5. Attendance & Enrollment Monitoring
router.get('/enrollment-attendance', getEnrollmentAndAttendance);

// 6. Skill Progression Analytics
router.get('/skill-progression', getSkillProgression);

// 7. Placements
router.get('/placements', getPlacements);
router.post('/placements', recordPlacement);
router.delete('/placements/:id', deletePlacement);

// 8. Impact & CSR Report
router.get('/impact-report', getImpactReport);

module.exports = router;
