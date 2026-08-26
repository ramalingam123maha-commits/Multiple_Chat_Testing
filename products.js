// Sample Product Data
const products = [
    {
        id: 1,
        name: 'Wireless Headphones',
        category: 'electronics',
        price: 79.99,
        rating: 4.5,
        reviews: 128,
        emoji: '🎧'
    },
    {
        id: 2,
        name: 'Smart Watch',
        category: 'electronics',
        price: 199.99,
        rating: 4.8,
        reviews: 256,
        emoji: '⌚'
    },
    {
        id: 3,
        name: 'Cotton T-Shirt',
        category: 'clothing',
        price: 29.99,
        rating: 4.2,
        reviews: 89,
        emoji: '👕'
    },
    {
        id: 4,
        name: 'Denim Jeans',
        category: 'clothing',
        price: 59.99,
        rating: 4.4,
        reviews: 156,
        emoji: '👖'
    },
    {
        id: 5,
        name: 'Canvas Backpack',
        category: 'accessories',
        price: 49.99,
        rating: 4.6,
        reviews: 201,
        emoji: '🎒'
    },
    {
        id: 6,
        name: 'Leather Wallet',
        category: 'accessories',
        price: 39.99,
        rating: 4.3,
        reviews: 145,
        emoji: '👛'
    },
    {
        id: 7,
        name: 'Ceramic Pot',
        category: 'home',
        price: 34.99,
        rating: 4.7,
        reviews: 112,
        emoji: '🏺'
    },
    {
        id: 8,
        name: 'Desk Lamp',
        category: 'home',
        price: 44.99,
        rating: 4.5,
        reviews: 178,
        emoji: '🪔'
    },
    {
        id: 9,
        name: 'USB-C Cable',
        category: 'electronics',
        price: 14.99,
        rating: 4.6,
        reviews: 634,
        emoji: '🔌'
    },
    {
        id: 10,
        name: 'Wireless Mouse',
        category: 'electronics',
        price: 34.99,
        rating: 4.4,
        reviews: 342,
        emoji: '🖱️'
    },
    {
        id: 11,
        name: 'Sneakers',
        category: 'clothing',
        price: 89.99,
        rating: 4.7,
        reviews: 421,
        emoji: '👟'
    },
    {
        id: 12,
        name: 'Sunglasses',
        category: 'accessories',
        price: 129.99,
        rating: 4.8,
        reviews: 289,
        emoji: '😎'
    }
];

// Application State
const appState = {
    cart: JSON.parse(localStorage.getItem('cart')) || [],
    filters: {
        category: 'all',
        minPrice: 0,
        maxPrice: 1000,
        minRating: 0
    },
    sortBy: 'default',
    filteredProducts: [...products]
};

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const noResults = document.getElementById('noResults');
const cartToggle = document.getElementById('cartToggle');
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const closeCart = document.getElementById('closeCart');
const cartCount = document.getElementById('cartCount');
const cartItems = document.getElementById('cartItems');
const cartEmpty = document.getElementById('cartEmpty');
const filterToggle = document.getElementById('filterToggle');
const filtersSidebar = document.getElementById('filtersSidebar');
const closeFilters = document.getElementById('closeFilters');
const resetFilters = document.getElementById('resetFilters');
const sortSelect = document.getElementById('sortSelect');
const categoryFilters = document.querySelectorAll('.category-filter');
const priceMin = document.getElementById('priceMin');
const priceMax = document.getElementById('priceMax');
const minPriceDisplay = document.getElementById('minPriceDisplay');
const maxPriceDisplay = document.getElementById('maxPriceDisplay');
const ratingFilters = document.querySelectorAll('.rating-filter');
const checkoutBtn = document.getElementById('checkoutBtn');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    updateCart();
    setupEventListeners();
});

// Event Listeners Setup
function setupEventListeners() {
    // Cart Controls
    cartToggle.addEventListener('click', openCart);
    closeCart.addEventListener('click', closeCartDrawer);
    cartOverlay.addEventListener('click', closeCartDrawer);
    checkoutBtn.addEventListener('click', handleCheckout);

    // Mobile Filter Controls
    filterToggle.addEventListener('click', openFilters);
    closeFilters.addEventListener('click', closeFiltersDrawer);

    // Filter Controls
    categoryFilters.forEach(filter => {
        filter.addEventListener('change', handleCategoryFilter);
    });

    priceMin.addEventListener('input', handlePriceFilter);
    priceMax.addEventListener('input', handlePriceFilter);

    ratingFilters.forEach(filter => {
        filter.addEventListener('change', handleRatingFilter);
    });

    resetFilters.addEventListener('click', handleResetFilters);

    // Sort Controls
    sortSelect.addEventListener('change', handleSort);

    // Close mobile filters when clicking outside
    document.addEventListener('click', (e) => {
        if (filtersSidebar.classList.contains('open') && 
            !filtersSidebar.contains(e.target) && 
            !filterToggle.contains(e.target)) {
            closeFiltersDrawer();
        }
    });
}

// Cart Functions
function openCart() {
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeCartDrawer() {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('open');
    document.body.style.overflow = '';
}

function addToCart(productId, quantity = 1) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = appState.cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        appState.cart.push({
            ...product,
            quantity
        });
    }

    saveCart();
    updateCart();
    showAddToCartFeedback();
}

// eslint-disable-next-line no-unused-vars
function removeFromCart(productId) {
    appState.cart = appState.cart.filter(item => item.id !== productId);
    saveCart();
    updateCart();
}

// eslint-disable-next-line no-unused-vars
function updateCartItemQuantity(productId, quantity) {
    const item = appState.cart.find(item => item.id === productId);
    if (item) {
        item.quantity = Math.max(1, quantity);
        saveCart();
        updateCart();
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(appState.cart));
}

function updateCart() {
    const totalItems = appState.cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    // Update cart items display
    if (appState.cart.length === 0) {
        cartItems.innerHTML = '';
        cartEmpty.style.display = 'flex';
    } else {
        cartEmpty.style.display = 'none';
        cartItems.innerHTML = appState.cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-image">${item.emoji}</div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                    <div class="cart-item-quantity">
                        <button class="cart-item-qty-btn" onclick="updateCartItemQuantity(${item.id}, ${item.quantity - 1})">−</button>
                        <input type="text" class="cart-item-qty" value="${item.quantity}" readonly>
                        <button class="cart-item-qty-btn" onclick="updateCartItemQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    </div>
                </div>
                <button class="remove-item" onclick="removeFromCart(${item.id})">🗑️</button>
            </div>
        `).join('');
    }

    updateCartTotals();
}

function updateCartTotals() {
    const subtotal = appState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}

function handleCheckout() {
    if (appState.cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    const total = document.getElementById('total').textContent;
    alert(`Proceeding to checkout!\n\nTotal: ${total}\n\nThank you for your purchase!`);
    appState.cart = [];
    saveCart();
    updateCart();
    closeCartDrawer();
}

function showAddToCartFeedback() {
    // Optional: Add visual feedback when item is added
    const allButtons = document.querySelectorAll('.add-to-cart-btn');
    allButtons.forEach(btn => {
        if (btn.classList.contains('added')) {
            btn.classList.remove('added');
        }
    });
}

// Filter Functions
function handleCategoryFilter(_e) {
    const selectedCategories = Array.from(categoryFilters)
        .filter(f => f.checked)
        .map(f => f.value);

    if (selectedCategories.includes('all')) {
        appState.filters.category = 'all';
        categoryFilters.forEach(f => f.checked = f.value === 'all');
    } else {
        appState.filters.category = selectedCategories;
    }

    applyFilters();
}

function handlePriceFilter() {
    let min = parseInt(priceMin.value);
    let max = parseInt(priceMax.value);

    if (min > max) {
        [min, max] = [max, min];
        priceMin.value = min;
        priceMax.value = max;
    }

    appState.filters.minPrice = min;
    appState.filters.maxPrice = max;
    minPriceDisplay.textContent = min;
    maxPriceDisplay.textContent = max;

    applyFilters();
}

function handleRatingFilter() {
    const selectedRatings = Array.from(ratingFilters)
        .filter(f => f.checked)
        .map(f => parseInt(f.value));

    appState.filters.minRating = selectedRatings.length > 0 ? Math.min(...selectedRatings) : 0;
    applyFilters();
}

function handleResetFilters() {
    appState.filters = {
        category: 'all',
        minPrice: 0,
        maxPrice: 1000,
        minRating: 0
    };
    appState.sortBy = 'default';

    // Reset UI
    categoryFilters.forEach(f => f.checked = f.value === 'all');
    priceMin.value = 0;
    priceMax.value = 1000;
    minPriceDisplay.textContent = '0';
    maxPriceDisplay.textContent = '1000';
    ratingFilters.forEach(f => f.checked = false);
    sortSelect.value = 'default';

    applyFilters();
}

function applyFilters() {
    const filtered = products.filter(product => {
        // Category filter
        const categoryMatch = appState.filters.category === 'all' || 
                            appState.filters.category === product.category ||
                            (Array.isArray(appState.filters.category) && 
                             appState.filters.category.includes(product.category));

        // Price filter
        const priceMatch = product.price >= appState.filters.minPrice && 
                          product.price <= appState.filters.maxPrice;

        // Rating filter
        const ratingMatch = product.rating >= appState.filters.minRating;

        return categoryMatch && priceMatch && ratingMatch;
    });

    appState.filteredProducts = filtered;
    applySorting();
    renderProducts();
}

function handleSort(e) {
    appState.sortBy = e.target.value;
    applySorting();
    renderProducts();
}

function applySorting() {
    const sorted = [...appState.filteredProducts];

    switch (appState.sortBy) {
        case 'price-low':
            sorted.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            sorted.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            sorted.sort((a, b) => b.rating - a.rating);
            break;
        case 'default':
        default:
            // Keep original order
            break;
    }

    appState.filteredProducts = sorted;
}

// Product Rendering
function renderProducts() {
    if (appState.filteredProducts.length === 0) {
        productsGrid.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }

    noResults.style.display = 'none';
    productsGrid.innerHTML = appState.filteredProducts.map(product => {
        const stars = '⭐'.repeat(Math.floor(product.rating));
        const inCart = appState.cart.find(item => item.id === product.id);
        const quantity = inCart ? inCart.quantity : 1;

        return `
            <div class="product-card">
                <div class="product-image">${product.emoji}</div>
                <div class="product-info">
                    <div class="product-category">${product.category}</div>
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-rating">
                        <span class="stars">${stars}</span>
                        <span class="rating-value">${product.rating}</span>
                        <span class="rating-count">(${product.reviews})</span>
                    </div>
                    <div class="product-price">$${product.price.toFixed(2)}</div>
                    <div class="product-controls">
                        <div class="quantity-control">
                            <button class="quantity-btn" onclick="decreaseQuantity(${product.id})">−</button>
                            <input type="number" class="quantity-input" id="qty-${product.id}" value="${quantity}" min="1" readonly>
                            <button class="quantity-btn" onclick="increaseQuantity(${product.id})">+</button>
                        </div>
                        <button class="add-to-cart-btn" onclick="handleAddToCart(${product.id})">Add to Cart</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Quantity Control Functions — called from inline onclick handlers in HTML
// eslint-disable-next-line no-unused-vars
function increaseQuantity(productId) {
    const input = document.getElementById(`qty-${productId}`);
    input.value = parseInt(input.value) + 1;
}

// eslint-disable-next-line no-unused-vars
function decreaseQuantity(productId) {
    const input = document.getElementById(`qty-${productId}`);
    const newValue = Math.max(1, parseInt(input.value) - 1);
    input.value = newValue;
}

// eslint-disable-next-line no-unused-vars
function handleAddToCart(productId) {
    const quantity = parseInt(document.getElementById(`qty-${productId}`).value);
    addToCart(productId, quantity);
    
    // Reset quantity to 1 for next use
    document.getElementById(`qty-${productId}`).value = 1;
    
    // Brief visual feedback
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = '✓ Added!';
    button.classList.add('added');
    
    setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove('added');
    }, 1500);
}

// Filter Sidebar Mobile Controls
function openFilters() {
    filtersSidebar.classList.add('open');
}

function closeFiltersDrawer() {
    filtersSidebar.classList.remove('open');
}

// Export for debugging/testing
window.appState = appState;
window.products = products;
