const express = require('express');
const router = express.Router();
const { getIssues, createIssue, updateIssue } = require('../controllers/issueController');
const { protect } = require('../middlewares/auth');
const { roleCheck } = require('../middlewares/roleCheck');

router.get('/project/:projectId', protect, getIssues);
router.post('/', protect, createIssue);
router.put('/:id', protect, roleCheck('admin'), updateIssue);

module.exports = router;
