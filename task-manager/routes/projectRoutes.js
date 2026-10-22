const express = require('express');
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const Task = require('../models/Task');
const { verifyToken } = require('./authRoutes');
const router = express.Router();

// Get all projects
router.get('/', verifyToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const projects = await Project.find(filter)
      .populate('owner', 'firstName lastName avatar')
      .populate('members.userId', 'firstName lastName avatar')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Project.countDocuments(filter);
    res.json({ projects, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get project by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner')
      .populate('members.userId');

    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create project
router.post('/', [
  body('name').notEmpty(),
  body('visibility').optional().isIn(['Private', 'Team', 'Public'])
], verifyToken, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const projectCode = `PRJ${Math.random().toString(36).substring(7).toUpperCase()}`;
    
    const project = new Project({
      ...req.body,
      projectCode,
      owner: req.user.id,
      members: [{
        userId: req.user.id,
        role: 'Owner'
      }]
    });

    await project.save();
    res.status(201).json({ message: 'Project created successfully', project });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update project
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add member to project
router.post('/:id/members', [
  body('userId').notEmpty(),
  body('role').optional().isIn(['Owner', 'Manager', 'Member', 'Viewer'])
], verifyToken, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const memberExists = project.members.some(m => m.userId.toString() === req.body.userId);
    if (memberExists) return res.status(400).json({ error: 'User already a member' });

    project.members.push({
      userId: req.body.userId,
      role: req.body.role || 'Member'
    });

    await project.save();
    res.json({ message: 'Member added successfully', project });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get project tasks
router.get('/:id/tasks', verifyToken, async (req, res) => {
  try {
    const tasks = await Task.find({ projectId: req.params.id })
      .populate('createdBy', 'firstName lastName')
      .populate('assignedTo', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get project stats
router.get('/:id/stats', verifyToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const tasks = await Task.find({ projectId: req.params.id });
    const completionRate = project.taskCount > 0 ? ((project.completedTaskCount / project.taskCount) * 100).toFixed(1) : 0;

    const tasksByStatus = {
      todo: tasks.filter(t => t.status === 'Todo').length,
      inProgress: tasks.filter(t => t.status === 'In Progress').length,
      inReview: tasks.filter(t => t.status === 'In Review').length,
      done: tasks.filter(t => t.status === 'Done').length,
      blocked: tasks.filter(t => t.status === 'Blocked').length
    };

    const tasksByPriority = {
      low: tasks.filter(t => t.priority === 'Low').length,
      medium: tasks.filter(t => t.priority === 'Medium').length,
      high: tasks.filter(t => t.priority === 'High').length,
      critical: tasks.filter(t => t.priority === 'Critical').length
    };

    res.json({
      totalTasks: project.taskCount,
      completedTasks: project.completedTaskCount,
      completionRate,
      tasksByStatus,
      tasksByPriority,
      memberCount: project.members.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
