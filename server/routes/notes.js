const express = require('express');
const router = express.Router();
const { getNotes, createNote, deleteNote } = require('../controllers/noteController');
const { protect } = require('../middlewares/auth');
const { roleCheck } = require('../middlewares/roleCheck');

router.get('/project/:projectId', protect, getNotes);
router.post('/', protect, roleCheck('admin'), createNote);
router.delete('/:id', protect, roleCheck('admin'), deleteNote);

module.exports = router;
