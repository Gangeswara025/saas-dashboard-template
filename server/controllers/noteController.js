const Note = require('../models/Note');
const Activity = require('../models/Activity');

const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ project: req.params.projectId })
      .populate('author', 'name avatar role')
      .sort({ pinned: -1, createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createNote = async (req, res) => {
  try {
    const { content, projectId, pinned } = req.body;
    const note = await Note.create({ content, project: projectId, author: req.user._id, pinned: pinned || false });
    await Activity.create({
      project: projectId, user: req.user._id, action: 'posted',
      description: `New update: "${content.substring(0, 60)}"`, entityType: 'note', entityId: note._id,
    });
    const populated = await note.populate('author', 'name avatar role');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteNote = async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json({ message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getNotes, createNote, deleteNote };
