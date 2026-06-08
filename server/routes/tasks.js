const express = require('express');
const router = express.Router();
const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController');
const { protect } = require('../middlewares/auth');
const { roleCheck } = require('../middlewares/roleCheck');

router.get('/project/:projectId', protect, getTasks);
router.post('/', protect, roleCheck('admin'), createTask);
router.put('/:id', protect, roleCheck('admin'), updateTask);
router.delete('/:id', protect, roleCheck('admin'), deleteTask);

module.exports = router;
