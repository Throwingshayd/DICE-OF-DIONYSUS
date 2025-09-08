/**
 * Game State Manager - Handles all game states and transitions
 * Based on Balatro's state system
 */
class GameState {
    constructor() {
        // Game states (based on Balatro's STATES)
        this.STATES = {
            MENU: 'menu',
            BLIND_SELECT: 'blind_select',
            SELECTING_HAND: 'selecting_hand',
            HAND_PLAYED: 'hand_played',
            DRAW_TO_HAND: 'draw_to_hand',
            NEW_ROUND: 'new_round',
            ROUND_EVAL: 'round_eval',
            SHOP: 'shop',
            CASH_OUT: 'cash_out',
            GAME_OVER: 'game_over',
            PAUSED: 'paused',
            TUTORIAL: 'tutorial'
        };

        // Game stages
        this.STAGES = {
            MAIN_MENU: 'main_menu',
            RUN: 'run',
            GAME_OVER: 'game_over'
        };

        // Current state and stage
        this.currentState = this.STATES.MENU;
        this.currentStage = this.STAGES.MAIN_MENU;
        this.previousState = null;
        this.stateTimer = 0;
        this.stateStartTime = 0;

        // State transition queue
        this.stateQueue = [];
        this.transitioning = false;

        // State callbacks
        this.stateCallbacks = {
            enter: {},
            exit: {},
            update: {}
        };

        // Game data
        this.gameData = {
            score: 0,
            favour: 0,
            round: 1,
            dice: [],
            jokers: [],
            libations: [],
            worshipLevels: {},
            hasRolled: false,
            selectedDice: [],
            scoringCategory: null
        };

        // Cash out data
        this.cashOutData = {
            currentScore: 0,
            currentFavour: 0,
            totalEarned: 0,
            roundBonus: 0,
            jokerBonus: 0,
            worshipBonus: 0,
            showCashOut: false
        };

        // UI state
        this.uiState = {
            showScore: false,
            showFavour: false,
            showPantheon: false,
            showShop: false,
            showTutorial: false,
            showCashOut: false
        };

        // Animation state
        this.animationState = {
            animating: false,
            animationQueue: [],
            currentAnimation: null
        };

        // Settings
        this.settings = {
            soundEnabled: true,
            musicEnabled: true,
            tutorialEnabled: true,
            autoSave: true
        };

        // Statistics
        this.statistics = {
            totalGames: 0,
            totalScore: 0,
            bestScore: 0,
            totalFavour: 0,
            roundsPlayed: 0,
            totalCashOuts: 0,
            totalCashOutValue: 0
        };
    }

    /**
     * Initialize the game state
     */
    initialize() {
        this.setState(this.STATES.MENU);
        this.loadSettings();
        this.loadStatistics();
    }

    /**
     * Set the current game state
     * @param {string} newState - New state to set
     * @param {Object} options - State transition options
     */
    setState(newState, options = {}) {
        if (!this.STATES[newState] && !Object.values(this.STATES).includes(newState)) {
            console.error(`Invalid state: ${newState}`);
            return;
        }

        const oldState = this.currentState;
        this.previousState = oldState;
        this.currentState = newState;
        this.stateStartTime = Date.now();
        this.stateTimer = 0;

        // Call exit callback for old state
        if (this.stateCallbacks.exit[oldState]) {
            this.stateCallbacks.exit[oldState](newState, options);
        }

        // Call enter callback for new state
        if (this.stateCallbacks.enter[newState]) {
            this.stateCallbacks.enter[newState](oldState, options);
        }

        // Update stage if needed
        this.updateStage();

        console.log(`State changed: ${oldState} -> ${newState}`);
    }

    /**
     * Queue a state transition
     * @param {string} newState - New state to transition to
     * @param {Object} options - Transition options
     */
    queueState(newState, options = {}) {
        this.stateQueue.push({ state: newState, options });
    }

    /**
     * Process state queue
     */
    processStateQueue() {
        if (this.stateQueue.length > 0 && !this.transitioning) {
            const nextState = this.stateQueue.shift();
            this.setState(nextState.state, nextState.options);
        }
    }

    /**
     * Update the current state
     * @param {number} dt - Delta time
     */
    update(dt) {
        this.stateTimer += dt;

        // Call update callback for current state
        if (this.stateCallbacks.update[this.currentState]) {
            this.stateCallbacks.update[this.currentState](dt);
        }

        // Process state queue
        this.processStateQueue();
    }

    /**
     * Update the current stage based on state
     */
    updateStage() {
        switch (this.currentState) {
            case this.STATES.MENU:
                this.currentStage = this.STAGES.MAIN_MENU;
                break;
            case this.STATES.GAME_OVER:
            case this.STATES.CASH_OUT:
                this.currentStage = this.STAGES.GAME_OVER;
                break;
            default:
                this.currentStage = this.STAGES.RUN;
                break;
        }
    }

    /**
     * Register a state callback
     * @param {string} state - State name
     * @param {string} type - Callback type ('enter', 'exit', 'update')
     * @param {Function} callback - Callback function
     */
    registerStateCallback(state, type, callback) {
        if (!this.stateCallbacks[type]) {
            console.error(`Invalid callback type: ${type}`);
            return;
        }
        this.stateCallbacks[type][state] = callback;
    }

    /**
     * Get current state
     * @returns {string} Current state
     */
    getCurrentState() {
        return this.currentState;
    }

    /**
     * Get current stage
     * @returns {string} Current stage
     */
    getCurrentStage() {
        return this.currentStage;
    }

    /**
     * Check if current state matches
     * @param {string} state - State to check
     * @returns {boolean} Whether states match
     */
    isState(state) {
        return this.currentState === state;
    }

    /**
     * Check if current stage matches
     * @param {string} stage - Stage to check
     * @returns {boolean} Whether stages match
     */
    isStage(stage) {
        return this.currentStage === stage;
    }

    /**
     * Get state timer
     * @returns {number} Time in current state
     */
    getStateTimer() {
        return this.stateTimer;
    }

    /**
     * Update game data
     * @param {Object} data - Data to update
     */
    updateGameData(data) {
        Object.assign(this.gameData, data);
    }

    /**
     * Get game data
     * @returns {Object} Game data
     */
    getGameData() {
        return { ...this.gameData };
    }

    /**
     * Update cash out data
     * @param {Object} data - Cash out data to update
     */
    updateCashOutData(data) {
        Object.assign(this.cashOutData, data);
    }

    /**
     * Get cash out data
     * @returns {Object} Cash out data
     */
    getCashOutData() {
        return { ...this.cashOutData };
    }

    /**
     * Calculate cash out value
     * @param {Object} gameState - Current game state
     * @returns {Object} Cash out calculation
     */
    calculateCashOut(gameState) {
        const baseScore = gameState.totalScore || 0;
        const baseFavour = gameState.gold || 0;
        const roundBonus = Math.floor(baseScore * 0.1); // 10% round bonus
        const jokerBonus = (gameState.jokers?.length || 0) * 50; // 50 per joker
        const worshipBonus = Object.values(gameState.worshipLevels || {}).reduce((sum, level) => sum + level * 25, 0); // 25 per worship level

        const totalEarned = baseScore + baseFavour + roundBonus + jokerBonus + worshipBonus;

        return {
            currentScore: baseScore,
            currentFavour: baseFavour,
            totalEarned: totalEarned,
            roundBonus: roundBonus,
            jokerBonus: jokerBonus,
            worshipBonus: worshipBonus
        };
    }

    /**
     * Show cash out screen
     * @param {Object} gameState - Current game state
     */
    showCashOut(gameState) {
        const cashOutCalc = this.calculateCashOut(gameState);
        this.updateCashOutData(cashOutCalc);
        this.updateUIState({ showCashOut: true });
        this.setState(this.STATES.CASH_OUT);
    }

    /**
     * Execute cash out
     * @param {Object} gameState - Current game state
     */
    executeCashOut(gameState) {
        const cashOutData = this.getCashOutData();
        
        // Update statistics
        this.statistics.totalCashOuts++;
        this.statistics.totalCashOutValue += cashOutData.totalEarned;
        
        // Play cash out sound
        if (window.musicManager) {
            window.musicManager.playSound('coin');
        }
        
        // Add cash out animation event
        if (window.gameEngine && window.gameEngine.getEventManager()) {
            window.gameEngine.getEventManager().addEvent({
                trigger: 'immediate',
                func: () => {
                    this.animateCashOut();
                    return true;
                }
            });
        }
        
        // Transition to game over
        setTimeout(() => {
            this.setState(this.STATES.GAME_OVER);
        }, 2000);
    }

    /**
     * Animate cash out
     */
    animateCashOut() {
        const cashOutOverlay = document.getElementById('cashOutOverlay');
        if (cashOutOverlay) {
            cashOutOverlay.classList.add('cash-out-animating');
            
            // Add coin animation
            const coins = document.createElement('div');
            coins.className = 'cash-out-coins';
            cashOutOverlay.appendChild(coins);
            
            setTimeout(() => {
                cashOutOverlay.classList.remove('cash-out-animating');
                if (coins.parentNode) {
                    coins.parentNode.removeChild(coins);
                }
            }, 2000);
        }
    }

    /**
     * Update UI state
     * @param {Object} uiState - UI state to update
     */
    updateUIState(uiState) {
        Object.assign(this.uiState, uiState);
    }

    /**
     * Get UI state
     * @returns {Object} UI state
     */
    getUIState() {
        return { ...this.uiState };
    }

    /**
     * Add animation to queue
     * @param {Object} animation - Animation object
     */
    queueAnimation(animation) {
        this.animationState.animationQueue.push(animation);
    }

    /**
     * Update animation state
     * @param {number} dt - Delta time
     */
    updateAnimation(dt) {
        if (this.animationState.currentAnimation) {
            // Update current animation
            const result = this.animationState.currentAnimation.update(dt);
            if (result.complete) {
                this.animationState.currentAnimation = null;
                this.animationState.animating = false;
            }
        } else if (this.animationState.animationQueue.length > 0) {
            // Start next animation
            this.animationState.currentAnimation = this.animationState.animationQueue.shift();
            this.animationState.animating = true;
        }
    }

    /**
     * Save game state
     */
    saveGame() {
        if (!this.settings.autoSave) return;

        const saveData = {
            gameData: this.gameData,
            cashOutData: this.cashOutData,
            settings: this.settings,
            statistics: this.statistics,
            timestamp: Date.now()
        };

        try {
            localStorage.setItem('diceOfDionysus_save', JSON.stringify(saveData));
        } catch (error) {
            console.error('Failed to save game:', error);
        }
    }

    /**
     * Load game state
     */
    loadGame() {
        try {
            const saveData = localStorage.getItem('diceOfDionysus_save');
            if (saveData) {
                const data = JSON.parse(saveData);
                this.gameData = data.gameData || this.gameData;
                this.cashOutData = data.cashOutData || this.cashOutData;
                this.settings = data.settings || this.settings;
                this.statistics = data.statistics || this.statistics;
                return true;
            }
        } catch (error) {
            console.error('Failed to load game:', error);
        }
        return false;
    }

    /**
     * Save settings
     */
    saveSettings() {
        try {
            localStorage.setItem('diceOfDionysus_settings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }

    /**
     * Load settings
     */
    loadSettings() {
        try {
            const settingsData = localStorage.getItem('diceOfDionysus_settings');
            if (settingsData) {
                this.settings = { ...this.settings, ...JSON.parse(settingsData) };
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }

    /**
     * Save statistics
     */
    saveStatistics() {
        try {
            localStorage.setItem('diceOfDionysus_statistics', JSON.stringify(this.statistics));
        } catch (error) {
            console.error('Failed to save statistics:', error);
        }
    }

    /**
     * Load statistics
     */
    loadStatistics() {
        try {
            const statsData = localStorage.getItem('diceOfDionysus_statistics');
            if (statsData) {
                this.statistics = { ...this.statistics, ...JSON.parse(statsData) };
            }
        } catch (error) {
            console.error('Failed to load statistics:', error);
        }
    }

    /**
     * Reset game data
     */
    resetGame() {
        this.gameData = {
            score: 0,
            favour: 0,
            round: 1,
            dice: [],
            jokers: [],
            libations: [],
            worshipLevels: {},
            hasRolled: false,
            selectedDice: [],
            scoringCategory: null
        };
        
        this.cashOutData = {
            currentScore: 0,
            currentFavour: 0,
            totalEarned: 0,
            roundBonus: 0,
            jokerBonus: 0,
            worshipBonus: 0,
            showCashOut: false
        };
    }

    /**
     * Start new game
     */
    startNewGame() {
        this.resetGame();
        this.statistics.totalGames++;
        this.setState(this.STATES.BLIND_SELECT);
    }

    /**
     * End current game
     */
    endGame() {
        // Update statistics
        this.statistics.totalScore += this.gameData.score;
        this.statistics.totalFavour += this.gameData.favour;
        this.statistics.roundsPlayed += this.gameData.round;
        
        if (this.gameData.score > this.statistics.bestScore) {
            this.statistics.bestScore = this.gameData.score;
        }

        this.saveStatistics();
        this.setState(this.STATES.GAME_OVER);
    }

    /**
     * Pause game
     */
    pauseGame() {
        if (this.currentState !== this.STATES.PAUSED) {
            this.setState(this.STATES.PAUSED);
        }
    }

    /**
     * Resume game
     */
    resumeGame() {
        if (this.currentState === this.STATES.PAUSED) {
            this.setState(this.previousState || this.STATES.SELECTING_HAND);
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameState;
} else {
    window.GameState = GameState;
}
