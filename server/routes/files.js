const express = require('express');
const router = express.Router();
const { getFiles, uploadFile, downloadFile, deleteFile } = require('../controllers/fileController');
const { protect } = require('../middlewares/auth');
const { roleCheck } = require('../middlewares/roleCheck');

router.get('/project/:projectId', protect, getFiles);
router.post('/upload', protect, roleCheck('admin'), uploadFile);
router.get('/download/:id', protect, downloadFile);
router.delete('/:id', protect, roleCheck('admin'), deleteFile);

module.exports = router;
