// UIManager - Handles all UI updates and interactions

class UIManager {
    constructor() {
        this.dom = {};
        this.isInitialized = false;
        this.shopState = {
            currentInventory: [],
            openedPacks: new Set(),
            rerolls: 1
        };
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
            
            // Dice and rolling
            diceContainer: document.getElementById('diceContainer'),
            rollButton: document.getElementById('rollButton'),
            liveScoreDisplay: document.getElementById('liveScoreDisplay'),
            
            // Scorecard
            scorecardRows: document.querySelectorAll('.score-row'),
            
            // Collections
            jokerSlots: document.getElementById('jokerSlots'),
            consumableSlots: document.getElementById('consumableSlots'),
            artifactSlots: document.getElementById('artifactSlots'),
            
            // Shop elements
            shopOverlay: document.getElementById('shopOverlay'),
            shopDefaultView: document.getElementById('shopDefaultView'),
            packOpeningView: document.getElementById('packOpeningView'),
            shopInventory: document.getElementById('shopInventory'),
            shopGold: document.getElementById('shopGold'),
            shopAnte: document.getElementById('shopAnte'),
            interestDisplay: document.getElementById('interestDisplay'),
            
            // Overlays
            confirmOverlay: document.getElementById('confirmOverlay'),
            libationOverlay: document.getElementById('libationOverlay'),
            
            // Message popup
            messagePopup: document.getElementById('message-popup')
        };
        
        // Check for critical elements and provide fallbacks
        const criticalElements = ['shopOverlay', 'diceContainer', 'rollButton'];
        const missingElements = criticalElements.filter(elementName => !this.dom[elementName]);
        
        if (missingElements.length > 0) {
            Logger.debug(`Restoring missing UI elements: ${missingElements.join(', ')}`);
            
            // Restore missing elements (normal during initialization)
            this.restoreMissingElements(missingElements);
            
            // Re-bind after restoration
            this.rebindRestoredElements(missingElements);
        }
        
        Logger.info('UIManager DOM elements bound successfully');
    }

    rebindRestoredElements(restoredElements) {
        // Re-bind DOM references for restored elements
        if (restoredElements.includes('shopOverlay')) {
            this.dom.shopOverlay = document.getElementById('shopOverlay');
            this.dom.shopGold = document.getElementById('shopGold');
            this.dom.shopDefaultView = document.getElementById('shopDefaultView');
            this.dom.packOpeningView = document.getElementById('packOpeningView');
            this.dom.closeShop = document.getElementById('closeShop');
            this.dom.rerollShop = document.getElementById('rerollShop');
            Logger.debug('Shop overlay DOM elements rebound');
        }
    }

    restoreMissingElements(missingElements) {
        // Try to restore shop overlay if missing
        if (missingElements.includes('shopOverlay') && !this.dom.shopOverlay) {
            this.restoreShopOverlay();
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

    restoreShopOverlay() {
        const gameContainer = document.getElementById('gameContainerWrapper');
        if (!gameContainer) {
            Logger.warn('Cannot restore shop overlay - game container not found');
            return;
        }
        
        const existingShopOverlay = document.getElementById('shopOverlay');
        if (!existingShopOverlay) {
            Logger.debug('Creating shop overlay (normal during initialization)');
            
            const shopOverlay = document.createElement('div');
            shopOverlay.id = 'shopOverlay';
            shopOverlay.className = 'overlay hidden';
            shopOverlay.innerHTML = `
                <div class="modal-content">
                    <div class="shop-header">
                        <h2 class="shop-title">Temple Market</h2>
                    </div>
                    <div id="shopDefaultView">
                        <div class="shop-row shop-items" id="shopItemsRow">
                            <div class="shop-section" id="shopArtifactsArea"><h4>Divine Artifacts</h4></div>
                            <div class="shop-section" id="shopDirectSales"><h4>Wares</h4></div>
                        </div>
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
                        <button class="divine-button" id="rerollShop">Reroll (${GAME_BALANCE.SHOP_REROLL_COST}g)</button>
                        <button class="divine-button" id="closeShop">Continue</button>
                    </div>
                </div>
            `;
            
            gameContainer.appendChild(shopOverlay);
            Logger.info('Shop overlay created successfully');
            
            // Attach event listeners to the new buttons
            this.attachShopEventListeners();
        } else {
            Logger.debug('Shop overlay already exists in DOM');
        }
    }

    attachShopEventListeners() {
        // Attach event listeners for shop buttons
        const closeShopBtn = document.getElementById('closeShop');
        const rerollShopBtn = document.getElementById('rerollShop');
        
        if (closeShopBtn) {
            // Remove any existing listeners (avoid duplicates)
            const newCloseBtn = closeShopBtn.cloneNode(true);
            closeShopBtn.parentNode.replaceChild(newCloseBtn, closeShopBtn);
            
            newCloseBtn.addEventListener('click', () => {
                Logger.debug('Close shop button clicked');
                if (window.game) {
                    window.game.closeShop();
                } else {
                    this.closeShop();
                }
            });
            Logger.debug('Close shop listener attached');
        } else {
            Logger.warn('Close shop button not found');
        }
        
        if (rerollShopBtn) {
            // Remove any existing listeners (avoid duplicates)
            const newRerollBtn = rerollShopBtn.cloneNode(true);
            rerollShopBtn.parentNode.replaceChild(newRerollBtn, rerollShopBtn);
            
            newRerollBtn.addEventListener('click', () => {
                Logger.debug('Reroll shop button clicked');
                if (window.game) {
                    window.game.rerollShop();
                } else if (window.uiManager) {
                    window.uiManager.rerollShop(window.game?.state, window.game);
                }
            });
            Logger.debug('Reroll shop listener attached');
        } else {
            Logger.warn('Reroll shop button not found');
        }
        
        Logger.info('Shop event listeners attached successfully');
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
            
            // Insert before rolling controls if they exist
            const rollingControls = centerGameArea.querySelector('.rollingControls') || centerGameArea.querySelector('.rolling-controls');
            if (rollingControls) {
                centerGameArea.insertBefore(diceContainer, rollingControls);
            } else {
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
        window.shopManager = {
            openShop: (gameState, gameEngine) => this.openShop(gameState, gameEngine),
            closeShop: () => this.closeShop(),
            rerollShop: (gameState, gameEngine) => this.rerollShop(gameState, gameEngine),
            buyPack: (packType, gameState, gameEngine) => this.buyPack(packType, gameState, gameEngine),
            buyArtifact: (artifactData, gameState, gameEngine) => this.buyArtifact(artifactData, gameState, gameEngine),
            buyCard: (card, gameState, gameEngine) => this.buyCard(card, gameState, gameEngine),
            claimCard: (card, gameState, gameEngine) => this.claimCard(card, gameState, gameEngine),
            sellCard: (card, gameState, gameEngine) => this.sellCard(card, gameState, gameEngine)
        };
        

    }

    updateAll(gameState, gameEngine) {
        if (!this.isInitialized) return;
        
        // Check if critical elements are available
        if (!this.dom.diceContainer || !this.dom.rollButton) {
            Logger.debug('Critical game elements not available yet, skipping UI update');
            return;
        }
        
        this.updateInfoUI(gameState);
        this.updateDiceUI(gameState);
        this.updateScorecardUI(gameState);
        this.updateCollectionUI(gameState, gameEngine);
        this.updateBlindUI(gameState);
    }

    updateInfoUI(gameState) {
        const anteIndex = gameState.ante - 1;
        let anteName;
        
        if (gameState.endlessMode) {
            anteName = `The Odyssey: ${gameState.ante}`;
        } else {
            const currentAnteData = AnteData[anteIndex] || AnteData[AnteData.length - 1];
            anteName = `${gameState.ante}: ${currentAnteData.name}`;
        }
        
        this.dom.anteDisplay.textContent = anteName.replace(': ', ' – ');
        this.dom.turnDisplay.textContent = `${gameState.turn}/${gameState.maxTurns}`;
        this.dom.rollsLeft.textContent = `Rolls Left: ${gameState.rollsLeft}`;
        this.dom.goldDisplay.textContent = gameState.gold;
        this.dom.totalScore.textContent = `${gameState.totalScore} / ${gameState.scoreThreshold}`;
        // Optionally, we could show an indicator when upper bonus is achieved
        
        // Update roll button
        this.dom.rollButton.disabled = gameState.rollsLeft <= 0 || gameState.gameOver || gameState.isAwaitingApi;
    }

    updateBlindUI(gameState) {
        const anteIndex = gameState.ante - 1;
        let currentAnteData;
        
        if (gameState.endlessMode) {
            // For endless mode, we'd need to store the current blind data
            const randomBlindIndex = Math.floor(Math.random() * AnteData.length);
            currentAnteData = AnteData[randomBlindIndex];
        } else {
            currentAnteData = AnteData[anteIndex] || AnteData[AnteData.length - 1];
        }
        

    }

    updateDiceUI(gameState) {
        if (!this.dom.diceContainer) {
            Logger.warn('Dice container not found, cannot update dice UI');
            return;
        }
        
        this.dom.diceContainer.innerHTML = '';
        
        gameState.dice.forEach((die, index) => {
            const dieEl = document.createElement('div');
            dieEl.className = 'die';
            dieEl.style.position = 'relative';
            
            if (gameState.held[index]) {
                dieEl.classList.add('held');
            }
            
            // Add Parmenides dual-value effect (purple/quantum tint)
            if (die.isParmenidesDie) {
                dieEl.classList.add('parmenides-die');
                dieEl.setAttribute('data-parmenides', `${die.face}↔${die.oppositeValue}`);
            }
            
            // Add enhancement glow if die has enhancements on the current face
            const currentFace = die.currentFace;
            const hasEnhancementsOnCurrentFace = currentFace > 0 && die.faces[currentFace] && die.faces[currentFace].enhancements.size > 0;
            if (hasEnhancementsOnCurrentFace) {
                dieEl.style.boxShadow = '0 0 10px rgba(255, 215, 0, 0.6)';
                dieEl.style.border = '2px solid rgba(255, 215, 0, 0.8)';
                dieEl.setAttribute('data-enhanced', 'true');
            }
            
            // Add die ID badge (small indicator showing which die this is)
            const dieIdBadge = document.createElement('div');
            dieIdBadge.className = 'die-id-badge';
            dieIdBadge.textContent = die.dieId || (index + 1);
            dieIdBadge.style.cssText = `
                position: absolute;
                top: -5px;
                right: -5px;
                width: 16px;
                height: 16px;
                background: var(--stone-terracotta-dark);
                border-radius: 50%;
                font-size: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                border: 1px solid var(--statue-cream);
                z-index: 5;
                opacity: 0.8;
            `;
            dieEl.appendChild(dieIdBadge);
            
            // Show die face using asset images
            const displayFace = gameState.hasRolled ? die.getDisplayFace() : '?';
            dieEl.setAttribute('data-face', displayFace);
            
            // Use asset images for dice faces with consistent sizing
            if (displayFace === '?') {
                // Question mark asset
                const questionAsset = AssetMapping.getAssetPath(AssetMapping.getDiceFaceAsset('question'));
                dieEl.style.backgroundImage = `url('${questionAsset}')`;
                dieEl.style.backgroundSize = '100% 100%'; // Force consistent sizing
                dieEl.style.backgroundPosition = 'center';
                dieEl.style.backgroundRepeat = 'no-repeat';
                dieEl.textContent = ''; // Remove text content
            } else if (displayFace >= 1 && displayFace <= 9) {
                // Regular die face asset
                const faceAsset = AssetMapping.getAssetPath(AssetMapping.getDiceFaceAsset(displayFace));
                dieEl.style.backgroundImage = `url('${faceAsset}')`;
                dieEl.style.backgroundSize = '100% 100%'; // Force consistent sizing
                dieEl.style.backgroundPosition = 'center';
                dieEl.style.backgroundRepeat = 'no-repeat';
                dieEl.textContent = ''; // Remove text content
            } else {
                // Fallback to text for any other values
                dieEl.textContent = displayFace;
            }
            
            // Debug logging for face values
            if (gameState.hasRolled && currentFace > 0) {
                Logger.debug(`Die ${index + 1} (ID: ${die.dieId}): face=${currentFace}, modifiedValue=${die.faces[currentFace]?.modifiedValue}, effectiveFace=${die.getEffectiveFace()}, displayFace=${displayFace}`);
            }
            
            // Add detailed tooltip for dice
            let tooltipText = `Die ${index + 1} (Face ${currentFace})`;
            
            // Add die identifier (since positions can shuffle)
            tooltipText += `\nDie ID: ${die.dieId || index + 1}`;
            
            // Add current face value
            if (currentFace > 0) {
                tooltipText += `\nCurrent Value: ${die.getEffectiveFace()}`;
            }
            
            // Add current face enhancements
            if (currentFace > 0 && die.faces[currentFace] && die.faces[currentFace].enhancements.size > 0) {
                const currentEnhancements = Array.from(die.faces[currentFace].enhancements);
                tooltipText += `\nEnhancements: ${currentEnhancements.map(enh => die.getEnhancementDescription(enh)).join(', ')}`;
            }
            
            // Add all face enhancements summary
            const allEnhancedFaces = [];
            Object.entries(die.faces).forEach(([faceNum, faceData]) => {
                if (faceData.enhancements.size > 0) {
                    const enhancements = Array.from(faceData.enhancements);
                    allEnhancedFaces.push(`Face ${faceNum}: ${enhancements.join(', ')}`);
                }
            });
            
            if (allEnhancedFaces.length > 0) {
                tooltipText += `\n\nAll Enhancements:\n${allEnhancedFaces.join('\n')}`;
            }
            
            // Add held status
            if (gameState.held[index]) {
                tooltipText += `\n\nStatus: HELD`;
            }
            
            dieEl.title = tooltipText;
            
            // Add click handler
            dieEl.addEventListener('click', () => {
                if (window.game) {
                    window.game.toggleHold(index);
                }
            });
            
            // Add enhancement overlays for face-specific enhancements (only show for current face)
            let allEnhancements = [];
            
            // Only show enhancements for the current face that is rolled
            if (currentFace > 0 && die.faces[currentFace]) {
                die.faces[currentFace].enhancements.forEach(enh => allEnhancements.push({ 
                    type: 'face', 
                    enhancement: enh, 
                    face: currentFace 
                }));
            }
            
            // Add enhancement overlays (only show the first enhancement for now)
            if (allEnhancements.length > 0) {
                const firstEnhancement = allEnhancements[0];
                const overlay = document.createElement('div');
                overlay.className = `die-enhancement-overlay enh-${firstEnhancement.enhancement}`;
                
                // Add tooltip for the enhancement
                const faceText = firstEnhancement.type === 'face' ? ` (Face ${firstEnhancement.face})` : '';
                overlay.title = `${die.getEnhancementDescription(firstEnhancement.enhancement)}${faceText}`;
                
                dieEl.appendChild(overlay);
            }
            
            // Also add face value overlays for modified faces (7, 8, 9)
            if (currentFace > 0 && currentFace >= 7) {
                const faceOverlay = document.createElement('div');
                faceOverlay.className = `die-enhancement-overlay face-${currentFace}`;
                faceOverlay.title = `Face ${currentFace} - Modified Value`;
                dieEl.appendChild(faceOverlay);
            }
            
            // Add temporary modifier indicator (only show after first roll)
            if (die.tempModifier !== 0 && gameState.hasRolled) {
                const modifierBadge = document.createElement('div');
                modifierBadge.className = 'die-modifier-badge';
                modifierBadge.textContent = die.tempModifier > 0 ? `+${die.tempModifier}` : `${die.tempModifier}`;
                modifierBadge.style.cssText = `
                    position: absolute;
                    bottom: -8px;
                    left: -8px;
                    padding: 2px 6px;
                    background: ${die.tempModifier > 0 ? 'var(--accent-green)' : 'var(--accent-red)'};
                    border-radius: 4px;
                    font-size: 10px;
                    color: white;
                    font-weight: bold;
                    border: 1px solid var(--stone-terracotta-dark);
                    z-index: 10;
                `;
                dieEl.appendChild(modifierBadge);
            }
            
            // Permanent modifiers are now handled via face-specific modifiedValue
            // No longer using deprecated getPermanentModifier() method
            
            this.dom.diceContainer.appendChild(dieEl);
        });
    }

    // Get enhancement symbol for display
    getEnhancementSymbol(enhancement) {
        const symbols = {
            'parchment': '📜',
            'iron': '⚔️',
            'gold': '💰',
            'mother_of_pearl': '🦪',
            'wild': '🎲',
            'cursed': '💀',
            'divine': '✨',
            'chaos': '🌀'
        };
        return symbols[enhancement] || '?';
    }

    // Get enhancement color for display
    getEnhancementColor(enhancement) {
        const colors = {
            'parchment': '#8B4513', // Saddle brown
            'iron': '#696969', // Dim gray
            'gold': '#FFD700', // Gold
            'mother_of_pearl': '#E6E6FA', // Lavender
            'wild': '#FF69B4', // Hot pink
            'cursed': '#8B0000', // Dark red
            'divine': '#FFD700', // Gold
            'chaos': '#9932CC' // Dark orchid
        };
        return colors[enhancement] || '#666666';
    }

    updateScorecardUI(gameState) {
        this.dom.scorecardRows.forEach(row => {
            const category = row.dataset.category;
            if (!category) return;
            
            // Hide locked categories (7s, 8s, 9s)
            if (['Sevens', 'Eights', 'Nines'].includes(category)) {
                if (!gameState.unlockedCategories[category]) {
                    row.style.display = 'none';
                    return;
                } else {
                    row.style.display = 'flex';
                }
            }
            
            // Upper/Lower bonus rows are informational only
            if (category === 'Upper Bonus') {
                const v = (['Ones','Twos','Threes','Fours','Fives','Sixes']
                    .reduce((sum, c) => sum + (gameState.scorecard[c] || 0), 0) >= 63) ? 35 : 0;
                row.classList.remove('used');
                row.querySelector('.potential-score').textContent = v > 0 ? v : '-';
                row.style.cursor = 'default';
                return;
            }
            if (category === 'Lower Bonus') {
                const lowerCats = [
                    'Three of a Kind','Four of a Kind','Full House','Small Straight','Large Straight','Yahtzee','Chance'
                ];
                const complete = lowerCats.every(c => gameState.scorecard[c] !== undefined);
                row.classList.remove('used');
                row.querySelector('.potential-score').textContent = complete ? 35 : '-';
                row.style.cursor = 'default';
                return;
            }

            // Update category name with worship level
            const categorySpan = row.querySelector('span');
            if (categorySpan) {
                const godMapping = {
                    'Ones': 'Artemis',
                    'Twos': 'Persephone', 
                    'Threes': 'Morpheus',
                    'Fours': 'Hera',
                    'Fives': 'Athena',
                    'Sixes': 'Heracles',
                    'Three of a Kind': 'Hephaestus',
                    'Four of a Kind': 'Ares',
                    'Full House': 'Dionysus',
                    'Small Straight': 'Hermes',
                    'Large Straight': 'Apollo',
                    'Yahtzee': 'Zeus',
                    'Chance': 'Nyx',
                    'Sevens': 'The Pleiades',
                    'Eights': 'Poseidon',
                    'Nines': 'The Nine Muses'
                };
                
                // Display name mapping (UI-only)
                const displayCategory = category === 'Yahtzee' ? 'Heureka' : category;
                const god = godMapping[category];
                const worshipLevel = gameState.worshipLevels[god] || 0;
                
                if (worshipLevel > 0) {
                    categorySpan.textContent = `${displayCategory} (${god} Lv.${worshipLevel})`;
                } else {
                    categorySpan.textContent = `${displayCategory} (${god})`;
                }
            }
            
            const scoreDisplay = row.querySelector('.potential-score');
            
            if (gameState.scorecard[category] !== undefined) {
                // Category already scored - show final score
                row.classList.add('used');
                row.classList.remove('available-category');
                scoreDisplay.textContent = gameState.scorecard[category];
            } else {
                // Category not scored - don't show preview (that's what Gnosis is for!)
                row.classList.remove('used');
                scoreDisplay.textContent = '-';
                
                // Add pulse and green text if category is available to score
                if (gameState.hasRolled && window.game) {
                    let { isValid } = window.game.calculateScore(category);
                    
                    if (isValid) {
                        row.classList.add('available-category');
                        row.classList.add('category-available-highlight');
                    } else {
                        row.classList.remove('available-category');
                        row.classList.remove('category-available-highlight');
                    }
                } else {
                    row.classList.remove('available-category');
                    row.classList.remove('category-available-highlight');
                }
            }
        });
        
        // Dynamically expand scorecard asset height/padding for unlocked bonus rows
        const rightScorecard = document.querySelector('.rightScorecard, .right-scorecard');
        const scorecardEl = document.getElementById('scorecard');
        if (rightScorecard && scorecardEl) {
            rightScorecard.classList.remove('expanded-1', 'expanded-2', 'expanded-3');
            scorecardEl.classList.remove('expanded-1', 'expanded-2', 'expanded-3');
            const unlockedCount = ['Sevens','Eights','Nines'].filter(c => gameState.unlockedCategories[c]).length;
            if (unlockedCount >= 1) {
                rightScorecard.classList.add(`expanded-${unlockedCount}`);
                scorecardEl.classList.add(`expanded-${unlockedCount}`);
            }
        }

        // Update bonus Yahtzee indicator
        this.updateBonusYahtzeeIndicator(gameState);
    }

    updateBonusYahtzeeIndicator(gameState) {
        const indicator = document.getElementById('bonusYahtzeeIndicator');
        const countDisplay = document.getElementById('bonusYahtzeeCount');
        const progressItems = document.querySelectorAll('.progress-item');
        
        if (indicator && countDisplay) {
            countDisplay.textContent = gameState.bonusYahtzees;
            
            // Update progress items
            progressItems.forEach(item => {
                const category = item.dataset.category;
                if (gameState.unlockedCategories[category]) {
                    item.classList.add('unlocked');
                } else {
                    item.classList.remove('unlocked');
                }
            });
        }
    }

    updateCollectionUI(gameState, gameEngine) {
        this.updateJokerUI(gameState, gameEngine);
        this.updateConsumableUI(gameState, gameEngine);
        this.updateArtifactUI(gameState);
    }

    updateJokerUI(gameState, gameEngine) {
        const container = this.dom.jokerSlots;
        
        // Add error handling for missing element
        if (!container) {
            Logger.warn('jokerSlots element not found');
            return;
        }
        
        container.innerHTML = '';
        
        if (gameState.jokers.length === 0) {
            container.innerHTML = '<div style="text-align: center; opacity: 0.6; width: 100%;">No Boons yet</div>';
            return;
        }
        
        gameState.jokers.forEach(joker => {
            const cardEl = joker.render();
            
            // Add sell label click handler
            const sellLabel = cardEl.querySelector('.buy-sell-label.sell');
            if (sellLabel) {
                sellLabel.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.sellCard(joker, gameState, gameEngine);
                });
            }
            
            container.appendChild(cardEl);
        });
    }

    updateConsumableUI(gameState, gameEngine) {
        const container = this.dom.consumableSlots;
        
        // Add error handling for missing element
        if (!container) {
            Logger.warn('consumableSlots element not found');
            return;
        }
        
        container.innerHTML = '';
        
        if (gameState.consumables.length === 0) {
            container.innerHTML = '';
            return;
        }
        
        gameState.consumables.forEach(card => {
            const cardEl = card.render();
            
            // Add sell label click handler
            const sellLabel = cardEl.querySelector('.buy-sell-label.sell');
            if (sellLabel) {
                sellLabel.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.sellCard(card, gameState, gameEngine);
                });
            }
            
            // Keep the click handler for using the card
            cardEl.addEventListener('click', () => {
                const engine = gameEngine || window.game;
                if (engine) {
                    this.useConsumable(card, gameState, engine);
                } else {
                    Logger.error('No game engine available for useConsumable');
                }
            });
            
            container.appendChild(cardEl);
        });
    }

    updateArtifactUI(gameState) {
        const container = this.dom.artifactSlots;
        
        // Add error handling for missing element
        if (!container) {
            Logger.warn('artifactSlots element not found');
            return;
        }
        
        container.innerHTML = '';
        
        if (gameState.artifacts.length === 0) {
            container.innerHTML = '';
            return;
        }
        
        gameState.artifacts.forEach(artifact => {
            const el = document.createElement('div');
            el.className = 'card';
            el.style.width = 'auto';
            el.style.minWidth = '120px';
            el.setAttribute('data-tooltip', JSON.stringify({
                title: artifact.name,
                description: artifact.effect
            }));
            el.innerHTML = '';
            container.appendChild(el);
        });
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

    // Shop functionality
    openShop(gameState, gameEngine) {
        gameState.usedFreeReroll = false;
        
        // Apply interest
        // Interest is now handled by GameEngine.openShop() with animation
        // This method is kept for legacy compatibility but shouldn't add gold twice
        
        // Ensure shop elements are properly bound
        this.ensureShopElementsBound();
        
        // Add null checks for shop elements
        if (!this.dom.shopOverlay) {
            Logger.warn('Shop overlay not found, attempting to restore...');
            // Try to find the shop overlay again
            const shopOverlay = document.getElementById('shopOverlay');
            if (shopOverlay) {
                this.dom.shopOverlay = shopOverlay;
        
            } else {
                Logger.error('Shop overlay still not found, cannot open shop');
                return;
            }
        }
        
        this.dom.shopOverlay.classList.remove('hidden');
        
        if (this.dom.shopGold) this.dom.shopGold.textContent = gameState.gold;
        if (this.dom.shopAnte) this.dom.shopAnte.textContent = gameState.ante;
        if (this.dom.interestDisplay) this.dom.interestDisplay.textContent = `+${interest}`;
        
        if (this.dom.packOpeningView) this.dom.packOpeningView.classList.add('hidden');
        if (this.dom.shopDefaultView) this.dom.shopDefaultView.classList.remove('hidden');
        
        this.generateShopStock(gameState, gameEngine);

        // Wire up category buttons to focus sections
        const catRow = document.getElementById('shopCategoryRow');
        if (catRow) {
            catRow.querySelectorAll('.shop-cat').forEach(btn => {
                btn.onclick = () => {
                    const targetId = btn.getAttribute('data-target');
                    const sub = btn.getAttribute('data-sub');
                    const target = document.getElementById(targetId);
                    if (target) {
                        // Simple focus effect
                        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        target.style.outline = '2px solid var(--accent-green)';
                        setTimeout(() => target.style.outline = '', 600);
                    }
                    // Removed the regenerate stock call that was causing duplication
                };
            });
        }
    }

    closeShop() {
        Logger.debug('UIManager.closeShop() called');
        
        if (!this.dom.shopOverlay) {
            Logger.warn('Shop overlay not found in DOM cache, searching...');
            // Try to find the shop overlay again
            const shopOverlay = document.getElementById('shopOverlay');
            if (shopOverlay) {
                this.dom.shopOverlay = shopOverlay;
                Logger.debug('Shop overlay found and cached');
            } else {
                Logger.error('Shop overlay not found in DOM, cannot close shop');
                return;
            }
        }
        
        // Hide the shop overlay
        this.dom.shopOverlay.classList.add('hidden');
        Logger.info('Shop closed');
        
        // Clean up pack opening view
        const modalContent = this.dom.shopOverlay.querySelector('.modal-content');
        if (modalContent) {
            modalContent.classList.remove('pack-opening-stage');
        }
        
        // Reset pack opening view
        if (this.dom.packOpeningView) {
            this.dom.packOpeningView.classList.add('hidden');
        }
        if (this.dom.shopDefaultView) {
            this.dom.shopDefaultView.classList.remove('hidden');
        }
    }

    generateShopStock(gameState, gameEngine) {
        const directSalesContainer = document.getElementById('shopDirectSales');
        const packsContainer = document.getElementById('shopPacksArea');
        const artifactsContainer = document.getElementById('shopArtifactsArea');
        
        // Add null checks for shop containers
        if (!directSalesContainer || !packsContainer || !artifactsContainer) {
            Logger.warn('Shop containers not found, cannot generate shop stock');
            return;
        }
        
        Logger.debug('Generating shop stock...');
        
        // Clear containers (with fade-out if rerolling)
        directSalesContainer.innerHTML = '<h4>Wares</h4>';
        packsContainer.innerHTML = '<h4>Packs</h4>';
        artifactsContainer.innerHTML = '<h4>Divine Artifacts</h4>';
        
        // Reset animation index for staggered entrance
        this.shopItemIndex = 0;
        
        // Generate with Balatro-style slide-in animations
        this.generateArtifactStock(artifactsContainer, gameState, gameEngine);
        this.generateDirectSales(directSalesContainer, gameState, gameEngine);
        this.generatePackStock(packsContainer, gameState, gameEngine);
        
        Logger.debug('Shop stock generation complete');
    }

    generateArtifactStock(container, gameState, gameEngine) {
        const purchasedArtifactIds = new Set(gameState.artifacts.map(a => a.id));
        let artifactPool = [];
        
        for (const key in CardData.artifacts) {
            const artifactPair = CardData.artifacts[key];
            if (!purchasedArtifactIds.has(artifactPair.base.id)) {
                artifactPool.push(artifactPair.base);
            } else if (artifactPair.upgraded && 
                      purchasedArtifactIds.has(artifactPair.base.id) && 
                      !purchasedArtifactIds.has(artifactPair.upgraded.id)) {
                artifactPool.push(artifactPair.upgraded);
            }
        }
        
        Logger.debug(`Artifact pool size: ${artifactPool.length}`);
        
        if (artifactPool.length > 0) {
            const artifactData = artifactPool[Math.floor(gameEngine.prng.random() * artifactPool.length)];
            const artifactCard = this.createCardElement(artifactData, 'artifact', gameState, gameEngine);
            
            // Add Balatro-style slide-in animation
            artifactCard.classList.add('shop-item-slide-in');
            artifactCard.style.animationDelay = `${this.shopItemIndex * 0.08}s`;
            this.shopItemIndex++;
            
            container.appendChild(artifactCard);
        }
    }

    generateDirectSales(container, gameState, gameEngine) {
        // Generate 2-3 direct sale items (jokers, worship, libations)
        const numItems = 2 + Math.floor(gameEngine.prng.random() * 2);
        
        for (let i = 0; i < numItems; i++) {
            const rand = gameEngine.prng.random();
            let cardData;
            
            if (rand < 0.4) {
                // 40% chance for joker
                cardData = this.selectCardByRarity(CardData.jokers, gameEngine.prng);
            } else if (rand < 0.7) {
                // 30% chance for worship
                cardData = this.selectCardByRarity(CardData.worship, gameEngine.prng);
            } else {
                // 30% chance for libation
                cardData = this.selectCardByRarity(CardData.libations, gameEngine.prng);
            }
            
            if (cardData) {
                const cardElement = this.createCardElement(cardData, 'direct', gameState, gameEngine);
                
                // Add Balatro-style slide-in animation
                cardElement.classList.add('shop-item-slide-in');
                cardElement.style.animationDelay = `${this.shopItemIndex * 0.08}s`;
                this.shopItemIndex++;
                
                container.appendChild(cardElement);
            }
        }
    }

    generatePackStock(container, gameState, gameEngine) {
        // Generate 1-2 packs
        const numPacks = 1 + Math.floor(gameEngine.prng.random() * 2);
        
        for (let i = 0; i < numPacks; i++) {
            const rand = gameEngine.prng.random();
            let packData;
            
            if (rand < 0.4) {
                packData = { type: 'joker', name: 'Boon Pack', cost: 4, description: 'Reveals 3 Boons - choose one to claim.' };
            } else if (rand < 0.7) {
                packData = { type: 'worship', name: 'Worship Pack', cost: 3, description: 'Reveals 3 Worship Cards - choose one to claim.' };
            } else {
                packData = { type: 'libation', name: 'Libation Pack', cost: 5, description: 'Reveals 3 Libations - choose one to claim.' };
            }
            
            const packElement = this.createPackElement(packData, gameState, gameEngine);
            
            // Add Balatro-style slide-in animation
            packElement.classList.add('shop-item-slide-in');
            packElement.style.animationDelay = `${this.shopItemIndex * 0.08}s`;
            this.shopItemIndex++;
            
            container.appendChild(packElement);
        }
    }

    selectCardByRarity(cardArray, prng) {
        if (!cardArray || cardArray.length === 0) return null;
        
        // Simple random selection for now
        return cardArray[Math.floor(prng.random() * cardArray.length)];
    }

    createCardElement(cardData, type, gameState, gameEngine) {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.cardId = cardData.id;
        card.dataset.cardType = type;
        
        // Set card styling based on type
        if (cardData.rarity) {
            card.classList.add(cardData.rarity);
        }
        
        // Add card content
        card.innerHTML = `
            <div class="card-name">${cardData.name}</div>
            <div class="card-effect">${cardData.effect || cardData.description}</div>
            <div class="card-cost">${cardData.cost}g</div>
            <button class="card-button buy-button" data-card-id="${cardData.id}">Buy</button>
        `;
        
        // Add click handler
        const buyButton = card.querySelector('.buy-button');
        buyButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.purchaseCard(cardData, type, gameState, gameEngine);
        });
        
        return card;
    }

    createPackElement(packData, gameState, gameEngine) {
        const pack = document.createElement('div');
        pack.className = 'pack-card';
        pack.dataset.packType = packData.type;
        
        pack.innerHTML = `
            <div class="pack-title">${packData.name}</div>
            <div class="pack-description">${packData.description}</div>
            <div class="pack-cost">${packData.cost}g</div>
            <button class="pack-button buy-button" data-pack-type="${packData.type}">Buy</button>
        `;
        
        // Add click handler
        const buyButton = pack.querySelector('.buy-button');
        buyButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.purchasePack(packData, gameState, gameEngine);
        });
        
        return pack;
    }

    purchaseCard(cardData, type, gameState, gameEngine) {
        if (gameState.gold < cardData.cost) {
            gameEngine.showMessage("Not enough gold!");
            return;
        }
        
        gameEngine.updateGoldAnimated(-cardData.cost, "card purchase");
        
        // Add to appropriate collection
        if (type === 'artifact') {
            gameState.artifacts.push(cardData);
        } else if (cardData.rarity) {
            // It's a joker
            gameState.jokers.push(cardData);
        } else if (cardData.type === 'worship') {
            gameState.worship.push(cardData);
        } else if (cardData.type === 'libation') {
            gameState.libations.push(cardData);
        }
        
        // Update UI
        this.updateAllUI();
        if (this.dom.shopGold) {
        this.dom.shopGold.textContent = gameState.gold;
        }
        
        // Remove the card from shop
        const cardElement = document.querySelector(`[data-card-id="${cardData.id}"]`);
        if (cardElement) {
            cardElement.remove();
        }
        
        gameEngine.showMessage(`Purchased ${cardData.name}!`);
    }

    purchasePack(packData, gameState, gameEngine) {
        if (gameState.gold < packData.cost) {
            gameEngine.showMessage("Not enough gold!");
            return;
        }
        
        gameEngine.updateGoldAnimated(-packData.cost, "pack purchase");
        
        // Open pack
        this.openPack(packData, gameState, gameEngine);
    }

    openPack(packData, gameState, gameEngine) {
        // Switch to pack opening view
        if (this.dom.shopDefaultView) this.dom.shopDefaultView.classList.add('hidden');
        if (this.dom.packOpeningView) this.dom.packOpeningView.classList.remove('hidden');
        
        // Generate pack contents
        const packContents = this.generatePackContents(packData, gameState, gameEngine);
        
        // Display pack contents
        const packRevealedCards = document.getElementById('packRevealedCards');
        if (packRevealedCards) {
            packRevealedCards.innerHTML = '<h4>Pack Contents</h4>';
            packContents.forEach(cardData => {
                const cardElement = this.createCardElement(cardData, 'pack', gameState, gameEngine);
                packRevealedCards.appendChild(cardElement);
            });
        }
    }

    generatePackContents(packData, gameState, gameEngine) {
        const contents = [];
        const numCards = 3;
        
        for (let i = 0; i < numCards; i++) {
            let cardData;
            
            if (packData.type === 'joker') {
                cardData = this.selectCardByRarity(CardData.jokers, gameEngine.prng);
            } else if (packData.type === 'worship') {
                cardData = this.selectCardByRarity(CardData.worship, gameEngine.prng);
            } else if (packData.type === 'libation') {
                cardData = this.selectCardByRarity(CardData.libations, gameEngine.prng);
            }
            
            if (cardData) {
                contents.push(cardData);
            }
        }
        
        return contents;
    }

    displayShopInventory() {
        // Try multiple ways to find the container
        let inventoryContainer = this.dom.shopInventory;
        if (!inventoryContainer) {
            inventoryContainer = document.getElementById('shopInventory');
        }
        if (!inventoryContainer) {
            // Try to find it in the shop overlay
            const shopOverlay = document.getElementById('shopOverlay');
            if (shopOverlay) {
                inventoryContainer = shopOverlay.querySelector('#shopInventory');
            }
        }
        
        if (!inventoryContainer) {
            Logger.error('Shop inventory container not found! Attempting to create it...');
            
            // Try to create the container if it doesn't exist
            const shopDefaultView = document.getElementById('shopDefaultView');
            if (shopDefaultView) {
                const newContainer = document.createElement('div');
                newContainer.id = 'shopInventory';
                newContainer.style.maxHeight = '400px';
                newContainer.style.overflowY = 'auto';
                newContainer.style.padding = '16px';
                newContainer.style.borderRadius = '8px';
                newContainer.style.background = 'rgba(10, 26, 21, 0.3)';
                newContainer.style.border = '1px solid rgba(106, 170, 158, 0.2)';
                newContainer.style.margin = '20px 0';
                
                // Insert at the beginning of shopDefaultView
                shopDefaultView.insertBefore(newContainer, shopDefaultView.firstChild);
                
                Logger.debug('Created shop inventory container:', newContainer);
                inventoryContainer = newContainer;
            } else {
                Logger.error('Cannot create shop inventory container - shopDefaultView not found!');
                return;
            }
        }
        
        Logger.debug('Displaying shop inventory:', this.shopState.currentInventory);
        
        inventoryContainer.innerHTML = '';
        
        this.shopState.currentInventory.forEach(item => {
            const itemElement = this.createShopItemElement(item);
            inventoryContainer.appendChild(itemElement);
        });
    }

    createShopItemElement(item) {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'shop-item';
        itemDiv.dataset.itemId = item.id;
        itemDiv.dataset.itemType = item.type;
        
        const canAfford = window.game && window.game.state && window.game.state.gold >= item.cost;
        
        itemDiv.innerHTML = `
            <div class="item-header">
                <h3>${item.name}</h3>
                <span class="item-cost ${canAfford ? 'affordable' : 'unaffordable'}">${item.cost} Gold</span>
            </div>
            <p class="item-description">${item.description}</p>
            <button class="divine-button buy-button ${canAfford ? '' : 'disabled'}" 
                    ${canAfford ? '' : 'disabled'}>
                ${item.type === 'boonpack' ? 'Open Pack' : 'Buy'}
            </button>
        `;
        
        // Add click handler
        const buyButton = itemDiv.querySelector('.buy-button');
        buyButton.addEventListener('click', () => {
            if (item.type === 'boonpack') {
                this.openPack(window.game.state, window.game);
            } else {
                this.purchaseCard(item, window.game.state, window.game);
            }
        });
        
        return itemDiv;
    }

    // Helper function to filter cards based on unlocked categories
    // This ensures that cards associated with 7's, 8's, and 9's categories
    // only appear in the shop after the required bonus Yahtzees have been scored
    filterCardsByUnlockedCategories(cardPool, gameState) {
        const filteredCards = cardPool.filter(card => {
            // Check if this card is associated with a locked category
            const lockedCards = {
                // Worship cards for locked categories
                'worship_pleiades': 'Sevens',      // Requires 1st bonus Yahtzee
                'worship_poseidon_eights': 'Eights', // Requires 2nd bonus Yahtzee
                'worship_muses': 'Nines',          // Requires 3rd bonus Yahtzee
                // Boon cards for locked categories
                'poseidon_eights_rare': 'Eights'   // Requires 2nd bonus Yahtzee
            };
            
            const associatedCategory = lockedCards[card.id];
            if (associatedCategory) {
                // Only include if the category is unlocked
                const isUnlocked = gameState.unlockedCategories && gameState.unlockedCategories[associatedCategory];
                if (!isUnlocked) {
                    Logger.debug(`Filtered out ${card.id} - requires ${associatedCategory} category to be unlocked`);
                }
                return isUnlocked;
            }
            
            // Include all other cards
            return true;
        });
        
        Logger.debug(`Filtered ${cardPool.length} cards to ${filteredCards.length} available cards`);
        return filteredCards;
    }

    // Debug method to show which categories are unlocked
    debugUnlockedCategories(gameState) {
        if (!gameState.unlockedCategories) {
            Logger.debug('No unlocked categories data available');
            return;
        }
        
        Logger.debug('=== UNLOCKED CATEGORIES DEBUG ===');
        Logger.debug('Sevens unlocked:', gameState.unlockedCategories['Sevens']);
        Logger.debug('Eights unlocked:', gameState.unlockedCategories['Eights']);
        Logger.debug('Nines unlocked:', gameState.unlockedCategories['Nines']);
        Logger.debug('Bonus Yahtzees:', gameState.bonusYahtzees || 0);
        Logger.debug('================================');
    }

    // Weighted card selection based on rarity (inspired by Balatro)
    selectCardByRarity(cardPool, gameEngine, gameState = null) {
        if (cardPool.length === 0) return null;
        
        // Use global rarity weights from constants
        const rarityWeights = {
            'rustic': RARITY_WEIGHTS.RUSTIC,
            'vibrant': RARITY_WEIGHTS.VIBRANT,
            'epic': RARITY_WEIGHTS.EPIC,
            'worship': RARITY_WEIGHTS.WORSHIP,
            'libation': RARITY_WEIGHTS.LIBATION,
            'artifact': RARITY_WEIGHTS.ARTIFACT
        };
        
        // Calculate weights for each card based on rarity
        const weights = cardPool.map(card => {
            const rarity = card.rarity || 'rustic';
            let baseWeight = rarityWeights[rarity] || 50; // Default weight if rarity not found
            
            // Adjust weights based on game progression (like Balatro)
            if (gameState) {
                // Increase rare card chances as game progresses
                const turnProgress = (gameState.turn || 1) / 13; // 0 to 1
                
                if (rarity === 'epic') {
                    // Epic cards become more common in later turns
                    baseWeight = Math.floor(baseWeight * (1 + turnProgress * 0.5));
                } else if (rarity === 'rustic') {
                    // Common cards become slightly less common in later turns
                    baseWeight = Math.floor(baseWeight * (1 - turnProgress * 0.2));
                }
                
                // Bonus for having few cards of this rarity
                const rarityCount = cardPool.filter(c => c.rarity === rarity).length;
                if (rarityCount <= 2) {
                    baseWeight = Math.floor(baseWeight * 1.2); // 20% bonus for rare categories
                }
            }
            
            return Math.max(1, baseWeight); // Ensure minimum weight of 1
        });
        
        // Use the game engine's weighted choice method
        const selectedIndex = gameEngine.prng.weightedChoice(cardPool, weights);
        return cardPool[selectedIndex];
    }

    // Get rarity distribution for debugging
    getRarityDistribution(cardPool) {
        const distribution = {};
        cardPool.forEach(card => {
            const rarity = card.rarity || 'unknown';
            distribution[rarity] = (distribution[rarity] || 0) + 1;
        });
        return distribution;
    }

    // Get rarity color for UI display (inspired by Balatro)
    getRarityColor(rarity) {
        const colors = {
            'rustic': '#8B7355',      // Brown for common
            'vibrant': '#4A90E2',     // Blue for uncommon
            'epic': '#9B59B6',        // Purple for rare
            'worship': '#F39C12',     // Orange for worship
            'libation': '#E74C3C',    // Red for libations
            'artifact': '#2ECC71'     // Green for artifacts
        };
        return colors[rarity] || '#95A5A6'; // Gray for unknown
    }

    // Get rarity name for display
    getRarityName(rarity) {
        const names = {
            'rustic': 'Common',
            'vibrant': 'Uncommon', 
            'epic': 'Rare',
            'worship': 'Worship',
            'libation': 'Libation',
            'artifact': 'Artifact'
        };
        return names[rarity] || 'Unknown';
    }

    // Show rarity statistics in shop (inspired by Balatro)
    showRarityStats(gameState, gameEngine) {
        const allCards = CardData.getAllCards();
        const filteredCards = this.filterCardsByUnlockedCategories(allCards, gameState);
        
        // Calculate rarity percentages
        const rarityStats = {};
        const totalCards = filteredCards.length;
        
        filteredCards.forEach(card => {
            const rarity = card.rarity || 'unknown';
            rarityStats[rarity] = (rarityStats[rarity] || 0) + 1;
        });
        
        // Convert to percentages
        const rarityPercentages = {};
        for (const [rarity, count] of Object.entries(rarityStats)) {
            rarityPercentages[rarity] = ((count / totalCards) * 100).toFixed(1);
        }
        
        console.log('=== RARITY STATISTICS ===');
        console.log('Total available cards:', totalCards);
        for (const [rarity, percentage] of Object.entries(rarityPercentages)) {
            const color = this.getRarityColor(rarity);
            const name = this.getRarityName(rarity);
            console.log(`%c${name} (${rarity}): ${percentage}%`, `color: ${color}; font-weight: bold;`);
        }
        console.log('========================');
    }

    // Add rarity indicator to card element (inspired by Balatro)
    addRarityIndicator(cardEl, rarity) {
        if (!rarity) return;
        
        const rarityColor = this.getRarityColor(rarity);
        const rarityName = this.getRarityName(rarity);
        
        // Create rarity indicator
        const rarityIndicator = document.createElement('div');
        rarityIndicator.className = 'rarity-indicator';
        rarityIndicator.style.cssText = `
            position: absolute;
            top: 5px;
            right: 5px;
            background: ${rarityColor};
            color: white;
            padding: 2px 6px;
            border-radius: 10px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            z-index: 10;
        `;
        rarityIndicator.textContent = rarityName.charAt(0);
        rarityIndicator.title = `${rarityName} (${rarity})`;
        
        // Add to card
        cardEl.style.position = 'relative';
        cardEl.appendChild(rarityIndicator);
    }

    generateDirectSales(container, gameState, gameEngine) {

        const allCards = CardData.getAllCards();

        
        // Filter cards based on unlocked categories
        const filteredCards = this.filterCardsByUnlockedCategories(allCards, gameState);

        
        // Check if we have enough cards after filtering
        if (filteredCards.length === 0) {
            container.innerHTML += '<p style="opacity: 0.7; text-align: center;">No cards available.</p>';
            return;
        }
        
        // Check if we have enough unique cards for direct sales
        if (filteredCards.length < 2) {
            container.innerHTML += `<p style="opacity: 0.7; text-align: center;">Not enough unique cards available (${filteredCards.length}/2 needed).</p>`;
            return;
        }
        
        // Create a copy of the filtered cards to avoid duplicates
        const availableCards = [...filteredCards];
        
        // Temporarily disable rarity distribution logging
        // console.log('Direct Sales Rarity Distribution:', this.getRarityDistribution(availableCards));
        
        for (let i = 0; i < 2; i++) {
            // Temporarily use simple random selection to fix shop
            if (availableCards.length === 0) break;
            const randomIndex = Math.floor(gameEngine.prng.random() * availableCards.length);
            const cardData = availableCards.splice(randomIndex, 1)[0];
            let card;
            
            switch (cardData.class) {
                case 'Joker':
                    card = new Joker(cardData);
                    break;
                case 'WorshipCard':
                    card = new WorshipCard(cardData);
                    break;
                case 'LibationCard':
                    card = new LibationCard(cardData);
                    break;
                default:
                    card = new Card(cardData);
            }
            
    
            const cardEl = card.render(true, true);
            
            // Temporarily disable rarity indicators to fix shop
            // this.addRarityIndicator(cardEl, cardData.rarity);
            
            // Add click listener for buy/sell labels
            const buyLabel = cardEl.querySelector('.buy-sell-label.buy');
            if (buyLabel) {
        
                buyLabel.addEventListener('click', (e) => {
            
                    e.stopPropagation();
                    this.buyCard(card, gameState, gameEngine, cardEl);
                });
            }
            container.appendChild(cardEl);
        }
    }

    generatePackStock(container, gameState, gameEngine) {
        let packPool = [...CardData.packs];
        
        if (gameState.activeBlind === 'no_worship') {
            packPool = packPool.filter(p => p.type !== 'worship');
        }
        
        // Check available cards for each type
        const jokersAvailable = this.filterCardsByUnlockedCategories(CardData.jokers, gameState).length;
        const worshipAvailable = this.filterCardsByUnlockedCategories(CardData.worship, gameState).length;
        const libationsAvailable = this.filterCardsByUnlockedCategories(CardData.libations, gameState).length;
        
        console.log(`Available cards - Jokers: ${jokersAvailable}, Worship: ${worshipAvailable}, Libations: ${libationsAvailable}`);
        
        // Filter out pack types that would have no available cards
        packPool = packPool.filter(pack => {
            switch (pack.type) {
                case 'joker':
                    return jokersAvailable >= 3; // Need at least 3 unique cards for a pack
                case 'worship':
                    return worshipAvailable >= 3;
                case 'libation':
                    return libationsAvailable >= 3;
                case 'chaos':
                    return jokersAvailable > 0 || worshipAvailable > 0 || libationsAvailable > 0;
                default:
                    return true;
            }
        });
        
        console.log(`Pack pool size after filtering: ${packPool.length}`);
        
        // Check if we have enough unique packs
        if (packPool.length < 2) {
            container.innerHTML += `<p style="opacity: 0.7; text-align: center;">Not enough unique packs available (${packPool.length}/2 needed).</p>`;
            return;
        }
        
        for (let i = 0; i < 2; i++) {
            if (packPool.length === 0) break;
            
            const packIndex = Math.floor(gameEngine.prng.random() * packPool.length);
            const packData = packPool.splice(packIndex, 1)[0];
            
            const packEl = document.createElement('div');
            packEl.className = `pack-card pack-${packData.type}`;
            packEl.setAttribute('data-tooltip', JSON.stringify({
                title: packData.name,
                description: packData.description,
                cost: `${packData.cost} Gold`
            }));
            packEl.innerHTML = '';
            packEl.addEventListener('click', () => {
                this.buyPack(packData.type, gameState, gameEngine);
            });
            container.appendChild(packEl);
            console.log(`Added pack: ${packData.name}`);
        }
    }

    // Shop transaction methods
    buyArtifact(artifactData, gameState, gameEngine, element) {
        if (gameState.gold < artifactData.cost) {
            gameEngine.showMessage("Not enough gold for this artifact!");
            return;
        }
        
        if (window.dataManager) {
            window.dataManager.unlockItem('artifacts', artifactData.id);
        }
        
        gameEngine.updateGoldAnimated(-artifactData.cost, "artifact purchase");
        gameState.artifacts.push(artifactData);
        gameEngine.showMessage(`Acquired: ${artifactData.name}!`);
        
        element.remove();
        if (this.dom.shopGold) {
        this.dom.shopGold.textContent = gameState.gold;
        }
        
        gameEngine.applyArtifactEffects();
        gameEngine.updateAllUI();
    }

    buyCard(card, gameState, gameEngine, element) {

        
        if (gameState.gold < card.cost) {
    
            gameEngine.showMessage("Not enough gold!");
            return;
        }
        

        gameEngine.updateGoldAnimated(-card.cost, "card purchase");

        // Add Balatro-style purchase effect
        if (window.balatroEffects && element) {
            window.balatroEffects.addCardPurchaseEffect(element);
        }

        this.claimCard(card, gameState, gameEngine, element);
    }

    claimCard(card, gameState, gameEngine, element) {

        
        // Check if this was claimed from a pack opening view and if pack is already claimed
        if (element?.parentNode?.id === 'packRevealedCards') {
            const container = element.parentNode;
            if (container.dataset.packClaimed === 'true') {
        
                return; // Pack already claimed, ignore further clicks
            }
            // Mark pack as claimed
            container.dataset.packClaimed = 'true';
    
        }
        
        if (card instanceof Joker) {
    
            if (gameState.jokers.length >= gameState.boonSlots) {
        
                gameEngine.showMessage("Boon slots are full!");
                if (element?.parentNode?.id === 'shopDirectSales') {
                    gameEngine.updateGoldAnimated(card.cost, "refund");
                }
                return;
            }
            
            if (window.dataManager) {
                window.dataManager.unlockItem('boons', card.id);
            }
            gameState.jokers.push(card);
            
        } else if (card instanceof WorshipCard) {
    
            card.applyWorship(gameState);
            
        } else if (card instanceof LibationCard) {
    
            if (gameState.consumables.length >= gameState.consumableSlots) {
        
                gameEngine.showMessage("Libation slots are full!");
                if (element?.parentNode?.id === 'shopDirectSales') {
                    gameEngine.updateGoldAnimated(card.cost, "refund");
                }
                return;
            }
            gameState.consumables.push(card);
        }
        
        if (element) {
            element.remove();
        }
        
        if (this.dom.shopGold) {
        this.dom.shopGold.textContent = gameState.gold;
        }
        gameEngine.updateAllUI();
        
        Logger.debug('Card claimed successfully');
    }

    useConsumable(card, gameState, gameEngine) {
        if (!card.canUse()) {
            gameEngine.showMessage("Cannot use this libation right now.");
            return;
        }
        
        let success = false;
        let message = "";
        
        // Handle different card types
        if (card instanceof LibationCard) {
            success = card.applyRule(gameState, gameEngine);
            message = success ? `Libation activated: ${card.name}!` : "Failed to activate libation.";
        } else if (card instanceof WorshipCard) {
            success = card.applyWorship(gameState);
            message = success ? `Worship applied: ${card.name}!` : "Failed to apply worship.";
        } else {
            // Generic card usage
            success = card.use ? card.use() : false;
            message = success ? `Used: ${card.name}!` : "Failed to use card.";
        }
        
        if (success) {
            gameEngine.showMessage(message);
            
            // Remove the card from consumables
            const cardIndex = gameState.consumables.findIndex(c => c.id === card.id);
            if (cardIndex !== -1) {
                gameState.consumables.splice(cardIndex, 1);
            }
            
            gameEngine.updateAllUI();
        } else {
            gameEngine.showMessage(message || "Failed to use libation.");
        }
    }

    rerollShop(gameState, gameEngine) {
        const hasChronosHourglass = gameState.artifacts.some(a => a.id === 'sundial_plus');
        
        if (hasChronosHourglass && !gameState.usedFreeReroll) {
            gameState.usedFreeReroll = true;
            gameEngine.showMessage("Used your free reroll from Chronos' Hourglass!");
            this.generateShopStock(gameState, gameEngine);
            return;
        }
        
        if (gameState.gold < GAME_BALANCE.SHOP_REROLL_COST) {
            gameEngine.showMessage("Not enough gold to reroll!");
            return;
        }
        
        // Balatro-style reroll: flip cards before regenerating
        const allShopItems = document.querySelectorAll('.shop-section .card, .shop-section .pack-card');
        allShopItems.forEach((item, index) => {
            item.classList.add('shop-item-flip-out');
            item.style.animationDelay = `${index * 0.05}s`;
        });
        
        // Wait for flip animation before regenerating
        setTimeout(() => {
            gameEngine.updateGoldAnimated(-GAME_BALANCE.SHOP_REROLL_COST, "reroll");
        this.generateShopStock(gameState, gameEngine);
            if (this.dom.shopGold) {
        this.dom.shopGold.textContent = gameState.gold;
            }
        }, 400);
    }

    sellCard(cardToSell, gameState, gameEngine) {
        let inventory = cardToSell.type === 'joker' ? gameState.jokers : gameState.consumables;
        const cardIndex = inventory.findIndex(c => c.id === cardToSell.id);
        
        if (cardIndex > -1) {
            const soldCard = inventory.splice(cardIndex, 1)[0];
            let totalGold = soldCard.sellValue;
            
            // Check for The Merchant boon - gives +1 gold for selling libations/worship
            const hasMerchant = gameState.jokers?.some(j => j.id === 'the_merchant');
            if (hasMerchant && (soldCard.type === 'libation' || soldCard.type === 'worship')) {
                totalGold += 1;
                gameEngine.showMessage("The Merchant: +1 Gold!");
            }
            
            // Check for Mortal Vineyard - selling a boon gives random libation
            const hasVineyard = gameState.jokers?.some(j => j.id === 'mortal_vineyard');
            if (hasVineyard && soldCard.type === 'joker' && gameState.consumables.length < gameState.consumableSlots) {
                const libationPool = CardData.libations;
                const randomLibationData = libationPool[Math.floor(Math.random() * libationPool.length)];
                const newLibation = new LibationCard(randomLibationData);
                
                gameState.consumables.push(newLibation);
                gameEngine.showMessage(`Mortal Vineyard: Gained ${newLibation.name}!`, 3000);
            }
            
            gameEngine.updateGoldAnimated(totalGold, "card sale");
            gameEngine.showMessage(`Sold ${soldCard.name} for ${totalGold} Gold.`);
            
            // Update shop gold display if shop is open
            if (this.dom.shopGold) {
                this.dom.shopGold.textContent = gameState.gold;
            }
            
            gameEngine.updateAllUI();
        }
    }

    /**
     * Balatro-style pack opening with animations
     * @param {string} packType - Type of pack to open
     * @param {Object} gameState - Current game state
     * @param {Object} gameEngine - Game engine reference
     */
    buyPack(packType, gameState, gameEngine) {
        const packData = CardData.packs.find(p => p.type === packType);
        if (gameState.gold < packData.cost) {
            gameEngine.showMessage("Not enough gold!");
            return;
        }
        
        gameState.gold -= packData.cost;
        
        // Update gold display with animation
        if (this.dom.shopGold) {
            this.dom.shopGold.textContent = gameState.gold;
        }
        
        // Switch to pack opening view
        this.dom.shopDefaultView.classList.add('hidden');
        this.dom.packOpeningView.classList.remove('hidden');
        this.dom.shopOverlay.querySelector('.modal-content').classList.add('pack-opening-stage');
        
        const revealedContainer = document.getElementById('packRevealedCards');
        revealedContainer.innerHTML = '';
        
        this.updatePackConsumables(gameState, gameEngine);
        
        // BALATRO-STYLE PACK OPENING ANIMATION
        this.playPackOpeningAnimation(packType, revealedContainer, gameState, gameEngine);
    }
    
    /**
     * Balatro-inspired pack opening animation
     * - Pack rips open
     * - Cards fly in one by one with stagger
     * - Cards flip to reveal
     * - Particles for high rarity
     */
    playPackOpeningAnimation(packType, container, gameState, gameEngine) {
        const packData = CardData.packs.find(p => p.type === packType);
        
        // Step 1: Show pack "ripping" animation
        container.innerHTML = `
            <div class="pack-opening-container">
                <div class="pack-rip-animation pack-${packType}">
                    <div class="pack-image"></div>
                    <div class="pack-rip-overlay"></div>
                </div>
                <div class="pack-opening-title">${packData.name}</div>
            </div>
        `;
        
        // Animate the pack ripping
        const packRip = container.querySelector('.pack-rip-animation');
        setTimeout(() => {
            packRip.classList.add('ripping');
        }, 100);
        
        // Step 2: After rip animation, reveal cards
        setTimeout(() => {
            packRip.classList.add('ripped');
            
            // Clear and prepare for cards
            container.innerHTML = '<div class="pack-cards-revealer"></div>';
            const cardsContainer = container.querySelector('.pack-cards-revealer');
            
            // Generate pack contents
            this.revealPackCardsWithAnimation(packType, cardsContainer, gameState, gameEngine);
            
        }, 1200); // Wait for rip animation
    }
    
    /**
     * Reveal pack cards with staggered fly-in and flip animation
     */
    revealPackCardsWithAnimation(packType, container, gameState, gameEngine) {
        const cardCount = 3;
        const generatedCards = this.generatePackCardData(packType, cardCount, gameState, gameEngine);
        
        if (!generatedCards || generatedCards.length === 0) {
            container.innerHTML = '<p style="opacity: 0.7; text-align: center;">No cards available for this pack type.</p>';
            return;
        }
        
        // Create instruction text
        const instructionDiv = document.createElement('div');
        instructionDiv.className = 'pack-instruction';
        instructionDiv.textContent = 'Choose One Card';
        container.appendChild(instructionDiv);
        
        // Create cards container
        const cardsGrid = document.createElement('div');
        cardsGrid.className = 'pack-cards-grid';
        container.appendChild(cardsGrid);
        
        let selectedCard = null;
        
        // Reveal cards one by one with stagger
        generatedCards.forEach((cardData, index) => {
            setTimeout(() => {
                const cardWrapper = document.createElement('div');
                cardWrapper.className = 'pack-card-wrapper';
                cardWrapper.style.animationDelay = `${index * 0.15}s`;
                
                // Create card back (initially shown)
                const cardBack = document.createElement('div');
                cardBack.className = 'pack-card-back';
                
                // Create actual card (hidden initially)
                const card = cardData.card;
                const cardEl = card.render(true, false);
                cardEl.classList.add('pack-card-reveal');
                cardEl.style.opacity = '0';
                
                cardWrapper.appendChild(cardBack);
                cardWrapper.appendChild(cardEl);
                cardsGrid.appendChild(cardWrapper);
                
                // Flip animation after a brief delay
                setTimeout(() => {
                    cardWrapper.classList.add('flipping');
                    
                    // Show real card, hide back
                    setTimeout(() => {
                        cardBack.style.opacity = '0';
                        cardEl.style.opacity = '1';
                        cardWrapper.classList.add('revealed');
                        
                        // Add particles for high rarity
                        if (['epic', 'worship'].includes(card.rarity)) {
                            this.addCardRevealParticles(cardWrapper);
                        }
                    }, 300);
                    
                }, 400 + (index * 150)); // Stagger the flip
                
                // Click handlers for selection and claiming
                let clickCount = 0;
                let clickTimer = null;
                
                cardWrapper.addEventListener('click', () => {
                    clickCount++;
                    
                    if (clickCount === 1) {
                        // First click - select
                        if (selectedCard && selectedCard !== cardWrapper) {
                            selectedCard.classList.remove('selected');
                        }
                        selectedCard = cardWrapper;
                        cardWrapper.classList.add('selected');
                        
                        // Reset click count after delay
                        clickTimer = setTimeout(() => {
                            clickCount = 0;
                        }, 400);
                        
                    } else if (clickCount === 2) {
                        // Second click (double-click) - claim
                        clearTimeout(clickTimer);
                        clickCount = 0;
                        
                        cardWrapper.classList.add('claiming');
                        
                        // Claim the card after animation
                        setTimeout(() => {
                            this.claimCard(card, gameState, gameEngine, cardEl);
                            
                            // Close pack opening view and return to shop
                            setTimeout(() => {
                                this.closePackOpeningView();
                            }, 100);
                        }, 300);
                    }
                });
                
            }, index * 200); // Stagger appearance
        });
    }
    
    /**
     * Generate card data for pack (separate from rendering for animation control)
     */
    generatePackCardData(packType, cardCount, gameState, gameEngine) {
        let cardPool, CardClass;
        
        switch (packType) {
            case 'joker':
                cardPool = CardData.jokers;
                CardClass = Joker;
                break;
            case 'worship':
                cardPool = CardData.worship;
                CardClass = WorshipCard;
                break;
            case 'libation':
                cardPool = CardData.libations;
                CardClass = LibationCard;
                break;
            case 'chaos':
                return this.generateChaosPackCardData(cardCount, gameState, gameEngine);
        }
        
        // Filter cards based on unlocked categories
        const filteredPool = this.filterCardsByUnlockedCategories(cardPool, gameState);
        
        if (filteredPool.length === 0) {
            return [];
        }
        
        const result = [];
        const availableCards = [...filteredPool];
        
        for (let i = 0; i < cardCount && availableCards.length > 0; i++) {
            const randomIndex = Math.floor(gameEngine.prng.random() * availableCards.length);
            const cardData = availableCards.splice(randomIndex, 1)[0];
            const card = new CardClass(cardData);
            result.push({ card, cardData });
        }
        
        return result;
    }
    
    /**
     * Add particle effects for high rarity card reveals
     */
    addCardRevealParticles(cardWrapper) {
        const particleCount = 12;
        const rect = cardWrapper.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'pack-reveal-particle';
            particle.style.left = centerX + 'px';
            particle.style.top = centerY + 'px';
            
            const angle = (i / particleCount) * Math.PI * 2;
            const distance = 50 + Math.random() * 30;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            
            particle.style.setProperty('--tx', `${tx}px`);
            particle.style.setProperty('--ty', `${ty}px`);
            particle.style.animationDelay = `${i * 0.05}s`;
            
            document.body.appendChild(particle);
            
            setTimeout(() => particle.remove(), 1000);
        }
    }
    
    /**
     * Generate card data for chaos pack (mixed types)
     */
    generateChaosPackCardData(cardCount, gameState, gameEngine) {
        const result = [];
        const cardTypes = [
            { pool: CardData.jokers, class: Joker },
            { pool: CardData.worship, class: WorshipCard },
            { pool: CardData.libations, class: LibationCard }
        ];
        
        for (let i = 0; i < cardCount; i++) {
            const randomType = cardTypes[Math.floor(gameEngine.prng.random() * cardTypes.length)];
            const filteredPool = this.filterCardsByUnlockedCategories(randomType.pool, gameState);
            
            if (filteredPool.length > 0) {
                const randomIndex = Math.floor(gameEngine.prng.random() * filteredPool.length);
                const cardData = filteredPool[randomIndex];
                const card = new randomType.class(cardData);
                result.push({ card, cardData });
            }
        }
        
        return result;
    }

    generatePackContents(packType, container, gameState, gameEngine) {
        let cardCount = 3;
        let cardPool, CardClass;
        
        switch (packType) {
            case 'joker':
                cardPool = CardData.jokers;
                CardClass = Joker;
                break;
            case 'worship':
                cardPool = CardData.worship;
                CardClass = WorshipCard;
                break;
            case 'libation':
                cardPool = CardData.libations;
                CardClass = LibationCard;
                break;
            case 'chaos':
                // Special handling for chaos pack
                this.generateChaosPackContents(container, gameState, gameEngine);
                return;
        }
        
        // Filter cards based on unlocked categories
        const filteredPool = this.filterCardsByUnlockedCategories(cardPool, gameState);
        
        console.log(`Pack type: ${packType}, Original pool size: ${cardPool.length}, Filtered pool size: ${filteredPool.length}`);
        
        // Check if we have enough cards after filtering
        if (filteredPool.length === 0) {
            container.innerHTML += '<p style="opacity: 0.7; text-align: center;">No cards available for this pack type.</p>';
            return;
        }
        
        // Check if we have enough unique cards for the pack
        if (filteredPool.length < cardCount) {
            container.innerHTML += `<p style="opacity: 0.7; text-align: center;">Not enough unique cards available (${filteredPool.length}/${cardCount} needed).</p>`;
            return;
        }
        
        // Store the cards and selected card for this pack
        const packCards = [];
        let selectedCard = null;
        
        // Create a copy of the filtered pool to avoid duplicates
        const availableCards = [...filteredPool];
        
        // Temporarily disable rarity distribution logging
        // console.log(`${packType} Pack Rarity Distribution:`, this.getRarityDistribution(availableCards));
        
        for (let i = 0; i < cardCount; i++) {
            // Temporarily use simple random selection to fix shop
            if (availableCards.length === 0) break;
            const randomIndex = Math.floor(gameEngine.prng.random() * availableCards.length);
            const cardData = availableCards.splice(randomIndex, 1)[0];
            
            const card = new CardClass(cardData);
            const cardEl = card.render(true, false);
            
            // Temporarily disable rarity indicators to fix shop
            // this.addRarityIndicator(cardEl, cardData.rarity);
            
            // Card info is now handled by the Balatro-style tooltip system
            
            // Make card clickable to select (single click)
            cardEl.addEventListener('click', () => {
                // Deselect previously selected card
                if (selectedCard) {
                    selectedCard.classList.remove('selected');
                }
                
                // Select this card
                selectedCard = cardEl;
                cardEl.classList.add('selected');
            });
            
            // Add Balatro-style take label for pack cards
            const takeLabel = cardEl.querySelector('.buy-sell-label.buy');
            if (takeLabel) {
                takeLabel.textContent = 'Take';
                takeLabel.classList.remove('buy');
                takeLabel.classList.add('take');
                console.log(`Added Take button to card: ${card.name}`);
                takeLabel.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent card click event
                    console.log(`Take button clicked for card: ${card.name}`);
            
                    // Disable all card interactions
                    packCards.forEach(p => {
                        p.element.style.pointerEvents = 'none';
                        p.element.style.opacity = '0.5';
                    });
                    
                    // Claim the selected card
                    this.claimCard(card, gameState, gameEngine, cardEl);
                    
                    // Force close the pack opening view
                    setTimeout(() => {
                        this.closePackOpeningView();
                    }, 100);
                });
            } else {
                console.log(`No Take button found for card: ${card.name}`);
            }
            
            container.appendChild(cardEl);
            packCards.push({ card, element: cardEl });
            console.log(`Added card to pack: ${card.name}`);
        }
    }

    generateChaosPackContents(container, gameState, gameEngine) {
        // Create 3 random cards from any combination of boons, worship, and libations
        const allCardPools = [
            { pool: CardData.jokers, class: Joker, name: 'Boon' },
            { pool: CardData.worship, class: WorshipCard, name: 'Worship' },
            { pool: CardData.libations, class: LibationCard, name: 'Libation' }
        ];
        
        // Filter all pools first to ensure we have available cards
        const availablePools = allCardPools.map(pool => ({
            ...pool,
            filteredPool: this.filterCardsByUnlockedCategories(pool.pool, gameState)
        })).filter(pool => pool.filteredPool.length > 0);
        
        if (availablePools.length === 0) {
            container.innerHTML += '<p style="opacity: 0.7; text-align: center;">No cards available for chaos pack.</p>';
            return;
        }
        
        // Check total available cards across all pools
        const totalAvailableCards = availablePools.reduce((sum, pool) => sum + pool.filteredPool.length, 0);
        if (totalAvailableCards < 3) {
            container.innerHTML += `<p style="opacity: 0.7; text-align: center;">Not enough unique cards available for chaos pack (${totalAvailableCards}/3 needed).</p>`;
            return;
        }
        
        // Store the cards and selected card for this pack
        const packCards = [];
        let selectedCard = null;
        
        // Create copies of filtered pools to avoid duplicates
        const poolCopies = availablePools.map(pool => ({
            ...pool,
            availableCards: [...pool.filteredPool]
        }));
        
        for (let i = 0; i < 3; i++) {
            // Find pools that still have available cards
            const poolsWithCards = poolCopies.filter(pool => pool.availableCards.length > 0);
            
            if (poolsWithCards.length === 0) {
                console.warn('No more cards available in chaos pack generation');
                break;
            }
            
            // Randomly select which card pool to use (from pools with available cards)
            const poolIndex = Math.floor(gameEngine.prng.random() * poolsWithCards.length);
            const selectedPool = poolsWithCards[poolIndex];
            
            // Temporarily use simple random selection to fix shop
            if (selectedPool.availableCards.length === 0) break;
            const cardIndex = Math.floor(gameEngine.prng.random() * selectedPool.availableCards.length);
            const cardData = selectedPool.availableCards.splice(cardIndex, 1)[0];
            const card = new selectedPool.class(cardData);
            const cardEl = card.render(true, false);
            
            // Temporarily disable rarity indicators to fix shop
            // this.addRarityIndicator(cardEl, cardData.rarity);
            
            // Add a small indicator of what type of card this is
            const cardTypeIndicator = document.createElement('div');
            cardTypeIndicator.className = `card-type-indicator card-type-${selectedPool.name.toLowerCase()}`;
            cardTypeIndicator.textContent = selectedPool.name;
            cardEl.style.position = 'relative';
            cardEl.appendChild(cardTypeIndicator);
            
            // Card info is now handled by the Balatro-style tooltip system
            
            // Make card clickable to select (single click)
            cardEl.addEventListener('click', () => {
                // Deselect previously selected card
                if (selectedCard) {
                    selectedCard.classList.remove('selected');
                }
                
                // Select this card
                selectedCard = cardEl;
                cardEl.classList.add('selected');
            });
            
            // Add Balatro-style take label for chaos pack cards
            const takeLabel = cardEl.querySelector('.buy-sell-label.buy');
            if (takeLabel) {
                takeLabel.textContent = 'Take';
                takeLabel.classList.remove('buy');
                takeLabel.classList.add('take');
                console.log(`Added Take button to chaos card: ${card.name}`);
                takeLabel.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent card click event
                    console.log(`Take button clicked for chaos card: ${card.name}`);
            
                    // Disable all card interactions
                    packCards.forEach(p => {
                        p.element.style.pointerEvents = 'none';
                        p.element.style.opacity = '0.5';
                    });
                    
                    // Claim the selected card
                    this.claimCard(card, gameState, gameEngine, cardEl);
                    
                    // Force close the pack opening view
                    setTimeout(() => {
                        this.closePackOpeningView();
                    }, 100);
                });
            } else {
                console.log(`No Take button found for chaos card: ${card.name}`);
            }
            
            container.appendChild(cardEl);
            packCards.push({ card, element: cardEl });
            console.log(`Added chaos card to pack: ${card.name}`);
        }
    }

    updatePackConsumables(gameState, gameEngine) {
        const consumablesContainer = document.getElementById('packPlayerConsumables');
        consumablesContainer.innerHTML = '<h4>Your Libations</h4>';
        
        if (gameState.consumables.length === 0) {
            consumablesContainer.innerHTML += '<p style="opacity: 0.7">None</p>';
        } else {
            gameState.consumables.forEach(card => {
                const cardEl = card.render();
                cardEl.addEventListener('click', () => {
                    this.useConsumable(card, gameState, gameEngine);
                });
                consumablesContainer.appendChild(cardEl);
            });
        }
    }

    // Close pack opening view and return to shop
    closePackOpeningView() {
        Logger.debug('Closing pack opening view...');
        
        // Check if DOM elements exist before trying to access them
        if (!this.dom.packOpeningView) {
            Logger.error('packOpeningView element not found!');
            return;
        }
        if (!this.dom.shopDefaultView) {
            console.error('shopDefaultView element not found!');
            return;
        }
        if (!this.dom.shopOverlay) {
            console.error('shopOverlay element not found!');
            return;
        }
        
        // Hide pack opening view and show shop default view
        this.dom.packOpeningView.classList.add('hidden');
        this.dom.shopDefaultView.classList.remove('hidden');
        
        // Remove pack opening stage class from modal content
        const modalContent = this.dom.shopOverlay.querySelector('.modal-content');
        if (modalContent) {
            modalContent.classList.remove('pack-opening-stage');
        }
        
        // Clear the revealed cards container
        const revealedContainer = document.getElementById('packRevealedCards');
        if (revealedContainer) {
            revealedContainer.innerHTML = '<h4>Hover to see Take labels</h4>';
            // Reset pack claimed state
            revealedContainer.dataset.packClaimed = 'false';
        } else {
            console.warn('packRevealedCards container not found');
        }
        
        console.log('Pack opening view closed successfully');
    }
}