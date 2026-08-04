# 📊 Poll Creator — Real-Time Polling Application

A modern, real-time poll creator with WebSocket support for live result updates, sharing capabilities, and beautiful responsive UI.

## ✨ Features

- **Create Polls**: Ask questions with multiple options (minimum 2)
- **Real-Time Voting**: Cast votes and see results update instantly across all connected clients
- **Live Result Bars**: Visual progress bars showing vote percentages and counts
- **Share Polls**: Generate shareable poll links with one click
- **Vote Tracking**: Prevent duplicate voting on the same poll per user
- **Dark/Light Mode**: Theme toggle with localStorage persistence
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **WebSocket Communication**: Instant updates without page refresh
- **Accessible UI**: ARIA labels and semantic HTML for accessibility

## 🚀 Quick Start

### Installation

```bash
cd blog/
npm install
```

### Start the Server

```bash
npm start
# Server runs on port 8080
```

### Access the Application

Open your browser and navigate to:
```
http://localhost:8080/poll.html
```

## 📖 How to Use

### Creating a Poll

1. **Enter Your Question**: Type your poll question in the "Question" field
2. **Add Options**: Fill in at least 2 options (more options available by clicking "+ Add Option")
3. **Create**: Click "Create Poll" to publish your poll
4. **Share**: Copy the poll link or use the share button to send it to others

### Voting on a Poll

1. **Select Option**: Click on the radio button next to your choice
2. **Vote**: Your vote is recorded instantly
3. **View Results**: See live update with percentage and vote count
4. **Note**: You can only vote once per poll per session

### Sharing Polls

- Click the **🔗 Share** button on any poll
- On mobile: Uses native share sheet if available
- On desktop: Poll link is copied to clipboard
- Share the link with others to collect votes

## 🏗️ Architecture

### Backend (Node.js)

```
poll-server.js
├── HTTP Server (port 8080)
│   ├── GET /api/polls — Get all polls
│   ├── GET /api/polls/:id — Get specific poll
│   └── POST /api/polls — Create new poll
├── WebSocket Server
│   ├── initial_load — Send all current polls to new clients
│   ├── vote — Accept votes and broadcast updates
│   ├── new_poll — Broadcast new poll creation
│   └── vote_cast — Broadcast vote results to all clients
└── In-Memory Store
    ├── polls Map — Poll data and options
    └── votes Map — Track user votes
```

### Frontend (HTML/CSS/JavaScript)

```
poll.html
├── Poll Creation Form
│   ├── Dynamic option inputs
│   ├── Form validation
│   └── Submit to API
├── Real-Time Updates
│   ├── WebSocket connection
│   ├── Live result rendering
│   └── Vote submission
├── Responsive UI
│   ├── Mobile-first design
│   ├── Sidebar layout
│   └── Dark mode support
└── Share Functionality
    ├── Native share (mobile)
    └── Clipboard copy (desktop)
```

## 🔌 API Reference

### Create Poll

**POST** `/api/polls`

Request:
```json
{
  "question": "What is your favorite color?",
  "options": ["Red", "Blue", "Green"],
  "userId": "user_123"
}
```

Response:
```json
{
  "id": "abc123xyz",
  "shareUrl": "localhost:8080/polls/abc123xyz"
}
```

### Get All Polls

**GET** `/api/polls`

Response:
```json
[
  {
    "id": "abc123xyz",
    "question": "What is your favorite color?",
    "options": [
      { "text": "Red", "votes": 5 },
      { "text": "Blue", "votes": 3 }
    ],
    "totalVotes": 8,
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
]
```

### Get Specific Poll

**GET** `/api/polls/:id`

Response: Same structure as individual poll object above

## 🔌 WebSocket Events

### Client → Server

**Vote Message**
```json
{
  "type": "vote",
  "pollId": "abc123xyz",
  "optionId": "opt_456"
}
```

### Server → Client

**Initial Load**
```json
{
  "type": "initial_load",
  "polls": [/* array of polls */]
}
```

**New Poll**
```json
{
  "type": "new_poll",
  "id": "abc123xyz",
  "question": "...",
  "options": [...],
  "createdAt": "..."
}
```

**Vote Cast**
```json
{
  "type": "vote_cast",
  "pollId": "abc123xyz",
  "optionId": "opt_456",
  "totalVotes": 10,
  "polls": [/* updated polls */]
}
```

## 📝 Files

- **poll-server.js** — WebSocket and HTTP server
- **poll.html** — Frontend interface (HTML, CSS, JavaScript)
- **package.json** — Dependencies (ws for WebSocket)
- **poll-test.js** — Test suite for functionality verification
- **POLL_README.md** — This file

## 🎨 Customization

### Change Server Port

Edit `poll-server.js`:
```javascript
const PORT = process.env.PORT || 8080; // Change 8080 to desired port
```

Or set environment variable:
```bash
PORT=3000 npm start
```

### Customize Colors

Edit `poll.html` CSS variables:
```css
:root {
  --primary: #7c3aed;        /* Main color */
  --primary-dark: #6d28d9;   /* Hover color */
  --accent: #ec4899;         /* Accent color */
  --success: #10b981;        /* Success color */
}
```

### Styling Options

Modify the `<style>` section in `poll.html` to customize:
- Font families
- Spacing (padding, margins)
- Border radius
- Shadow effects
- Animation speeds

## 🧪 Testing

Run the included test suite:

```bash
node poll-test.js
```

Tests verify:
- ✅ Poll creation via HTTP
- ✅ WebSocket connection and messaging
- ✅ Vote casting and result updates
- ✅ Poll retrieval

## 🔐 Security Notes

- ✅ No authentication required (simple voting)
- ⚠️ Vote tracking is session-based (uses clientId)
- ⚠️ For production, add:
  - User authentication
  - Input sanitization
  - Rate limiting
  - Database persistence
  - HTTPS/WSS encryption

## 🚀 Production Deployment

For production use:

1. **Use a Database** — Replace in-memory Map with MongoDB, PostgreSQL, etc.
2. **Enable Authentication** — Add user login and session management
3. **Use HTTPS** — Deploy on HTTPS with WSS (secure WebSocket)
4. **Rate Limiting** — Prevent spam voting
5. **Input Validation** — Sanitize poll questions and options
6. **Error Handling** — Add comprehensive error logging
7. **Deployment** — Use PM2, Docker, or cloud platforms (Heroku, Vercel, etc.)

## 📦 Dependencies

- **ws** (^8.14.2) — WebSocket server library

## 📄 License

MIT - Use freely in your projects

## 🤝 Contributing

Feel free to fork, modify, and enhance the poll creator!

---

**Built with ❤️ for real-time polling**
