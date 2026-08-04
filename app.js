// Configuration
let API_KEY = localStorage.getItem('omdbApiKey') || '';
const OMDB_BASE_URL = 'https://www.omdbapi.com/';

// State Management
const state = {
    searchResults: [],
    currentPage: 1,
    totalResults: 0,
    favorites: JSON.parse(localStorage.getItem('movieFavorites')) || [],
    currentFilters: {
        type: '',
        year: ''
    }
};

// DOM Elements
const apiKeyModal = document.getElementById('apiKeyModal');
const apiKeyInput = document.getElementById('apiKeyInput');
const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const typeFilter = document.getElementById('typeFilter');
const yearFilter = document.getElementById('yearFilter');
const moviesGrid = document.getElementById('moviesGrid');
const errorMessage = document.getElementById('errorMessage');
const loadingSpinner = document.getElementById('loadingSpinner');
const favoritesList = document.getElementById('favoritesList');
const clearFavoritesBtn = document.getElementById('clearFavoritesBtn');
const movieModal = document.getElementById('movieModal');
const movieDetail = document.getElementById('movieDetail');
const closeModalBtn = document.getElementById('closeModalBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageInfo = document.getElementById('pageInfo');
const paginationContainer = document.getElementById('paginationContainer');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    if (!API_KEY) {
        apiKeyModal.classList.add('active');
    } else {
        apiKeyModal.classList.remove('active');
    }

    // Event listeners
    saveApiKeyBtn.addEventListener('click', handleSaveApiKey);
    apiKeyInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSaveApiKey();
    });

    searchBtn.addEventListener('click', () => {
        state.currentPage = 1;
        handleSearch();
    });
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            state.currentPage = 1;
            handleSearch();
        }
    });

    typeFilter.addEventListener('change', () => {
        state.currentPage = 1;
        handleSearch();
    });
    yearFilter.addEventListener('change', () => {
        state.currentPage = 1;
        handleSearch();
    });

    prevBtn.addEventListener('click', () => {
        if (state.currentPage > 1) {
            state.currentPage--;
            handleSearch();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    nextBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(state.totalResults / 10);
        if (state.currentPage < totalPages) {
            state.currentPage++;
            handleSearch();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    clearFavoritesBtn.addEventListener('click', () => {
        if (state.favorites.length > 0 && confirm('Are you sure you want to clear all favorites?')) {
            state.favorites = [];
            saveFavorites();
            renderFavorites();
        }
    });

    closeModalBtn.addEventListener('click', closeModal);
    movieModal.addEventListener('click', (e) => {
        if (e.target === movieModal) closeModal();
    });

    renderFavorites();
});

// Handle save API key
function handleSaveApiKey() {
    const key = apiKeyInput.value.trim();
    if (key) {
        API_KEY = key;
        localStorage.setItem('omdbApiKey', API_KEY);
        apiKeyModal.classList.remove('active');
    } else {
        showError('Please enter a valid API key');
    }
}

// Handle search
async function handleSearch() {
    const query = searchInput.value.trim();
    if (!query) {
        showError('Please enter a movie title to search');
        return;
    }

    state.currentFilters.type = typeFilter.value;
    state.currentFilters.year = yearFilter.value;

    showLoading(true);
    clearError();

    try {
        let url = `${OMDB_BASE_URL}?apikey=${API_KEY}&s=${encodeURIComponent(query)}&type=${state.currentFilters.type}&page=${state.currentPage}`;
        
        if (state.currentFilters.year) {
            url += `&y=${state.currentFilters.year}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (data.Response === 'False') {
            showError(data.Error || 'No movies found');
            moviesGrid.innerHTML = '<p class="empty-state">😔 No results found. Try a different search!</p>';
            state.searchResults = [];
            state.totalResults = 0;
        } else {
            state.searchResults = data.Search || [];
            state.totalResults = parseInt(data.totalResults) || 0;
            renderMovies();
            updatePagination();
        }
    } catch (error) {
        console.error('Search error:', error);
        showError('Error searching for movies. Please check your API key and try again.');
    } finally {
        showLoading(false);
    }
}

// Render movies grid
function renderMovies() {
    if (state.searchResults.length === 0) {
        moviesGrid.innerHTML = '<p class="empty-state">No movies found</p>';
        paginationContainer.style.display = 'none';
        return;
    }

    moviesGrid.innerHTML = state.searchResults.map(movie => createMovieCard(movie)).join('');
    paginationContainer.style.display = 'flex';

    // Attach event listeners to cards and favorite badges
    document.querySelectorAll('.movie-card').forEach((card, index) => {
        card.addEventListener('click', () => openModal(state.searchResults[index]));
    });

    document.querySelectorAll('.favorite-badge').forEach((badge, index) => {
        badge.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(state.searchResults[index]);
            updateFavoriteBadge(badge, state.searchResults[index].imdbID);
        });
    });
}

// Create movie card HTML
function createMovieCard(movie) {
    const isFavorite = state.favorites.some(fav => fav.imdbID === movie.imdbID);
    const posterUrl = movie.Poster !== 'N/A' ? movie.Poster : null;

    return `
        <div class="movie-card">
            <div class="movie-poster">
                ${posterUrl ? `<img src="${posterUrl}" alt="${movie.Title}" loading="lazy">` : '<div class="movie-poster-placeholder">🎬</div>'}
                <div class="favorite-badge ${isFavorite ? 'active' : ''}" data-id="${movie.imdbID}">
                    ${isFavorite ? '❤️' : '🤍'}
                </div>
            </div>
            <div class="movie-info">
                <h3 class="movie-title">${escapeHtml(movie.Title)}</h3>
                <div class="movie-meta">
                    <span class="movie-year">${movie.Year}</span>
                    ${movie.imdbRating && movie.imdbRating !== 'N/A' ? `<span class="movie-rating">${movie.imdbRating}</span>` : ''}
                </div>
                <span class="movie-type">${movie.Type}</span>
            </div>
        </div>
    `;
}

// Open movie detail modal
async function openModal(movie) {
    showLoading(true);
    try {
        const response = await fetch(`${OMDB_BASE_URL}?apikey=${API_KEY}&i=${movie.imdbID}&plot=full`);
        const fullMovie = await response.json();

        if (fullMovie.Response === 'False') {
            showError('Could not load movie details');
            return;
        }

        const isFavorite = state.favorites.some(fav => fav.imdbID === fullMovie.imdbID);
        const posterUrl = fullMovie.Poster !== 'N/A' ? fullMovie.Poster : null;
        const rating = fullMovie.imdbRating !== 'N/A' ? fullMovie.imdbRating : 'N/A';
        const ratingStars = getRatingStars(parseFloat(rating));

        movieDetail.innerHTML = `
            <div class="detail-header">
                <div class="detail-poster">
                    ${posterUrl ? `<img src="${posterUrl}" alt="${fullMovie.Title}">` : '<div class="movie-poster-placeholder">🎬</div>'}
                </div>
                <div class="detail-info">
                    <h1 class="detail-title">${escapeHtml(fullMovie.Title)}</h1>
                    <div class="detail-meta">
                        <div class="meta-item">
                            <div class="meta-label">Year</div>
                            <div class="meta-value">${fullMovie.Year}</div>
                        </div>
                        <div class="meta-item">
                            <div class="meta-label">Runtime</div>
                            <div class="meta-value">${fullMovie.Runtime}</div>
                        </div>
                        <div class="meta-item">
                            <div class="meta-label">Genre</div>
                            <div class="meta-value">${fullMovie.Genre}</div>
                        </div>
                        <div class="meta-item">
                            <div class="meta-label">Type</div>
                            <div class="meta-value">${fullMovie.Type}</div>
                        </div>
                    </div>
                    <div class="detail-rating">
                        <span class="rating-stars">${ratingStars}</span>
                        <span class="rating-value">${rating}/10</span>
                    </div>
                    <button class="favorite-btn ${isFavorite ? 'added' : ''}" onclick="toggleFavoriteFromModal('${escapeHtml(fullMovie.imdbID)}', '${escapeHtml(fullMovie.Title)}', '${posterUrl || ''}')">
                        ${isFavorite ? '❤️ Added to Favorites' : '🤍 Add to Favorites'}
                    </button>
                </div>
            </div>

            <div class="detail-plot">
                <div class="detail-plot-title">Plot</div>
                <div class="detail-plot-text">${fullMovie.Plot !== 'N/A' ? escapeHtml(fullMovie.Plot) : 'Plot information not available'}</div>
            </div>

            <div class="detail-additional">
                ${fullMovie.Director !== 'N/A' ? `
                    <div class="additional-item">
                        <div class="additional-item-title">Director</div>
                        <div class="additional-item-content">${escapeHtml(fullMovie.Director)}</div>
                    </div>
                ` : ''}
                ${fullMovie.Cast !== 'N/A' ? `
                    <div class="additional-item">
                        <div class="additional-item-title">Cast</div>
                        <div class="additional-item-content">${escapeHtml(fullMovie.Cast)}</div>
                    </div>
                ` : ''}
                ${fullMovie.Writer !== 'N/A' ? `
                    <div class="additional-item">
                        <div class="additional-item-title">Writer</div>
                        <div class="additional-item-content">${escapeHtml(fullMovie.Writer)}</div>
                    </div>
                ` : ''}
                ${fullMovie.Awards !== 'N/A' ? `
                    <div class="additional-item">
                        <div class="additional-item-title">Awards</div>
                        <div class="additional-item-content">${escapeHtml(fullMovie.Awards)}</div>
                    </div>
                ` : ''}
                ${fullMovie.imdbVotes !== 'N/A' ? `
                    <div class="additional-item">
                        <div class="additional-item-title">IMDb Votes</div>
                        <div class="additional-item-content">${fullMovie.imdbVotes}</div>
                    </div>
                ` : ''}
                ${fullMovie.Language !== 'N/A' ? `
                    <div class="additional-item">
                        <div class="additional-item-title">Language</div>
                        <div class="additional-item-content">${escapeHtml(fullMovie.Language)}</div>
                    </div>
                ` : ''}
            </div>
        `;

        movieModal.classList.add('active');
    } catch (error) {
        console.error('Modal error:', error);
        showError('Error loading movie details');
    } finally {
        showLoading(false);
    }
}

// Close modal
function closeModal() {
    movieModal.classList.remove('active');
}

// Toggle favorite
function toggleFavorite(movie) {
    const index = state.favorites.findIndex(fav => fav.imdbID === movie.imdbID);
    if (index > -1) {
        state.favorites.splice(index, 1);
    } else {
        state.favorites.push({
            imdbID: movie.imdbID,
            Title: movie.Title,
            Poster: movie.Poster,
            Year: movie.Year
        });
    }
    saveFavorites();
    renderFavorites();
}

// Toggle favorite from modal
function toggleFavoriteFromModal(imdbID, title, poster) {
    const index = state.favorites.findIndex(fav => fav.imdbID === imdbID);
    const btn = document.querySelector('.favorite-btn');
    
    if (index > -1) {
        state.favorites.splice(index, 1);
        btn.textContent = '🤍 Add to Favorites';
        btn.classList.remove('added');
    } else {
        state.favorites.push({
            imdbID,
            Title: title,
            Poster: poster,
            Year: 'N/A'
        });
        btn.textContent = '❤️ Added to Favorites';
        btn.classList.add('added');
    }
    saveFavorites();
    renderFavorites();
    
    // Update favorite badges in grid
    document.querySelectorAll('.favorite-badge').forEach(badge => {
        if (badge.getAttribute('data-id') === imdbID) {
            badge.textContent = index > -1 ? '🤍' : '❤️';
            badge.classList.toggle('active');
        }
    });
}

// Update favorite badge
function updateFavoriteBadge(badge, imdbID) {
    const isFavorite = state.favorites.some(fav => fav.imdbID === imdbID);
    badge.textContent = isFavorite ? '❤️' : '🤍';
    badge.classList.toggle('active');
}

// Render favorites list
function renderFavorites() {
    if (state.favorites.length === 0) {
        favoritesList.innerHTML = '<p class="empty-message">No favorites yet</p>';
        clearFavoritesBtn.style.opacity = '0.5';
        clearFavoritesBtn.disabled = true;
        return;
    }

    favoritesList.innerHTML = state.favorites.map(movie => `
        <div class="favorite-item" onclick="searchFavorite('${escapeHtml(movie.Title)}')">
            <span class="favorite-item-title">${escapeHtml(movie.Title)}</span>
            <button class="favorite-item-remove" onclick="removeFavorite(event, '${movie.imdbID}')">×</button>
        </div>
    `).join('');

    clearFavoritesBtn.style.opacity = '1';
    clearFavoritesBtn.disabled = false;
}

// Search favorite movie
function searchFavorite(title) {
    searchInput.value = title;
    state.currentPage = 1;
    handleSearch();
}

// Remove favorite
function removeFavorite(event, imdbID) {
    event.stopPropagation();
    const index = state.favorites.findIndex(fav => fav.imdbID === imdbID);
    if (index > -1) {
        state.favorites.splice(index, 1);
        saveFavorites();
        renderFavorites();
        
        // Update favorite badges
        document.querySelectorAll('.favorite-badge').forEach(badge => {
            if (badge.getAttribute('data-id') === imdbID) {
                badge.textContent = '🤍';
                badge.classList.remove('active');
            }
        });
    }
}

// Save favorites to localStorage
function saveFavorites() {
    localStorage.setItem('movieFavorites', JSON.stringify(state.favorites));
}

// Update pagination
function updatePagination() {
    const totalPages = Math.ceil(state.totalResults / 10);
    pageInfo.textContent = `Page ${state.currentPage} of ${totalPages}`;
    
    prevBtn.disabled = state.currentPage === 1;
    nextBtn.disabled = state.currentPage >= totalPages;
}

// Show/hide loading spinner
function showLoading(show) {
    loadingSpinner.classList.toggle('show', show);
}

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
}

// Clear error message
function clearError() {
    errorMessage.classList.remove('show');
    errorMessage.textContent = '';
}

// Get rating stars
function getRatingStars(rating) {
    if (rating === 0 || isNaN(rating)) return '⭐ 0';
    const stars = Math.round(rating / 2);
    return '⭐'.repeat(stars) || '⭐ 0';
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
