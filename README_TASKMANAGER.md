# Task Manager Application - TaskFlow

A collaborative project management and task tracking application with real-time updates. TaskFlow enables teams to create projects, manage tasks, assign work, track progress, and collaborate efficiently with real-time WebSocket communication.

## Features

### ✅ Project Management
- **Create Projects**: Establish new projects with descriptions and color coding
- **Project Dashboard**: View project overview with task statistics
- **Progress Tracking**: Visual progress indicators for each project
- **Task Organization**: Organize tasks by projects
- **Completion Metrics**: Track completed vs. total tasks

### ✅ Task Management
- **Create Tasks**: Create tasks with title, description, priority, and due dates
- **Task Assignment**: Assign tasks to team members
- **Priority Levels**: Low, Medium, High priority settings
- **Status Tracking**: Todo, In Progress, Completed states
- **Due Dates**: Track deadlines with visual indicators
- **Time Estimation**: Log estimated and actual hours
- **Task Search**: Search and filter tasks across projects
- **Task Details**: Comprehensive task information modal

### ✅ Subtasks
- **Subtask Creation**: Break down tasks into smaller subtasks
- **Subtask Tracking**: Monitor subtask completion
- **Subtask Assignment**: Assign subtasks to team members
- **Nested Organization**: Organize work hierarchically

### ✅ Collaboration Features
- **Comments**: Add comments and discussion to tasks
- **User Mentions**: Tag team members in comments with @ mentions
- **Notifications**: Real-time notifications for mentions and assignments
- **Activity Feed**: See who did what and when
- **Team Visibility**: View team member profiles and workload

### ✅ Task Comments & Attachments
- **Inline Comments**: Add detailed comments to tasks
- **Comment Thread**: Organize discussion on tasks
- **File Attachments**: Attach files to tasks
- **Attachment Tracking**: View all attachments on a task

### ✅ Notifications & Real-time Updates
- **Task Assignment Notifications**: Get notified when assigned tasks
- **Mention Notifications**: Be alerted when mentioned in comments
- **Task Completion Alerts**: See when tasks are completed
- **Live Updates**: Real-time synchronization via WebSocket
- **Notification Center**: Centralized notification management
- **Unread Badge**: Track unread notifications

### ✅ Dashboard & Analytics
- **Overview Statistics**: Total tasks, completed, in progress, overdue
- **Project Progress**: Visual representation of project completion
- **Team Performance**: Workload distribution across team
- **Calendar View**: Tasks organized by due date
- **Timeline**: Upcoming tasks view

### ✅ Team Management
- **Team Directory**: View all team members
- **Member Profiles**: See member details and role
- **Workload Overview**: View tasks assigned to each member
- **Performance Metrics**: Track completed tasks per member
- **Availability Status**: See who's online

### ✅ Filters & Search
- **Status Filtering**: Filter by todo, in progress, completed
- **Priority Filtering**: Filter by priority level
- **Search**: Full-text search across task titles and descriptions
- **Project Filtering**: Filter tasks by project
- **Assignee Filtering**: Find tasks by assigned member

## Technology Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **WebSocket (ws)** - Real-time bidirectional communication
- **body-parser** - Request parsing
- **cors** - Cross-Origin Resource Sharing
- **uuid** - Unique ID generation

### Frontend
- **HTML5** - Markup structure
- **CSS3** - Responsive grid-based styling
- **Vanilla JavaScript** - Client-side logic
- **WebSocket API** - Real-time updates
- **DOM API** - Dynamic content rendering

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)

### Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Server**
   ```bash
   npm start
   ```
   The application will run on `http://localhost:5000` with WebSocket on the same port

3. **Access the Application**
   Open your browser and navigate to `http://localhost:5000/public/task-manager.html`

## Project Structure

```
/
├── server.js                    # Express server, WebSocket, and API
├── package.json                 # Project dependencies
├── public/
│   ├── task-manager.html        # Main application HTML
│   ├── task-app.js              # Client-side logic
│   └── task-styles.css          # Responsive styling
```

## API Endpoints

### Users
- `GET /api/users` - Get all team members
- `GET /api/users/:id` - Get user details

### Projects
- `POST /api/projects` - Create new project
- `GET /api/projects` - Get all projects

### Tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks` - Get tasks (supports filters)
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task information
- `POST /api/tasks/:id/status` - Update task status
- `DELETE /api/tasks/:id` - Delete task

### Subtasks
- `POST /api/tasks/:id/subtasks` - Create subtask
- `POST /api/tasks/:taskId/subtasks/:subtaskId/complete` - Mark subtask complete

### Comments
- `POST /api/tasks/:id/comments` - Add comment to task
- `GET /api/tasks/:id/comments` - Get task comments
- `DELETE /api/comments/:id` - Delete comment

### Attachments
- `POST /api/tasks/:id/attachments` - Upload attachment
- `GET /api/tasks/:id/attachments` - Get task attachments

### Notifications
- `GET /api/users/:userId/notifications` - Get user notifications
- `POST /api/notifications/:id/read` - Mark notification as read

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/timeline` - Get tasks by date

## WebSocket Events

### Client to Server
- `user_join` - User connects and joins real-time updates

### Server to Client
- `initial_state` - Send initial data on connection
- `task_created` - New task created
- `task_updated` - Task information updated
- `task_status_changed` - Task status changed
- `project_created` - New project created
- `comment_added` - New comment on task
- `subtask_created` - New subtask created
- `subtask_completed` - Subtask completed
- `user_online` - User comes online
- `user_offline` - User goes offline
- `attachment_uploaded` - File attached to task
- `task_deleted` - Task deleted
- `comment_deleted` - Comment deleted
- `notification` - User-specific notification

## Data Models

### User
```javascript
{
  id: string,
  name: string,
  role: string,
  email: string,
  status: "active" | "inactive",
  joinedDate: ISO8601,
  tasksCompleted: number,
  currentTasks: number
}
```

### Project
```javascript
{
  id: string,
  name: string,
  description: string,
  color: string,
  createdAt: ISO8601,
  taskCount: number,
  completedTasks: number
}
```

### Task
```javascript
{
  id: string,
  projectId: string,
  title: string,
  description: string,
  assignedTo: string | null,
  priority: "high" | "medium" | "low",
  status: "todo" | "in_progress" | "completed",
  dueDate: ISO8601 | null,
  estimatedHours: number,
  actualHours: number,
  tags: string[],
  createdAt: ISO8601,
  updatedAt: ISO8601,
  completedAt: ISO8601 | null,
  subtasks: Subtask[],
  attachments: string[],
  commentCount: number,
  createdBy: string
}
```

### Subtask
```javascript
{
  id: string,
  title: string,
  status: "todo" | "completed",
  assignedTo: string | null,
  createdAt: ISO8601
}
```

### Comment
```javascript
{
  id: string,
  taskId: string,
  userId: string,
  content: string,
  mentions: string[],
  createdAt: ISO8601,
  likes: string[]
}
```

### Notification
```javascript
{
  id: string,
  userId: string,
  type: "task_assigned" | "task_completed" | "mentioned_in_task",
  data: object,
  createdAt: ISO8601,
  read: boolean
}
```

## Usage Guide

### Creating a Project
1. Go to **Projects** section
2. Fill in project name and description
3. Choose a color for the project
4. Click **Create Project**
5. Project appears in the projects grid

### Creating a Task
1. Navigate to **My Tasks** section
2. Fill in the task creation form:
   - Select project
   - Enter task title
   - Add description
   - Set priority level
   - Assign to team member
   - Set due date
   - Estimate hours
3. Click **Create Task**

### Assigning Tasks
1. Create a task and select an assignee, OR
2. Edit an existing task to change assignee
3. Task notification sent to assigned team member
4. Task appears in assignee's task list

### Updating Task Status
1. Find the task in your list
2. Click the status button (arrow icon)
3. Status cycles: Todo → In Progress → Completed → Todo
4. Real-time update sent to all users

### Adding Comments
1. Open task details modal
2. Scroll to comments section
3. Type your comment
4. Use @ to mention team members
5. Submit comment
6. Mentioned users receive notifications

### Viewing Analytics
1. Go to **Overview** section
2. View dashboard statistics:
   - Total tasks count
   - Completed tasks
   - In-progress tasks
   - Overdue tasks
3. See project progress bars
4. View team performance metrics

### Team Collaboration
1. Go to **Team** section
2. View all team members
3. See current workload (current tasks)
4. View completed tasks count
5. Identify availability and workload distribution

## Dashboard Views

### Overview
- Key metrics at a glance
- Project progress tracking
- Team performance overview
- Upcoming tasks timeline

### Projects
- All active projects
- Project progress visualization
- Task count per project
- Quick project access

### My Tasks
- Personal task list
- Filterable by status and priority
- Task search functionality
- Quick task actions

### Calendar
- Tasks organized by due date
- Timeline view of upcoming work
- Priority indicators
- Assignee information

### Team
- Team member directory
- Workload distribution
- Performance metrics
- Online status

## Features Highlights

### Real-time Collaboration
- WebSocket ensures instant updates
- All users see changes immediately
- No page refresh needed
- Live presence indicators

### Smart Notifications
- Only notify relevant people
- Mention-based notifications
- Task assignment alerts
- Completion confirmations

### Flexible Filtering
- Filter by status, priority, project
- Search across all tasks
- Multiple filter combinations
- Save filtered views

### Team Visibility
- See who's working on what
- Understand team workload
- Track individual progress
- Identify bottlenecks

## Keyboard Shortcuts
- (Future enhancement) Ctrl+K to search tasks
- (Future enhancement) T to create new task
- (Future enhancement) P to create new project

## Browser Compatibility
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Considerations
- In-memory data storage for demonstration
- Efficient WebSocket message handling
- Optimized rendering for 1000+ tasks
- Scalable architecture ready for database

## Future Enhancements
- Database integration (MongoDB/PostgreSQL)
- Drag-and-drop task management
- Kanban board view
- Gantt chart visualization
- Time tracking
- Recurring tasks
- Task dependencies
- Bulk operations
- Advanced reporting
- Mobile app
- Email notifications
- Integration with calendars
- API for third-party tools
- Custom workflows
- Role-based access control

## Security Considerations
- Input validation on all endpoints
- CORS protection
- WebSocket message validation
- User authentication (to be implemented)
- Authorization checks (to be implemented)

## Troubleshooting

### WebSocket Connection Issues
- Check that server is running
- Verify port 5000 is accessible
- Check browser console for errors
- Ensure WebSocket is not blocked by firewall

### Tasks Not Updating
- Refresh the page
- Check WebSocket connection status
- Verify network connectivity
- Clear browser cache

### Performance Issues
- Check browser DevTools performance
- Monitor network tab
- Ensure adequate system resources
- Consider database migration for large datasets

## License
MIT License

## Support
For issues or questions, please contact the development team.

## Credits
Built with Node.js, Express, WebSocket, and vanilla JavaScript for maximum compatibility and learning value.
