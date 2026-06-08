const express = require('express');
const router = express.Router();
const { getProjects, getProject, createProject, updateProject, updateStages, deleteProject } = require('../controllers/projectController');
const { protect } = require('../middlewares/auth');
const { roleCheck } = require('../middlewares/roleCheck');

router.get('/', protect, getProjects);
router.get('/:id', protect, getProject);
router.post('/', protect, roleCheck('admin'), createProject);
router.put('/:id', protect, roleCheck('admin'), updateProject);
router.put('/:id/stages', protect, roleCheck('admin'), updateStages);
router.delete('/:id', protect, roleCheck('admin'), deleteProject);

module.exports = router;
