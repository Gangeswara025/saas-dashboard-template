const Issue = require('../models/Issue');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const Project = require('../models/Project');

// @desc    Get issues for a project
// @route   GET /api/issues/project/:projectId
const getIssues = async (req, res) => {
  try {
    const { status, priority } = req.query;
    const filter = { project: req.params.projectId };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const issues = await Issue.find(filter)
      .populate('reportedBy', 'name avatar role')
      .sort({ createdAt: -1 });
    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create issue
// @route   POST /api/issues
const createIssue = async (req, res) => {
  try {
    const { title, description, projectId, priority } = req.body;
    const issue = await Issue.create({
      title,
      description,
      project: projectId,
      reportedBy: req.user._id,
      priority: priority || 'medium',
    });

    // Notify admin (find admin users)
    const User = require('../models/User');
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        user: admin._id,
        title: 'New Issue Reported',
        message: `"${title}" reported by ${req.user.name} — Priority: ${priority || 'medium'}`,
        type: 'issue',
        relatedId: issue._id,
        relatedModel: 'Issue',
      });
    }

    await Activity.create({
      project: projectId,
      user: req.user._id,
      action: 'reported',
      description: `Issue "${title}" reported`,
      entityType: 'issue',
      entityId: issue._id,
    });

    const populated = await issue.populate('reportedBy', 'name avatar role');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update issue
// @route   PUT /api/issues/:id
const updateIssue = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const update = { status, adminNotes };
    if (status === 'resolved') update.resolvedAt = new Date();

    const issue = await Issue.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('reportedBy', 'name avatar role');

    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    await Notification.create({
      user: issue.reportedBy._id,
      title: 'Issue Status Updated',
      message: `Your issue "${issue.title}" is now ${status}`,
      type: 'issue',
      relatedId: issue._id,
      relatedModel: 'Issue',
    });

    await Activity.create({
      project: issue.project,
      user: req.user._id,
      action: 'updated',
      description: `Issue "${issue.title}" status changed to ${status}`,
      entityType: 'issue',
      entityId: issue._id,
    });

    res.json(issue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getIssues, createIssue, updateIssue };
