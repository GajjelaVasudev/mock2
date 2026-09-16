const express = require('express');
const router = express.Router();
const mentorshipController = require('../controllers/mentorship.controller');
const alumniController = require('../controllers/alumni.controller');
const authenticate = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');

router.get('/mentors', authenticate, requireRole('student', 'alumni'), mentorshipController.getMentors);
router.post('/mentorship/requests', authenticate, requireRole('student', 'alumni'), mentorshipController.requestMentorship);
router.get('/alumni/me/placement', authenticate, requireRole('alumni'), alumniController.getMyPlacement);

module.exports = router;