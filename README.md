# 🎬 MovieHub - Movie Search App

A modern, responsive movie search application built with vanilla JavaScript and the OMDB API. Search for movies, manage your favorites, and explore detailed movie information in an elegant dark-themed interface.

## 🌟 Features

### Core Features
- **🔍 Advanced Movie Search** - Search movies by title with real-time results
- **📄 Pagination** - Navigate through search results with next/previous buttons
- **🎯 Filtering** - Filter movies by type (Movie/Series) and release year
- **⭐ Favorites Management** - Save your favorite movies and manage them in a dedicated sidebar
- **📋 Detailed Movie Modal** - Click any movie to view comprehensive details including:
  - Full plot description
  - Director, cast, and writers
  - IMDb ratings and votes
  - Awards information
  - Language and runtime details
  - Beautiful poster images

### Design & UX
- **🌙 Dark Theme UI** - Modern dark gradient background with vibrant accents
- **📱 Fully Responsive** - Works perfectly on desktop, tablet, and mobile devices
- **⚡ Smooth Animations** - Polished transitions and hover effects
- **♿ Accessible** - Semantic HTML and keyboard navigation support
- **🔒 XSS Protection** - HTML escaping to prevent security vulnerabilities

### Data Persistence
- **💾 Local Storage** - API key, favorites list, and preferences are saved locally
- **🔐 Secure Storage** - API key never leaves your browser or device

## 🚀 Getting Started

### Prerequisites
- A free OMDB API key from [https://www.omdbapi.com/apikey.aspx](https://www.omdbapi.com/apikey.aspx)
- A modern web browser

### Setup Instructions

1. **Get Your API Key**
   - Visit [https://www.omdbapi.com/apikey.aspx](https://www.omdbapi.com/apikey.aspx)
   - Sign up for a free account
   - Copy your API key from the dashboard

2. **Run the App**
   - Open `index.html` in your web browser
   - The app will prompt you to enter your OMDB API key
   - Paste your API key and click "Save API Key"

3. **Start Searching**
   - Enter a movie title in the search bar
   - Press Enter or click the Search button
   - Browse results and click any movie to see details
   - Add movies to your favorites list

## 📖 How to Use

### Searching for Movies
1. Type a movie title in the search bar (e.g., "Inception", "The Matrix")
2. Use the filter dropdowns to narrow by type or year
3. Press Enter or click "Search"
4. Browse the movie cards with posters and ratings

### Managing Favorites
- **Add to Favorites**: Click the heart icon (🤍/❤️) on any movie card
- **View Favorites**: See all favorites in the left sidebar
- **Remove Favorite**: Click the × button next to a favorite, or click the heart again
- **Quick Search**: Click any favorite in the sidebar to search for it
- **Clear All**: Use the "Clear All" button to remove all favorites at once

### Viewing Movie Details
1. Click any movie card to open the detail modal
2. View comprehensive information including:
   - High-quality poster image
   - IMDb rating with star visualization
   - Release year, runtime, and genre
   - Full plot description
   - Director, cast, and writers
   - Awards information
   - IMDb vote count and language
3. Add/remove from favorites directly from the modal
4. Close the modal by clicking the × button or clicking outside

## 🛠️ Technology Stack

- **HTML5** - Semantic markup structure
- **CSS3** - Modern styling with CSS Grid, Flexbox, and animations
- **Vanilla JavaScript** - No frameworks, pure ES6+ code
- **OMDB API** - Movie data and information
- **LocalStorage API** - Client-side data persistence

## 📁 Project Structure

```
├── index.html          # Main HTML file with semantic structure
├── styles.css          # Complete CSS with responsive design
├── app.js              # JavaScript application logic
└── README.md           # This file
```

## 🎨 Design Highlights

- **Color Scheme**
  - Primary: #FF6B6B (Coral Red)
  - Secondary: #4ECDC4 (Teal)
  - Accent: #FFD93D (Golden Yellow)
  - Dark Background: #1A1A2E & #16213E

- **Responsive Breakpoints**
  - Desktop: Full layout with sidebar
  - Tablet (1024px): Adjusted grid
  - Mobile (768px): Single column layout
  - Small Phone (480px): Optimized for small screens

## 🔒 Security Features

- **XSS Prevention** - All user input and API data is HTML-escaped
- **Secure Storage** - API key stored in browser localStorage only
- **No Backend Required** - Direct API calls from browser (safe for public keys)
- **Error Handling** - Graceful error messages for failed requests

## 📊 API Integration

The app uses the free tier of OMDB API with the following endpoints:

- **Search**: `/` - Search for movies by title
  - Parameters: `s` (search query), `type` (optional), `y` (year, optional), `page`
  
- **Details**: `/` - Get full movie information
  - Parameters: `i` (IMDb ID), `plot=full`

Free tier limitations:
- 1,000 API calls per day
- No movie images for free keys (older API limitation)
- Results limited to 10 movies per page

## 🎯 Features in Detail

### Movie Cards
- Responsive grid layout (auto-fills based on screen size)
- Movie poster with fallback emoji
- Title with truncation on overflow
- Release year and IMDb rating
- Movie type badge (Movie/Series)
- Favorite heart button with animation

### Favorites Sidebar
- Sticky positioning on desktop
- Scrollable list of saved favorites
- Quick search by clicking favorites
- Individual remove buttons
- Clear all functionality
- Empty state message

### Search & Filters
- Real-time input handling
- Type filter (All/Movie/Series)
- Year filter (Any/2024/2023/2022/2021/2020)
- Separate control for each filter
- Clear feedback on empty states

### Pagination
- Previous/Next navigation buttons
- Current page indicator
- Disabled buttons on boundaries
- Smooth page transitions
- Auto-scroll to top

### Detail Modal
- Large readable layout
- Poster image or emoji placeholder
- IMDb star rating visualization
- Metadata in organized grid
- Full plot description
- Additional info sections
- Add to favorites button with state
- Close button and backdrop click to dismiss

## 🌐 Browser Compatibility

- Chrome/Edge (90+)
- Firefox (88+)
- Safari (14+)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📝 License

This project is open source and available under the MIT License.

## 🙋 Support

For issues or questions:
1. Check your OMDB API key is valid
2. Verify you haven't exceeded the daily API limit
3. Clear browser cache if experiencing issues
4. Check browser console (F12) for error messages

## 🎓 Learning Resources

- [OMDB API Documentation](http://www.omdbapi.com/)
- [MDN Web Docs - Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [MDN Web Docs - LocalStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [CSS Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)

---

**Enjoy discovering and managing your favorite movies! 🍿🎬**
