const express = require('express');
const { body, validationResult } = require('express-validator');
const Team = require('../models/Team');
const Project = require('../models/Project');
const { verifyToken } = require('./authRoutes');
const router = express.Router();

// Get all teams
router.get('/', verifyToken, async (req, res) => {
  try {
    const teams = await Team.find()
      .populate('owner', 'firstName lastName avatar')
      .populate('members.userId', 'firstName lastName avatar')
      .populate('projects');

    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get team by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('owner')
      .populate('members.userId')
      .populate('projects');

    if (!team) return res.status(404).json({ error: 'Team not found' });
    res.json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create team
router.post('/', [
  body('teamName').notEmpty(),
  body('description').optional()
], verifyToken, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const team = new Team({
      teamName: req.body.teamName,
      description: req.body.description,
      owner: req.user.id,
      members: [{
        userId: req.user.id,
        role: 'Owner'
      }]
    });

    await team.save();
    res.status(201).json({ message: 'Team created successfully', team });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add member to team
router.post('/:id/members', [
  body('userId').notEmpty(),
  body('role').optional().isIn(['Owner', 'Lead', 'Member'])
], verifyToken, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ error: 'Team not found' });

    const memberExists = team.members.some(m => m.userId.toString() === req.body.userId);
    if (memberExists) return res.status(400).json({ error: 'User already in team' });

    team.members.push({
      userId: req.body.userId,
      role: req.body.role || 'Member'
    });

    await team.save();
    res.json({ message: 'Member added to team', team });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove member from team
router.delete('/:id/members/:userId', verifyToken, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ error: 'Team not found' });

    team.members = team.members.filter(m => m.userId.toString() !== req.params.userId);
    await team.save();

    res.json({ message: 'Member removed from team', team });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add project to team
router.post('/:id/projects', [
  body('projectId').notEmpty()
], verifyToken, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const team = await Team.findById(req.params.id);
    const project = await Project.findById(req.body.projectId);

    if (!team || !project) return res.status(404).json({ error: 'Team or Project not found' });

    if (!team.projects.includes(req.body.projectId)) {
      team.projects.push(req.body.projectId);
      await team.save();
    }

    res.json({ message: 'Project added to team', team });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
