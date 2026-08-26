/* ═══════════════════════════════════════════
   MODERN STATE MANAGEMENT
   Reactive store pattern (2024 recommended approach)
   ═══════════════════════════════════════════ */

'use strict';

/**
 * createStore: Minimal reactive state manager
 * 
 * Modern pattern benefits:
 * ✓ Centralized state (single source of truth)
 * ✓ Explicit mutations via actions (not direct mutations)
 * ✓ Automatic persistence to localStorage
 * ✓ Reactive subscriptions (listeners for changes)
 * ✓ DevTools-friendly (state history tracking)
 * 
 * Why this replaces the old pattern:
 * ✗ OLD: Direct mutation (let friends = [...])
 * ✓ NEW: Actions (store.addFriend(), store.removeFriend())
 * 
 * ✗ OLD: Scattered persistence calls (saveFriends() everywhere)
 * ✓ NEW: Automatic sync (mutation triggers persistence)
 * 
 * ✗ OLD: Manual synchronization with DOM
 * ✓ NEW: Subscribe to state changes, declarative updates
 */

function createStore(initialState, options = {}) {
  const { storageKey = null, onMutate = null } = options;
  
  let state = { ...initialState };
  const subscribers = new Set();

  /**
   * notify: Trigger all subscribers when state changes
   * This is the reactive part - UI listens and re-renders
   */
  function notify(mutationName, oldState, newState) {
    subscribers.forEach(cb => cb({ mutationName, oldState, newState }));
  }

  /**
   * commit: Pure mutation function
   * All state changes go through here (no direct mutations)
   */
  function commit(mutationName, mutationFn) {
    const oldState = JSON.parse(JSON.stringify(state));
    mutationFn(state);
    const newState = JSON.parse(JSON.stringify(state));

    // Dev hook for logging/debugging
    if (onMutate) onMutate({ mutationName, oldState, newState });

    // Persist to localStorage if configured
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(state));
      } catch (err) {
        console.error('[Store] Failed to persist:', err);
      }
    }

    // Notify subscribers (drives UI updates)
    notify(mutationName, oldState, newState);
  }

  /**
   * subscribe: Listen for state changes
   * Returns unsubscribe function for cleanup
   */
  function subscribe(callback) {
    subscribers.add(callback);
    // Return unsubscribe function
    return () => subscribers.delete(callback);
  }

  /**
   * getState: Immutable read-only snapshot
   */
  function getState() {
    return JSON.parse(JSON.stringify(state));
  }

  return {
    commit,
    subscribe,
    getState,
    // Direct access for read-only usage (not mutations)
    get state() {
      return state;
    }
  };
}

/**
 * birthdayStore: Application state + actions
 * 
 * Modern API design:
 * - State is immutable (read via getState())
 * - All mutations are named actions (self-documenting)
 * - Persistence is automatic (no manual saveFriends() calls)
 */

const birthdayStore = createStore(
  // Initial state
  {
    friends: [],
    uiState: {
      currentCardFriend: null,
      pendingDeleteId: null,
      currentTheme: 'pink',
      searchQuery: '',
      filterWindow: 'all'
    }
  },
  // Options
  {
    storageKey: 'birthdayRemind_v2',
    onMutate: (info) => {
      // Uncomment for debugging:
      // console.log(`[Mutation] ${info.mutationName}`, info.oldState, '->', info.newState);
    }
  }
);

/**
 * ACTIONS: Public API for mutations
 * These are the only way to change state
 * (This is the key difference from the old pattern)
 */

const store = {
  /**
   * addFriend: Create new friend
   * @param {string} name
   * @param {string} birthday - YYYY-MM-DD format
   * @param {string} note - optional
   * @returns {string} - new friend ID
   */
  addFriend(name, birthday, note = '') {
    const newId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    birthdayStore.commit('addFriend', (state) => {
      state.friends.push({
        id: newId,
        name: name.trim(),
        birthday,
        note: note.trim()
      });
    });
    return newId;
  },

  /**
   * removeFriend: Delete friend by ID
   */
  removeFriend(friendId) {
    birthdayStore.commit('removeFriend', (state) => {
      state.friends = state.friends.filter(f => f.id !== friendId);
    });
  },

  /**
   * updateFriend: Modify friend data
   */
  updateFriend(friendId, updates) {
    birthdayStore.commit('updateFriend', (state) => {
      const friend = state.friends.find(f => f.id === friendId);
      if (friend) {
        Object.assign(friend, updates);
      }
    });
  },

  /**
   * setCurrentCardFriend: Track which friend's card is being previewed
   */
  setCurrentCardFriend(friendId) {
    birthdayStore.commit('setCurrentCardFriend', (state) => {
      state.uiState.currentCardFriend = friendId;
    });
  },

  /**
   * setPendingDeleteId: Track which friend is pending deletion
   */
  setPendingDeleteId(friendId) {
    birthdayStore.commit('setPendingDeleteId', (state) => {
      state.uiState.pendingDeleteId = friendId;
    });
  },

  /**
   * setCurrentTheme: Update card theme
   */
  setCurrentTheme(themeName) {
    birthdayStore.commit('setCurrentTheme', (state) => {
      state.uiState.currentTheme = themeName;
    });
  },

  /**
   * setSearchQuery: Update search filter
   */
  setSearchQuery(query) {
    birthdayStore.commit('setSearchQuery', (state) => {
      state.uiState.searchQuery = query;
    });
  },

  /**
   * setFilterWindow: Update time window filter
   */
  setFilterWindow(window) {
    birthdayStore.commit('setFilterWindow', (state) => {
      state.uiState.filterWindow = window;
    });
  },

  /**
   * subscribe: Listen for any state change
   * @param {Function} callback - receives {mutationName, oldState, newState}
   * @returns {Function} - unsubscribe function
   */
  subscribe(callback) {
    return birthdayStore.subscribe(callback);
  },

  /**
   * getState: Read current state (immutable)
   */
  getState() {
    return birthdayStore.getState();
  },

  /**
   * getFriends: Get current friends list
   */
  getFriends() {
    return birthdayStore.state.friends;
  },

  /**
   * getFriend: Get single friend by ID
   */
  getFriend(friendId) {
    return birthdayStore.state.friends.find(f => f.id === friendId);
  },

  /**
   * getUIState: Get UI state
   */
  getUIState() {
    return birthdayStore.state.uiState;
  }
};

// Migration helper: Load old localStorage format (v1) if exists
(function migrateLegacyData() {
  try {
    const oldData = localStorage.getItem('birthdayRemind_v1');
    if (oldData && !localStorage.getItem('birthdayRemind_v2')) {
      const friends = JSON.parse(oldData);
      birthdayStore.commit('migrateLegacyData', (state) => {
        state.friends = friends;
      });
      console.log('[Store] Migrated', friends.length, 'friends from v1');
    }
  } catch (err) {
    console.error('[Store] Migration failed:', err);
  }
})();

Object.freeze(store);
