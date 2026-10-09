const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// In-memory database
const usersDB = {};
const tasksDB = {};
const projectsDB = {};
const commentsDB = {};

// Initialize sample data
function initializeData() {
    // Create sample users
    const user1Id = uuidv4();
    const user2Id = uuidv4();
    const user3Id = uuidv4();
    
    usersDB[user1Id] = {
        id: user1Id,
        name: 'John Manager',
        email: 'john@company.com',
        role: 'Manager',
        avatar: '👨‍💼'
    };
    
    usersDB[user2Id] = {
        id: user2Id,
        name: 'Sarah Developer',
        email: 'sarah@company.com',
        role: 'Developer',
        avatar: '👩‍💻'
    };
    
    usersDB[user3Id] = {
        id: user3Id,
        name: 'Mike Designer',
        email: 'mike@company.com',
        role: 'Designer',
        avatar: '🎨'
    };
    
    // Create sample project
    const projectId = uuidv4();
    projectsDB[projectId] = {
        id: projectId,
        name: 'Website Redesign',
        description: 'Complete redesign of company website',
        status: 'In Progress',
        startDate: new Date('2024-01-01'),
        dueDate: new Date('2024-03-31'),
        owner: user1Id,
        members: [user1Id, user2Id, user3Id],
        createdDate: new Date()
    };
}

initializeData();

// ==================== USER MANAGEMENT ====================

app.get('/api/users', (req, res) => {
    res.json(Object.values(usersDB));
});

app.get('/api/users/:id', (req, res) => {
    const user = usersDB[req.params.id];
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
});

// ==================== PROJECT MANAGEMENT ====================

app.post('/api/projects', (req, res) => {
    const { name, description, owner, members } = req.body;
    
    if (!name || !owner) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const projectId = uuidv4();
    const project = {
        id: projectId,
        name,
        description,
        status: 'Not Started',
        owner,
        members: members || [owner],
        startDate: new Date(),
        dueDate: null,
        createdDate: new Date(),
        updatedDate: new Date()
    };
    
    projectsDB[projectId] = project;
    res.status(201).json(project);
});

app.get('/api/projects', (req, res) => {
    res.json(Object.values(projectsDB));
});

app.get('/api/projects/:id', (req, res) => {
    const project = projectsDB[req.params.id];
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
});

app.put('/api/projects/:id', (req, res) => {
    const project = projectsDB[req.params.id];
    if (!project) return res.status(404).json({ error: 'Project not found' });
    
    Object.assign(project, req.body);
    project.updatedDate = new Date();
    res.json(project);
});

// ==================== TASK MANAGEMENT ====================

app.post('/api/tasks', (req, res) => {
    const { 
        title, description, projectId, assignedTo, priority, 
        dueDate, status, tags 
    } = req.body;
    
    if (!title || !projectId) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (!projectsDB[projectId]) {
        return res.status(404).json({ error: 'Project not found' });
    }
    
    const taskId = uuidv4();
    const task = {
        id: taskId,
        title,
        description,
        projectId,
        assignedTo: assignedTo || null,
        priority: priority || 'Medium',
        status: status || 'Todo',
        dueDate: dueDate || null,
        tags: tags || [],
        createdDate: new Date(),
        updatedDate: new Date(),
        completedDate: null,
        attachments: [],
        subtasks: [],
        watchers: []
    };
    
    tasksDB[taskId] = task;
    res.status(201).json(task);
});

app.get('/api/tasks', (req, res) => {
    const tasks = Object.values(tasksDB);
    
    // Filter by query parameters
    if (req.query.projectId) {
        const filtered = tasks.filter(t => t.projectId === req.query.projectId);
        return res.json(filtered);
    }
    
    if (req.query.status) {
        const filtered = tasks.filter(t => t.status === req.query.status);
        return res.json(filtered);
    }
    
    if (req.query.assignedTo) {
        const filtered = tasks.filter(t => t.assignedTo === req.query.assignedTo);
        return res.json(filtered);
    }
    
    res.json(tasks);
});

app.get('/api/tasks/:id', (req, res) => {
    const task = tasksDB[req.params.id];
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
});

app.put('/api/tasks/:id', (req, res) => {
    const task = tasksDB[req.params.id];
    if (!task) return res.status(404).json({ error: 'Task not found' });
    
    Object.assign(task, req.body);
    task.updatedDate = new Date();
    
    if (req.body.status === 'Done' && !task.completedDate) {
        task.completedDate = new Date();
    }
    
    res.json(task);
});

app.delete('/api/tasks/:id', (req, res) => {
    if (tasksDB[req.params.id]) {
        delete tasksDB[req.params.id];
    }
    res.json({ message: 'Task deleted' });
});

// ==================== SUBTASKS ====================

app.post('/api/tasks/:id/subtasks', (req, res) => {
    const task = tasksDB[req.params.id];
    if (!task) return res.status(404).json({ error: 'Task not found' });
    
    const subtask = {
        id: uuidv4(),
        title: req.body.title,
        completed: false,
        createdDate: new Date()
    };
    
    task.subtasks.push(subtask);
    res.status(201).json(subtask);
});

app.put('/api/tasks/:id/subtasks/:subtaskId', (req, res) => {
    const task = tasksDB[req.params.id];
    if (!task) return res.status(404).json({ error: 'Task not found' });
    
    const subtask = task.subtasks.find(st => st.id === req.params.subtaskId);
    if (!subtask) return res.status(404).json({ error: 'Subtask not found' });
    
    Object.assign(subtask, req.body);
    res.json(subtask);
});

app.delete('/api/tasks/:id/subtasks/:subtaskId', (req, res) => {
    const task = tasksDB[req.params.id];
    if (!task) return res.status(404).json({ error: 'Task not found' });
    
    task.subtasks = task.subtasks.filter(st => st.id !== req.params.subtaskId);
    res.json({ message: 'Subtask deleted' });
});

// ==================== COMMENTS & COLLABORATION ====================

app.post('/api/tasks/:id/comments', (req, res) => {
    const task = tasksDB[req.params.id];
    if (!task) return res.status(404).json({ error: 'Task not found' });
    
    const commentId = uuidv4();
    const comment = {
        id: commentId,
        taskId: req.params.id,
        author: req.body.author,
        content: req.body.content,
        createdDate: new Date(),
        likes: 0,
        replies: []
    };
    
    commentsDB[commentId] = comment;
    res.status(201).json(comment);
});

app.get('/api/tasks/:id/comments', (req, res) => {
    const comments = Object.values(commentsDB).filter(c => c.taskId === req.params.id);
    res.json(comments);
});

app.post('/api/comments/:id/reply', (req, res) => {
    const comment = commentsDB[req.params.id];
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    
    const reply = {
        id: uuidv4(),
        author: req.body.author,
        content: req.body.content,
        createdDate: new Date()
    };
    
    comment.replies.push(reply);
    res.status(201).json(reply);
});

app.post('/api/comments/:id/like', (req, res) => {
    const comment = commentsDB[req.params.id];
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    
    comment.likes += 1;
    res.json(comment);
});

// ==================== TASK TRACKING & WATCHERS ====================

app.post('/api/tasks/:id/watch', (req, res) => {
    const task = tasksDB[req.params.id];
    if (!task) return res.status(404).json({ error: 'Task not found' });
    
    const userId = req.body.userId;
    if (!task.watchers.includes(userId)) {
        task.watchers.push(userId);
    }
    
    res.json({ message: 'Now watching task', watchers: task.watchers.length });
});

app.post('/api/tasks/:id/unwatch', (req, res) => {
    const task = tasksDB[req.params.id];
    if (!task) return res.status(404).json({ error: 'Task not found' });
    
    task.watchers = task.watchers.filter(w => w !== req.body.userId);
    res.json({ message: 'Unwatched task', watchers: task.watchers.length });
});

// ==================== PRIORITY & STATUS MANAGEMENT ====================

app.put('/api/tasks/:id/priority', (req, res) => {
    const task = tasksDB[req.params.id];
    if (!task) return res.status(404).json({ error: 'Task not found' });
    
    task.priority = req.body.priority;
    task.updatedDate = new Date();
    res.json(task);
});

app.put('/api/tasks/:id/status', (req, res) => {
    const task = tasksDB[req.params.id];
    if (!task) return res.status(404).json({ error: 'Task not found' });
    
    const oldStatus = task.status;
    task.status = req.body.status;
    task.updatedDate = new Date();
    
    if (req.body.status === 'Done' && !task.completedDate) {
        task.completedDate = new Date();
    }
    
    res.json({ 
        task,
        message: `Task moved from ${oldStatus} to ${req.body.status}`
    });
});

// ==================== ANALYTICS & REPORTING ====================

app.get('/api/analytics/project-stats/:projectId', (req, res) => {
    const projectTasks = Object.values(tasksDB).filter(t => t.projectId === req.params.projectId);
    
    const stats = {
        totalTasks: projectTasks.length,
        completedTasks: projectTasks.filter(t => t.status === 'Done').length,
        todoTasks: projectTasks.filter(t => t.status === 'Todo').length,
        inProgressTasks: projectTasks.filter(t => t.status === 'In Progress').length,
        highPriorityTasks: projectTasks.filter(t => t.priority === 'High').length,
        overdueTasks: projectTasks.filter(t => {
            return t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done';
        }).length,
        completionRate: projectTasks.length > 0 
            ? (projectTasks.filter(t => t.status === 'Done').length / projectTasks.length * 100).toFixed(2)
            : 0
    };
    
    res.json(stats);
});

app.get('/api/analytics/user-stats/:userId', (req, res) => {
    const userTasks = Object.values(tasksDB).filter(t => t.assignedTo === req.params.userId);
    
    const stats = {
        assignedTasks: userTasks.length,
        completedTasks: userTasks.filter(t => t.status === 'Done').length,
        inProgressTasks: userTasks.filter(t => t.status === 'In Progress').length,
        todoTasks: userTasks.filter(t => t.status === 'Todo').length,
        overdueTasks: userTasks.filter(t => {
            return t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done';
        }).length,
        highPriorityTasks: userTasks.filter(t => t.priority === 'High').length
    };
    
    res.json(stats);
});

app.get('/api/analytics/dashboard', (req, res) => {
    const allTasks = Object.values(tasksDB);
    
    const stats = {
        totalTasks: allTasks.length,
        completedTasks: allTasks.filter(t => t.status === 'Done').length,
        inProgressTasks: allTasks.filter(t => t.status === 'In Progress').length,
        todoTasks: allTasks.filter(t => t.status === 'Todo').length,
        overdueTasks: allTasks.filter(t => {
            return t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done';
        }).length,
        highPriorityTasks: allTasks.filter(t => t.priority === 'High').length,
        projects: Object.keys(projectsDB).length,
        users: Object.keys(usersDB).length
    };
    
    res.json(stats);
});

// ==================== TASK FILTERING & SEARCH ====================

app.get('/api/search', (req, res) => {
    const query = req.query.q ? req.query.q.toLowerCase() : '';
    
    if (!query) {
        return res.json([]);
    }
    
    const tasks = Object.values(tasksDB).filter(t =>
        t.title.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.tags.some(tag => tag.toLowerCase().includes(query))
    );
    
    res.json(tasks);
});

app.get('/api/tasks/by-priority/:priority', (req, res) => {
    const tasks = Object.values(tasksDB).filter(t => t.priority === req.params.priority);
    res.json(tasks);
});

app.get('/api/tasks/by-status/:status', (req, res) => {
    const tasks = Object.values(tasksDB).filter(t => t.status === req.params.status);
    res.json(tasks);
});

// ==================== TASK TEMPLATES ====================

app.post('/api/tasks/from-template', (req, res) => {
    const { templateName, projectId, tasks } = req.body;
    
    const createdTasks = tasks.map(taskTemplate => {
        const taskId = uuidv4();
        const task = {
            id: taskId,
            title: taskTemplate.title,
            description: taskTemplate.description || '',
            projectId,
            priority: taskTemplate.priority || 'Medium',
            status: 'Todo',
            createdDate: new Date(),
            updatedDate: new Date(),
            subtasks: [],
            watchers: []
        };
        tasksDB[taskId] = task;
        return task;
    });
    
    res.status(201).json({
        templateName,
        tasksCreated: createdTasks.length,
        tasks: createdTasks
    });
});

app.listen(PORT, () => {
    console.log(`Task Manager Application running on port ${PORT}`);
});
