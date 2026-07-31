const OMDB_API_KEY = 'YOUR_OMDB_API_KEY_HERE';
const OMDB_BASE_URL = 'https://www.omdbapi.com/';

class MovieSearchApp {
    constructor() {
        this.searchInput = document.getElementById('searchInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.moviesGrid = document.getElementById('moviesGrid');
        this.noResults = document.getElementById('noResults');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.searchError = document.getElementById('searchError');
        this.favoritesToggle = document.getElementById('favoritesToggle');
        this.favoritesView = document.getElementById('favoritesView');
        this.resultsView = document.getElementById('resultsView');
        this.favoritesGrid = document.getElementById('favoritesGrid');
        this.noFavorites = document.getElementById('noFavorites');
        this.favoritesSection = document.getElementById('favoritesSection');
        this.resultsSection = document.getElementById('resultsSection');
        this.movieModal = document.getElementById('movieModal');
        this.modalOverlay = document.getElementById('modalOverlay');
        this.modalClose = document.getElementById('modalClose');
        this.modalDetails = document.getElementById('modalDetails');
        this.favoriteCount = document.getElementById('favoriteCount');

        this.favorites = this.loadFavorites();
        this.currentMovie = null;

        this.initEventListeners();
        this.updateFavoriteCount();
    }

    initEventListeners() {
        this.searchBtn.addEventListener('click', () => this.handleSearch());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });

        this.favoritesToggle.addEventListener('click', () => this.showFavoritesView());
        this.favoritesView.addEventListener('click', () => this.showFavoritesView());
        this.resultsView.addEventListener('click', () => this.showResultsView());

        this.modalClose.addEventListener('click', () => this.closeModal());
        this.modalOverlay.addEventListener('click', () => this.closeModal());
        this.movieModal.addEventListener('click', (e) => {
            if (e.target === this.movieModal) this.closeModal();
        });
    }

    async handleSearch() {
        const query = this.searchInput.value.trim();

        if (!query) {
            this.showError('Please enter a search query');
            return;
        }

        if (!OMDB_API_KEY.includes('YOUR_OMDB')) {
            this.showError('⚠️ OMDB API key not configured. Get a free key at https://www.omdbapi.com/apikey.aspx');
            return;
        }

        this.clearError();
        this.showLoading(true);

        try {
            const response = await fetch(
                `${OMDB_BASE_URL}?s=${encodeURIComponent(query)}&type=movie&apikey=${OMDB_API_KEY}`
            );
            const data = await response.json();

            if (data.Response === 'True') {
                this.displayMovies(data.Search);
                this.showResultsView();
            } else {
                this.showNoResults();
                this.showError(data.Error || 'No movies found');
            }
        } catch (error) {
            this.showError('Error fetching movies. Please try again.');
            console.error('Fetch error:', error);
        } finally {
            this.showLoading(false);
        }
    }

    displayMovies(movies) {
        this.moviesGrid.innerHTML = '';
        this.noResults.classList.add('hidden');

        movies.forEach((movie) => {
            const card = this.createMovieCard(movie);
            this.moviesGrid.appendChild(card);
        });
    }

    createMovieCard(movie) {
        const card = document.createElement('div');
        card.className = 'movie-card';

        const isFavorite = this.favorites.some((fav) => fav.imdbID === movie.imdbID);

        const posterHTML =
            movie.Poster !== 'N/A'
                ? `<img src="${movie.Poster}" alt="${movie.Title}" loading="lazy">`
                : `<div class="poster-placeholder">🎬</div>`;

        card.innerHTML = `
            <div class="movie-poster">
                ${posterHTML}
                <div class="favorite-badge ${isFavorite ? 'active' : ''}" data-imdb-id="${movie.imdbID}">
                    ❤️
                </div>
            </div>
            <div class="movie-info">
                <h3 class="movie-title">${movie.Title}</h3>
                <p class="movie-year">${movie.Year}</p>
                <div class="movie-rating">
                    <span>⭐ ${movie.imdbRating !== 'N/A' ? movie.imdbRating : 'N/A'}</span>
                </div>
            </div>
        `;

        card.addEventListener('click', (e) => {
            if (e.target.closest('.favorite-badge')) {
                e.stopPropagation();
                this.toggleFavorite(movie);
            } else {
                this.openMovieModal(movie);
            }
        });

        const favoriteBtn = card.querySelector('.favorite-badge');
        favoriteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleFavorite(movie);
        });

        return card;
    }

    toggleFavorite(movie) {
        const index = this.favorites.findIndex((fav) => fav.imdbID === movie.imdbID);

        if (index === -1) {
            this.favorites.push(movie);
        } else {
            this.favorites.splice(index, 1);
        }

        this.saveFavorites();
        this.updateFavoriteCount();
        this.refreshCurrentView();
    }

    async openMovieModal(movie) {
        this.currentMovie = movie;

        if (!OMDB_API_KEY.includes('YOUR_OMDB')) {
            this.showError('API key not configured');
            return;
        }

        try {
            const response = await fetch(
                `${OMDB_BASE_URL}?i=${movie.imdbID}&plot=full&apikey=${OMDB_API_KEY}`
            );
            const data = await response.json();

            if (data.Response === 'True') {
                this.displayMovieModal(data);
            }
        } catch (error) {
            console.error('Error fetching movie details:', error);
        }
    }

    displayMovieModal(movie) {
        const isFavorite = this.favorites.some((fav) => fav.imdbID === movie.imdbID);

        const posterHTML =
            movie.Poster !== 'N/A'
                ? `<img src="${movie.Poster}" alt="${movie.Title}">`
                : `<div class="modal-poster-placeholder">🎬</div>`;

        const modalHTML = `
            <div class="modal-poster">
                ${posterHTML}
            </div>
            <div class="modal-info">
                <h1 class="modal-title">${movie.Title}</h1>
                <p class="modal-year">${movie.Year} • ${movie.Runtime}</p>
                <div class="modal-rating">
                    <span>⭐ ${movie.imdbRating} / 10</span>
                </div>

                <div class="modal-detail-row">
                    <div class="modal-detail-label">Genre</div>
                    <div class="modal-detail-value">${movie.Genre}</div>
                </div>

                <div class="modal-detail-row">
                    <div class="modal-detail-label">Director</div>
                    <div class="modal-detail-value">${movie.Director}</div>
                </div>

                <div class="modal-detail-row">
                    <div class="modal-detail-label">Cast</div>
                    <div class="modal-detail-value">${movie.Actors}</div>
                </div>

                <div class="modal-plot">
                    <strong>Plot:</strong><br>
                    ${movie.Plot}
                </div>

                <div class="modal-actions">
                    <button class="modal-btn btn-favorite ${isFavorite ? 'added' : ''}" id="favBtn">
                        ${isFavorite ? '❤️ Added to Favorites' : '🤍 Add to Favorites'}
                    </button>
                </div>
            </div>
        `;

        this.modalDetails.innerHTML = modalHTML;

        const favBtn = document.getElementById('favBtn');
        favBtn.addEventListener('click', () => {
            this.toggleFavorite(this.currentMovie);
            const isFav = this.favorites.some((fav) => fav.imdbID === this.currentMovie.imdbID);
            favBtn.textContent = isFav ? '❤️ Added to Favorites' : '🤍 Add to Favorites';
            favBtn.classList.toggle('added');
        });

        this.openModal();
    }

    openModal() {
        this.movieModal.classList.remove('hidden');
        this.modalOverlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        this.movieModal.classList.add('hidden');
        this.modalOverlay.classList.add('hidden');
        document.body.style.overflow = 'auto';
        this.currentMovie = null;
    }

    showFavoritesView() {
        this.resultsSection.classList.add('hidden');
        this.favoritesSection.classList.remove('hidden');
        this.resultsView.classList.remove('active');
        this.favoritesView.classList.add('active');

        this.refreshFavoritesList();
    }

    showResultsView() {
        this.resultsSection.classList.remove('hidden');
        this.favoritesSection.classList.add('hidden');
        this.resultsView.classList.add('active');
        this.favoritesView.classList.remove('active');
    }

    refreshFavoritesList() {
        this.favoritesGrid.innerHTML = '';

        if (this.favorites.length === 0) {
            this.noFavorites.classList.remove('hidden');
            return;
        }

        this.noFavorites.classList.add('hidden');

        this.favorites.forEach((movie) => {
            const card = this.createMovieCard(movie);
            this.favoritesGrid.appendChild(card);
        });
    }

    refreshCurrentView() {
        const isShowingFavorites = !this.favoritesSection.classList.contains('hidden');

        if (isShowingFavorites) {
            this.refreshFavoritesList();
        } else {
            // Refresh current results if any
            const cards = this.moviesGrid.querySelectorAll('.movie-card');
            cards.forEach((card) => {
                const badge = card.querySelector('.favorite-badge');
                const imdbId = badge.dataset.imdbId;
                const isFavorite = this.favorites.some((fav) => fav.imdbID === imdbId);

                if (isFavorite) {
                    badge.classList.add('active');
                } else {
                    badge.classList.remove('active');
                }
            });
        }
    }

    showLoading(show) {
        if (show) {
            this.loadingSpinner.classList.remove('hidden');
        } else {
            this.loadingSpinner.classList.add('hidden');
        }
    }

    showNoResults() {
        this.moviesGrid.innerHTML = '';
        this.noResults.classList.remove('hidden');
    }

    showError(message) {
        this.searchError.textContent = message;
        this.searchError.classList.add('show');
    }

    clearError() {
        this.searchError.textContent = '';
        this.searchError.classList.remove('show');
    }

    saveFavorites() {
        localStorage.setItem('movieFavorites', JSON.stringify(this.favorites));
    }

    loadFavorites() {
        const saved = localStorage.getItem('movieFavorites');
        return saved ? JSON.parse(saved) : [];
    }

    updateFavoriteCount() {
        this.favoriteCount.textContent = this.favorites.length;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new MovieSearchApp();
});
