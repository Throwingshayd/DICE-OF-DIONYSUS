// UIManager - Handles all UI updates and interactions

class UIManager {
    constructor() {
        this.dom = {};
        this.isInitialized = false;
        /** @type {ShopUI|null} */
        this.shopUI = null;
    }

    initialize() {
        if (this.isInitialized) {
            Logger.debug('UIManager already initialized, skipping...');
            return;
        }
        
        this.bindDOMElements();
        this.setupShopManager();
        this.isInitialized = true;
        Logger.info('UIManager initialized successfully');
    }

    bindDOMElements() {
        // Preserve existing DOM bindings if they exist
        const existingDom = this.dom || {};
        
        this.dom = {
            // Game info displays
            anteDisplay: document.getElementById('anteDisplay'),
            turnDisplay: document.getElementById('turnDisplay'),
            rollsLeft: document.getElementById('rollsLeft'),
            goldDisplay: document.getElementById('goldDisplay'),
            totalScore: document.getElementById('totalScore'),
            scoreThresholdDisplay: document.getElementById('scoreThresholdDisplay'),
            
            // Dice and rolling
            diceContainer: document.getElementById('diceContainer'),
            rollButton: document.getElementById('rollButton'),
            liveScoreDisplay: document.getElementById('liveScoreDisplay'),
            
            // Scorecard
            scorecardRows: document.querySelectorAll('.score-row'),
            
            // Play-area: boon slots + consumable slots
            boonSlots: document.getElementById('boonSlots'),
            consumableSlots: document.getElementById('consumableSlots'),
            artifactSlots: document.getElementById('artifactSlots'),
            boonSlotCounter: document.getElementById('boonSlotCounter'),
            consumableSlotCounter: document.getElementById('consumableSlotCounter'),
            
            // Shop stage (replaces rolling area per 6-translator)
            playStage: document.getElementById('playStage'),
            shopStage: document.getElementById('shopStage'),
            shopDefaultView: document.getElementById('shopDefaultView'),
            packOpeningView: document.getElementById('packOpeningView'),
            shopInventory: document.getElementById('shopInventory'),
            shopAnte: document.getElementById('shopAnte'),
            interestDisplay: document.getElementById('interestDisplay'),
            
            // Overlays
            confirmOverlay: document.getElementById('confirmOverlay'),
            libationOverlay: document.getElementById('libationOverlay'),
            expulsionOverlay: document.getElementById('expulsionOverlay'),
            
            // Message popup
            messagePopup: document.getElementById('message-popup')
        };
        
        // Clear play-area cache so slots always re-render after DOM replace (e.g. Continue)
        this._playAreaSlotsKey = null;

        // Game elements (playStage, shopStage, etc.) live in #gameUITemplate - only in DOM after loadGameUI()
        // Only run restore logic when game UI is loaded (at least one game element exists)
        const criticalElements = ['playStage', 'shopStage', 'diceContainer', 'rollButton'];
        const missingElements = criticalElements.filter(elementName => !this.dom[elementName]);
        const gameUILoaded = this.dom.playStage || this.dom.shopStage;
        
        if (missingElements.length > 0 && gameUILoaded) {
            // Game UI exists but some elements missing - restore/rebind
            Logger.debug(`Restoring missing UI elements: ${missingElements.join(', ')}`);
            this.restoreMissingElements(missingElements);
            this.rebindRestoredElements(missingElements);
        }
        // Else: pre-game (template not cloned yet) - nothing to restore, bindDOMElements runs again after loadGameUI()
        
        Logger.info('UIManager DOM elements bound successfully');
    }

    rebindRestoredElements(restoredElements) {
        // Re-bind DOM references for restored elements
        if (restoredElements.includes('shopStage')) {
            this.dom.playStage = document.getElementById('playStage');
            this.dom.shopStage = document.getElementById('shopStage');
            this.dom.shopDefaultView = document.getElementById('shopDefaultView');
            this.dom.packOpeningView = document.getElementById('packOpeningView');
            this.dom.closeShop = document.getElementById('closeShop');
            this.dom.rerollShop = document.getElementById('rerollShop');
            Logger.debug('Shop stage DOM elements rebound');
        }
    }

    restoreMissingElements(missingElements) {
        // Shop is in template (shopStage) - no restore; rebind after game loads
        if (missingElements.includes('shopStage') && !this.dom.shopStage) {
            Logger.debug('Shop stage not found (template may not be loaded yet)');
        }
        
        // Try to restore dice container if missing
        if (missingElements.includes('diceContainer') && !this.dom.diceContainer) {
            this.restoreDiceContainer();
        }
        
        // Try to restore roll button if missing
        if (missingElements.includes('rollButton') && !this.dom.rollButton) {
            this.restoreRollButton();
        }
    }

    restoreDiceContainer() {
        const centerGameArea = document.querySelector('.centerGameArea') || document.querySelector('.center-game-area');
        if (!centerGameArea) return;
        
        const existingDiceContainer = document.getElementById('diceContainer');
        if (!existingDiceContainer) {
            Logger.debug('Restoring dice container...');
            
            const diceContainer = document.createElement('div');
            diceContainer.id = 'diceContainer';
            diceContainer.className = 'diceContainer';
            
            // Insert before rolling controls (dice center, button under)
            const playStage = document.getElementById('playStage') || centerGameArea.querySelector('#playStage');
            const rollingControls = centerGameArea.querySelector('.rollingControls') || centerGameArea.querySelector('.rolling-controls');
            if (playStage && rollingControls) {
                playStage.insertBefore(diceContainer, rollingControls);
            } else if (centerGameArea) {
                centerGameArea.appendChild(diceContainer);
            }
            
            this.dom.diceContainer = diceContainer;
            Logger.debug('Dice container restored successfully');
        }
    }

    restoreRollButton() {
        const rollingControls = document.querySelector('.rollingControls') || document.querySelector('.rolling-controls');
        if (!rollingControls) return;
        
        const existingRollButton = document.getElementById('rollButton');
        if (!existingRollButton) {
            Logger.debug('Restoring roll button...');
            
            const rollButton = document.createElement('button');
            rollButton.id = 'rollButton';
            rollButton.className = 'roll-button';
            rollButton.textContent = 'Cast the Bones';
            
            rollingControls.insertBefore(rollButton, rollingControls.firstChild);
            this.dom.rollButton = rollButton;
            Logger.debug('Roll button restored successfully');
        }
    }

    setupShopManager() {
        if (!this.shopUI) this.shopUI = new ShopUI(this);
        const shop = this.shopUI;
        window.shopManager = {
            openShop: (gameState, gameEngine) => shop.openShop(gameState, gameEngine),
            closeShop: () => shop.closeShop(),
            rerollShop: (gameState, gameEngine) => shop.rerollShop(gameState, gameEngine),
            buyPack: (packType, gameState, gameEngine) => shop.buyPack?.(packType, gameState, gameEngine),
            buyArtifact: (artifactData, gameState, gameEngine, el) => shop.buyArtifact(artifactData, gameState, gameEngine, el),
            buyCard: (card, gameState, gameEngine, el) => shop.buyCard(card, gameState, gameEngine, el),
            claimCard: (card, gameState, gameEngine, el) => shop.claimCard(card, gameState, gameEngine, el),
            sellCard: (card, gameState, gameEngine) => shop.sellCard(card, gameState, gameEngine)
        };
    }

    /** Delegate to ShopUI for play-area sell (7-call-upon-able) */
    sellCard(card, gameState, gameEngine) {
        if (this.shopUI) this.shopUI.sellCard(card, gameState, gameEngine);
    }

    /** Delegate to ShopUI/ShopStockGenerator for price display */
    getShopPrice(baseCost, gameState) {
        return this.shopUI ? this.shopUI.getShopPrice(baseCost, gameState) : ShopStockGenerator.getShopPrice(baseCost, gameState);
    }

    /** Delegate to ShopUI (used by GameEngine resume + window.shopManager) */
    openShop(gameState, gameEngine) {
        if (this.shopUI) this.shopUI.openShop(gameState, gameEngine);
    }

    updateAll(gameState, gameEngine) {
        if (!this.isInitialized) return;
        
        if (!this.dom.diceContainer || !this.dom.rollButton) return;
        
        this.updateInfoUI(gameState, gameEngine);
        this.updateDiceUI(gameState, gameEngine);
        this.updateScorecardUI(gameState, gameEngine);
        this.updatePlayAreaSlots(gameState, gameEngine);
        this.updateBlindUI(gameState, gameEngine);
    }

    updateInfoUI(gameState, gameEngine) {
        InfoBarRenderer.updateInfoUI(this.dom, gameState);
    }

    updateBlindUI(gameState, gameEngine) {
        InfoBarRenderer.updateBlindUI(this.dom, gameState, gameEngine);
    }

    updateDiceUI(gameState, gameEngine = null) {
        DiceRenderer.updateDiceUI(this.dom, gameState, gameEngine);
    }

    updateScorecardUI(gameState, gameEngine = null) {
        ScorecardRenderer.updateScorecardUI(this.dom, gameState, gameEngine, this);
    }

    updatePlayAreaSlots(gameState, gameEngine) {
        PlayAreaRenderer.updatePlayAreaSlots(this.dom, gameState, gameEngine, this);
    }

    /**
     * Shared inventory card renderer — "call upon" this when adding buy/sell/use tags to any card type.
     * Renders a card, wires action labels, and toggles visibility on card click.
     * @param {Card} card - Card instance (Boon, LibationCard, WorshipCard)
     * @param {HTMLElement} container - Parent to append to (boonSlots or consumableSlots)
     * @param {Object} opts - { onSell, onUse, revealOn }
     * @param {Function} opts.onSell - Called when sell label is clicked
     * @param {Function} opts.onUse - Called when use label is clicked (consumables only)
     * @param {'click'|'contextmenu'} [opts.revealOn='click'] - Event that toggles action labels visibility
     */
    appendInventoryCard(card, container, { onSell, onUse, revealOn = 'click' }) {
        const cardEl = card.render();
        const sellLabel = cardEl.querySelector('.buy-sell-label.sell');
        const useLabel = cardEl.querySelector('.buy-sell-label.use');

        if (sellLabel && onSell) {
            sellLabel.addEventListener('click', (e) => {
                e.stopPropagation();
                this.createRippleEffect(sellLabel, e);
                onSell(card);
            });
        }

        if (useLabel && onUse) {
            useLabel.addEventListener('click', (e) => {
                e.stopPropagation();
                this.createRippleEffect(useLabel, e);
                onUse(card);
            });
        }

        const toggleActionLabels = (e) => {
            if (e.target.closest('.buy-sell-label')) return;
            container.querySelectorAll('.card').forEach(el => el.classList.remove('sell-label-visible'));
            cardEl.classList.toggle('sell-label-visible');
        };

        cardEl.addEventListener(revealOn, (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleActionLabels(e);
        });

        // Click outside: hide sell label when clicking away from cards
        if (!container._sellLabelClickOutsideHandler) {
            container._sellLabelClickOutsideHandler = (e) => {
                if (!e.target.closest('.card') || !container.contains(e.target)) {
                    container.querySelectorAll('.card').forEach(el => el.classList.remove('sell-label-visible'));
                }
            };
            document.addEventListener('click', container._sellLabelClickOutsideHandler);
        }

        container.appendChild(cardEl);
    }

    /**
     * Use a consumable (libation/worship) from play area. Not shop-related.
     * @param {LibationCard|WorshipCard} card
     * @param {Object} gameState
     * @param {Object} gameEngine
     */
    useConsumable(card, gameState, gameEngine) {
        window.balatroEffects?.hideAllTooltips();
        if (card instanceof LibationCard) {
            const libTargeting = gameEngine?.state?.libationTargetingMode;
            const euchTargeting = gameEngine?.state?.eucharistTargetingMode;
            if ((libTargeting?.libation === card || euchTargeting?.libation === card)) {
                gameEngine.cancelTargetingMode();
                return;
            }
        }
        if (!card.canUse()) {
            gameEngine.showMessage("Cannot use this consumable right now.");
            return;
        }
        let success = false;
        let message = "";
        if (card instanceof LibationCard) {
            success = card.applyRule(gameState, gameEngine);
            message = success ? `Libation activated: ${card.name}!` : "Failed to activate libation.";
        } else if (card instanceof WorshipCard) {
            success = card.applyWorship(gameState);
            message = success ? `Worship applied: ${card.name}!` : "Failed to apply worship.";
        } else {
            success = card.use ? card.use() : false;
            message = success ? `Used: ${card.name}!` : "Failed to use card.";
        }
        if (success) {
            if (window.soundManager) window.soundManager.play('magic_crumple', { pitch: 0.95 + Math.random() * 0.1, volume: 0.55 });
            gameEngine.showMessage(message);
            const cardIndex = gameState.consumables.findIndex(c => c.id === card.id);
            if (cardIndex !== -1) gameState.consumables.splice(cardIndex, 1);
            gameEngine.updateAllUI();
            window.balatroEffects?.hideAllTooltips();
        } else {
            if (window.soundManager) window.soundManager.play('cancel', { volume: 0.5 });
            gameEngine.showMessage(message || "Failed to use libation.");
        }
    }

    // Ensure shop DOM elements are properly bound
    ensureShopElementsBound() {
        // Re-bind shop elements if they're missing
        if (!this.dom.shopInventory) {
            this.dom.shopInventory = document.getElementById('shopInventory');
            Logger.debug('Re-bound shopInventory element:', this.dom.shopInventory);
        }
        if (!this.dom.shopDefaultView) {
            this.dom.shopDefaultView = document.getElementById('shopDefaultView');
        }
        if (!this.dom.packOpeningView) {
            this.dom.packOpeningView = document.getElementById('packOpeningView');
        }
    }

    createRippleEffect(button, event) {
        // Create ripple element
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        
        // Position ripple at click coordinates
        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        
        // Add ripple to button
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        // Remove ripple after animation completes
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    /**
     * Add success animation to button on purchase
     * @param {HTMLElement} button - The button element
     */
    playPurchaseAnimation(button) {
        button.classList.add('purchasing');
        setTimeout(() => {
            button.classList.remove('purchasing');
        }, 400);
    }
}
