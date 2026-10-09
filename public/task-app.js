const API_BASE = 'http://localhost:5000/api';
const WS_URL = 'ws://localhost:5000';

let ws = null;
let currentUser = null;
let allUsers = [];
let allProjects = [];
let allTasks = [];

// ============ WEBSOCKET CONNECTION ============

function connectWebSocket() {
  ws = new WebSocket(WS_URL);
  
  ws.onopen = () => {
    console.log('WebSocket connected');
    updateWSStatus(true);
    if (currentUser) {
      ws.send(JSON.stringify({
        type: 'user_join',
        userId: currentUser.id,
        userName: currentUser.name
      }));
    }
  };
  
  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    
    if (message.type === 'initial_state') {
      console.log('Received initial state');
    } else if (message.type === 'notification') {
      handleNotification(message.data);
    } else {
      handleRealtimeUpdate(message);
    }
  };
  
  ws.onclose = () => {
    console.log('WebSocket disconnected');
    updateWSStatus(false);
    setTimeout(connectWebSocket, 3000);
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    updateWSStatus(false);
  };
}

function updateWSStatus(connected) {
  const badge = document.getElementById('wsStatus');
  if (connected) {
    badge.textContent = '● Online';
    badge.classList.remove('offline');
    badge.classList.add('online');
  } else {
    badge.textContent = '● Offline';
    badge.classList.add('offline');
    badge.classList.remove('online');
  }
}

function handleRealtimeUpdate(message) {
  const { type, data } = message;
  
  switch (type) {
    case 'task_created':
      allTasks.push(data);
      updateAllViews();
      showToast('New task created', 'success');
      break;
    case 'task_updated':
      const taskIdx = allTasks.findIndex(t => t.id === data.id);
      if (taskIdx >= 0) {
        allTasks[taskIdx] = data;
        updateAllViews();
      }
      break;
    case 'task_status_changed':
      handleTaskStatusChange(data);
      break;
    case 'project_created':
      allProjects.push(data);
      updateAllViews();
      showToast('New project created', 'success');
      break;
    case 'comment_added':
      showToast('New comment on task', 'success');
      break;
    case 'user_online':
      showToast(`${data.userName} is online`, 'success');
      break;
  }
}

function handleNotification(notification) {
  const { type, data } = notification;
  
  let message = '';
  switch (type) {
    case 'task_assigned':
      message = `Task assigned: ${data.task}`;
      break;
    case 'task_completed':
      message = `Task completed: ${data.task}`;
      break;
    case 'mentioned_in_task':
      message = `Mentioned in task: ${data.task}`;
      break;
  }
  
  if (message) {
    showToast(message, 'success');
    updateNotifications();
  }
}

function handleTaskStatusChange(task) {
  const taskIdx = allTasks.findIndex(t => t.id === task.id);
  if (taskIdx >= 0) {
    allTasks[taskIdx] = task;
  }
  updateAllViews();
}

// ============ UTILITY FUNCTIONS ============

async function fetchAPI(endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    showToast(error.message, 'error');
    throw error;
  }
}

function showView(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(viewId).classList.add('active');
  
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelector(`[data-view="${viewId}"]`).classList.add('active');
  
  const titles = {
    'overview': 'Dashboard',
    'projects': 'Projects',
    'tasks': 'My Tasks',
    'calendar': 'Calendar',
    'team': 'Team Members'
  };
  
  document.getElementById('viewTitle').textContent = titles[viewId] || 'Dashboard';
  
  if (viewId === 'overview') {
    loadDashboard();
  } else if (viewId === 'projects') {
    loadProjects();
  } else if (viewId === 'tasks') {
    loadTasks();
  } else if (viewId === 'calendar') {
    loadCalendar();
  } else if (viewId === 'team') {
    loadTeam();
  }
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

function openModal(modalId) {
  document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

function updateAllViews() {
  loadDashboard();
  loadProjects();
  loadTasks();
  loadTeam();
}

// ============ INITIALIZATION ============

async function initializeApp() {
  try {
    // Load initial data
    allUsers = await fetchAPI('/users');
    allProjects = await fetchAPI('/projects');
    allTasks = await fetchAPI('/tasks');
    
    // Set current user (first user or random)
    currentUser = allUsers[0];
    document.getElementById('currentUserName').textContent = currentUser.name;
    document.getElementById('currentUserRole').textContent = currentUser.role;
    
    // Connect WebSocket
    connectWebSocket();
    
    // Load dashboard
    loadDashboard();
    
    // Setup event listeners
    setupEventListeners();
  } catch (error) {
    console.error('Error initializing app:', error);
  }
}

function setupEventListeners() {
  // Project Form
  const projectForm = document.getElementById('projectForm');
  if (projectForm) {
    projectForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const projectData = {
        name: document.getElementById('projectName').value,
        description: document.getElementById('projectDesc').value,
        color: document.getElementById('projectColor').value
      };
      
      try {
        const newProject = await fetchAPI('/projects', 'POST', projectData);
        allProjects.push(newProject);
        projectForm.reset();
        loadProjects();
        showToast('Project created successfully', 'success');
      } catch (error) {
        console.error('Error creating project:', error);
      }
    });
  }
  
  // Task Form
  const taskForm = document.getElementById('taskForm');
  if (taskForm) {
    taskForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const taskData = {
        projectId: document.getElementById('taskProject').value,
        title: document.getElementById('taskTitle').value,
        description: document.getElementById('taskDesc').value,
        priority: document.getElementById('taskPriority').value,
        assignedTo: document.getElementById('taskAssignee').value || null,
        dueDate: document.getElementById('taskDue').value,
        estimatedHours: parseFloat(document.getElementById('taskHours').value) || 0,
        createdBy: currentUser.id
      };
      
      try {
        const newTask = await fetchAPI('/tasks', 'POST', taskData);
        allTasks.push(newTask);
        taskForm.reset();
        loadTasks();
        showToast('Task created successfully', 'success');
      } catch (error) {
        console.error('Error creating task:', error);
      }
    });
  }
  
  // Filters
  const statusFilter = document.getElementById('statusFilter');
  const priorityFilter = document.getElementById('priorityFilter');
  
  if (statusFilter) {
    statusFilter.addEventListener('change', loadTasks);
  }
  
  if (priorityFilter) {
    priorityFilter.addEventListener('change', loadTasks);
  }
  
  // Search
  const searchBox = document.getElementById('searchBox');
  if (searchBox) {
    searchBox.addEventListener('input', loadTasks);
  }
  
  // Close modals
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      e.target.style.display = 'none';
    }
  });
}

// ============ DASHBOARD ============

async function loadDashboard() {
  try {
    const stats = await fetchAPI('/dashboard/stats');
    
    document.getElementById('totalTasksCount').textContent = stats.totalTasks;
    document.getElementById('completedTasksCount').textContent = stats.completedTasks;
    document.getElementById('inProgressCount').textContent = stats.inProgressTasks;
    document.getElementById('overdueCount').textContent = stats.overdueTasks;
    
    // Project Progress
    const projectProgress = document.getElementById('projectProgress');
    projectProgress.innerHTML = stats.projectStats.map(p => `
      <div class="progress-item">
        <div class="progress-name">${p.name}</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${p.progress}%"></div>
        </div>
        <div class="progress-text">${p.completed}/${p.tasks}</div>
      </div>
    `).join('');
    
    // Team Performance
    const teamPerformance = document.getElementById('teamPerformance');
    teamPerformance.innerHTML = stats.userStats.map(u => `
      <div class="performance-item">
        <div class="performance-name">${u.name}</div>
        <div class="performance-stats">
          <span>${u.currentTasks} current</span> • <span>${u.tasksCompleted} completed</span>
        </div>
      </div>
    `).join('');
    
    // Upcoming Tasks
    const upcomingTasks = document.getElementById('upcomingTasks');
    const tasksByDate = await fetchAPI('/dashboard/timeline');
    
    let timelineHTML = '';
    for (const [date, tasks] of Object.entries(tasksByDate)) {
      timelineHTML += `
        <div class="timeline-item">
          <div class="timeline-date">${date}</div>
          <div class="timeline-tasks">
            ${tasks.map(t => `
              <div class="timeline-task">
                <span class="task-title">${t.title}</span>
                <span class="task-priority priority-${t.priority}">${t.priority}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
    
    upcomingTasks.innerHTML = timelineHTML || '<p>No upcoming tasks</p>';
  } catch (error) {
    console.error('Error loading dashboard:', error);
  }
}

// ============ PROJECTS ============

async function loadProjects() {
  try {
    const projectsGrid = document.getElementById('projectsGrid');
    
    projectsGrid.innerHTML = allProjects.map(project => {
      const projectTasks = allTasks.filter(t => t.projectId === project.id);
      const completedCount = projectTasks.filter(t => t.status === 'completed').length;
      const progress = projectTasks.length > 0 ? Math.round((completedCount / projectTasks.length) * 100) : 0;
      
      return `
        <div class="project-card" onclick="viewProjectDetails('${project.id}')">
          <div class="project-header" style="border-left-color: ${project.color}">
            <h3>${project.name}</h3>
            <p>${project.description}</p>
          </div>
          <div class="project-stats">
            <span>${projectTasks.length} tasks</span>
            <span>${progress}% complete</span>
          </div>
        </div>
      `;
    }).join('');
    
    // Populate project select
    const projectSelect = document.getElementById('taskProject');
    if (projectSelect) {
      projectSelect.innerHTML = '<option value="">Select Project</option>' +
        allProjects.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    }
  } catch (error) {
    console.error('Error loading projects:', error);
  }
}

function viewProjectDetails(projectId) {
  const project = allProjects.find(p => p.id === projectId);
  const projectTasks = allTasks.filter(t => t.projectId === projectId);
  
  const details = `
    <h3>${project.name}</h3>
    <p>${project.description}</p>
    <div style="margin-top: 20px;">
      <h4>Tasks in this project</h4>
      <ul>
        ${projectTasks.map(t => `
          <li>
            ${t.title} 
            <span class="task-badge badge-priority-${t.priority}">${t.priority}</span>
            <span class="task-badge badge-status-${t.status}">${t.status}</span>
          </li>
        `).join('')}
      </ul>
    </div>
  `;
  
  document.getElementById('taskDetails').innerHTML = details;
  openModal('taskModal');
}

// ============ TASKS ============

async function loadTasks() {
  try {
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    const priorityFilter = document.getElementById('priorityFilter')?.value || '';
    const searchQuery = document.getElementById('searchBox')?.value?.toLowerCase() || '';
    
    let filtered = allTasks;
    
    if (statusFilter) {
      filtered = filtered.filter(t => t.status === statusFilter);
    }
    
    if (priorityFilter) {
      filtered = filtered.filter(t => t.priority === priorityFilter);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(searchQuery) ||
        t.description.toLowerCase().includes(searchQuery)
      );
    }
    
    const tasksList = document.getElementById('tasksList');
    
    tasksList.innerHTML = filtered.map(task => {
      const project = allProjects.find(p => p.id === task.projectId);
      const assignee = allUsers.find(u => u.id === task.assignedTo);
      
      return `
        <div class="task-item" onclick="viewTaskDetails('${task.id}')">
          <div class="task-content">
            <div class="task-title">${task.title}</div>
            <div class="task-meta">
              ${project ? `<span>${project.name}</span>` : ''} •
              ${assignee ? `<span>Assigned to ${assignee.name}</span>` : '<span>Unassigned</span>'} •
              ${task.dueDate ? `<span>Due ${new Date(task.dueDate).toLocaleDateString()}</span>` : ''}
            </div>
            <div class="task-badges">
              <span class="task-badge badge-priority-${task.priority}">${task.priority}</span>
              <span class="task-badge badge-status-${task.status}">${task.status}</span>
            </div>
          </div>
          <div class="task-actions">
            <button onclick="event.stopPropagation(); updateTaskStatus('${task.id}', '${task.status}')" class="task-action-btn">
              ${task.status === 'todo' ? '→' : task.status === 'in_progress' ? '✓' : '✓'}
            </button>
          </div>
        </div>
      `;
    }).join('');
    
    // Populate assignee select
    const assigneeSelect = document.getElementById('taskAssignee');
    if (assigneeSelect) {
      assigneeSelect.innerHTML = '<option value="">Assign to...</option>' +
        allUsers.map(u => `<option value="${u.id}">${u.name}</option>`).join('');
    }
  } catch (error) {
    console.error('Error loading tasks:', error);
  }
}

async function viewTaskDetails(taskId) {
  try {
    const task = await fetchAPI(`/tasks/${taskId}`);
    const project = allProjects.find(p => p.id === task.projectId);
    const assignee = allUsers.find(u => u.id === task.assignedTo);
    
    const details = `
      <div class="task-detail">
        <h2>${task.title}</h2>
        <div class="detail-row">
          <div>
            <div class="detail-field">
              <div class="detail-label">Project</div>
              <div class="detail-value">${project?.name || 'N/A'}</div>
            </div>
            <div class="detail-field">
              <div class="detail-label">Status</div>
              <div class="detail-value">
                <span class="task-badge badge-status-${task.status}">${task.status}</span>
              </div>
            </div>
            <div class="detail-field">
              <div class="detail-label">Priority</div>
              <div class="detail-value">
                <span class="task-badge badge-priority-${task.priority}">${task.priority}</span>
              </div>
            </div>
          </div>
          <div>
            <div class="detail-field">
              <div class="detail-label">Assigned To</div>
              <div class="detail-value">${assignee?.name || 'Unassigned'}</div>
            </div>
            <div class="detail-field">
              <div class="detail-label">Due Date</div>
              <div class="detail-value">${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</div>
            </div>
            <div class="detail-field">
              <div class="detail-label">Estimated Hours</div>
              <div class="detail-value">${task.estimatedHours}h</div>
            </div>
          </div>
        </div>
        
        <div class="detail-field">
          <div class="detail-label">Description</div>
          <div class="detail-value">${task.description || 'No description'}</div>
        </div>
        
        ${task.subtasks && task.subtasks.length > 0 ? `
          <div class="detail-field">
            <div class="detail-label">Subtasks</div>
            <ul>
              ${task.subtasks.map(s => `
                <li>${s.title} - ${s.status}</li>
              `).join('')}
            </ul>
          </div>
        ` : ''}
        
        ${task.comments && task.comments.length > 0 ? `
          <div class="comments-section">
            <h3>Comments</h3>
            ${task.comments.map(c => `
              <div class="comment">
                <div class="comment-author">${c.author?.name}</div>
                <div class="comment-text">${c.content}</div>
                <div class="comment-time">${new Date(c.createdAt).toLocaleString()}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
    
    document.getElementById('taskDetails').innerHTML = details;
    openModal('taskModal');
  } catch (error) {
    console.error('Error loading task details:', error);
  }
}

async function updateTaskStatus(taskId, currentStatus) {
  const statuses = { 'todo': 'in_progress', 'in_progress': 'completed', 'completed': 'todo' };
  const nextStatus = statuses[currentStatus];
  
  try {
    const updatedTask = await fetchAPI(`/tasks/${taskId}/status`, 'POST', {
      status: nextStatus
    });
    
    const taskIdx = allTasks.findIndex(t => t.id === taskId);
    if (taskIdx >= 0) {
      allTasks[taskIdx] = updatedTask;
    }
    
    loadTasks();
    showToast(`Task updated to ${nextStatus}`, 'success');
  } catch (error) {
    console.error('Error updating task:', error);
  }
}

// ============ CALENDAR ============

async function loadCalendar() {
  try {
    const timeline = await fetchAPI('/dashboard/timeline');
    const timelineDiv = document.getElementById('taskTimeline');
    
    let html = '';
    for (const [date, tasks] of Object.entries(timeline)) {
      html += `
        <div class="timeline-item">
          <div class="timeline-date">${date}</div>
          <div class="timeline-tasks">
            ${tasks.map(t => `
              <div class="timeline-task">
                <span class="task-title">${t.title}</span>
                <span class="task-priority priority-${t.priority}">${t.priority}</span>
                <span>${t.assignee}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
    
    timelineDiv.innerHTML = html || '<p>No tasks scheduled</p>';
  } catch (error) {
    console.error('Error loading calendar:', error);
  }
}

// ============ TEAM ============

async function loadTeam() {
  try {
    const teamGrid = document.getElementById('teamGrid');
    
    teamGrid.innerHTML = allUsers.map(user => {
      const userTasks = allTasks.filter(t => t.assignedTo === user.id);
      const completedTasks = userTasks.filter(t => t.status === 'completed').length;
      
      return `
        <div class="team-member">
          <div class="member-avatar">👤</div>
          <h3>${user.name}</h3>
          <p>${user.role}</p>
          <div class="member-stats">
            <div class="member-stat">
              <div class="member-stat-value">${user.currentTasks}</div>
              <div>Current</div>
            </div>
            <div class="member-stat">
              <div class="member-stat-value">${user.tasksCompleted}</div>
              <div>Completed</div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error('Error loading team:', error);
  }
}

// ============ NOTIFICATIONS ============

function toggleNotifications() {
  const panel = document.getElementById('notificationsPanel');
  panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  if (panel.style.display === 'block') {
    updateNotifications();
  }
}

async function updateNotifications() {
  try {
    if (!currentUser) return;
    
    const notifications = await fetchAPI(`/users/${currentUser.id}/notifications`);
    const unreadCount = notifications.filter(n => !n.read).length;
    
    const badge = document.getElementById('notificationBadge');
    if (unreadCount > 0) {
      badge.textContent = unreadCount;
      badge.style.display = 'inline-flex';
    } else {
      badge.style.display = 'none';
    }
    
    const notificationsList = document.getElementById('notificationsList');
    notificationsList.innerHTML = notifications.slice(0, 10).map(n => `
      <div class="notification-item ${n.read ? '' : 'unread'}">
        <p>${n.data}</p>
        <div class="notification-time">${new Date(n.createdAt).toLocaleString()}</div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error updating notifications:', error);
  }
}

// Initialize on page load
window.addEventListener('load', () => {
  initializeApp();
});

// Add CSS for progress bars and timeline
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .progress-item {
    margin-bottom: 15px;
  }
  
  .progress-name {
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 5px;
  }
  
  .progress-bar {
    height: 8px;
    background: #e0e0e0;
    border-radius: 4px;
    overflow: hidden;
  }
  
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #667eea, #764ba2);
    border-radius: 4px;
    transition: width 0.3s ease;
  }
  
  .progress-text {
    font-size: 11px;
    color: #999;
    margin-top: 3px;
  }
  
  .performance-item {
    padding: 12px;
    background: #f8f9fa;
    border-radius: 5px;
    margin-bottom: 10px;
  }
  
  .performance-name {
    font-weight: 600;
    font-size: 13px;
    margin-bottom: 5px;
  }
  
  .performance-stats {
    font-size: 12px;
    color: #999;
  }
  
  .timeline-item {
    padding: 15px;
    background: white;
    border-radius: 5px;
    margin-bottom: 10px;
    border-left: 4px solid #667eea;
  }
  
  .timeline-date {
    font-weight: 600;
    color: #333;
    margin-bottom: 10px;
  }
  
  .timeline-task {
    padding: 8px;
    background: #f8f9fa;
    border-radius: 4px;
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
  }
  
  .timeline-task .task-title {
    flex: 1;
  }
  
  .timeline-task .task-priority {
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 3px;
    margin: 0 5px;
  }
`;

document.head.appendChild(styleSheet);
