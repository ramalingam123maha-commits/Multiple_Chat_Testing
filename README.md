# 🎬 MovieFlix - Movie Search App

A modern, feature-rich movie search application built with vanilla JavaScript that integrates with the OMDB API.

## Features

✨ **Search Movies** - Real-time movie search powered by OMDB API  
🎯 **Movie Cards** - Display poster, title, year, and rating  
❤️ **Favorites List** - Save your favorite movies with persistent storage  
📋 **Detailed Modal** - Click any movie to see full details including plot, cast, director, and more  
📱 **Responsive Design** - Beautiful UI that works on desktop, tablet, and mobile  
🎨 **Modern Styling** - Netflix-inspired dark theme with smooth animations  

## Setup Instructions

### 1. Get OMDB API Key
- Visit [https://www.omdbapi.com/apikey.aspx](https://www.omdbapi.com/apikey.aspx)
- Sign up for a free account
- Copy your API key

### 2. Configure API Key
Open `app.js` and replace the placeholder with your actual API key:

```javascript
const OMDB_API_KEY = 'YOUR_ACTUAL_API_KEY_HERE';
```

### 3. Run the App
Since this is a vanilla JavaScript app, you can simply:

**Option A: Open directly in browser**
- Open `index.html` in your web browser

**Option B: Use a local server (recommended)**
```bash
# Using Python 3
python -m http.server 8000

# Or using Node.js
npx http-server
```

Then visit `http://localhost:8000` (or the port shown in your terminal)

## How to Use

### Search for Movies
1. Enter a movie title in the search bar
2. Click "Search" or press Enter
3. Browse the movie results

### Save Favorites
- Click the ❤️ heart icon on a movie card to add it to favorites
- View all favorites by clicking the "❤️ Favorites" button in the header
- Favorites are automatically saved in your browser's local storage

### View Movie Details
- Click on any movie card to open a detailed modal
- See the full plot, cast, director, genre, runtime, and IMDB rating
- Add/remove from favorites directly from the modal

## Project Structure

```
├── index.html          # Main HTML structure
├── styles.css          # All styling with CSS Grid & Flexbox
├── app.js              # JavaScript application logic
└── README.md           # This file
```

## Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Flexbox, CSS Grid, Animations, Gradients
- **Vanilla JavaScript** - No frameworks, pure DOM manipulation
- **OMDB API** - Movie database integration
- **LocalStorage API** - Persistent favorites storage

## Features in Detail

### Search Functionality
- Real-time search with error handling
- Displays OMDB error messages
- Loading spinner during API calls
- API key validation

### Movie Cards
- Responsive grid layout (auto-fill columns)
- Movie poster images (or placeholder if unavailable)
- Title, year, and IMDB rating display
- Hover animations and effects
- Quick favorite toggle

### Favorites Management
- Persistent storage using browser's LocalStorage
- Dedicated favorites view
- Real-time favorite count in header
- Favorites sync across movie cards

### Detailed Modal
- Full movie information including:
  - High-res poster image
  - Title, year, runtime
  - IMDB rating (out of 10)
  - Genre, director, cast
  - Full plot summary
- Add/remove from favorites button
- Smooth animations
- Responsive design

### Responsive Design
- Mobile-first approach
- Adapts to all screen sizes
- Touch-friendly buttons and interactions
- Optimized grid layout for small screens

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Notes

- Lazy loading for images
- Efficient DOM updates
- CSS animations for smooth transitions
- Minimal API calls (search + single movie details)

## Troubleshooting

### "API key not configured" error
Make sure you've added your OMDB API key to the `app.js` file.

### Movies not displaying
- Check that your API key is valid
- Ensure you have an active internet connection
- Check the browser console for error messages

### Favorites not persisting
- Make sure LocalStorage is enabled in your browser
- Check browser privacy settings

## Future Enhancement Ideas

- Advanced filtering (genre, year, rating)
- Sorting options (rating, year, alphabetical)
- Movie recommendations
- User reviews and ratings
- Watchlist feature
- Dark/Light theme toggle
- Export favorites list

## License

This project is open source and available for personal and educational use.

## Credits

- OMDB API: [http://www.omdbapi.com/](http://www.omdbapi.com/)
- Icons: Emoji
