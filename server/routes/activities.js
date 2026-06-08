const express = require('express');
const router = express.Router();
const { getActivities } = require('../controllers/activityController');
const { protect } = require('../middlewares/auth');

router.get('/project/:projectId', protect, getActivities);

module.exports = router;
