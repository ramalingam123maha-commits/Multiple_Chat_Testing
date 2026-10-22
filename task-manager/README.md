# Task Manager - Collaborative Project Management

A modern, full-stack collaborative task management application enabling teams to create projects, assign tasks, track progress, manage priorities, meet deadlines, and collaborate effectively with real-time updates and WebSocket synchronization.

## Features

### Project Management
- Create and organize projects with visibility settings
- Project templates and categories
- Team-based access control (Private, Team, Public)
- Project status tracking (Planning, Active, On Hold, Completed, Archived)
- Progress metrics and completion rates
- Budget and timeline management

### Task Management
- Create tasks with detailed descriptions
- Assign tasks to team members
- Priority levels (Low, Medium, High, Critical)
- Status tracking (Todo, In Progress, In Review, Done, Blocked)
- Deadline management with automatic notifications
- Estimated vs. actual hours tracking
- Task dependencies and prerequisites
- Subtasks and checklists

### User & Team Management
- User registration and authentication
- Role-based access control (Admin, Manager, User)
- Team creation and management
- Team member roles (Owner, Lead, Member)
- User preferences and notifications settings
- Activity tracking and audit logs

### Collaboration Features
- Real-time task updates via WebSocket
- Comments on tasks with @mentions
- Reaction support (emoji) on comments
- File attachments for tasks and comments
- Edit history for tasks and comments
- Collaborative editing indicators

### Reporting & Analytics
- Project statistics and metrics
- Task completion rates
- Team performance tracking
- Activity logs and timelines
- Burndown charts
- Resource utilization reports
- Custom dashboards

### Time & Priority Management
- Deadline tracking with warnings
- Priority-based sorting and filtering
- Time estimation and tracking
- Workload balancing across team
- Critical path analysis
- Sprint planning support

## Technology Stack

**Backend:**
- Node.js with Express.js
- MongoDB for data persistence
- Socket.io for real-time WebSocket communication
- JWT for authentication
- Bcrypt for password hashing
- Nodemailer for email notifications

**Frontend:**
- HTML5, CSS3, JavaScript ES6+
- Socket.io client for real-time updates
- Responsive design (Mobile, Tablet, Desktop)
- Kanban board interface

## Installation & Setup

1. **Clone the repository:**
```bash
cd task-manager
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
```bash
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, and SMTP credentials
```

4. **Start the server:**
```bash
npm start
# For development with auto-reload:
npm run dev
```

5. **Access the application:**
Open your browser and navigate to `http://localhost:5002`

## Database Models

### User
- Username, email, password
- Name and profile information
- Role and permissions
- Team memberships
- Project assignments
- Activity log
- Notification preferences

### Project
- Project code and name
- Owner and team members with roles
- Status and visibility settings
- Start and end dates
- Category and budget
- Task and completion metrics
- Member list with permissions

### Task
- Task ID and title
- Project assignment
- Creator and assignees
- Status and priority
- Due date and estimated hours
- Description and attachments
- Dependencies and subtasks
- Comments and activity log
- Custom fields support

### Comment
- Task reference
- Author information
- Comment content with @mentions
- Reactions (emoji responses)
- Edit history
- Attached files
- Timestamps

### Team
- Team name and description
- Owner and members
- Associated projects
- Permissions and visibility
- Color and icon customization
- Status (Active, Inactive, Archived)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify JWT token
- `GET /api/auth/me` - Get current user info

### Tasks
- `GET /api/tasks` - Get all tasks (with filters)
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `PATCH /api/tasks/:id/status` - Change task status
- `PATCH /api/tasks/:id/assign` - Assign task to users
- `PATCH /api/tasks/:id/complete` - Mark task complete
- `DELETE /api/tasks/:id` - Delete task

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `POST /api/projects/:id/members` - Add team member
- `GET /api/projects/:id/tasks` - Get project tasks
- `GET /api/projects/:id/stats` - Get project statistics

### Comments
- `GET /api/comments/task/:taskId` - Get task comments
- `POST /api/comments` - Create comment
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment
- `POST /api/comments/:id/reaction` - Add reaction/emoji

### Teams
- `GET /api/teams` - Get all teams
- `POST /api/teams` - Create new team
- `GET /api/teams/:id` - Get team details
- `POST /api/teams/:id/members` - Add team member
- `DELETE /api/teams/:id/members/:userId` - Remove member
- `POST /api/teams/:id/projects` - Add project to team

## Key Functionalities

### For Team Members
1. **Task Management**
   - View assigned tasks
   - Update task status
   - Log time spent
   - Add comments
   - Upload attachments

2. **Collaboration**
   - Real-time updates
   - @mention team members
   - React to comments
   - View activity history
   - Edit own comments

3. **Progress Tracking**
   - View personal workload
   - Track deadline compliance
   - Monitor task status
   - See project progress

### For Project Managers
1. **Project Planning**
   - Create and organize projects
   - Set up team structure
   - Define phases and milestones
   - Allocate resources
   - Set budgets and timelines

2. **Task Assignment**
   - Assign tasks to team members
   - Set priorities and deadlines
   - Define dependencies
   - Track allocation

3. **Monitoring & Reporting**
   - Track project progress
   - Monitor team performance
   - Generate reports
   - Identify bottlenecks
   - Manage risks

### For Administrators
1. **System Management**
   - User account management
   - Team administration
   - Access control
   - Backup and recovery
   - System settings

2. **Analytics**
   - Company-wide metrics
   - Team performance
   - Resource utilization
   - Trends and forecasting

## WebSocket Events

**Client to Server:**
- `task_created` - New task created
- `task_updated` - Task modified
- `task_status_changed` - Status update
- `task_assigned` - Task reassigned
- `task_commented` - Comment added
- `task_completed` - Task marked done
- `join_project` - User enters project
- `leave_project` - User leaves project
- `user_typing` - User typing indicator

**Server to Client:**
- `task_update` - Task event broadcast
- `comment_update` - Comment event broadcast
- `user_joined` - User joined project
- `user_activity` - User activity broadcast

## Real-Time Collaboration

- Instant task updates across all team members
- Live comment notifications
- Real-time status changes
- Typing indicators
- Activity feed
- Presence awareness

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- Email verification
- Secure session management
- Rate limiting on API endpoints
- Data encryption

## Performance Optimization

- Efficient database indexing
- Connection pooling
- Caching strategies
- Pagination for large datasets
- Lazy loading
- WebSocket optimization

## Responsive Design

- Mobile-friendly interface
- Tablet optimization
- Desktop full features
- Touch-friendly controls
- Adaptive layouts

## Notifications

- Task assignment notifications
- Deadline reminders
- Comment mentions
- Status change alerts
- Email notifications
- In-app notifications

## Future Enhancements

- Time tracking integration
- Resource planning
- Budget management
- Risk management
- Agile/Scrum support
- Gantt chart views
- Calendar integration
- Third-party integrations (Slack, Teams, etc.)
- Mobile applications
- Advanced reporting
- Workflow automation
- Custom workflows
- API webhooks

## Contributing

This is a demonstration project. Feel free to modify and extend as needed.

## License

MIT License
