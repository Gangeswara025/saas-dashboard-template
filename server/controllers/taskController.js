const Task = require('../models/Task');
const Activity = require('../models/Activity');

// @desc    Get tasks for a project
// @route   GET /api/tasks/project/:projectId
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignedTo', 'name avatar')
      .sort({ order: 1, createdAt: 1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create task
// @route   POST /api/tasks
const createTask = async (req, res) => {
  try {
    const { title, description, projectId, assignedTo, priority, dueDate, status } = req.body;
    const task = await Task.create({
      title, description, project: projectId, assignedTo, priority, dueDate, status,
    });

    await Activity.create({
      project: projectId,
      user: req.user._id,
      action: 'created',
      description: `Task "${title}" was created`,
      entityType: 'task',
      entityId: task._id,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
const updateTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo } = req.body;
    const update = { title, description, status, priority, dueDate, assignedTo };
    if (status === 'completed') update.completedAt = new Date();

    const task = await Task.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    await Activity.create({
      project: task.project,
      user: req.user._id,
      action: 'updated',
      description: `Task "${task.title}" status changed to ${status}`,
      entityType: 'task',
      entityId: task._id,
    });

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
