# Book Tracker 📚

A full-stack book tracking application that helps users manage their reading collection, track reading progress, and view statistics about their reading habits.

## Features

### 📖 Book Management
- **Add Books**: Create new book entries with title, author, and optional cover image
- **Status Tracking**: Mark books as "To Read", "Reading", or "Finished"
- **Star Ratings**: Rate books with a 5-star system
- **Image Upload**: Upload and display book cover images

### 📊 Reading Statistics
- **Total Books**: See how many books you have in your library
- **Status Breakdown**: View the count of books in each status
- **Average Rating**: Track your average rating across all books
- **Monthly Chart**: Visualize books finished per month for the last 12 months
- **Reading History**: Track when books were added, started, and finished

### 🎨 User Interface
- Modern, responsive design with gradient backgrounds
- Interactive star rating system
- Visual status indicators with color-coded badges
- Chart visualization for monthly reading data
- Mobile-friendly layout

## Tech Stack

### Backend
- **Node.js** with Express.js
- **SQLite3** for data persistence
- **Multer** for image upload handling
- **CORS** for cross-origin requests

### Frontend
- Vanilla JavaScript (no framework dependencies for simplicity)
- CSS3 with responsive grid layout
- Fetch API for backend communication

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. **Install Dependencies**
   ```bash
   npm install -f package-book-tracker.json
   ```

2. **Create Upload Directory**
   ```bash
   mkdir -p public/uploads
   ```

3. **Start the Server**
   ```bash
   npm start
   ```
   The server will run on `http://localhost:3001`

4. **Access the Application**
   Open your browser and navigate to:
   ```
   http://localhost:3001/book-tracker.html
   ```

## API Endpoints

### Books
- `GET /api/books` - Get all books
- `POST /api/books` - Add a new book (multipart form-data with optional image)
- `PUT /api/books/:id/status` - Update book status
- `PUT /api/books/:id/rating` - Update book rating
- `DELETE /api/books/:id` - Delete a book

### Statistics
- `GET /api/stats` - Get reading statistics (total, by status, per month, avg rating)

## Database Schema

### Books Table
```sql
CREATE TABLE books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  coverImage TEXT,
  status TEXT DEFAULT 'To Read',
  rating INTEGER,
  dateAdded DATETIME DEFAULT CURRENT_TIMESTAMP,
  dateStarted DATETIME,
  dateFinished DATETIME
)
```

## Usage

### Adding a Book
1. Enter the book title and author in the form
2. Optionally select a cover image
3. Click "Add Book"

### Managing Reading Status
- Click on "To Read", "Reading", or "Finished" buttons to change the book's status
- Dates are automatically tracked when you change status

### Rating Books
- Click the stars to set a rating (1-5 stars)
- Ratings are updated immediately and reflected in your average rating

### Viewing Statistics
- The dashboard shows total books, average rating, and status breakdown
- The monthly chart displays books finished per month for the last 12 months

### Deleting Books
- Click the "Delete" button on a book card to remove it from your library

## File Structure

```
/
├── book-tracker-server.js      # Express server with API routes
├── public/
│   ├── book-tracker.html       # Main frontend application
│   └── uploads/                # Book cover images storage
├── booktracker.db              # SQLite database (created on first run)
└── package-book-tracker.json   # Dependencies
```

## Features Breakdown

### ✅ Book Addition
- Form validation for required fields
- Support for image uploads
- Automatic timestamp creation

### ✅ Status Management
- Three reading statuses: To Read, Reading, Finished
- Automatic date tracking for start and finish
- Color-coded status badges

### ✅ Rating System
- Interactive 5-star rating system
- Visual feedback on hover
- Persistent rating storage

### ✅ Statistics Dashboard
- Real-time stat calculations
- Monthly reading trends
- Status distribution
- Average rating calculation

## Future Enhancements

- Genre categorization
- Reading goals and progress tracking
- Export reading data (PDF/CSV)
- Book recommendations based on ratings
- User authentication for multi-user support
- Cloud sync and backup
- Mobile app version
