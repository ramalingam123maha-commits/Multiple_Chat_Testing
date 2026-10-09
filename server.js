const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// In-memory data storage
const tasks = new Map();
const users = new Map();
const comments = new Map();
const attachments = new Map();
const notifications = new Map();
const projects = new Map();

// WebSocket connections
const connectedClients = new Set();
const userSessions = new Map();

// Initialize sample users
function initializeUsers() {
  const userList = [
    { name: 'Alice Johnson', role: 'Project Manager', email: 'alice@company.com' },
    { name: 'Bob Smith', role: 'Developer', email: 'bob@company.com' },
    { name: 'Carol Davis', role: 'Designer', email: 'carol@company.com' },
    { name: 'David Wilson', role: 'QA Engineer', email: 'david@company.com' }
  ];
  
  userList.forEach(user => {
    const userId = uuidv4();
    users.set(userId, {
      id: userId,
      ...user,
      status: 'active',
      joinedDate: new Date().toISOString(),
      tasksCompleted: 0,
      currentTasks: 0
    });
  });
}

// Initialize sample projects
function initializeProjects() {
  const projectList = [
    { name: 'Website Redesign', description: 'Complete redesign of company website', color: '#FF6B6B' },
    { name: 'Mobile App', description: 'New mobile application development', color: '#4ECDC4' },
    { name: 'API Integration', description: 'Third-party API integration', color: '#45B7D1' }
  ];
  
  projectList.forEach(project => {
    const projectId = uuidv4();
    projects.set(projectId, {
      id: projectId,
      ...project,
      createdAt: new Date().toISOString(),
      taskCount: 0,
      completedTasks: 0
    });
  });
}

initializeUsers();
initializeProjects();

// WebSocket broadcast function
function broadcastUpdate(type, data) {
  const message = JSON.stringify({ type, data, timestamp: new Date().toISOString() });
  connectedClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Notify specific user
function notifyUser(userId, type, data) {
  const notification = {
    id: uuidv4(),
    userId,
    type,
    data,
    createdAt: new Date().toISOString(),
    read: false
  };
  
  notifications.set(notification.id, notification);
  
  userSessions.forEach((clients, uid) => {
    if (uid === userId) {
      clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'notification',
            data: notification
          }));
        }
      });
    }
  });
}

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('New WebSocket client connected');
  connectedClients.add(ws);
  
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      
      if (message.type === 'user_join') {
        const userId = message.userId;
        if (!userSessions.has(userId)) {
          userSessions.set(userId, new Set());
        }
        userSessions.get(userId).add(ws);
        
        broadcastUpdate('user_online', {
          userId,
          userName: message.userName
        });
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
    connectedClients.delete(ws);
    
    userSessions.forEach((clients, userId) => {
      if (clients.has(ws)) {
        clients.delete(ws);
        if (clients.size === 0) {
          userSessions.delete(userId);
          broadcastUpdate('user_offline', { userId });
        }
      }
    });
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    connectedClients.delete(ws);
  });
  
  // Send initial state
  ws.send(JSON.stringify({
    type: 'initial_state',
    data: {
      users: Array.from(users.values()),
      projects: Array.from(projects.values()),
      tasks: Array.from(tasks.values())
    }
  }));
});

// ============ USER ENDPOINTS ============

app.get('/api/users', (req, res) => {
  const usersList = Array.from(users.values());
  res.json(usersList);
});

app.get('/api/users/:id', (req, res) => {
  const user = users.get(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

// ============ PROJECT ENDPOINTS ============

app.get('/api/projects', (req, res) => {
  const projectsList = Array.from(projects.values());
  res.json(projectsList);
});

app.post('/api/projects', (req, res) => {
  const { name, description, color } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Project name is required' });
  }
  
  const projectId = uuidv4();
  const project = {
    id: projectId,
    name,
    description: description || '',
    color: color || '#3498db',
    createdAt: new Date().toISOString(),
    taskCount: 0,
    completedTasks: 0
  };
  
  projects.set(projectId, project);
  broadcastUpdate('project_created', project);
  res.status(201).json(project);
});

// ============ TASK ENDPOINTS ============

app.post('/api/tasks', (req, res) => {
  const { projectId, title, description, assignedTo, priority, dueDate, estimatedHours, tags } = req.body;
  
  if (!projectId || !title) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  if (!projects.has(projectId)) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  const taskId = uuidv4();
  const task = {
    id: taskId,
    projectId,
    title,
    description: description || '',
    assignedTo: assignedTo || null,
    priority: priority || 'medium',
    status: 'todo',
    dueDate: dueDate || null,
    estimatedHours: estimatedHours || 0,
    actualHours: 0,
    tags: tags || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null,
    subtasks: [],
    attachments: [],
    commentCount: 0,
    createdBy: req.body.createdBy || null
  };
  
  tasks.set(taskId, task);
  
  // Update project task count
  const project = projects.get(projectId);
  project.taskCount++;
  
  // Update user current tasks
  if (assignedTo && users.has(assignedTo)) {
    users.get(assignedTo).currentTasks++;
  }
  
  broadcastUpdate('task_created', task);
  res.status(201).json(task);
});

app.get('/api/tasks', (req, res) => {
  const { projectId, assignedTo, status, priority } = req.query;
  
  let tasksList = Array.from(tasks.values());
  
  if (projectId) {
    tasksList = tasksList.filter(t => t.projectId === projectId);
  }
  
  if (assignedTo) {
    tasksList = tasksList.filter(t => t.assignedTo === assignedTo);
  }
  
  if (status) {
    tasksList = tasksList.filter(t => t.status === status);
  }
  
  if (priority) {
    tasksList = tasksList.filter(t => t.priority === priority);
  }
  
  res.json(tasksList);
});

app.get('/api/tasks/:id', (req, res) => {
  const task = tasks.get(req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  const taskWithDetails = {
    ...task,
    assignee: task.assignedTo ? users.get(task.assignedTo) : null,
    project: projects.get(task.projectId),
    comments: Array.from(comments.values()).filter(c => c.taskId === task.id)
  };
  
  res.json(taskWithDetails);
});

app.put('/api/tasks/:id', (req, res) => {
  const task = tasks.get(req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  const { title, description, priority, dueDate, estimatedHours, tags, assignedTo } = req.body;
  
  if (title) task.title = title;
  if (description) task.description = description;
  if (priority) task.priority = priority;
  if (dueDate) task.dueDate = dueDate;
  if (estimatedHours) task.estimatedHours = estimatedHours;
  if (tags) task.tags = tags;
  
  // Handle reassignment
  if (assignedTo && assignedTo !== task.assignedTo) {
    if (task.assignedTo && users.has(task.assignedTo)) {
      users.get(task.assignedTo).currentTasks--;
    }
    task.assignedTo = assignedTo;
    if (users.has(assignedTo)) {
      users.get(assignedTo).currentTasks++;
      notifyUser(assignedTo, 'task_assigned', { task: task.title });
    }
  }
  
  task.updatedAt = new Date().toISOString();
  tasks.set(req.params.id, task);
  
  broadcastUpdate('task_updated', task);
  res.json(task);
});

app.post('/api/tasks/:id/status', (req, res) => {
  const task = tasks.get(req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  const { status, actualHours } = req.body;
  
  if (status) {
    task.status = status;
    
    if (status === 'completed') {
      task.completedAt = new Date().toISOString();
      
      if (task.assignedTo && users.has(task.assignedTo)) {
        const user = users.get(task.assignedTo);
        user.currentTasks--;
        user.tasksCompleted++;
        
        notifyUser(task.assignedTo, 'task_completed', { 
          task: task.title 
        });
      }
      
      const project = projects.get(task.projectId);
      if (project) {
        project.completedTasks++;
      }
    }
  }
  
  if (actualHours) {
    task.actualHours = actualHours;
  }
  
  task.updatedAt = new Date().toISOString();
  tasks.set(req.params.id, task);
  
  broadcastUpdate('task_status_changed', task);
  res.json(task);
});

app.delete('/api/tasks/:id', (req, res) => {
  const task = tasks.get(req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  if (task.assignedTo && users.has(task.assignedTo)) {
    users.get(task.assignedTo).currentTasks--;
  }
  
  const project = projects.get(task.projectId);
  if (project) {
    project.taskCount--;
    if (task.status === 'completed') {
      project.completedTasks--;
    }
  }
  
  tasks.delete(req.params.id);
  broadcastUpdate('task_deleted', { taskId: req.params.id });
  
  res.json({ message: 'Task deleted successfully' });
});

// ============ SUBTASK ENDPOINTS ============

app.post('/api/tasks/:id/subtasks', (req, res) => {
  const task = tasks.get(req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  const { title, assignedTo } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Subtask title is required' });
  }
  
  const subtask = {
    id: uuidv4(),
    title,
    status: 'todo',
    assignedTo: assignedTo || null,
    createdAt: new Date().toISOString()
  };
  
  task.subtasks.push(subtask);
  tasks.set(req.params.id, task);
  
  broadcastUpdate('subtask_created', { taskId: req.params.id, subtask });
  res.status(201).json(subtask);
});

app.post('/api/tasks/:taskId/subtasks/:subtaskId/complete', (req, res) => {
  const task = tasks.get(req.params.taskId);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  const subtask = task.subtasks.find(s => s.id === req.params.subtaskId);
  if (!subtask) {
    return res.status(404).json({ error: 'Subtask not found' });
  }
  
  subtask.status = 'completed';
  tasks.set(req.params.taskId, task);
  
  broadcastUpdate('subtask_completed', { taskId: req.params.taskId, subtask });
  res.json(subtask);
});

// ============ COMMENT ENDPOINTS ============

app.post('/api/tasks/:id/comments', (req, res) => {
  const task = tasks.get(req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  const { content, userId, mentions } = req.body;
  
  if (!content) {
    return res.status(400).json({ error: 'Comment content is required' });
  }
  
  const commentId = uuidv4();
  const comment = {
    id: commentId,
    taskId: req.params.id,
    userId,
    content,
    mentions: mentions || [],
    createdAt: new Date().toISOString(),
    likes: []
  };
  
  comments.set(commentId, comment);
  task.commentCount++;
  tasks.set(req.params.id, task);
  
  broadcastUpdate('comment_added', comment);
  
  // Notify mentioned users
  if (mentions && mentions.length > 0) {
    mentions.forEach(userId => {
      notifyUser(userId, 'mentioned_in_task', { 
        task: task.title,
        comment: content
      });
    });
  }
  
  res.status(201).json(comment);
});

app.get('/api/tasks/:id/comments', (req, res) => {
  const taskComments = Array.from(comments.values())
    .filter(c => c.taskId === req.params.id)
    .map(c => ({
      ...c,
      author: users.get(c.userId)
    }));
  
  res.json(taskComments);
});

app.delete('/api/comments/:id', (req, res) => {
  if (!comments.has(req.params.id)) {
    return res.status(404).json({ error: 'Comment not found' });
  }
  
  const comment = comments.get(req.params.id);
  const task = tasks.get(comment.taskId);
  if (task) {
    task.commentCount--;
  }
  
  comments.delete(req.params.id);
  broadcastUpdate('comment_deleted', { commentId: req.params.id });
  
  res.json({ message: 'Comment deleted successfully' });
});

// ============ ATTACHMENT ENDPOINTS ============

app.post('/api/tasks/:id/attachments', (req, res) => {
  const task = tasks.get(req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  const { fileName, fileUrl, fileType, uploadedBy } = req.body;
  
  const attachmentId = uuidv4();
  const attachment = {
    id: attachmentId,
    taskId: req.params.id,
    fileName,
    fileUrl,
    fileType,
    uploadedBy,
    uploadedAt: new Date().toISOString()
  };
  
  attachments.set(attachmentId, attachment);
  task.attachments.push(attachmentId);
  tasks.set(req.params.id, task);
  
  broadcastUpdate('attachment_uploaded', attachment);
  res.status(201).json(attachment);
});

// ============ NOTIFICATION ENDPOINTS ============

app.get('/api/users/:userId/notifications', (req, res) => {
  const userNotifications = Array.from(notifications.values())
    .filter(n => n.userId === req.params.userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  res.json(userNotifications);
});

app.post('/api/notifications/:id/read', (req, res) => {
  const notification = notifications.get(req.params.id);
  if (!notification) {
    return res.status(404).json({ error: 'Notification not found' });
  }
  
  notification.read = true;
  notifications.set(req.params.id, notification);
  res.json(notification);
});

// ============ DASHBOARD ENDPOINTS ============

app.get('/api/dashboard/stats', (req, res) => {
  const stats = {
    totalTasks: tasks.size,
    totalProjects: projects.size,
    totalUsers: users.size,
    completedTasks: Array.from(tasks.values()).filter(t => t.status === 'completed').length,
    inProgressTasks: Array.from(tasks.values()).filter(t => t.status === 'in_progress').length,
    todoTasks: Array.from(tasks.values()).filter(t => t.status === 'todo').length,
    overdueTasks: Array.from(tasks.values()).filter(t => {
      if (!t.dueDate) return false;
      return new Date(t.dueDate) < new Date() && t.status !== 'completed';
    }).length,
    projectStats: Array.from(projects.values()).map(p => ({
      name: p.name,
      tasks: p.taskCount,
      completed: p.completedTasks,
      progress: p.taskCount > 0 ? Math.round((p.completedTasks / p.taskCount) * 100) : 0
    })),
    userStats: Array.from(users.values()).map(u => ({
      name: u.name,
      currentTasks: u.currentTasks,
      tasksCompleted: u.tasksCompleted
    }))
  };
  
  res.json(stats);
});

app.get('/api/dashboard/timeline', (req, res) => {
  const tasksByDate = {};
  
  Array.from(tasks.values()).forEach(task => {
    if (task.dueDate) {
      const date = new Date(task.dueDate).toLocaleDateString();
      if (!tasksByDate[date]) {
        tasksByDate[date] = [];
      }
      tasksByDate[date].push({
        title: task.title,
        priority: task.priority,
        assignee: task.assignedTo ? users.get(task.assignedTo)?.name : 'Unassigned'
      });
    }
  });
  
  res.json(tasksByDate);
});

// Start server
server.listen(PORT, () => {
  console.log(`Task Manager running on http://localhost:${PORT}`);
  console.log(`WebSocket server ready for real-time collaboration`);
});
