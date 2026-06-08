const Project = require('../models/Project');
const User = require('../models/User');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');

// @desc    Get projects (all for admin, assigned for client)
// @route   GET /api/projects
const getProjects = async (req, res) => {
  try {
    let projects;
    if (req.user.role === 'admin') {
      projects = await Project.find().populate('client', 'name email company avatar');
    } else {
      projects = await Project.find({ client: req.user._id }).populate('client', 'name email company avatar');
    }
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('client', 'name email company avatar phone');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (req.user.role === 'client' && project.client._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create project
// @route   POST /api/projects
const createProject = async (req, res) => {
  try {
    const { name, description, clientId, estimatedDelivery, totalCost, stages, techStack } = req.body;
    const project = await Project.create({
      name,
      description,
      client: clientId,
      estimatedDelivery,
      totalCost,
      stages: stages || [],
      techStack: techStack || [],
    });

    // Assign project to client
    await User.findByIdAndUpdate(clientId, { $push: { assignedProjects: project._id } });

    await Activity.create({
      project: project._id,
      user: req.user._id,
      action: 'created',
      description: `Project "${name}" was created`,
      entityType: 'project',
      entityId: project._id,
    });

    await Notification.create({
      user: clientId,
      title: 'New Project Assigned',
      message: `You have been assigned to project: ${name}`,
      type: 'general',
      relatedId: project._id,
      relatedModel: 'Project',
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
const updateProject = async (req, res) => {
  try {
    const { name, description, progress, currentStage, estimatedDelivery, status, totalCost, techStack } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { name, description, progress, currentStage, estimatedDelivery, status, totalCost, techStack },
      { new: true }
    ).populate('client', 'name email');

    if (!project) return res.status(404).json({ message: 'Project not found' });

    await Activity.create({
      project: project._id,
      user: req.user._id,
      action: 'updated',
      description: `Project progress updated to ${progress}%`,
      entityType: 'project',
      entityId: project._id,
    });

    if (project.client) {
      await Notification.create({
        user: project.client._id,
        title: 'Project Updated',
        message: `Project "${project.name}" progress updated to ${progress}%`,
        type: 'progress',
        relatedId: project._id,
        relatedModel: 'Project',
      });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update project stages
// @route   PUT /api/projects/:id/stages
const updateStages = async (req, res) => {
  try {
    const { stages } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { stages },
      { new: true }
    );
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProjects, getProject, createProject, updateProject, updateStages, deleteProject };
