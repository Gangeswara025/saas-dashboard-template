const path = require('path');
const fs = require('fs');
const multer = require('multer');
const File = require('../models/File');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const Project = require('../models/Project');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    'application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/zip', 'application/x-zip-compressed',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain', 'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('File type not allowed'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } });

const getCategory = (mime) => {
  if (mime.includes('image')) return 'image';
  if (mime.includes('pdf') || mime.includes('word') || mime.includes('text')) return 'document';
  if (mime.includes('zip')) return 'archive';
  return 'other';
};

// @desc    Get files for a project
// @route   GET /api/files/project/:projectId
const getFiles = async (req, res) => {
  try {
    const files = await File.find({ project: req.params.projectId })
      .populate('uploadedBy', 'name avatar')
      .sort({ createdAt: -1 });
    res.json(files);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload file
// @route   POST /api/files/upload
const uploadFile = [
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
      const { projectId, description } = req.body;

      const versionCount = await File.countDocuments({
        project: projectId,
        originalName: req.file.originalname,
      });

      const fileDoc = await File.create({
        name: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        mimeType: req.file.mimetype,
        size: req.file.size,
        project: projectId,
        uploadedBy: req.user._id,
        version: versionCount + 1,
        category: getCategory(req.file.mimetype),
        description,
      });

      const project = await Project.findById(projectId).populate('client', '_id');
      if (project?.client) {
        await Notification.create({
          user: project.client._id,
          title: 'New File Uploaded',
          message: `"${req.file.originalname}" has been uploaded to your project`,
          type: 'file',
          relatedId: fileDoc._id,
          relatedModel: 'File',
        });
      }

      await Activity.create({
        project: projectId,
        user: req.user._id,
        action: 'uploaded',
        description: `File "${req.file.originalname}" uploaded`,
        entityType: 'file',
        entityId: fileDoc._id,
      });

      const populated = await fileDoc.populate('uploadedBy', 'name avatar');
      res.status(201).json(populated);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
];

// @desc    Download file
// @route   GET /api/files/download/:id
const downloadFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ message: 'File not found' });
    res.download(file.path, file.originalName);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete file
// @route   DELETE /api/files/:id
const deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ message: 'File not found' });
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    await file.deleteOne();
    res.json({ message: 'File deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getFiles, uploadFile, downloadFile, deleteFile };
