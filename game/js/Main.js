// Main application controller and entry point

class App {
    constructor() {
        this.currentScreen = 'start';
        this.game = null;
        this.uiManager = null;
        this.dataManager = null;
        this._collectionManager = null;  // Lazy: created on first showCollection()
        this.soundManager = null;
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }

    /** Lazy accessor for CollectionManager - only created when Anthology is opened */
    get collectionManager() {
        if (!this._collectionManager) {
            this._collectionManager = new CollectionManager();
        }
        return this._collectionManager;
    }

    initialize() {
        window.app = this;
        if (typeof Logger !== 'undefined') Logger.info('Initializing Dice of Dionysus...');
        
        // Initialize managers
        this.dataManager = new DataManager();
        this.uiManager = new UIManager();
        this.soundManager = window.soundManager;
        
        // Effect systems (BalatroEffects, JuiceIntegration) defer init to startGame() - only needed during gameplay
        
        // Make globally available
        window.dataManager = this.dataManager;
        window.uiManager = this.uiManager;
        
        // Initialize UI manager immediately (shop overlay exists in main HTML)
        this.uiManager.initialize();
        
        // Set up screen management
        this.setupScreens();
        this.setupGlobalEventListeners();
        
        // Apply saved settings (sound, auto-save)
        const s = this.dataManager?.getSettings?.() || {};
        this.applySoundSetting(s.soundEnabled !== false, s.musicVolume, s.sfxVolume);
        if (s.autoSave === false) this.stopAutoSave();
        
        // Register PWA ServiceWorker (HTTPS or localhost only)
        this.registerServiceWorker();
        
        // Show start screen
        this.showStartScreen();
        
        Logger.info('Game initialized successfully!');
    }

    setupScreens() {
        this.screens = {
            start: document.getElementById('startScreen'),
            collection: document.getElementById('collectionScreen'),
            game: document.getElementById('gameViewport')
        };
        
        // Ensure all screens start hidden except start
        Object.entries(this.screens).forEach(([name, screen]) => {
            if (name !== 'start') {
                screen.classList.add('hidden');
            }
        });
    }

    setupGlobalEventListeners() {
        // Use event delegation so buttons work even if DOM is replaced or created later
        document.addEventListener('click', (e) => {
            const el = e.target?.closest?.('button, [role="button"]');
            if (!el) return;
            switch (el.id) {
                case 'playButton': this.startGame(false); break;
                case 'continueButton': this.startGame(true); break;
                case 'collectionButton': this.showCollection(); break;
                case 'settingsButton': this.showSettings(); break;
                case 'backToStartButton': this.showStartScreen(); break;
                case 'returnToMenuBtn': this.saveAndShowPauseMenu(); break;
                case 'pauseSettingsBtn': this.showSettings(); break;
                case 'pauseExitBtn': this.exitToMenuFromPause(); break;
                case 'pauseResumeBtn': this.hidePauseMenu(); break;
                case 'settingsCloseBtn': this.hideSettings(); break;
            }
        });
        
        // Collection tabs
        this.setupCollectionTabs();
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        
        // Window events
        window.addEventListener('beforeunload', () => this.handleBeforeUnload());
        window.addEventListener('resize', () => this.handleResize());
        
        // Error handling
        window.addEventListener('error', (e) => this.handleError(e));
        window.addEventListener('unhandledrejection', (e) => this.handleUnhandledRejection(e));
        
        // Start music on any user interaction (Balatro: resume on click)
        document.addEventListener('click', () => {
            if (this.soundManager) this.soundManager.startOnInteraction();
        }, { once: true });
    }

    /** Balatro: G.FUNCS.options → overlay_menu with create_UIBox_settings */
    showSettings() {
        if (window.settingsOverlay) {
            window.settingsOverlay.show(() => {});
        }
    }

    hideSettings() {
        if (window.settingsOverlay) window.settingsOverlay.hide();
    }

    /** Register PWA ServiceWorker for offline support (HTTPS or localhost only) */
    registerServiceWorker() {
        if (!('serviceWorker' in navigator)) return;
        const isSecure = location.protocol === 'https:' || location.hostname === 'localhost';
        if (!isSecure) return;
        try {
            navigator.serviceWorker.register('js/pwa/ServiceWorker.js', { scope: './' })
                .then((reg) => {
                    if (typeof Logger !== 'undefined') Logger.info('ServiceWorker registered');
                })
                .catch((err) => {
                    if (typeof Logger !== 'undefined') Logger.warn('ServiceWorker registration failed:', err);
                });
        } catch (e) {
            if (typeof Logger !== 'undefined') Logger.warn('ServiceWorker registration error:', e);
        }
    }

    /**
     * Save run before showing pause menu (Balatro: save_run at checkpoints).
     * Ensures boons/consumables persist if user exits.
     */
    saveAndShowPauseMenu() {
        if (this.game?.canSave?.()) this.game.saveGame();
        this.showPauseMenu();
    }

    /** Balatro: overlay_menu — create pause menu with Run Info (G.UIDEF.run_info) */
    showPauseMenu() {
        if (this._pauseOverlay) {
            this._pauseOverlay.remove();
        }
        this._pauseOverlay = document.createElement('div');
        this._pauseOverlay.className = 'overlay settings-overlay-created';
        this._pauseOverlay.style.cssText = 'z-index: 10002;';
        this._pauseOverlay.id = 'pauseMenuOverlayDynamic';
        const gameState = this.game?.state ?? null;
        const runInfoContent = typeof RunInfoOverlay !== 'undefined'
            ? RunInfoOverlay.create(gameState)
            : null;
        this._pauseOverlay.innerHTML = `
            <div class="modal-content pause-menu-modal">
                <h2 class="shop-title">Menu</h2>
                <div class="pause-menu-buttons">
                    <button class="divine-button" id="pauseSettingsBtn">Settings</button>
                    <button class="divine-button" id="pauseExitBtn">Exit to Menu</button>
                </div>
                <button class="divine-button" id="pauseResumeBtn">Resume</button>
            </div>
        `;
        const modal = this._pauseOverlay.querySelector('.pause-menu-modal');
        if (runInfoContent && modal) {
            modal.insertBefore(runInfoContent, modal.querySelector('.pause-menu-buttons'));
        }
        this._pauseOverlay.addEventListener('click', (e) => {
            if (e.target === this._pauseOverlay) this.hidePauseMenu();
        });
        document.body.appendChild(this._pauseOverlay);
    }

    hidePauseMenu() {
        if (this._pauseOverlay) {
            this._pauseOverlay.remove();
            this._pauseOverlay = null;
        }
    }

    applySoundSetting(enabled, musicVolume, sfxVolume) {
        if (this.soundManager) {
            if (enabled) {
                this.soundManager.setMusicVolume(musicVolume ?? 0.6);
                this.soundManager.setSfxVolume(sfxVolume ?? 0.8);
            } else {
                this.soundManager.setMusicVolume(0);
                this.soundManager.setSfxVolume(0);
            }
        }
    }

    applyAutoSaveSetting(enabled) {
        if (enabled) {
            this.startAutoSave();
        } else {
            this.stopAutoSave();
        }
    }

    exitToMenuFromPause() {
        this.hidePauseMenu();
        this.exitToMenuAndSave();
    }

    /**
     * Central exit-to-menu: always save (Balatro: save_run before go_to_menu).
     * Single code path for pause Exit and GameEngine overlay Exit.
     */
    exitToMenuAndSave() {
        if (this.game?.canSave?.()) this.game.saveGame();
        this.showStartScreen();
    }

    setupCollectionTabs() {
        const tabs = document.querySelectorAll('.collection-tabs .divine-button');
        const grids = document.querySelectorAll('.collection-grid');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active from all tabs
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Hide all grids
                grids.forEach(grid => grid.classList.add('hidden'));
                
                // Show target grid
                const targetGridId = tab.dataset.tab + 'CollectionGrid';
                const targetGrid = document.getElementById(targetGridId);
                if (targetGrid) {
                    targetGrid.classList.remove('hidden');
                }
            });
        });
    }

    showStartScreen() {
        this.switchToScreen('start');
        this.currentScreen = 'start';
        this.updateContinueButton();
    }

    /** Balatro: G.FUNCS.can_continue — show/enable Continue only when valid save exists */
    updateContinueButton() {
        const btn = document.getElementById('continueButton');
        if (!btn) return;
        const dm = this.dataManager || new DataManager();
        const canContinue = dm.hasValidSave('auto');
        btn.style.display = canContinue ? '' : 'none';
        btn.disabled = !canContinue;
    }

    showCollection() {
        this.switchToScreen('collection');
        this.currentScreen = 'collection';
        this.collectionManager.populateCollection();
    }

    /**
     * Start game — new run or continue saved (Balatro: start_setup_run with New Run vs Continue)
     * @param {boolean} [continueRun=false] - If true, load from save instead of starting fresh
     */
    startGame(continueRun = false) {
        // Switch to game screen
        this.switchToScreen('game');
        this.currentScreen = 'game';
        
        // Load game UI template
        this.loadGameUI();
        
        // Initialize effect systems only when entering gameplay (not on start screen or collection)
        this.ensureGameEffectsReady();
        
        if (continueRun && this.dataManager?.hasValidSave('auto')) {
            // Continue: create engine with placeholder, then load saved state
            Logger.info('Continuing saved run');
            this.game = new GameEngine('CONTINUE');
            window.game = this.game;
            this.game.bindDOMElements();
            this.uiManager.bindDOMElements();
            if (!this.game.loadGame()) {
                Logger.warn('Failed to load save; starting new run');
                this.game = new GameEngine(this.generateRandomSeed());
                window.game = this.game;
                this.game.bindDOMElements();
                this.game.startGame();
            }
        } else {
            // New run
            const seedInput = document.getElementById('seedInput');
            let seed = seedInput ? seedInput.value.trim() : '';
            if (seed === '') {
                seed = this.generateRandomSeed();
                if (seedInput) seedInput.value = seed;
            }
            Logger.info(`Starting game with seed: ${seed}`);
            this.game = new GameEngine(seed);
            window.game = this.game;
            this.game.bindDOMElements();
            this.uiManager.bindDOMElements();
            this.game.startGame();
        }
        
        if (this.soundManager) {
            this.soundManager.startOnInteraction();
        }
        
        // Auto-save every 30 seconds during gameplay (if enabled in settings)
        const s = this.dataManager?.getSettings?.() || {};
        if (s.autoSave !== false) this.startAutoSave();

        // First-run tutorial overlay (when showTutorial enabled)
        if (s.showTutorial !== false) this.maybeShowTutorialOverlay();
    }

    /** Show tutorial overlay on first run when showTutorial is enabled */
    maybeShowTutorialOverlay() {
        const key = (this.dataManager?.prefix || 'diceOfDionysus_') + 'tutorialShown';
        if (localStorage.getItem(key) === '1') return;
        const overlay = document.createElement('div');
        overlay.className = 'overlay settings-overlay-created';
        overlay.style.cssText = 'z-index: 10003;';
        overlay.innerHTML = `
            <div class="modal-content settings-modal" style="max-width: 480px;">
                <h2 class="shop-title">Quick Start</h2>
                <div class="settings-content" style="text-align: left; line-height: 1.6;">
                    <p><strong>Roll:</strong> Press R or click "Cast the Bones"</p>
                    <p><strong>Hold:</strong> Click dice or press 1–5</p>
                    <p><strong>Score:</strong> Click a category on the pantheon (right). Hover to preview.</p>
                    <p><strong>Formula:</strong> Pips × Favour = final score</p>
                </div>
                <button class="divine-button" id="tutorialCloseBtn">Got it</button>
            </div>
        `;
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
                localStorage.setItem(key, '1');
            }
        });
        overlay.querySelector('#tutorialCloseBtn')?.addEventListener('click', () => {
            overlay.remove();
            localStorage.setItem(key, '1');
        });
        document.body.appendChild(overlay);
    }

    /** Initialize effect systems only when needed (on game start). Not called for start screen or collection. */
    ensureGameEffectsReady() {
        if (window.balatroEffects && !window.balatroEffects.isInitialized) {
            window.balatroEffects.initialize();
        }
        if (window.juiceIntegration && !window.juiceIntegration.initialized) {
            window.juiceIntegration.initialize();
        }
    }

    loadGameUI() {
        const gameContainer = document.getElementById('gameContainerWrapper');
        const template = document.getElementById('gameUITemplate');
        
        if (!template || !template.content) {
            Logger.warn('Game UI template not found – using built-in layout. Run via npm run dev for full UI.');
            return;
        }
        
        Logger.debug('Loading game UI from template');
        
        // Clear and load the game UI template into the inner game container
        if (gameContainer) {
            gameContainer.innerHTML = '';
            gameContainer.appendChild(template.content.cloneNode(true));
        }
        
        // Note: Shop overlay verification happens in UIManager.bindDOMElements()
        // UIManager will restore if missing - no need to verify here
        
        Logger.info('Game UI loaded successfully');
    }

    switchToScreen(screenName) {
        // Hide all screens
        Object.values(this.screens).forEach(screen => {
            screen.classList.add('hidden');
        });
        
        // Show target screen
        if (this.screens[screenName]) {
            this.screens[screenName].classList.remove('hidden');
        }
    }

    generateRandomSeed() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    startAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        
        this.autoSaveInterval = setInterval(() => {
            if (this.game && this.currentScreen === 'game') {
                // Only save if game is in a safe state
                const saved = this.game.saveGame();
                if (saved) {
                    // Optional: Show subtle save indicator
                    this.showSaveIndicator();
                }
            }
        }, TIMING.AUTO_SAVE_INTERVAL);
        
        Logger.info(`Auto-save enabled (every ${TIMING.AUTO_SAVE_INTERVAL / 1000}s)`);
    }

    showSaveIndicator() {
        // Create or find save indicator
        let indicator = document.getElementById('auto-save-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'auto-save-indicator';
            indicator.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 8px 16px;
                background: rgba(46, 204, 113, 0.9);
                color: white;
                border-radius: 4px;
                font-size: 12px;
                z-index: 9999;
                opacity: 0;
                transition: opacity 0.3s;
                pointer-events: none;
            `;
            indicator.textContent = '✓ Saved';
            document.body.appendChild(indicator);
        }
        
        // Show indicator
        indicator.style.opacity = '1';
        
        // Hide after configured duration
        setTimeout(() => {
            indicator.style.opacity = '0';
        }, TIMING.SAVE_INDICATOR_DURATION);
    }

    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }

    // Keyboard shortcuts
    handleKeyboardShortcuts(e) {
        // Only handle shortcuts when not typing in input fields
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        switch (e.key.toLowerCase()) {
            case 'r':
                if (this.game && this.currentScreen === 'game') {
                    e.preventDefault();
                    this.game.rollDice();
                }
                break;
                
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
                if (this.game && this.currentScreen === 'game') {
                    e.preventDefault();
                    const index = parseInt(e.key) - 1;
                    this.game.toggleHold(index);
                }
                break;
                
            case 'escape':
                e.preventDefault();
                if (this.currentScreen === 'game') {
                    if (window.settingsOverlay?.isVisible?.()) {
                        this.hideSettings();
                    } else if (this._pauseOverlay) {
                        this.hidePauseMenu();
                    } else {
                        this.showPauseMenu();
                    }
                } else if (this.currentScreen === 'collection') {
                    this.showStartScreen();
                } else if (this.currentScreen === 'start') {
                    if (window.settingsOverlay?.isVisible?.()) this.hideSettings();
                }
                break;
                
            case 'c':
                if (this.currentScreen === 'start') {
                    e.preventDefault();
                    this.showCollection();
                }
                break;
                
                case 's':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    if (this.game) {
                        const saved = this.game.saveGame();
                        if (saved) {
                            this.showMessage('Game saved!');
                            this.showSaveIndicator();
                        } else {
                            this.showMessage('Cannot save right now', 2000);
                        }
                    }
                }
                break;
        }
    }

    // Event handlers
    handleBeforeUnload() {
        if (this.game && this.currentScreen === 'game') {
            this.game.saveGame();
        }
        this.stopAutoSave();
    }

    handleResize() {
        // Handle responsive design adjustments if needed
        if (this.currentScreen === 'game' && this.uiManager) {
            // Could trigger UI updates for responsive behavior
        }
    }

    handleError(e) {
        Logger.error('Game Error', e.error);
        this.showMessage('An error occurred. Check the console for details.', 5000);
        
        // Log error for debugging
        if (this.dataManager) {
            const errorLog = {
                message: e.error?.message || 'Unknown error',
                stack: e.error?.stack || 'No stack trace',
                timestamp: Date.now(),
                screen: this.currentScreen,
                userAgent: navigator.userAgent
            };
            Logger.debug('Error log', errorLog);
        }
    }

    handleUnhandledRejection(e) {
        const reason = e?.reason;
        const reasonText = typeof reason === 'string' ? reason : (reason?.message || '');
        // Ignore wallet/extension connection errors (e.g., MetaMask not installed)
        if (/metamask|wallet|ethereum/i.test(reasonText)) {
            Logger.warn('Ignored wallet extension error', { reason: reasonText });
            if (typeof e.preventDefault === 'function') e.preventDefault();
            return;
        }
        Logger.error('Unhandled Promise Rejection', reason);
        this.showMessage('A promise was rejected. Check the console for details.', 5000);
    }

    // Utility methods
    showMessage(text, duration = 3000) {
        const popup = document.getElementById('message-popup');
        if (popup) {
            popup.textContent = text;
            popup.classList.add('show');
            setTimeout(() => {
                popup.classList.remove('show');
            }, duration);
        }
    }


}

// Collection Manager - handles the collection screen
class CollectionManager {
    constructor() {
        this.currentTab = 'boons';
    }

    populateCollection() {
        const collection = window.dataManager.getCollection();
        
        this.populateBoons(collection);
        this.populateArtifacts(collection);
        this.populateWorship(collection);
        this.populateLibations(collection);
    }

    populateBoons(collection) {
        const grid = document.getElementById('boonsCollectionGrid');
        grid.innerHTML = '';
        
        CardData.jokers.forEach(boonData => {
            const isUnlocked = collection.boons.includes(boonData.id);
            const boon = new Joker(boonData);
            // Render as shop item to show full text (isShopItem = true, forSale = false)
            const cardEl = boon.render(true, false);
            
            if (!isUnlocked) {
                cardEl.classList.add('locked');
                cardEl.classList.add('no-asset'); // Force fallback white background
                const effectEl = cardEl.querySelector('.card-effect');
                const nameEl = cardEl.querySelector('.card-name');
                const rarityEl = cardEl.querySelector('.card-rarity');
                if (effectEl) effectEl.textContent = '???';
                if (nameEl) nameEl.textContent = '???';
                if (rarityEl) rarityEl.textContent = '???';
                
                // Remove background image for locked cards
                const bgEl = cardEl.querySelector('.card-background');
                if (bgEl) bgEl.remove();
            }
            
            // Add unlock info
            if (isUnlocked) {
                const unlockInfo = document.createElement('div');
                unlockInfo.className = 'unlock-info';
                unlockInfo.textContent = `${boon.rarity} • ${boon.cost}g`;
                unlockInfo.style.cssText = `
                    position: absolute;
                    bottom: 5px;
                    right: 5px;
                    font-size: 0.7rem;
                    opacity: 0.7;
                `;
                cardEl.appendChild(unlockInfo);
            }
            
            grid.appendChild(cardEl);
        });
    }

    populateArtifacts(collection) {
        const grid = document.getElementById('artifactsCollectionGrid');
        grid.innerHTML = '';
        
        Object.values(CardData.artifacts).forEach(artifactPair => {
            [artifactPair.base, artifactPair.upgraded].forEach(artifact => {
                if (!artifact) return;
                
                const isUnlocked = collection.artifacts.includes(artifact.id);
                const el = document.createElement('div');
                el.className = 'card artifact-card';
                
                if (!isUnlocked) {
                    el.classList.add('locked');
                    el.classList.add('no-asset'); // Force fallback white background
                    el.style.background = 'white';
                    el.style.color = '#333';
                }
                
                el.innerHTML = `
                    <div class="card-name" style="${!isUnlocked ? 'color: #999;' : ''}">${isUnlocked ? artifact.name : '???'}</div>
                    <div class="card-effect" style="${!isUnlocked ? 'color: #999;' : ''}">${isUnlocked ? artifact.effect : 'Locked'}</div>
                    ${isUnlocked ? `<div class="card-cost">${artifact.cost}g</div>` : ''}
                `;
                
                grid.appendChild(el);
            });
        });
    }

    populateWorship(collection) {
        const grid = document.getElementById('worshipCollectionGrid');
        grid.innerHTML = '';
        
        CardData.worship.forEach(worshipData => {
            const isUnlocked = collection.worship ? collection.worship.includes(worshipData.id) : false;
            const worship = new WorshipCard(worshipData);
            // Render as shop item to show full text
            const cardEl = worship.render(true, false);
            
            if (!isUnlocked) {
                cardEl.classList.add('locked');
                cardEl.classList.add('no-asset'); // Force fallback white background
                const effectEl = cardEl.querySelector('.card-effect');
                const nameEl = cardEl.querySelector('.card-name');
                const rarityEl = cardEl.querySelector('.card-rarity');
                if (effectEl) effectEl.textContent = '???';
                if (nameEl) nameEl.textContent = '???';
                if (rarityEl) rarityEl.textContent = '???';
                
                // Remove background image for locked cards
                const bgEl = cardEl.querySelector('.card-background');
                if (bgEl) bgEl.remove();
            }
            
            grid.appendChild(cardEl);
        });
    }

    populateLibations(collection) {
        const grid = document.getElementById('libationsCollectionGrid');
        grid.innerHTML = '';
        
        CardData.libations.forEach(libationData => {
            const isUnlocked = collection.libations ? collection.libations.includes(libationData.id) : false;
            const libation = new LibationCard(libationData);
            // Render as shop item to show full text
            const cardEl = libation.render(true, false);
            
            if (!isUnlocked) {
                cardEl.classList.add('locked');
                cardEl.classList.add('no-asset'); // Force fallback white background
                const effectEl = cardEl.querySelector('.card-effect');
                const nameEl = cardEl.querySelector('.card-name');
                const rarityEl = cardEl.querySelector('.card-rarity');
                if (effectEl) effectEl.textContent = '???';
                if (nameEl) nameEl.textContent = '???';
                if (rarityEl) rarityEl.textContent = '???';
                
                // Remove background image for locked cards
                const bgEl = cardEl.querySelector('.card-background');
                if (bgEl) bgEl.remove();
            }
            
            grid.appendChild(cardEl);
        });
    }
}

// Initialize the application (window.app set in initialize())
const app = new App();

// Development mode detection
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    Logger.debug('Development mode detected');
}