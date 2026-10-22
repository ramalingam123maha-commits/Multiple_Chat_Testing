const API_URL = 'http://localhost:5002/api';
const socket = io('http://localhost:5002');
let token = localStorage.getItem('token');
let currentUser = localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')) : null;
let projects = [];
let tasks = [];
let teams = [];

document.addEventListener('DOMContentLoaded', () => {
  if (token && currentUser) {
    showDashboard();
    setupWebSocket();
    loadDashboardStats();
  }
});

// Tab switching
function switchTab(tab) {
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  
  event.target.classList.add('active');
  document.getElementById(tab + '-form').classList.add('active');
}

// Authentication
async function registerUser(e) {
  e.preventDefault();
  const data = {
    username: document.getElementById('reg-username').value,
    firstName: document.getElementById('reg-firstname').value,
    lastName: document.getElementById('reg-lastname').value,
    email: document.getElementById('reg-email').value,
    password: document.getElementById('reg-password').value
  };

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Registration failed');

    token = result.token;
    currentUser = result.user;
    localStorage.setItem('token', token);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    showDashboard();
    setupWebSocket();
    loadDashboardStats();
  } catch (err) {
    document.getElementById('register-error').textContent = err.message;
  }
}

async function loginUser(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');

    token = data.token;
    currentUser = data.user;
    localStorage.setItem('token', token);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    showDashboard();
    setupWebSocket();
    loadDashboardStats();
  } catch (err) {
    document.getElementById('login-error').textContent = err.message;
  }
}

function logout() {
  token = null;
  currentUser = null;
  localStorage.clear();
  document.getElementById('login-container').classList.remove('hidden');
  document.getElementById('dashboard').classList.add('hidden');
}

function showDashboard() {
  document.getElementById('login-container').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
  
  document.getElementById('user-info').textContent = `Welcome, ${currentUser.firstName}`;
}

// WebSocket Setup
function setupWebSocket() {
  socket.on('task_update', (data) => {
    showNotification(`Task ${data.type}: ${data.data.title}`);
    loadTasks();
  });

  socket.on('task_completed', (data) => {
    showNotification(`Task completed: ${data.data.title}`);
    loadTasks();
  });

  socket.on('comment_update', (data) => {
    showNotification('New comment on task');
  });
}

function showNotification(message) {
  const notif = document.createElement('div');
  notif.className = 'real-time-update';
  notif.textContent = message;
  notif.style.cssText = 'position:fixed;top:100px;right:20px;background:#27ae60;color:white;padding:15px;border-radius:5px;z-index:999;animation:slideIn 0.3s ease;';
  document.body.appendChild(notif);
  
  setTimeout(() => notif.remove(), 3000);
}

// Page Navigation
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(page + '-page').classList.add('active');

  if (page === 'dashboard') loadDashboardStats();
  if (page === 'projects') loadProjects();
  if (page === 'tasks') loadTasks();
  if (page === 'teams') loadTeams();
  if (page === 'profile') loadProfile();
}

// Dashboard
async function loadDashboardStats() {
  try {
    const projectsRes = await fetch(`${API_URL}/projects`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const tasksRes = await fetch(`${API_URL}/tasks`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    projects = (await projectsRes.json()).projects || [];
    tasks = (await tasksRes.json()).tasks || [];

    const myTasks = tasks.filter(t => t.assignedTo.some(a => a._id === currentUser._id));
    const overdueTasks = myTasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'Done');
    const inProgress = tasks.filter(t => t.status === 'In Progress');
    const completedThisWeek = tasks.filter(t => {
      const completedDate = new Date(t.completionDate);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return completedDate >= weekAgo && t.status === 'Done';
    });

    document.getElementById('active-projects').textContent = projects.filter(p => p.status === 'Active').length;
    document.getElementById('total-tasks').textContent = tasks.length;
    document.getElementById('my-tasks').textContent = myTasks.length;
    document.getElementById('overdue-tasks').textContent = overdueTasks.length;
    document.getElementById('in-progress').textContent = inProgress.length;
    document.getElementById('completed-week').textContent = completedThisWeek.length;

    renderRecentTasks(tasks.slice(0, 5));
  } catch (err) {
    console.error(err);
  }
}

function renderRecentTasks(recentTasks) {
  const tbody = document.getElementById('recent-tasks-tbody');
  tbody.innerHTML = '';

  recentTasks.forEach(task => {
    const row = tbody.insertRow();
    const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date';
    row.innerHTML = `
      <td>${task.title}</td>
      <td>${task.projectId?.name || 'N/A'}</td>
      <td><span class="priority-badge priority-${task.priority.toLowerCase()}">${task.priority}</span></td>
      <td>${task.status}</td>
      <td>${dueDate}</td>
    `;
  });
}

// Projects
async function loadProjects() {
  try {
    const res = await fetch(`${API_URL}/projects`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    projects = (await res.json()).projects || [];
    const grid = document.getElementById('projects-grid');
    grid.innerHTML = '';

    projects.forEach(project => {
      const card = document.createElement('div');
      card.className = 'project-card';
      card.innerHTML = `
        <h3>${project.name}</h3>
        <p>${project.description || 'No description'}</p>
        <div class="project-stats">
          <span>Tasks: ${project.taskCount}</span>
          <span>Members: ${project.members.length}</span>
        </div>
      `;
      grid.appendChild(card);
    });
  } catch (err) {
    console.error(err);
  }
}

function openCreateProjectModal() {
  document.getElementById('create-project-modal').classList.remove('hidden');
}

async function createProject(e) {
  e.preventDefault();
  const form = e.target;
  const data = {
    name: form.children[0].value,
    description: form.children[1].value,
    category: form.children[2].value,
    visibility: form.children[3].value
  };

  try {
    const res = await fetch(`${API_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!res.ok) throw new Error('Failed to create project');
    alert('Project created successfully!');
    closeModal('create-project-modal');
    loadProjects();
  } catch (err) {
    alert(err.message);
  }
}

// Tasks
async function loadTasks() {
  try {
    const res = await fetch(`${API_URL}/tasks`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    tasks = (await res.json()).tasks || [];
    renderKanbanBoard();
  } catch (err) {
    console.error(err);
  }
}

function renderKanbanBoard() {
  const statuses = ['Todo', 'In Progress', 'In Review', 'Done'];
  
  statuses.forEach(status => {
    const list = document.getElementById(`list-${status}`);
    list.innerHTML = '';

    const statusTasks = tasks.filter(t => t.status === status);
    statusTasks.forEach(task => {
      const card = document.createElement('div');
      card.className = 'task-card';
      card.draggable = true;
      card.innerHTML = `
        <h4>${task.title}</h4>
        <div class="task-card-meta">
          <span class="priority-badge priority-${task.priority.toLowerCase()}">${task.priority}</span>
          <span>${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}</span>
        </div>
      `;
      list.appendChild(card);
    });
  });
}

function filterTasks() {
  // Filter implementation
  renderKanbanBoard();
}

function openCreateTaskModal() {
  loadProjectSelects();
  document.getElementById('create-task-modal').classList.remove('hidden');
}

async function loadProjectSelects() {
  const select = document.getElementById('task-project');
  select.innerHTML = '<option value="">Select Project</option>';
  
  projects.forEach(p => {
    const option = document.createElement('option');
    option.value = p._id;
    option.textContent = p.name;
    select.appendChild(option);
  });
}

async function createTask(e) {
  e.preventDefault();
  const form = e.target;
  const data = {
    title: form.children[0].value,
    description: form.children[1].value,
    projectId: form.children[2].value,
    priority: form.children[3].value,
    dueDate: form.children[4].value,
    estimatedHours: form.children[5].value
  };

  try {
    const res = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!res.ok) throw new Error('Failed to create task');
    alert('Task created successfully!');
    closeModal('create-task-modal');
    loadTasks();
  } catch (err) {
    alert(err.message);
  }
}

// Teams
async function loadTeams() {
  try {
    const res = await fetch(`${API_URL}/teams`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    teams = (await res.json()) || [];
    const tbody = document.getElementById('teams-tbody');
    tbody.innerHTML = '';

    teams.forEach(team => {
      const row = tbody.insertRow();
      row.innerHTML = `
        <td>${team.teamName}</td>
        <td>${team.members.length}</td>
        <td>${team.projects.length}</td>
        <td><button onclick="viewTeam('${team._id}')">View</button></td>
      `;
    });
  } catch (err) {
    console.error(err);
  }
}

function openCreateTeamModal() {
  document.getElementById('create-team-modal').classList.remove('hidden');
}

async function createTeam(e) {
  e.preventDefault();
  const form = e.target;
  const data = {
    teamName: form.children[0].value,
    description: form.children[1].value
  };

  try {
    const res = await fetch(`${API_URL}/teams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!res.ok) throw new Error('Failed to create team');
    alert('Team created successfully!');
    closeModal('create-team-modal');
    loadTeams();
  } catch (err) {
    alert(err.message);
  }
}

// Profile
async function loadProfile() {
  const content = document.getElementById('profile-content');
  content.innerHTML = `
    <p><strong>Name:</strong> ${currentUser.firstName} ${currentUser.lastName}</p>
    <p><strong>Email:</strong> ${currentUser.email}</p>
    <p><strong>Username:</strong> ${currentUser.username}</p>
    <p><strong>Role:</strong> ${currentUser.role}</p>
  `;
}

// Modal functions
function closeModal(modalId) {
  document.getElementById(modalId).classList.add('hidden');
}

function viewTeam(teamId) {
  alert('View team - implementation pending');
}
