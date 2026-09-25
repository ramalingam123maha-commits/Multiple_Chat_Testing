// Configuration
let API_KEY = localStorage.getItem('weatherApiKey') || '';
const BASE_URL = 'https://api.openweathermap.org';

// DOM Elements
const apiKeyModal = document.getElementById('apiKeyModal');
const apiKeyInput = document.getElementById('apiKeyInput');
const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const logoutBtn = document.getElementById('logoutBtn');
const suggestionsDiv = document.getElementById('suggestions');
const weatherCard = document.getElementById('weatherCard');
const forecastContainer = document.getElementById('forecastContainer');
const errorMessage = document.getElementById('errorMessage');

// Weather icons mapping
const weatherIcons = {
    '01d': '☀️',
    '01n': '🌙',
    '02d': '⛅',
    '02n': '☁️',
    '03d': '☁️',
    '03n': '☁️',
    '04d': '☁️',
    '04n': '☁️',
    '09d': '🌧️',
    '09n': '🌧️',
    '10d': '🌧️',
    '10n': '🌧️',
    '11d': '⛈️',
    '11n': '⛈️',
    '13d': '❄️',
    '13n': '❄️',
    '50d': '🌫️',
    '50n': '🌫️'
};

// Debounce timer for search suggestions
let debounceTimer;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Check if API key exists
    if (!API_KEY) {
        apiKeyModal.style.display = 'flex';
    } else {
        apiKeyModal.style.display = 'none';
        initializeWeather();
    }

    // API Key Modal Event Listener
    saveApiKeyBtn.addEventListener('click', () => {
        const key = apiKeyInput.value.trim();
        if (key) {
            API_KEY = key;
            localStorage.setItem('weatherApiKey', API_KEY);
            apiKeyModal.style.display = 'none';
            initializeWeather();
        } else {
            showError('Please enter a valid API key');
        }
    });

    // Allow Enter key to save API key
    apiKeyInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            saveApiKeyBtn.click();
        }
    });

    // Event listeners for search
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', event => {
        if (event.key === 'Enter') handleSearch();
    });
    searchInput.addEventListener('input', handleSearchInput);

    // Logout functionality
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('weatherApiKey');
            window.location.href = 'logout.html';
        });
    }
});

// Initialize weather display
function initializeWeather() {
    // Get weather for default city or current location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                fetchWeatherByCoordinates(latitude, longitude);
            },
            error => {
                console.log('Geolocation error:', error);
                fetchWeatherByCity('London');
            }
        );
    } else {
        fetchWeatherByCity('London');
    }
}

// Handle search input - show suggestions
async function handleSearchInput(event) {
    const query = event.target.value.trim();

    clearTimeout(debounceTimer);
    suggestionsDiv.innerHTML = '';

    if (query.length < 2) return;

    debounceTimer = setTimeout(async () => {
        if (!API_KEY) {
            showError('Please enter a valid API key');
            return;
        }

        try {
            const response = await fetch(
                `${BASE_URL}/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}`
            );

            if (!response.ok) {
                if (response.status === 401) {
                    showError('Invalid API key. Please check your key and reload.');
                    localStorage.removeItem('weatherApiKey');
                }
                return;
            }

            const cities = await response.json();

            if (cities.length === 0) {
                suggestionsDiv.innerHTML = '<div class="suggestion-item">No cities found</div>';
                return;
            }

            cities.forEach(city => {
                const suggestion = document.createElement('div');
                suggestion.className = 'suggestion-item';
                suggestion.innerHTML = `${city.name}${city.state ? ', ' + city.state : ''}, ${city.country}`;
                suggestion.addEventListener('click', () => {
                    searchInput.value = city.name;
                    suggestionsDiv.innerHTML = '';
                    fetchWeatherByCoordinates(city.lat, city.lon, city.name);
                });
                suggestionsDiv.appendChild(suggestion);
            });
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            showError('Error fetching city suggestions');
        }
    }, 300);
}

// Handle search button click
function handleSearch() {
    const query = searchInput.value.trim();
    if (query) {
        suggestionsDiv.innerHTML = '';
        fetchWeatherByCity(query);
    }
}

// Fetch weather by city name
async function fetchWeatherByCity(cityName) {
    if (!API_KEY) {
        showError('Please enter a valid API key');
        return;
    }

    try {
        showError('');
        weatherCard.innerHTML = '<div class="loading">Loading weather data...</div>';
        
        // Get coordinates from city name
        const geoResponse = await fetch(
            `${BASE_URL}/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${API_KEY}`
        );

        if (!geoResponse.ok) {
            if (geoResponse.status === 401) {
                showError('Invalid API key. Please reload and enter a valid key.');
                localStorage.removeItem('weatherApiKey');
            }
            throw new Error('City not found');
        }

        const cities = await geoResponse.json();
        if (cities.length === 0) {
            showError('City not found. Please try again.');
            weatherCard.innerHTML = '';
            return;
        }

        const { lat, lon, name, state, country } = cities[0];
        await fetchWeatherByCoordinates(lat, lon, name);
    } catch (error) {
        console.error('Error:', error);
        showError('Error fetching weather data. Please check the city name.');
        weatherCard.innerHTML = '';
    }
}

// Fetch weather by coordinates
async function fetchWeatherByCoordinates(lat, lon, cityName = '') {
    if (!API_KEY) {
        showError('Please enter a valid API key');
        return;
    }

    try {
        showError('');
        weatherCard.innerHTML = '<div class="loading">Loading weather data...</div>';

        const response = await fetch(
            `${BASE_URL}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );

        if (!response.ok) {
            if (response.status === 401) {
                showError('Invalid API key. Please reload and enter a valid key.');
                localStorage.removeItem('weatherApiKey');
            }
            throw new Error('Failed to fetch weather');
        }

        const data = await response.json();
        displayCurrentWeather(data, cityName);
        displayForecast(data);
    } catch (error) {
        console.error('Error:', error);
        showError('Error fetching weather data. Please try again.');
        weatherCard.innerHTML = '';
    }
}

// Display current weather
function displayCurrentWeather(data, cityName) {
    const current = data.list[0];
    const { main, weather, wind, clouds, visibility } = current;
    const city = data.city.name;
    const { lat, lon } = data.city.coord;

    const weatherIcon = weatherIcons[weather[0].icon] || '🌡️';
    const feelsLike = Math.round(main.feels_like);
    const temp = Math.round(main.temp);
    const description = weather[0].main;

    weatherCard.innerHTML = `
        <div class="weather-header">
            <h2>${cityName || city}</h2>
            <p class="coordinates">Lat: ${lat.toFixed(2)}° | Lon: ${lon.toFixed(2)}°</p>
        </div>
        
        <div class="weather-main">
            <div class="weather-icon">${weatherIcon}</div>
            <div class="weather-temp">
                <div class="temperature">${temp}°C</div>
                <div class="description">${description}</div>
            </div>
        </div>

        <div class="weather-details">
            <div class="detail-item">
                <span class="detail-label">Feels Like</span>
                <span class="detail-value">${feelsLike}°C</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Humidity</span>
                <span class="detail-value">${main.humidity}%</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Wind Speed</span>
                <span class="detail-value">${wind.speed.toFixed(1)} km/h</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Pressure</span>
                <span class="detail-value">${main.pressure} hPa</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Visibility</span>
                <span class="detail-value">${(visibility / 1000).toFixed(1)} km</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Cloud Cover</span>
                <span class="detail-value">${clouds.all}%</span>
            </div>
        </div>
    `;
}

// Display 5-day forecast
function displayForecast(data) {
    const forecastData = {};

    // Group forecast data by day
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dayKey = date.toLocaleDateString();

        if (!forecastData[dayKey]) {
            forecastData[dayKey] = {
                temps: [],
                humidity: [],
                wind: [],
                weather: null,
                icon: null
            };
        }

        forecastData[dayKey].temps.push(item.main.temp);
        forecastData[dayKey].humidity.push(item.main.humidity);
        forecastData[dayKey].wind.push(item.wind.speed);
        
        if (!forecastData[dayKey].weather) {
            forecastData[dayKey].weather = item.weather[0].main;
            forecastData[dayKey].icon = item.weather[0].icon;
        }
    });

    // Display first 5 days
    forecastContainer.innerHTML = '';
    const days = Object.keys(forecastData).slice(0, 5);

    days.forEach((dayKey, index) => {
        if (index === 0) return; // Skip today

        const day = forecastData[dayKey];
        const avgTemp = Math.round(day.temps.reduce((a, b) => a + b) / day.temps.length);
        const minTemp = Math.round(Math.min(...day.temps));
        const maxTemp = Math.round(Math.max(...day.temps));
        const avgHumidity = Math.round(day.humidity.reduce((a, b) => a + b) / day.humidity.length);
        const avgWind = (day.wind.reduce((a, b) => a + b) / day.wind.length).toFixed(1);
        const icon = weatherIcons[day.icon] || '🌡️';

        const date = new Date(dayKey);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        const forecastCard = document.createElement('div');
        forecastCard.className = 'forecast-card';
        forecastCard.innerHTML = `
            <div class="forecast-date">
                <div class="day-name">${dayName}</div>
                <div class="date-str">${dateStr}</div>
            </div>
            <div class="forecast-icon">${icon}</div>
            <div class="forecast-desc">${day.weather}</div>
            <div class="forecast-temps">
                <span class="temp-max">${maxTemp}°</span>
                <span class="temp-min">${minTemp}°</span>
            </div>
            <div class="forecast-details">
                <div><small>💧 ${avgHumidity}%</small></div>
                <div><small>💨 ${avgWind} km/h</small></div>
            </div>
        `;
        forecastContainer.appendChild(forecastCard);
    });
}

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = message ? 'block' : 'none';
}
