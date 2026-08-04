/* ── RecipeVault — app.js ──────────────────────────────────────
   Features:
   • 12 recipes across 8 cuisines
   • Search (title, description, ingredients)
   • Cuisine filter chips
   • Sort (name, cook time, difficulty)
   • Recipe detail modal with Ingredients / Instructions / Nutrition tabs
   • Ingredient checklist (click to check, "check all" button)
   • Step-by-step instructions with progress counter
   • Favorites save / remove via localStorage
   • Favorites side panel
   • Toast notifications
──────────────────────────────────────────────────────────────── */

'use strict';

// ── Data ────────────────────────────────────────────────────────
const RECIPES = [
  {
    id: 1,
    title: 'Spaghetti Carbonara',
    cuisine: 'Italian',
    description: 'Classic Roman pasta with silky egg sauce, crispy guanciale and pecorino — no cream needed.',
    image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&q=80',
    time: 25,
    servings: 4,
    difficulty: 'Medium',
    ingredients: [
      { name: 'Spaghetti', amount: '400 g' },
      { name: 'Guanciale or pancetta', amount: '200 g' },
      { name: 'Eggs (large)', amount: '4' },
      { name: 'Pecorino Romano, grated', amount: '80 g' },
      { name: 'Parmesan, grated', amount: '40 g' },
      { name: 'Black pepper, freshly ground', amount: '1 tsp' },
      { name: 'Salt', amount: 'to taste' },
    ],
    steps: [
      'Bring a large pot of salted water to a boil and cook spaghetti until al dente.',
      'While pasta cooks, cut guanciale into thick lardons and fry in a dry pan over medium heat until golden and fat has rendered.',
      'Whisk eggs, pecorino, parmesan and a generous amount of black pepper together in a bowl.',
      'Reserve 1 cup of pasta cooking water, then drain the spaghetti.',
      'Add hot pasta to the guanciale pan off the heat. Toss to coat in the fat.',
      'Pour egg mixture over the pasta, adding pasta water a splash at a time, tossing vigorously to create a creamy emulsified sauce.',
      'Serve immediately, topped with extra cheese and cracked pepper.',
    ],
    nutrition: { calories: 620, protein: 28, carbs: 72, fat: 24, fiber: 3 },
  },
  {
    id: 2,
    title: 'Chicken Tikka Masala',
    cuisine: 'Indian',
    description: 'Tender marinated chicken in a rich, spiced tomato-cream sauce. Serve with basmati rice or naan.',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80',
    time: 50,
    servings: 4,
    difficulty: 'Medium',
    ingredients: [
      { name: 'Chicken thighs, boneless', amount: '700 g' },
      { name: 'Plain yoghurt', amount: '200 ml' },
      { name: 'Tikka masala paste', amount: '4 tbsp' },
      { name: 'Crushed tomatoes', amount: '400 g' },
      { name: 'Heavy cream', amount: '100 ml' },
      { name: 'Onion, diced', amount: '1 large' },
      { name: 'Garlic cloves, minced', amount: '4' },
      { name: 'Fresh ginger, grated', amount: '2 tsp' },
      { name: 'Garam masala', amount: '1 tsp' },
      { name: 'Salt', amount: 'to taste' },
    ],
    steps: [
      'Mix yoghurt, 2 tbsp tikka paste, salt, and half the ginger. Marinate chicken for at least 30 minutes.',
      'Grill or pan-fry marinated chicken on high heat until charred in spots. Set aside.',
      'In the same pan, sauté onion until golden. Add garlic and remaining ginger, cook 2 minutes.',
      'Add remaining tikka paste and garam masala. Stir 1 minute.',
      'Pour in crushed tomatoes and simmer 10 minutes.',
      'Stir in cream, add the grilled chicken and simmer 5 more minutes.',
      'Taste, adjust salt, and garnish with fresh coriander.',
    ],
    nutrition: { calories: 490, protein: 38, carbs: 18, fat: 28, fiber: 4 },
  },
  {
    id: 3,
    title: 'Beef Tacos',
    cuisine: 'Mexican',
    description: 'Juicy spiced beef in warm corn tortillas with fresh salsa, avocado and tangy lime crema.',
    image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&q=80',
    time: 30,
    servings: 4,
    difficulty: 'Easy',
    ingredients: [
      { name: 'Ground beef', amount: '500 g' },
      { name: 'Corn tortillas (small)', amount: '12' },
      { name: 'Taco seasoning', amount: '2 tbsp' },
      { name: 'Avocado, diced', amount: '2' },
      { name: 'Cherry tomatoes, halved', amount: '200 g' },
      { name: 'Red onion, finely diced', amount: '½' },
      { name: 'Lime juice', amount: '2 tbsp' },
      { name: 'Sour cream', amount: '100 ml' },
      { name: 'Cheddar, shredded', amount: '80 g' },
      { name: 'Fresh coriander', amount: 'handful' },
    ],
    steps: [
      'Brown ground beef in a skillet over high heat, breaking it apart.',
      'Add taco seasoning and 60 ml water. Simmer 3 minutes until saucy.',
      'Mix tomatoes, red onion, lime juice and coriander for fresh salsa.',
      'Warm tortillas in a dry pan or directly over a gas flame.',
      'Assemble tacos with beef, salsa, avocado, sour cream and cheese.',
      'Serve immediately with lime wedges.',
    ],
    nutrition: { calories: 540, protein: 32, carbs: 44, fat: 26, fiber: 7 },
  },
  {
    id: 4,
    title: 'Salmon Miso Ramen',
    cuisine: 'Japanese',
    description: 'Comforting rich miso broth with silky noodles, crispy salmon, soft-boiled egg and nori.',
    image: 'https://images.unsplash.com/photo-1569775894861-79c5ede2b931?w=600&q=80',
    time: 45,
    servings: 2,
    difficulty: 'Medium',
    ingredients: [
      { name: 'Ramen noodles', amount: '200 g' },
      { name: 'Salmon fillet', amount: '2 × 150 g' },
      { name: 'White miso paste', amount: '3 tbsp' },
      { name: 'Chicken or dashi stock', amount: '1 L' },
      { name: 'Soy sauce', amount: '2 tbsp' },
      { name: 'Mirin', amount: '1 tbsp' },
      { name: 'Eggs', amount: '2' },
      { name: 'Spring onions, sliced', amount: '3' },
      { name: 'Nori sheets', amount: '2' },
      { name: 'Sesame oil', amount: '1 tsp' },
      { name: 'Corn kernels', amount: '80 g' },
    ],
    steps: [
      'Soft-boil eggs: 6½ minutes in boiling water, then ice bath. Peel and halve.',
      'Season salmon with salt and sear skin-side down in a hot oiled pan for 4 min each side. Rest and flake.',
      'Heat stock; whisk in miso, soy sauce and mirin. Do not boil once miso is added.',
      'Cook ramen noodles per packet, drain and divide into warm bowls.',
      'Ladle hot broth over noodles.',
      'Top with flaked salmon, halved eggs, corn, spring onions and nori.',
      'Finish with a drizzle of sesame oil.',
    ],
    nutrition: { calories: 560, protein: 42, carbs: 58, fat: 16, fiber: 5 },
  },
  {
    id: 5,
    title: 'Classic Cheeseburger',
    cuisine: 'American',
    description: 'Juicy beef patty with melted cheese, crisp lettuce, tomato and special sauce in a brioche bun.',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
    time: 20,
    servings: 2,
    difficulty: 'Easy',
    ingredients: [
      { name: 'Ground beef (80/20)', amount: '300 g' },
      { name: 'Brioche buns', amount: '2' },
      { name: 'Cheddar slices', amount: '4' },
      { name: 'Iceberg lettuce', amount: '4 leaves' },
      { name: 'Beef tomato, sliced', amount: '1' },
      { name: 'Red onion, sliced', amount: '½' },
      { name: 'Dill pickles', amount: '6 slices' },
      { name: 'Mayonnaise', amount: '2 tbsp' },
      { name: 'Ketchup', amount: '1 tbsp' },
      { name: 'American mustard', amount: '1 tsp' },
      { name: 'Salt & pepper', amount: 'to taste' },
    ],
    steps: [
      'Divide beef into 2 equal balls, flatten into patties slightly wider than the buns.',
      'Mix mayo, ketchup and mustard for the special sauce.',
      'Heat a cast-iron or heavy pan to very high heat. Season patties generously.',
      'Cook patties 2–3 min per side. Add cheese slices in the last minute, cover to melt.',
      'Toast bun halves cut-side down until golden.',
      'Build: bottom bun → sauce → lettuce → tomato → patty + cheese → onion → pickles → top bun.',
    ],
    nutrition: { calories: 720, protein: 40, carbs: 48, fat: 38, fiber: 3 },
  },
  {
    id: 6,
    title: 'Greek Salad with Falafel',
    cuisine: 'Mediterranean',
    description: 'Crispy baked falafel on a bed of classic Greek salad with creamy tahini dressing.',
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=80',
    time: 35,
    servings: 2,
    difficulty: 'Easy',
    ingredients: [
      { name: 'Canned chickpeas, drained', amount: '400 g' },
      { name: 'Garlic clove', amount: '2' },
      { name: 'Fresh parsley', amount: 'large handful' },
      { name: 'Cumin', amount: '1 tsp' },
      { name: 'Coriander powder', amount: '1 tsp' },
      { name: 'Plain flour', amount: '2 tbsp' },
      { name: 'Cucumber, diced', amount: '1' },
      { name: 'Cherry tomatoes, halved', amount: '200 g' },
      { name: 'Kalamata olives', amount: '80 g' },
      { name: 'Feta cheese, crumbled', amount: '100 g' },
      { name: 'Tahini', amount: '3 tbsp' },
      { name: 'Lemon juice', amount: '2 tbsp' },
    ],
    steps: [
      'Blend chickpeas, garlic, parsley, cumin, coriander and flour into a coarse paste.',
      'Shape into 12 small patties. Brush with oil and bake at 200 °C for 20–22 min until golden.',
      'Whisk tahini, lemon juice, water and a pinch of salt into a smooth dressing.',
      'Combine cucumber, tomatoes, olives and feta in a bowl.',
      'Plate salad, top with hot falafel and drizzle generously with tahini dressing.',
    ],
    nutrition: { calories: 420, protein: 18, carbs: 48, fat: 20, fiber: 12 },
  },
  {
    id: 7,
    title: 'Kung Pao Chicken',
    cuisine: 'Chinese',
    description: 'Stir-fried chicken with crunchy peanuts, dried chillies and fragrant Sichuan pepper in a sweet-sour sauce.',
    image: 'https://images.unsplash.com/photo-1525518392674-39ba1fca2ec2?w=600&q=80',
    time: 25,
    servings: 3,
    difficulty: 'Medium',
    ingredients: [
      { name: 'Chicken thighs, diced', amount: '500 g' },
      { name: 'Roasted peanuts', amount: '80 g' },
      { name: 'Dried red chillies', amount: '8' },
      { name: 'Sichuan peppercorns', amount: '1 tsp' },
      { name: 'Spring onions, cut into chunks', amount: '4' },
      { name: 'Soy sauce', amount: '2 tbsp' },
      { name: 'Rice vinegar', amount: '1 tbsp' },
      { name: 'Hoisin sauce', amount: '1 tbsp' },
      { name: 'Sesame oil', amount: '1 tsp' },
      { name: 'Cornstarch', amount: '2 tsp' },
      { name: 'Garlic cloves, minced', amount: '3' },
      { name: 'Ginger, grated', amount: '1 tbsp' },
    ],
    steps: [
      'Marinate chicken with soy sauce, cornstarch and sesame oil for 15 minutes.',
      'Mix remaining soy sauce, rice vinegar, hoisin and a little water into a sauce.',
      'Stir-fry dried chillies and Sichuan pepper in oil until fragrant. Remove and set aside.',
      'Add chicken to the wok in a single layer. Sear without moving for 1 min, then stir-fry.',
      'Add garlic, ginger and spring onion whites. Toss for 1 minute.',
      'Return chillies to wok, pour in sauce and toss until everything is coated.',
      'Stir in peanuts and spring onion greens. Serve over rice.',
    ],
    nutrition: { calories: 480, protein: 35, carbs: 22, fat: 28, fiber: 3 },
  },
  {
    id: 8,
    title: 'Pad Thai',
    cuisine: 'Thai',
    description: 'Street-food classic — wok-fried rice noodles with tofu, egg, bean sprouts and tamarind sauce.',
    image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600&q=80',
    time: 30,
    servings: 2,
    difficulty: 'Medium',
    ingredients: [
      { name: 'Flat rice noodles (medium)', amount: '200 g' },
      { name: 'Extra-firm tofu, cubed', amount: '200 g' },
      { name: 'Eggs', amount: '3' },
      { name: 'Bean sprouts', amount: '150 g' },
      { name: 'Tamarind paste', amount: '3 tbsp' },
      { name: 'Fish sauce (or soy sauce)', amount: '2 tbsp' },
      { name: 'Palm sugar or brown sugar', amount: '1 tbsp' },
      { name: 'Oyster sauce', amount: '1 tbsp' },
      { name: 'Garlic, minced', amount: '3 cloves' },
      { name: 'Spring onions, sliced', amount: '3' },
      { name: 'Roasted peanuts, crushed', amount: '4 tbsp' },
      { name: 'Lime', amount: '1' },
    ],
    steps: [
      'Soak rice noodles in warm water for 20 minutes, drain and set aside.',
      'Mix tamarind paste, fish sauce, sugar and oyster sauce into a sauce.',
      'Fry tofu in hot oil until golden on all sides. Set aside.',
      'In the same wok, fry garlic, push to side, crack in eggs and scramble.',
      'Add noodles and sauce. Toss over high heat until noodles absorb the sauce.',
      'Add tofu, bean sprouts and spring onions. Toss 1 minute.',
      'Serve with crushed peanuts, lime wedges and chilli flakes.',
    ],
    nutrition: { calories: 510, protein: 22, carbs: 70, fat: 16, fiber: 5 },
  },
  {
    id: 9,
    title: 'Margherita Pizza',
    cuisine: 'Italian',
    description: 'Neapolitan-style thin-crust pizza with crushed tomatoes, fresh mozzarella and basil.',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80',
    time: 90,
    servings: 2,
    difficulty: 'Hard',
    ingredients: [
      { name: 'Strong bread flour', amount: '300 g' },
      { name: 'Instant yeast', amount: '7 g' },
      { name: 'Salt', amount: '1 tsp' },
      { name: 'Olive oil', amount: '2 tbsp' },
      { name: 'Warm water', amount: '190 ml' },
      { name: 'Crushed plum tomatoes', amount: '200 g' },
      { name: 'Fresh mozzarella', amount: '250 g' },
      { name: 'Fresh basil leaves', amount: 'large handful' },
      { name: 'Extra-virgin olive oil', amount: 'for drizzling' },
      { name: 'Sea salt flakes', amount: 'pinch' },
    ],
    steps: [
      'Mix flour, yeast and salt. Add oil and water, knead for 10 minutes until smooth and elastic.',
      'Place in an oiled bowl, cover and prove in a warm spot for 1 hour until doubled.',
      'Preheat oven to its highest setting (ideally 250 °C / 480 °F) with a baking stone or heavy tray inside.',
      'Divide dough in two. Stretch each ball into a thin round on semolina-dusted parchment.',
      'Spread lightly crushed tomatoes, leaving a border. Season with salt.',
      'Bake 8–10 min until crust is charred at the edges and tomato is reduced.',
      'Remove from oven, tear over mozzarella and basil, drizzle with extra-virgin olive oil. Serve instantly.',
    ],
    nutrition: { calories: 580, protein: 24, carbs: 78, fat: 18, fiber: 4 },
  },
  {
    id: 10,
    title: 'Butter Chicken',
    cuisine: 'Indian',
    description: 'Velvety tomato-butter sauce with tender chicken, warm spices and a hint of fenugreek.',
    image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&q=80',
    time: 55,
    servings: 4,
    difficulty: 'Medium',
    ingredients: [
      { name: 'Chicken breasts, cubed', amount: '700 g' },
      { name: 'Greek yoghurt', amount: '120 ml' },
      { name: 'Tandoori masala', amount: '2 tbsp' },
      { name: 'Butter', amount: '4 tbsp' },
      { name: 'Onion, finely chopped', amount: '1' },
      { name: 'Garlic, minced', amount: '5 cloves' },
      { name: 'Ginger, grated', amount: '2 tsp' },
      { name: 'Tomato purée', amount: '3 tbsp' },
      { name: 'Crushed tomatoes', amount: '400 g' },
      { name: 'Heavy cream', amount: '120 ml' },
      { name: 'Garam masala', amount: '1 tsp' },
      { name: 'Dried fenugreek leaves', amount: '1 tsp' },
    ],
    steps: [
      'Marinate chicken in yoghurt and tandoori masala for 30 minutes.',
      'Grill or broil until slightly charred. Set aside.',
      'Melt butter in a pan, sauté onion until golden. Add garlic and ginger.',
      'Add tomato purée and cook 2 minutes. Add crushed tomatoes, simmer 15 minutes.',
      'Blend sauce until smooth. Return to pan, add chicken and cream.',
      'Simmer 10 minutes. Stir in garam masala and fenugreek leaves.',
      'Serve with basmati rice and warm naan.',
    ],
    nutrition: { calories: 510, protein: 40, carbs: 20, fat: 30, fiber: 4 },
  },
  {
    id: 11,
    title: 'BBQ Pulled Pork',
    cuisine: 'American',
    description: 'Slow-roasted pork shoulder with smoky dry rub, pulled apart and glazed with tangy BBQ sauce.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80',
    time: 240,
    servings: 6,
    difficulty: 'Hard',
    ingredients: [
      { name: 'Pork shoulder, bone-in', amount: '2 kg' },
      { name: 'Smoked paprika', amount: '2 tbsp' },
      { name: 'Brown sugar', amount: '2 tbsp' },
      { name: 'Garlic powder', amount: '1 tbsp' },
      { name: 'Onion powder', amount: '1 tbsp' },
      { name: 'Cumin', amount: '1 tsp' },
      { name: 'Cayenne pepper', amount: '½ tsp' },
      { name: 'Salt & black pepper', amount: '2 tbsp' },
      { name: 'BBQ sauce', amount: '250 ml' },
      { name: 'Apple cider vinegar', amount: '60 ml' },
    ],
    steps: [
      'Mix all dry spices into a rub. Coat pork generously, massaging into all surfaces.',
      'Refrigerate overnight if possible, or at least 2 hours.',
      'Preheat oven to 150 °C. Place pork in a roasting tin with 250 ml water at the bottom.',
      'Cover tightly with foil and roast for 3–4 hours until fork-tender.',
      'Remove foil, raise oven to 220 °C and roast 20 more minutes for a crust.',
      'Rest pork 20 minutes, then pull apart with two forks.',
      'Toss pulled meat with BBQ sauce and a splash of apple cider vinegar. Serve in buns.',
    ],
    nutrition: { calories: 640, protein: 48, carbs: 28, fat: 36, fiber: 2 },
  },
  {
    id: 12,
    title: 'Shakshuka',
    cuisine: 'Mediterranean',
    description: 'Eggs poached in a spiced tomato-pepper sauce with feta, herbs and crusty bread for dipping.',
    image: 'https://images.unsplash.com/photo-1590412200988-a436970781fa?w=600&q=80',
    time: 30,
    servings: 2,
    difficulty: 'Easy',
    ingredients: [
      { name: 'Eggs', amount: '4' },
      { name: 'Crushed tomatoes', amount: '400 g' },
      { name: 'Red bell pepper, diced', amount: '1' },
      { name: 'Yellow onion, diced', amount: '1' },
      { name: 'Garlic, minced', amount: '3 cloves' },
      { name: 'Cumin', amount: '1 tsp' },
      { name: 'Smoked paprika', amount: '1 tsp' },
      { name: 'Chilli flakes', amount: '½ tsp' },
      { name: 'Feta, crumbled', amount: '60 g' },
      { name: 'Fresh parsley or coriander', amount: 'handful' },
      { name: 'Olive oil', amount: '2 tbsp' },
    ],
    steps: [
      'Heat olive oil in a wide skillet. Sauté onion and pepper until soft, about 8 minutes.',
      'Add garlic, cumin, paprika and chilli flakes. Cook 1 minute until fragrant.',
      'Pour in crushed tomatoes. Simmer 10 minutes, season with salt.',
      'Make 4 wells in the sauce and crack an egg into each.',
      'Cover and cook on low heat for 6–8 minutes until whites are set but yolks still runny.',
      'Scatter over feta and fresh herbs. Serve directly from the pan with crusty bread.',
    ],
    nutrition: { calories: 320, protein: 18, carbs: 24, fat: 18, fiber: 6 },
  },
];

// ── State ────────────────────────────────────────────────────────
let state = {
  filter: 'all',
  search: '',
  sort: 'default',
  activeRecipe: null,
  checkedIngredients: [],
  completedSteps: [],
  favorites: loadFavorites(),
};

// ── localStorage helpers ─────────────────────────────────────────
function loadFavorites() {
  try {
    return JSON.parse(localStorage.getItem('rv_favorites') || '[]');
  } catch { return []; }
}

function saveFavorites() {
  localStorage.setItem('rv_favorites', JSON.stringify(state.favorites));
}

// ── Init ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderGrid();
  updateFavBadge();
  renderFavPanel();
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
});

// ── Filtering & sorting helpers ───────────────────────────────────
function getFilteredSorted() {
  let list = [...RECIPES];

  // cuisine filter
  if (state.filter !== 'all') {
    list = list.filter(r => r.cuisine === state.filter);
  }

  // search
  if (state.search) {
    const q = state.search.toLowerCase();
    list = list.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.cuisine.toLowerCase().includes(q) ||
      r.ingredients.some(i => i.name.toLowerCase().includes(q))
    );
  }

  // sort
  const diff = { Easy: 0, Medium: 1, Hard: 2 };
  switch (state.sort) {
    case 'name-asc':        list.sort((a, b) => a.title.localeCompare(b.title)); break;
    case 'time-asc':        list.sort((a, b) => a.time - b.time); break;
    case 'time-desc':       list.sort((a, b) => b.time - a.time); break;
    case 'difficulty-asc':  list.sort((a, b) => diff[a.difficulty] - diff[b.difficulty]); break;
    case 'difficulty-desc': list.sort((a, b) => diff[b.difficulty] - diff[a.difficulty]); break;
  }

  return list;
}

// ── Render grid ───────────────────────────────────────────────────
function renderGrid() {
  const grid  = document.getElementById('recipeGrid');
  const empty = document.getElementById('emptyState');
  const count = document.getElementById('resultsCount');
  const list  = getFilteredSorted();

  count.textContent = list.length === 0
    ? 'No recipes found'
    : list.length === 1
    ? 'Showing 1 recipe'
    : `Showing ${list.length} recipe${list.length !== RECIPES.length ? ' of ' + RECIPES.length : 's'}`;

  if (list.length === 0) {
    grid.innerHTML = '';
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  grid.innerHTML = list.map(r => cardHTML(r)).join('');
}

function cardHTML(r) {
  const isFav = state.favorites.includes(r.id);
  const diffClass = r.difficulty.toLowerCase();
  const timeLabel = r.time >= 60
    ? `${Math.floor(r.time / 60)}h${r.time % 60 ? ' ' + (r.time % 60) + 'm' : ''}`
    : `${r.time} min`;

  return `
    <article class="recipe-card" role="listitem" onclick="openModal(${r.id})" aria-label="${esc(r.title)}">
      <div class="card-img-wrap">
        <img
          class="card-img"
          src="${r.image}"
          alt="${esc(r.title)}"
          loading="lazy"
          onerror="this.src='https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=600&q=80'"
        />
        <span class="card-cuisine">${esc(r.cuisine)}</span>
        <button
          class="card-fav-btn ${isFav ? 'active' : ''}"
          onclick="event.stopPropagation(); toggleFav(${r.id}, this)"
          aria-label="${isFav ? 'Remove from favorites' : 'Add to favorites'}"
          title="${isFav ? 'Remove from favorites' : 'Add to favorites'}"
        >${isFav ? '❤️' : '🤍'}</button>
      </div>
      <div class="card-body">
        <h3 class="card-title">${esc(r.title)}</h3>
        <p class="card-desc">${esc(r.description)}</p>
        <div class="card-meta">
          <span class="meta-item"><span class="meta-icon">⏱</span>${timeLabel}</span>
          <span class="meta-item"><span class="meta-icon">👤</span>${r.servings}</span>
          <span class="difficulty-badge ${diffClass}">${esc(r.difficulty)}</span>
        </div>
      </div>
    </article>`;
}

// ── XSS guard ────────────────────────────────────────────────────
function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── Search ────────────────────────────────────────────────────────
function handleSearch() {
  const input = document.getElementById('searchInput');
  const clear = document.getElementById('searchClear');
  state.search = input.value.trim();
  clear.classList.toggle('visible', state.search.length > 0);
  renderGrid();
}

function clearSearch() {
  document.getElementById('searchInput').value = '';
  state.search = '';
  document.getElementById('searchClear').classList.remove('visible');
  renderGrid();
}

// ── Filter chips ──────────────────────────────────────────────────
function setFilter(cuisine, btn) {
  state.filter = cuisine;
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  renderGrid();
}

function resetFilters() {
  state.filter = 'all';
  state.search = '';
  state.sort   = 'default';
  document.getElementById('searchInput').value = '';
  document.getElementById('sortSelect').value  = 'default';
  document.getElementById('searchClear').classList.remove('visible');
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  document.querySelector('.chip[data-cuisine="all"]').classList.add('active');
  renderGrid();
}

// ── Sort ──────────────────────────────────────────────────────────
function handleSort() {
  state.sort = document.getElementById('sortSelect').value;
  renderGrid();
}

// ── Favorites ────────────────────────────────────────────────────
function toggleFav(id, btn) {
  const idx = state.favorites.indexOf(id);
  const recipe = RECIPES.find(r => r.id === id);
  if (idx === -1) {
    state.favorites.push(id);
    if (btn) { btn.textContent = '❤️'; btn.classList.add('active'); btn.setAttribute('aria-label', 'Remove from favorites'); }
    showToast(`❤️ "${recipe.title}" saved!`);
  } else {
    state.favorites.splice(idx, 1);
    if (btn) { btn.textContent = '🤍'; btn.classList.remove('active'); btn.setAttribute('aria-label', 'Add to favorites'); }
    showToast(`Removed "${recipe.title}" from favorites`);
  }
  saveFavorites();
  updateFavBadge();
  renderFavPanel();
}

function toggleFavFromModal() {
  if (!state.activeRecipe) return;
  const id = state.activeRecipe.id;

  // Update state and storage
  const idx = state.favorites.indexOf(id);
  if (idx === -1) {
    state.favorites.push(id);
    saveFavorites();
    showToast(`❤️ "${state.activeRecipe.title}" saved!`);
  } else {
    state.favorites.splice(idx, 1);
    saveFavorites();
    showToast(`Removed "${state.activeRecipe.title}" from favorites`);
  }

  updateFavBadge();
  renderFavPanel();
  syncModalFavBtn();

  // Sync the card heart in the grid
  const cardBtn = document.querySelector(`.recipe-card [onclick*="toggleFav(${id}"]`);
  if (cardBtn) {
    const isFav = state.favorites.includes(id);
    cardBtn.textContent = isFav ? '❤️' : '🤍';
    cardBtn.classList.toggle('active', isFav);
  }
}

function syncModalFavBtn() {
  if (!state.activeRecipe) return;
  const isFav = state.favorites.includes(state.activeRecipe.id);
  const btn  = document.getElementById('modalFavBtn');
  document.getElementById('modalFavIcon').textContent = isFav ? '❤️' : '🤍';
  document.getElementById('modalFavText').textContent = isFav ? 'Remove from Favorites' : 'Save to Favorites';
  btn.classList.toggle('saved', isFav);
}

function updateFavBadge() {
  document.getElementById('favCountBadge').textContent = state.favorites.length;
}

function renderFavPanel() {
  const list  = document.getElementById('favList');
  const empty = document.getElementById('favEmpty');
  const favs  = RECIPES.filter(r => state.favorites.includes(r.id));

  if (favs.length === 0) {
    list.innerHTML = '';
    list.style.display = 'none';
    empty.style.display = 'flex';
    return;
  }
  empty.style.display = 'none';
  list.style.display  = 'flex';

  list.innerHTML = favs.map(r => `
    <div class="fav-item" onclick="openModal(${r.id})" role="listitem" tabindex="0">
      <img class="fav-item-img" src="${r.image}" alt="${esc(r.title)}" loading="lazy"
           onerror="this.src='https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=600&q=80'" />
      <div class="fav-item-info">
        <div class="fav-item-name">${esc(r.title)}</div>
        <div class="fav-item-meta">⏱ ${r.time} min · ${esc(r.difficulty)}</div>
      </div>
      <button class="fav-item-remove" onclick="event.stopPropagation(); removeFavFromPanel(${r.id})"
              aria-label="Remove ${esc(r.title)} from favorites">✕</button>
    </div>
  `).join('');
}

function removeFavFromPanel(id) {
  state.favorites = state.favorites.filter(f => f !== id);
  saveFavorites();
  updateFavBadge();
  renderFavPanel();
  const recipe = RECIPES.find(r => r.id === id);
  showToast(`Removed "${recipe.title}" from favorites`);
  renderGrid();
}

// ── Favorites Side Panel ─────────────────────────────────────────
function toggleFavoritesView() {
  const panel   = document.getElementById('favPanel');
  const overlay = document.getElementById('panelOverlay');
  const isOpen  = panel.classList.toggle('open');
  overlay.classList.toggle('visible', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

// ── Modal ────────────────────────────────────────────────────────
function openModal(id) {
  const recipe = RECIPES.find(r => r.id === id);
  if (!recipe) return;

  state.activeRecipe        = recipe;
  state.checkedIngredients  = [];
  state.completedSteps      = [];

  // Close favorites panel if open
  const panel = document.getElementById('favPanel');
  if (panel.classList.contains('open')) toggleFavoritesView();

  // Populate header
  document.getElementById('modalImg').src              = recipe.image;
  document.getElementById('modalImg').alt              = recipe.title;
  document.getElementById('modalCuisine').textContent  = recipe.cuisine;
  document.getElementById('modalTitle').textContent    = recipe.title;

  const timeLabel = recipe.time >= 60
    ? `⏱ ${Math.floor(recipe.time / 60)}h${recipe.time % 60 ? ' ' + recipe.time % 60 + 'm' : ''}`
    : `⏱ ${recipe.time} min`;
  document.getElementById('modalTime').textContent       = timeLabel;
  document.getElementById('modalDifficulty').textContent = `${diffEmoji(recipe.difficulty)} ${recipe.difficulty}`;
  document.getElementById('modalServings').textContent   = `👤 ${recipe.servings} servings`;

  // Tabs — reset to ingredients
  switchTab('ingredients', document.querySelector('.tab-btn[data-tab="ingredients"]'));

  // Ingredients
  renderIngredients(recipe);

  // Instructions
  renderSteps(recipe);

  // Nutrition
  renderNutrition(recipe);

  // Fav button
  syncModalFavBtn();

  // Show modal
  document.getElementById('modalBackdrop').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function diffEmoji(d) {
  return d === 'Easy' ? '🟢' : d === 'Medium' ? '🟡' : '🔴';
}

function closeModal() {
  document.getElementById('modalBackdrop').classList.remove('open');
  document.body.style.overflow = '';
  state.activeRecipe = null;
}

function handleBackdropClick(e) {
  if (e.target === document.getElementById('modalBackdrop')) closeModal();
}

// ── Tabs ─────────────────────────────────────────────────────────
function switchTab(tabId, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const pane = document.getElementById(`tab-${tabId}`);
  if (pane) pane.classList.add('active');
}

// ── Ingredient Checklist ─────────────────────────────────────────
function renderIngredients(recipe) {
  const ul = document.getElementById('ingredientList');
  ul.innerHTML = recipe.ingredients.map((ing, i) => `
    <li class="ingredient-item" onclick="toggleIngredient(${i})" id="ing-${i}" tabindex="0"
        role="checkbox" aria-checked="false" aria-label="${esc(ing.name)}">
      <span class="ing-checkbox"></span>
      <span class="ing-name">${esc(ing.name)}</span>
      <span class="ing-amount">${esc(ing.amount)}</span>
    </li>
  `).join('');
}

function toggleIngredient(i) {
  const el  = document.getElementById(`ing-${i}`);
  const idx = state.checkedIngredients.indexOf(i);
  if (idx === -1) {
    state.checkedIngredients.push(i);
    el.classList.add('checked');
    el.setAttribute('aria-checked', 'true');
  } else {
    state.checkedIngredients.splice(idx, 1);
    el.classList.remove('checked');
    el.setAttribute('aria-checked', 'false');
  }
}

function toggleCheckAll() {
  if (!state.activeRecipe) return;
  const total = state.activeRecipe.ingredients.length;
  const allChecked = state.checkedIngredients.length === total;

  state.checkedIngredients = allChecked ? [] : Array.from({ length: total }, (_, i) => i);

  state.activeRecipe.ingredients.forEach((_, i) => {
    const el = document.getElementById(`ing-${i}`);
    if (!el) return;
    if (!allChecked) {
      el.classList.add('checked');
      el.setAttribute('aria-checked', 'true');
    } else {
      el.classList.remove('checked');
      el.setAttribute('aria-checked', 'false');
    }
  });

  document.querySelector('.check-all-btn').textContent = allChecked ? 'Check all' : 'Uncheck all';
}

// ── Step-by-step Instructions ────────────────────────────────────
function renderSteps(recipe) {
  const ol = document.getElementById('stepList');
  ol.innerHTML = recipe.steps.map((step, i) => `
    <li class="step-item" onclick="toggleStep(${i})" id="step-${i}" tabindex="0"
        role="checkbox" aria-checked="false">
      <span class="step-num">${i + 1}</span>
      <span class="step-text">${esc(step)}</span>
    </li>
  `).join('');
  updateStepProgress();
}

function toggleStep(i) {
  const el  = document.getElementById(`step-${i}`);
  const idx = state.completedSteps.indexOf(i);
  if (idx === -1) {
    state.completedSteps.push(i);
    el.classList.add('done');
    el.setAttribute('aria-checked', 'true');
    // Remove the number text so the CSS ::before "✓" shows
    el.querySelector('.step-num').textContent = '';
  } else {
    state.completedSteps.splice(idx, 1);
    el.classList.remove('done');
    el.setAttribute('aria-checked', 'false');
    el.querySelector('.step-num').textContent = i + 1;
  }
  updateStepProgress();
}

function updateStepProgress() {
  if (!state.activeRecipe) return;
  const total = state.activeRecipe.steps.length;
  const done  = state.completedSteps.length;
  document.getElementById('stepProgress').textContent = `${done} / ${total} done`;
}

// ── Nutrition ─────────────────────────────────────────────────────
function renderNutrition(recipe) {
  const n = recipe.nutrition;
  const items = [
    { label: 'Calories', value: n.calories, unit: 'kcal' },
    { label: 'Protein',  value: n.protein,  unit: 'g' },
    { label: 'Carbs',    value: n.carbs,    unit: 'g' },
    { label: 'Fat',      value: n.fat,      unit: 'g' },
    { label: 'Fiber',    value: n.fiber,    unit: 'g' },
  ];
  document.getElementById('nutritionGrid').innerHTML = items.map(it => `
    <div class="nutrition-item">
      <span class="nutrition-value">${it.value}</span>
      <span class="nutrition-unit">${it.unit}</span>
      <span class="nutrition-label">${it.label}</span>
    </div>
  `).join('');
}

// ── Toast ─────────────────────────────────────────────────────────
let _toastTimer;
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}
