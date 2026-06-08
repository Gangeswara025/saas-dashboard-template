const mongoose = require('mongoose');

const stageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  status: { type: String, enum: ['completed', 'in-progress', 'pending'], default: 'pending' },
  completedAt: { type: Date },
  order: { type: Number, default: 0 },
});

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    currentStage: { type: String, default: '' },
    estimatedDelivery: { type: Date },
    status: { type: String, enum: ['active', 'completed', 'on-hold', 'cancelled'], default: 'active' },
    stages: [stageSchema],
    totalCost: { type: Number, default: 0 },
    techStack: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
