const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(express.static('public'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/task_manager')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/teams', require('./routes/teamRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));

// WebSocket Events for Real-time Collaboration
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

  // Task events
  socket.on('task_created', (data) => {
    io.emit('task_update', { type: 'created', data, timestamp: new Date() });
  });

  socket.on('task_updated', (data) => {
    io.emit('task_update', { type: 'updated', data, timestamp: new Date() });
  });

  socket.on('task_status_changed', (data) => {
    io.emit('task_update', { type: 'status_changed', data, timestamp: new Date() });
  });

  socket.on('task_assigned', (data) => {
    io.emit('task_update', { type: 'assigned', data, timestamp: new Date() });
  });

  socket.on('task_commented', (data) => {
    io.emit('comment_update', { type: 'added', data, timestamp: new Date() });
  });

  // Team collaboration
  socket.on('join_project', (projectId) => {
    socket.join(`project_${projectId}`);
    io.to(`project_${projectId}`).emit('user_joined', { userId: socket.id, projectId });
  });

  socket.on('leave_project', (projectId) => {
    socket.leave(`project_${projectId}`);
  });

  // Activity tracking
  socket.on('user_typing', (data) => {
    io.emit('user_activity', { type: 'typing', data });
  });

  socket.on('task_completed', (data) => {
    io.emit('task_update', { type: 'completed', data, timestamp: new Date() });
  });
});

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 5002;
server.listen(PORT, () => {
  console.log(`Task Manager running on port ${PORT}`);
});

module.exports = { io };
