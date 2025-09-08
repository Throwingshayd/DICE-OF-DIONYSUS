// Main application controller and entry point

class App {
    constructor() {
        this.currentScreen = 'start';
        this.game = null;
        this.uiManager = null;
        this.dataManager = null;
        this.collectionManager = null;
        this.musicManager = null;
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }

    initialize() {
        console.log('Initializing Dice of Dionysus...');
        
        // Initialize managers
        this.dataManager = new DataManager();
        this.uiManager = new UIManager();
        this.collectionManager = new CollectionManager();
        this.musicManager = new MusicManager();
        
        // Initialize Balatro-style effects system
        if (window.balatroEffects) {
            window.balatroEffects.initialize();
        }
        
        // Make globally available
        window.dataManager = this.dataManager;
        window.uiManager = this.uiManager;
        window.musicManager = this.musicManager;
        
        // Initialize UI manager immediately (shop overlay exists in main HTML)
        this.uiManager.initialize();
        
        // Set up screen management
        this.setupScreens();
        this.setupGlobalEventListeners();
        
        // Show start screen
        this.showStartScreen();
        
        console.log('Game initialized successfully!');
    }

    setupScreens() {
        this.screens = {
            start: document.getElementById('startScreen'),
            collection: document.getElementById('collectionScreen'),
            game: document.getElementById('gameContainerWrapper')
        };
        
        // Ensure all screens start hidden except start
        Object.entries(this.screens).forEach(([name, screen]) => {
            if (name !== 'start') {
                screen.classList.add('hidden');
            }
        });
    }

    setupGlobalEventListeners() {
        // Start screen buttons
        document.getElementById('playButton').addEventListener('click', () => this.startGame());
        document.getElementById('collectionButton').addEventListener('click', () => this.showCollection());
        
        // Collection screen buttons  
        document.getElementById('backToStartButton').addEventListener('click', () => this.showStartScreen());
        
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
        
        // Start music on any user interaction
        document.addEventListener('click', () => {
            if (this.musicManager && !this.musicManager.isMusicPlaying()) {
                this.musicManager.startMusicOnInteraction();
            }
        }, { once: true });
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
    }

    showCollection() {
        this.switchToScreen('collection');
        this.currentScreen = 'collection';
        this.collectionManager.populateCollection();
    }

    startGame() {
        // Get seed from input
        const seedInput = document.getElementById('seedInput');
        let seed = seedInput.value.trim();
        
        if (seed === '') {
            seed = this.generateRandomSeed();
            seedInput.value = seed;
        }
        
        console.log(`Starting game with seed: ${seed}`);
        
        // Switch to game screen
        this.switchToScreen('game');
        this.currentScreen = 'game';
        
        // Load game UI template
        this.loadGameUI();
        
        // Initialize game engine
        this.game = new GameEngine(seed);
        window.game = this.game; // Make globally available
        
        // Bind game engine to DOM
        this.game.bindDOMElements();
        
        // Rebind UI manager to DOM elements after game UI is loaded
        this.uiManager.bindDOMElements();
        
        // Event listeners are already bound in GameEngine.bindDOMElements()
        
        // Start the game
        this.game.startGame();
        
        // Start background music when play button is clicked
        if (this.musicManager) {
            this.musicManager.ensureMusicStarted();
        }
        

        
        // Auto-save every 30 seconds during gameplay
        this.startAutoSave();
    }

    loadGameUI() {
        const gameContainer = this.screens.game;
        const template = document.getElementById('gameUITemplate');
        
        if (!template) {
            console.error('Game UI template not found!');
            return;
        }
        
        // Clear and load the game UI template
        gameContainer.innerHTML = '';
        gameContainer.appendChild(template.content.cloneNode(true));
        
        // Restore shop overlay if it was lost
        this.restoreShopOverlay();
        
        console.log('Game UI loaded successfully');
    }
    
    restoreShopOverlay() {
        const gameContainer = this.screens.game;
        const existingShopOverlay = document.getElementById('shopOverlay');
        
        if (!existingShopOverlay) {
            console.log('Shop overlay missing, restoring...');
            
            // Create shop overlay with correct structure matching index.html
            const shopOverlay = document.createElement('div');
            shopOverlay.id = 'shopOverlay';
            shopOverlay.className = 'overlay hidden';
            shopOverlay.innerHTML = `
                <div class="modal-content">
                    <div class="shop-header">
                        <h2 class="shop-title">Temple Market</h2>
                    </div>
                    <div id="shopDefaultView">
                        <!-- Artifacts and Individual Items Row (side by side) -->
                        <div class="shop-row shop-items" id="shopItemsRow">
                            <div class="shop-section" id="shopArtifactsArea"><h4>Divine Artifacts</h4></div>
                            <div class="shop-section" id="shopDirectSales"><h4>Wares</h4></div>
                        </div>

                        <!-- Packs Row (below) -->
                        <div class="shop-row shop-packs" id="shopPacksRow">
                            <div class="shop-section" id="shopPacksArea"><h4>Packs</h4></div>
                        </div>
                    </div>
                    <div id="packOpeningView" class="hidden">
                        <div class="shop-main-area">
                            <div class="shop-section" id="packRevealedCards"><h4>Pack Contents</h4></div>
                            <div class="shop-section" id="packPlayerConsumables"><h4>Your Libations</h4></div>
                        </div>
                    </div>
                    <div class="shop-actions">
                        <div class="shop-info" id="goldDisplayButton">
                            <span id="shopGold">10</span>
                        </div>
                        <button class="divine-button" id="rerollShop">Reroll (2g)</button>
                        <button class="divine-button" id="closeShop">Continue</button>
                    </div>
                </div>
            `;
            
            gameContainer.appendChild(shopOverlay);
            console.log('Shop overlay restored successfully');
        }
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
                this.game.saveGame();
            }
        }, 30000); // Save every 30 seconds
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
                    this.showStartScreen();
                } else if (this.currentScreen === 'collection') {
                    this.showStartScreen();
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
                        this.game.saveGame();
                        this.showMessage('Game saved!');
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
        console.error('Game Error:', e.error);
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
            console.log('Error log:', errorLog);
        }
    }

    handleUnhandledRejection(e) {
        const reason = e?.reason;
        const reasonText = typeof reason === 'string' ? reason : (reason?.message || '');
        // Ignore wallet/extension connection errors (e.g., MetaMask not installed)
        if (/metamask|wallet|ethereum/i.test(reasonText)) {
            console.warn('Ignored wallet extension error:', reasonText);
            if (typeof e.preventDefault === 'function') e.preventDefault();
            return;
        }
        console.error('Unhandled Promise Rejection:', reason);
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
            const cardEl = boon.render();
            
            if (!isUnlocked) {
                cardEl.classList.add('locked');
                cardEl.querySelector('.card-effect').textContent = '???';
                cardEl.querySelector('.card-name').textContent = '???';
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
                }
                
                el.innerHTML = `
                    <div class="card-name">${isUnlocked ? artifact.name : '???'}</div>
                    <div class="card-effect">${isUnlocked ? artifact.effect : 'Complete requirements to unlock'}</div>
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
            const cardEl = worship.render();
            
            if (!isUnlocked) {
                cardEl.classList.add('locked');
                cardEl.querySelector('.card-effect').textContent = '???';
            }
            
            grid.appendChild(cardEl);
        });
    }

    populateLibations(collection) {
        const grid = document.getElementById('libationsCollectionGrid');
        grid.innerHTML = '';
        
        CardData.libations.forEach(libationData => {
            const isUnlocked = collection.libations ? collection.libations.includes(libationData.id) : false;
            const libation = new HouseRuleCard(libationData);
            const cardEl = libation.render();
            
            if (!isUnlocked) {
                cardEl.classList.add('locked');
                cardEl.querySelector('.card-effect').textContent = '???';
            }
            
            grid.appendChild(cardEl);
        });
    }
}

// Initialize the application
const app = new App();

// Make available globally for debugging
window.app = app;

// Development mode detection
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('Development mode detected');
}