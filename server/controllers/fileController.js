const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const supabase = require('../config/supabase');
const File = require('../models/File');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const Project = require('../models/Project');

const storage = multer.memoryStorage();

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

const formatAvatarUrl = (avatarPath) => {
  if (!avatarPath) return avatarPath;
  if (avatarPath.startsWith('/')) return avatarPath; 
  if (avatarPath.startsWith('http')) return avatarPath; 
  return `/api/auth/avatar/${encodeURIComponent(avatarPath)}`;
};

// @desc    Get files for a project
// @route   GET /api/files/project/:projectId
const getFiles = async (req, res) => {
  try {
    const files = await File.find({ project: req.params.projectId })
      .populate('uploadedBy', 'name avatar')
      .sort({ createdAt: -1 });

    const formattedFiles = files.map(file => {
      const f = file.toObject();
      if (f.uploadedBy && f.uploadedBy.avatar) {
        f.uploadedBy.avatar = formatAvatarUrl(f.uploadedBy.avatar);
      }
      return f;
    });

    res.json(formattedFiles);
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

      const ext = path.extname(req.file.originalname);
      const fileName = `${uuidv4()}${ext}`;

      const { data, error } = await supabase.storage
        .from(process.env.SUPABASE_DELIVERABLES_BUCKET || 'deliverables')
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false,
        });

      if (error) throw new Error(`Supabase upload error: ${error.message}`);

      const versionCount = await File.countDocuments({
        project: projectId,
        originalName: req.file.originalname,
      });

      const fileDoc = await File.create({
        name: fileName,
        originalName: req.file.originalname,
        path: fileName,
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
      const populatedObj = populated.toObject();
      if (populatedObj.uploadedBy && populatedObj.uploadedBy.avatar) {
        populatedObj.uploadedBy.avatar = formatAvatarUrl(populatedObj.uploadedBy.avatar);
      }

      res.status(201).json(populatedObj);
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

    const { data, error } = await supabase.storage
      .from(process.env.SUPABASE_DELIVERABLES_BUCKET || 'deliverables')
      .createSignedUrl(file.path, 300, {
        download: file.originalName,
      });

    if (error) return res.status(500).json({ message: error.message });

    res.redirect(data.signedUrl);
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

    await supabase.storage
      .from(process.env.SUPABASE_DELIVERABLES_BUCKET || 'deliverables')
      .remove([file.path]);

    await file.deleteOne();
    res.json({ message: 'File deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getFiles, uploadFile, downloadFile, deleteFile };
