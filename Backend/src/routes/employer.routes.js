const express = require('express');
const router = express.Router();
const {
  getEmployerProfile,
  updateEmployerProfile,
  getJobs,
  createJob,
  updateJob,
  deleteJob,
  getMatchedStudentsForJob,
  getGraduates,
  getCandidateDetails,
  getPipeline,
  addToPipeline,
  updatePipelineStage,
} = require('../controllers/employer.controller');

// 1. Employer Profile & Overview
router.get('/profile', getEmployerProfile);
router.put('/profile', updateEmployerProfile);

// 2. Real Job Openings & Role Postings
router.get('/jobs', getJobs);
router.post('/jobs', createJob);
router.put('/jobs/:id', updateJob);
router.delete('/jobs/:id', deleteJob);
router.get('/jobs/:id/matches', getMatchedStudentsForJob);

// 3. Graduate Talent Pool & Smart Candidate Matching
router.get('/graduates', getGraduates);
router.get('/candidates/:id', getCandidateDetails);

// 4. Hiring Pipeline Management
router.get('/pipeline', getPipeline);
router.post('/pipeline', addToPipeline);
router.put('/pipeline/:id', updatePipelineStage);

module.exports = router;
