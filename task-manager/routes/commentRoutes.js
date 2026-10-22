const express = require('express');
const { body, validationResult } = require('express-validator');
const Comment = require('../models/Comment');
const Task = require('../models/Task');
const { verifyToken } = require('./authRoutes');
const router = express.Router();

// Get comments for task
router.get('/task/:taskId', verifyToken, async (req, res) => {
  try {
    const comments = await Comment.find({ taskId: req.params.taskId })
      .populate('author', 'firstName lastName avatar')
      .populate('mentions', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create comment
router.post('/', [
  body('taskId').notEmpty(),
  body('content').notEmpty()
], verifyToken, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const task = await Task.findById(req.body.taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const comment = new Comment({
      ...req.body,
      author: req.user.id
    });

    await comment.save();
    task.comments.push(comment._id);
    await task.save();

    req.io.emit('task_commented', comment);
    res.status(201).json({ message: 'Comment added', comment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update comment
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (comment.author.toString() !== req.user.id) return res.status(403).json({ error: 'Access denied' });

    comment.content = req.body.content;
    comment.edited = true;
    comment.editedAt = new Date();
    comment.editedBy = req.user.id;
    await comment.save();

    res.json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete comment
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (comment.author.toString() !== req.user.id) return res.status(403).json({ error: 'Access denied' });

    await Comment.findByIdAndDelete(req.params.id);
    await Task.findByIdAndUpdate(comment.taskId, { $pull: { comments: comment._id } });

    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add reaction to comment
router.post('/:id/reaction', [
  body('emoji').notEmpty()
], verifyToken, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    const reactionIndex = comment.reactions.findIndex(r => r.emoji === req.body.emoji && r.userId.toString() === req.user.id);
    
    if (reactionIndex > -1) {
      comment.reactions.splice(reactionIndex, 1);
    } else {
      comment.reactions.push({
        emoji: req.body.emoji,
        userId: req.user.id
      });
    }

    await comment.save();
    res.json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
