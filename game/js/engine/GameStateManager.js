/**
 * GameStateManager — high-level UI mode (MENU | ROUND | SHOP | BLIND_SELECT)
 * Authoritative run state lives in GameEngine.state, not here.
 * @module GameStateManager
 */

const GAME_STATES = {
    MENU: 'MENU',
    ROUND: 'ROUND',
    SHOP: 'SHOP',
    BLIND_SELECT: 'BLIND_SELECT'
};

const GameStateManager = {
    currentState: GAME_STATES.MENU,
    previousState: null,
    listeners: [],

    /**
     * Transition to a new state
     * @param {string} newState - One of GAME_STATES
     */
    setState(newState) {
        if (!Object.values(GAME_STATES).includes(newState)) {
            Logger?.warn?.('GameStateManager: Invalid state', newState);
            return;
        }
        this.previousState = this.currentState;
        this.currentState = newState;
        this._notifyListeners();
        Logger?.debug?.(`GameState: ${this.previousState} → ${newState}`);
    },

    getState() {
        return this.currentState;
    },

    isRound() {
        return this.currentState === GAME_STATES.ROUND;
    },

    isShop() {
        return this.currentState === GAME_STATES.SHOP;
    },

    isBlindSelect() {
        return this.currentState === GAME_STATES.BLIND_SELECT;
    },

    isMenu() {
        return this.currentState === GAME_STATES.MENU;
    },

    /**
     * Subscribe to state changes (for Stage swap, etc.)
     * @param {Function} cb - (newState, prevState) => void
     * @returns {Function} Unsubscribe
     */
    subscribe(cb) {
        this.listeners.push(cb);
        return () => {
            this.listeners = this.listeners.filter(l => l !== cb);
        };
    },

    _notifyListeners() {
        this.listeners.forEach(cb => {
            try {
                cb(this.currentState, this.previousState);
            } catch (e) {
                Logger?.error?.('GameStateManager listener error', e);
            }
        });
    }
};

if (typeof window !== 'undefined') {
    window.GAME_STATES = GAME_STATES;
    window.GameStateManager = GameStateManager;
}
