const API_BASE = 'http://localhost:3003/api';

let allTasks = [];
let allProjects = [];
let allUsers = [];
let currentFilter = '';

// ==================== TAB NAVIGATION ====================

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabName = e.target.dataset.tab;
            showTab(tabName);
            
            if (tabName === 'dashboard') loadDashboard();
            if (tabName === 'board') loadBoard();
            if (tabName === 'list') loadTaskList();
            if (tabName === 'projects') loadProjects();
            if (tabName === 'team') loadTeam();
        });
    });
    
    loadDashboard();
    loadInitialData();
});

function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(tabName).classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
}

async function loadInitialData() {
    try {
        const [tasksRes, projectsRes, usersRes] = await Promise.all([
            fetch(`${API_BASE}/tasks`),
            fetch(`${API_BASE}/projects`),
            fetch(`${API_BASE}/users`)
        ]);
        
        allTasks = await tasksRes.json();
        allProjects = await projectsRes.json();
        allUsers = await usersRes.json();
        
        populateSelects();
    } catch (error) {
        console.error('Error loading initial data:', error);
    }
}

// ==================== DASHBOARD ====================

async function loadDashboard() {
    try {
        const response = await fetch(`${API_BASE}/analytics/dashboard`);
        const stats = await response.json();
        
        document.getElementById('statTotalTasks').textContent = stats.totalTasks;
        document.getElementById('statInProgress').textContent = stats.inProgressTasks;
        document.getElementById('statTodo').textContent = stats.todoTasks;
        document.getElementById('statCompleted').textContent = stats.completedTasks;
        document.getElementById('statOverdue').textContent = stats.overdueTasks;
        document.getElementById('statHighPriority').textContent = stats.highPriorityTasks;
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// ==================== BOARD VIEW ====================

async function loadBoard() {
    try {
        const response = await fetch(`${API_BASE}/tasks`);
        allTasks = await response.json();
        renderBoard();
    } catch (error) {
        console.error('Error loading board:', error);
    }
}

function renderBoard() {
    const todoColumn = document.getElementById('todoColumn');
    const inProgressColumn = document.getElementById('inProgressColumn');
    const doneColumn = document.getElementById('doneColumn');
    
    // Filter tasks based on current priority filter
    const filteredTasks = currentFilter 
        ? allTasks.filter(t => t.priority === currentFilter)
        : allTasks;
    
    const todoTasks = filteredTasks.filter(t => t.status === 'Todo');
    const inProgressTasks = filteredTasks.filter(t => t.status === 'In Progress');
    const doneTasks = filteredTasks.filter(t => t.status === 'Done');
    
    todoColumn.innerHTML = todoTasks.map(task => renderTaskCard(task)).join('');
    inProgressColumn.innerHTML = inProgressTasks.map(task => renderTaskCard(task)).join('');
    doneColumn.innerHTML = doneTasks.map(task => renderTaskCard(task)).join('');
}

function renderTaskCard(task) {
    const assignee = allUsers.find(u => u.id === task.assignedTo);
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done';
    
    return `
        <div class="task-card ${task.priority.toLowerCase()}-priority" onclick="viewTaskDetail('${task.id}')">
            <div class="task-title">${task.title}</div>
            <div class="task-meta">
                ${task.description ? `<div>${task.description.substring(0, 50)}...</div>` : ''}
            </div>
            <div>
                <span class="badge badge-${task.priority.toLowerCase()}">${task.priority}</span>
            </div>
            <div style="margin-top: 8px;">
                ${assignee ? `<span class="task-assignee">${assignee.avatar}</span>` : ''}
                ${task.dueDate ? `
                    <span class="task-due-date ${isOverdue ? 'overdue' : ''}">
                        ${new Date(task.dueDate).toLocaleDateString()}
                    </span>
                ` : ''}
            </div>
            <div style="margin-top: 8px; font-size: 12px; color: #999;">
                ${task.subtasks.length} subtasks | ${task.watchers.length} watchers
            </div>
        </div>
    `;
}

function filterByPriority(priority) {
    currentFilter = priority;
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    renderBoard();
}

// ==================== LIST VIEW ====================

async function loadTaskList() {
    try {
        const response = await fetch(`${API_BASE}/tasks`);
        allTasks = await response.json();
        renderTaskList(allTasks);
    } catch (error) {
        console.error('Error loading task list:', error);
    }
}

function renderTaskList(tasks) {
    const tbody = document.getElementById('tasksTableBody');
    
    tbody.innerHTML = tasks.map(task => {
        const project = allProjects.find(p => p.id === task.projectId);
        const assignee = allUsers.find(u => u.id === task.assignedTo);
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done';
        
        return `
            <tr>
                <td onclick="viewTaskDetail('${task.id}')" style="cursor:pointer; color: #667eea;"><strong>${task.title}</strong></td>
                <td>${project ? project.name : 'N/A'}</td>
                <td><span class="badge badge-${task.priority.toLowerCase()}">${task.priority}</span></td>
                <td>${task.status}</td>
                <td>${assignee ? assignee.avatar + ' ' + assignee.name : 'Unassigned'}</td>
                <td>${task.dueDate ? `<span class="${isOverdue ? 'badge-danger' : ''}">${new Date(task.dueDate).toLocaleDateString()}</span>` : '-'}</td>
                <td>
                    <button class="btn-primary" onclick="showTaskEditModal('${task.id}')" style="font-size:12px;">Edit</button>
                    <button class="btn-danger" onclick="deleteTask('${task.id}')" style="font-size:12px;">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

function searchTasks() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const filtered = allTasks.filter(t =>
        t.title.toLowerCase().includes(query) ||
        (t.description && t.description.toLowerCase().includes(query))
    );
    renderTaskList(filtered);
}

// ==================== TASK MANAGEMENT ====================

function showTaskModal() {
    document.getElementById('taskModal').classList.add('show');
}

function closeTaskModal() {
    document.getElementById('taskModal').classList.remove('show');
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskDescription').value = '';
    document.getElementById('taskPriority').value = 'Medium';
    document.getElementById('taskProject').value = '';
    document.getElementById('taskAssignee').value = '';
    document.getElementById('taskDueDate').value = '';
}

async function saveTask(e) {
    e.preventDefault();
    
    const task = {
        title: document.getElementById('taskTitle').value,
        description: document.getElementById('taskDescription').value,
        projectId: document.getElementById('taskProject').value,
        priority: document.getElementById('taskPriority').value,
        assignedTo: document.getElementById('taskAssignee').value || null,
        dueDate: document.getElementById('taskDueDate').value || null,
        status: 'Todo'
    };
    
    try {
        const response = await fetch(`${API_BASE}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task)
        });
        
        if (response.ok) {
            closeTaskModal();
            await loadInitialData();
            loadBoard();
            showNotification('Task created successfully!', 'success');
        }
    } catch (error) {
        console.error('Error creating task:', error);
        showNotification('Error creating task', 'error');
    }
}

async function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        try {
            await fetch(`${API_BASE}/tasks/${taskId}`, { method: 'DELETE' });
            await loadInitialData();
            loadTaskList();
            showNotification('Task deleted', 'success');
        } catch (error) {
            console.error('Error deleting task:', error);
            showNotification('Error deleting task', 'error');
        }
    }
}

async function viewTaskDetail(taskId) {
    try {
        const response = await fetch(`${API_BASE}/tasks/${taskId}`);
        const task = await response.json();
        
        const commentsResponse = await fetch(`${API_BASE}/tasks/${taskId}/comments`);
        const comments = await commentsResponse.json();
        
        const project = allProjects.find(p => p.id === task.projectId);
        const assignee = allUsers.find(u => u.id === task.assignedTo);
        
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done';
        
        let html = `
            <div style="margin-bottom: 20px;">
                <p><strong>Project:</strong> ${project ? project.name : 'N/A'}</p>
                <p><strong>Status:</strong> ${task.status}</p>
                <p><strong>Priority:</strong> <span class="badge badge-${task.priority.toLowerCase()}">${task.priority}</span></p>
                <p><strong>Assigned To:</strong> ${assignee ? assignee.avatar + ' ' + assignee.name : 'Unassigned'}</p>
                ${task.dueDate ? `<p><strong>Due Date:</strong> <span class="${isOverdue ? 'badge-danger' : ''}">${new Date(task.dueDate).toLocaleDateString()}</span></p>` : ''}
                <p><strong>Description:</strong></p>
                <p>${task.description || 'No description'}</p>
            </div>
            
            <div style="margin: 20px 0;">
                <h4>Status Update</h4>
                <select id="statusUpdate" onchange="updateTaskStatus('${task.id}', this.value)">
                    <option value="Todo" ${task.status === 'Todo' ? 'selected' : ''}>Todo</option>
                    <option value="In Progress" ${task.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                    <option value="Done" ${task.status === 'Done' ? 'selected' : ''}>Done</option>
                </select>
            </div>
            
            <div style="margin: 20px 0;">
                <h4>Subtasks (${task.subtasks.length})</h4>
                ${task.subtasks.map(st => `
                    <div style="margin: 8px 0;">
                        <input type="checkbox" ${st.completed ? 'checked' : ''} onchange="updateSubtask('${task.id}', '${st.id}', this.checked)">
                        <span>${st.title}</span>
                    </div>
                `).join('')}
                <input type="text" id="subtaskInput" placeholder="Add new subtask...">
                <button class="btn-secondary" onclick="addSubtask('${task.id}')" style="margin-top: 8px;">Add</button>
            </div>
            
            <div class="comment-section">
                <h4>Comments (${comments.length})</h4>
                ${comments.map(comment => `
                    <div class="comment">
                        <div class="comment-author">${comment.author}</div>
                        <div>${comment.content}</div>
                        <div class="comment-time">${new Date(comment.createdDate).toLocaleString()}</div>
                    </div>
                `).join('')}
                <textarea id="commentInput" placeholder="Add a comment..." style="width: 100%; margin-top: 10px; padding: 10px; border-radius: 5px;"></textarea>
                <button class="btn-primary" onclick="addComment('${task.id}')" style="margin-top: 10px;">Post Comment</button>
            </div>
        `;
        
        document.getElementById('detailTaskTitle').textContent = task.title;
        document.getElementById('taskDetailContent').innerHTML = html;
        document.getElementById('taskDetailModal').classList.add('show');
    } catch (error) {
        console.error('Error loading task details:', error);
        showNotification('Error loading task details', 'error');
    }
}

function closeTaskDetailModal() {
    document.getElementById('taskDetailModal').classList.remove('show');
}

async function updateTaskStatus(taskId, newStatus) {
    try {
        const response = await fetch(`${API_BASE}/tasks/${taskId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        
        if (response.ok) {
            await loadInitialData();
            loadBoard();
            showNotification('Task status updated!', 'success');
        }
    } catch (error) {
        console.error('Error updating task status:', error);
    }
}

async function addSubtask(taskId) {
    const title = document.getElementById('subtaskInput').value;
    if (!title) return;
    
    try {
        await fetch(`${API_BASE}/tasks/${taskId}/subtasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title })
        });
        
        document.getElementById('subtaskInput').value = '';
        viewTaskDetail(taskId);
        showNotification('Subtask added!', 'success');
    } catch (error) {
        console.error('Error adding subtask:', error);
    }
}

async function updateSubtask(taskId, subtaskId, completed) {
    try {
        await fetch(`${API_BASE}/tasks/${taskId}/subtasks/${subtaskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed })
        });
    } catch (error) {
        console.error('Error updating subtask:', error);
    }
}

async function addComment(taskId) {
    const content = document.getElementById('commentInput').value;
    if (!content) return;
    
    try {
        await fetch(`${API_BASE}/tasks/${taskId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                author: 'Current User',
                content
            })
        });
        
        document.getElementById('commentInput').value = '';
        viewTaskDetail(taskId);
        showNotification('Comment added!', 'success');
    } catch (error) {
        console.error('Error adding comment:', error);
    }
}

// ==================== PROJECT MANAGEMENT ====================

async function loadProjects() {
    try {
        const response = await fetch(`${API_BASE}/projects`);
        allProjects = await response.json();
        
        const tbody = document.getElementById('projectsTableBody');
        
        tbody.innerHTML = allProjects.map(project => {
            const projectTasks = allTasks.filter(t => t.projectId === project.id);
            const owner = allUsers.find(u => u.id === project.owner);
            
            return `
                <tr>
                    <td>${project.name}</td>
                    <td>${project.status}</td>
                    <td>${projectTasks.length}</td>
                    <td>${project.members.length}</td>
                    <td>${new Date(project.startDate).toLocaleDateString()}</td>
                    <td>${project.dueDate ? new Date(project.dueDate).toLocaleDateString() : '-'}</td>
                    <td>
                        <button class="btn-secondary" onclick="viewProject('${project.id}')" style="font-size:12px;">View</button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

function showProjectModal() {
    document.getElementById('projectModal').classList.add('show');
}

function closeProjectModal() {
    document.getElementById('projectModal').classList.remove('show');
    document.getElementById('projectName').value = '';
    document.getElementById('projectDescription').value = '';
}

async function saveProject(e) {
    e.preventDefault();
    
    // Using first user as owner for simplicity
    const owner = allUsers.length > 0 ? allUsers[0].id : null;
    
    const project = {
        name: document.getElementById('projectName').value,
        description: document.getElementById('projectDescription').value,
        owner,
        members: [owner]
    };
    
    try {
        const response = await fetch(`${API_BASE}/projects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(project)
        });
        
        if (response.ok) {
            closeProjectModal();
            await loadInitialData();
            loadProjects();
            showNotification('Project created successfully!', 'success');
        }
    } catch (error) {
        console.error('Error creating project:', error);
        showNotification('Error creating project', 'error');
    }
}

function viewProject(projectId) {
    const project = allProjects.find(p => p.id === projectId);
    if (project) {
        alert(`
Project: ${project.name}
Description: ${project.description || 'N/A'}
Status: ${project.status}
Tasks: ${allTasks.filter(t => t.projectId === projectId).length}
Members: ${project.members.length}
        `);
    }
}

// ==================== TEAM MANAGEMENT ====================

async function loadTeam() {
    try {
        const tbody = document.getElementById('teamTableBody');
        
        tbody.innerHTML = allUsers.map(user => {
            const assignedTasks = allTasks.filter(t => t.assignedTo === user.id);
            const completedTasks = assignedTasks.filter(t => t.status === 'Done');
            const inProgressTasks = assignedTasks.filter(t => t.status === 'In Progress');
            
            return `
                <tr>
                    <td>${user.avatar} ${user.name}</td>
                    <td>${user.email}</td>
                    <td>${user.role}</td>
                    <td>${assignedTasks.length}</td>
                    <td>${completedTasks.length}</td>
                    <td>${inProgressTasks.length}</td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading team:', error);
    }
}

// ==================== UTILITIES ====================

function populateSelects() {
    const projectSelect = document.getElementById('taskProject');
    projectSelect.innerHTML = '<option value="">Choose a project</option>' +
        allProjects.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    
    const assigneeSelect = document.getElementById('taskAssignee');
    assigneeSelect.innerHTML = '<option value="">Unassigned</option>' +
        allUsers.map(u => `<option value="${u.id}">${u.avatar} ${u.name}</option>`).join('');
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 2000;
        border-left: 4px solid ${type === 'success' ? '#51cf66' : '#ff6b6b'};
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 4000);
}

window.onclick = (event) => {
    ['taskModal', 'projectModal', 'taskDetailModal'].forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (event.target === modal) {
            modal.classList.remove('show');
        }
    });
};
