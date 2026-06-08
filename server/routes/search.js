const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const Task = require('../models/Task');
const Issue = require('../models/Issue');
const File = require('../models/File');

router.get('/', protect, async (req, res) => {
  try {
    const { q, type, projectId } = req.query;
    if (!q) return res.json({ tasks: [], issues: [], files: [] });

    const regex = new RegExp(q, 'i');
    const projectFilter = projectId ? { project: projectId } : {};

    const results = {};

    if (!type || type === 'tasks') {
      results.tasks = await Task.find({ ...projectFilter, title: regex }).limit(10);
    }
    if (!type || type === 'issues') {
      results.issues = await Issue.find({ ...projectFilter, $or: [{ title: regex }, { description: regex }] })
        .populate('reportedBy', 'name').limit(10);
    }
    if (!type || type === 'files') {
      results.files = await File.find({ ...projectFilter, originalName: regex }).limit(10);
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
