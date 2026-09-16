const express = require('express');
const router = express.Router();
const {
  getEmployerProfile,
  updateEmployerProfile,
  getGraduates,
  getCandidateDetails,
  getPipeline,
  addToPipeline,
  updatePipelineStage,
} = require('../controllers/employer.controller');

// 1. Employer Profile & Overview
router.get('/profile', getEmployerProfile);
router.put('/profile', updateEmployerProfile);

// 2. Graduate Talent Pool & Candidate Search
router.get('/graduates', getGraduates);
router.get('/candidates/:id', getCandidateDetails);

// 3. Hiring Pipeline Management
router.get('/pipeline', getPipeline);
router.post('/pipeline', addToPipeline);
router.put('/pipeline/:id', updatePipelineStage);

module.exports = router;
