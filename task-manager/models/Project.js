const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  projectCode: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [
    {
      userId: mongoose.Schema.Types.ObjectId,
      role: {
        type: String,
        enum: ['Owner', 'Manager', 'Member', 'Viewer'],
        default: 'Member'
      }
    }
  ],
  status: {
    type: String,
    enum: ['Planning', 'Active', 'On Hold', 'Completed', 'Archived'],
    default: 'Planning'
  },
  startDate: Date,
  endDate: Date,
  color: String,
  icon: String,
  category: String,
  visibility: {
    type: String,
    enum: ['Private', 'Team', 'Public'],
    default: 'Team'
  },
  settings: {
    allowComments: { type: Boolean, default: true },
    allowAttachments: { type: Boolean, default: true },
    requireDueDate: { type: Boolean, default: false },
    allowSubtasks: { type: Boolean, default: true }
  },
  taskCount: {
    type: Number,
    default: 0
  },
  completedTaskCount: {
    type: Number,
    default: 0
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  budget: Number,
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
