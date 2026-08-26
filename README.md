# 🌤️ Weather Dashboard

A modern, responsive weather dashboard application that fetches real-time weather data from the OpenWeatherMap API. Get current weather conditions, detailed metrics, and a 5-day forecast with beautiful weather icons and intuitive UI.

## Features

✨ **Current Weather Display**
- Real-time temperature and "feels like" temperature
- Weather condition with descriptive icons
- Location coordinates display
- Automatic geolocation detection on startup

📊 **Current Conditions Details**
- **Humidity**: Current moisture levels
- **Wind Speed**: In km/h
- **Feels Like**: Temperature adjusted for wind chill
- **Visibility**: Horizontal visibility in km
- **Pressure**: Atmospheric pressure in hPa
- **Cloud Cover**: Percentage of cloud coverage

📅 **5-Day Forecast**
- Daily high/low temperatures
- Weather condition and icon
- Humidity percentage
- Wind speed
- Rainfall prediction

🔍 **Smart City Search**
- Autocomplete suggestions as you type
- Search across 195 countries
- Click suggestions to instantly load weather
- Geolocation-based weather on startup

🎨 **Modern UI/UX**
- Beautiful gradient background
- Responsive design (mobile, tablet, desktop)
- Smooth animations and hover effects
- Glass-morphism effect on cards
- Weather emoji icons for quick visual reference

## Getting Started

### 1. Get Your API Key

1. Visit [OpenWeatherMap API](https://openweathermap.org/api)
2. Sign up for a **free account**
3. Go to the **API keys** section in your account dashboard
4. Copy your API key

### 2. Run the Application

#### Option A: Using Python (Recommended)
```bash
cd /path/to/weather-dashboard
python3 -m http.server 8000
```

Then open your browser and navigate to:
```
http://localhost:8000
```

#### Option B: Using Node.js http-server
```bash
npm install -g http-server
cd /path/to/weather-dashboard
http-server
```

#### Option C: Using Live Server (VS Code Extension)
- Install the "Live Server" extension
- Right-click on `index.html`
- Select "Open with Live Server"

### 3. Enter Your API Key

On first load, the application will prompt you to enter your OpenWeatherMap API key. Enter the key you obtained in step 1.

**Note**: Your API key is stored in browser localStorage and never sent to any server except OpenWeatherMap.

## File Structure

```
weather-dashboard/
├── index.html          # Main HTML structure
├── styles.css          # All styling and responsive design
├── app.js              # JavaScript logic and API integration
└── README.md           # This file
```

## How to Use

### Search for a City
1. Type a city name in the search bar
2. Select from the autocomplete suggestions
3. Or click "Search" to find the city
4. Weather data loads instantly

### View Details
- **Current Weather**: Large temperature display with weather icon
- **Weather Details**: Scroll or swipe to see humidity, wind, pressure, etc.
- **Forecast**: Swipe horizontally or scroll to view 5-day predictions

### On First Load
- If geolocation is enabled, weather for your current location is shown
- If geolocation is disabled, London's weather is shown by default
- Click on any forecast day to see more details

## API Information

### Free Tier Limits
- **Calls per minute**: 60
- **Data refresh**: Updated every 10 minutes
- **Forecast**: 5-day ahead forecast (3-hour intervals)
- **Locations**: All locations worldwide

### API Endpoints Used
1. **Geocoding API**: Convert city names to coordinates
   - `/geo/1.0/direct` - Get coordinates from city name

2. **Weather API**: Get weather data
   - `/data/2.5/forecast` - Get 5-day forecast with hourly data

## Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### "Invalid API key" error
- Ensure you copied the API key correctly from OpenWeatherMap
- Check that your account is active
- Wait a few minutes if you just created the account (activation delay)

### "City not found" error
- Check spelling of the city name
- Try using a larger city nearby
- Include country code if needed (e.g., "London, UK")

### Geolocation not working
- Check browser permissions for location access
- The app falls back to London if geolocation is denied
- Allow access when your browser asks for location permission

### API rate limit exceeded
- Free tier allows 60 calls/minute
- Wait a few seconds before searching again
- Consider upgrading to a paid tier for higher limits

## Weather Icons Guide

- ☀️ Clear sky day
- 🌙 Clear sky night
- ⛅ Few clouds
- ☁️ Overcast clouds
- 🌧️ Rainy
- ⛈️ Thunderstorm
- ❄️ Snow
- 🌫️ Mist/Fog

## Customization

### Change Default City
Edit `app.js` line ~33:
```javascript
fetchWeatherByCity('Tokyo'); // Change 'London' to your preferred city
```

### Change Temperature Units
Edit `app.js` line ~120, change `units=metric` to:
- `units=metric` for Celsius (default)
- `units=imperial` for Fahrenheit
- Update conversion factors accordingly

### Modify Gradient Colors
Edit `styles.css` line ~13:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

## Performance Tips

- Forecasts are cached in memory for the current session
- API calls are minimized by batching data
- UI updates are optimized with CSS animations instead of JavaScript
- Mobile-optimized with responsive grid layouts

## Security

- 🔒 API key stored locally in browser (localStorage)
- 🔒 No backend server - all requests go directly to OpenWeatherMap
- 🔒 No personal data is collected or transmitted
- 🔒 HTTPS used for all API calls

## Future Enhancements

Possible features to add:
- [ ] Hourly forecast details
- [ ] Air quality index (AQI)
- [ ] UV index information
- [ ] Historical weather data
- [ ] Weather alerts
- [ ] Multiple city comparison
- [ ] Favorite cities list
- [ ] Dark mode toggle
- [ ] Unit conversion (°C / °F)
- [ ] Share weather data feature

---

## CI / CD

This project uses a **GitHub Actions CI pipeline** that runs on every push and on every pull request targeting `main`.

### Pipeline stages (each must pass before the next starts)

| # | Job | Tool | What it checks |
|---|-----|------|----------------|
| 1 | **Lint** | ESLint | Code style, unused variables, `==` vs `===`, `var` usage |
| 2 | **Type Check** | TypeScript `tsc --noEmit --checkJs` | Type correctness via JSDoc annotations |
| 3 | **Unit Tests** | Jest + jsdom | Business logic + DOM integration, with coverage threshold |
| 4 | **Build** | esbuild | Produces minified production bundle in `dist/` |

### Running CI locally

```bash
npm install
npm run lint        # step 1
npm run typecheck   # step 2
npm run test        # step 3
npm run build       # step 4

# or all at once:
npm run ci
```

### Blocking merges to `main` (branch protection)

To prevent any PR from merging if CI fails, configure branch protection rules:

1. Go to **Settings → Branches** in your GitHub repository.
2. Click **Add branch protection rule**.
3. Set **Branch name pattern** to `main`.
4. Enable the following options:

   | Option | Purpose |
   |--------|---------|
   | ✅ **Require a pull request before merging** | No direct pushes to `main` |
   | ✅ **Require status checks to pass before merging** | CI must be green |
   | ✅ **Require branches to be up to date before merging** | Prevents stale PRs |
   | ✅ **Do not allow bypassing the above settings** | Applies to admins too |

5. Under **Status checks that are required**, search for and add:
   - `Lint`
   - `Type Check`
   - `Unit Tests`
   - `Build`
   - `CI Passed` *(the summary job — add this as a single gate if preferred)*

6. Click **Save changes**.

> **Note:** Status check names appear in the dropdown only after the workflow has run at least once.

---

## License

This project is open source and available for personal and commercial use.

## Credits

- Weather data provided by [OpenWeatherMap](https://openweathermap.org/)
- Icons: Weather emojis from system font
- Built with vanilla JavaScript, HTML5, and CSS3

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Visit [OpenWeatherMap FAQ](https://openweathermap.org/faq)
3. Review your API key settings at [openweathermap.org](https://openweathermap.org)

---

**Happy weather tracking! 🌦️**
