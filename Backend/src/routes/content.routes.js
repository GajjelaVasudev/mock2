const express = require('express');
const router = express.Router();
const contentController = require('../controllers/content.controller');
const authenticate = require('../middlewares/auth.middleware');

router.get('/modules', authenticate, contentController.getModules);
router.get('/modules/:id', authenticate, contentController.getModuleById);

module.exports = router;