const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  taskId: {
    type: String,
    unique: true,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  status: {
    type: String,
    enum: ['Todo', 'In Progress', 'In Review', 'Done', 'Blocked'],
    default: 'Todo'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  dueDate: Date,
  completionDate: Date,
  estimatedHours: Number,
  actualHours: Number,
  tags: [String],
  attachments: [
    {
      fileName: String,
      fileUrl: String,
      uploadedBy: mongoose.Schema.Types.ObjectId,
      uploadedAt: Date
    }
  ],
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    }
  ],
  dependencies: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    }
  ],
  subtasks: [
    {
      id: String,
      title: String,
      completed: Boolean,
      assignedTo: mongoose.Schema.Types.ObjectId
    }
  ],
  checklist: [
    {
      id: String,
      item: String,
      completed: Boolean
    }
  ],
  labels: [String],
  customFields: mongoose.Schema.Types.Mixed,
  activity: [
    {
      action: String,
      performedBy: mongoose.Schema.Types.ObjectId,
      timestamp: { type: Date, default: Date.now },
      changes: mongoose.Schema.Types.Mixed
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
