const express = require('express');
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { verifyToken } = require('./authRoutes');
const router = express.Router();

// Get all tasks (with filters)
router.get('/', verifyToken, async (req, res) => {
  try {
    const { projectId, status, priority, assignedTo, page = 1, limit = 10 } = req.query;
    const filter = {};
    
    if (projectId) filter.projectId = projectId;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;

    const tasks = await Task.find(filter)
      .populate('createdBy', 'firstName lastName avatar')
      .populate('assignedTo', 'firstName lastName avatar')
      .populate('comments')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Task.countDocuments(filter);
    res.json({ tasks, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get task by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('createdBy')
      .populate('assignedTo')
      .populate('comments')
      .populate('dependencies');
    
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create task
router.post('/', [
  body('title').notEmpty(),
  body('projectId').notEmpty(),
  body('priority').optional().isIn(['Low', 'Medium', 'High', 'Critical']),
  body('status').optional().isIn(['Todo', 'In Progress', 'In Review', 'Done', 'Blocked'])
], verifyToken, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const project = await Project.findById(req.body.projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const taskId = `TASK${Date.now()}`;
    const task = new Task({
      ...req.body,
      taskId,
      createdBy: req.user.id,
      activity: [{
        action: 'created',
        performedBy: req.user.id
      }]
    });

    await task.save();
    project.taskCount += 1;
    await project.save();

    req.io.emit('task_created', task);
    res.status(201).json({ message: 'Task created successfully', task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update task
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    task.activity.push({
      action: 'updated',
      performedBy: req.user.id,
      changes: req.body
    });
    await task.save();

    req.io.emit('task_updated', task);
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Change task status
router.patch('/:id/status', [
  body('status').isIn(['Todo', 'In Progress', 'In Review', 'Done', 'Blocked'])
], verifyToken, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const oldStatus = task.status;
    task.status = req.body.status;

    if (req.body.status === 'Done') {
      task.completionDate = new Date();
      const project = await Project.findById(task.projectId);
      project.completedTaskCount += 1;
      await project.save();
    }

    task.activity.push({
      action: 'status_changed',
      performedBy: req.user.id,
      changes: { from: oldStatus, to: req.body.status }
    });

    await task.save();
    req.io.emit('task_status_changed', task);
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Assign task
router.patch('/:id/assign', [
  body('assignedTo').isArray()
], verifyToken, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { assignedTo: req.body.assignedTo },
      { new: true }
    );

    if (!task) return res.status(404).json({ error: 'Task not found' });

    task.activity.push({
      action: 'assigned',
      performedBy: req.user.id,
      changes: { assignedTo: req.body.assignedTo }
    });
    await task.save();

    req.io.emit('task_assigned', task);
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark task complete
router.patch('/:id/complete', verifyToken, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Done',
        completionDate: new Date(),
        actualHours: req.body.actualHours || 0
      },
      { new: true }
    );

    if (!task) return res.status(404).json({ error: 'Task not found' });

    task.activity.push({
      action: 'completed',
      performedBy: req.user.id
    });
    await task.save();

    req.io.emit('task_completed', task);
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete task
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const project = await Project.findById(task.projectId);
    project.taskCount = Math.max(0, project.taskCount - 1);
    if (task.status === 'Done') {
      project.completedTaskCount = Math.max(0, project.completedTaskCount - 1);
    }
    await project.save();

    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
