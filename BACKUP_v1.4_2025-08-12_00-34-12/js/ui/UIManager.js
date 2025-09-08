// UIManager - Handles all UI updates and interactions

class UIManager {
    constructor() {
        this.dom = {};
        this.isInitialized = false;
    }

    initialize() {
        if (this.isInitialized) {
            console.log('UIManager already initialized, skipping...');
            return;
        }
        
        this.bindDOMElements();
        this.setupShopManager();
        this.isInitialized = true;
        console.log('UIManager initialized successfully');
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
            shopGold: document.getElementById('shopGold'),
            shopAnte: document.getElementById('shopAnte'),
            interestDisplay: document.getElementById('interestDisplay'),
            
            // Overlays
            confirmOverlay: document.getElementById('confirmOverlay'),
            libationOverlay: document.getElementById('libationOverlay'),
            
            // Message popup
            messagePopup: document.getElementById('message-popup')
        };
        
        // Check for critical elements
        const criticalElements = ['shopOverlay', 'diceContainer', 'rollButton'];
        const missingElements = criticalElements.filter(elementName => !this.dom[elementName]);
        
        if (missingElements.length > 0) {
            console.warn(`Missing critical elements: ${missingElements.join(', ')}`);
        }
    }

    setupShopManager() {
        window.shopManager = {
            openShop: (gameState, gameEngine) => this.openShop(gameState, gameEngine),
            closeShop: () => this.closeShop(),
            rerollShop: (gameState, gameEngine) => this.rerollShop(gameState, gameEngine),
            toggleSellMode: (gameState, gameEngine) => this.toggleSellMode(gameState, gameEngine),
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
            console.log('Critical game elements not available yet, skipping UI update');
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
            console.warn('Dice container not found, cannot update dice UI');
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
            
            // Show die face or question mark
            const displayFace = gameState.hasRolled ? die.getDisplayFace() : '?';
            dieEl.textContent = displayFace;
            dieEl.setAttribute('data-face', displayFace);
            
            // Debug logging for face values
            if (gameState.hasRolled && currentFace > 0) {
                console.log(`Die ${index + 1} (ID: ${die.dieId}): face=${currentFace}, modifiedValue=${die.faces[currentFace]?.modifiedValue}, effectiveFace=${die.getEffectiveFace()}, displayFace=${displayFace}`);
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
            
            // Add permanent modifier indicator (shows always if non-zero)
            const permanentModifier = die.getPermanentModifier();
            if (permanentModifier !== 0) {
                const modifierBadge = document.createElement('div');
                modifierBadge.className = 'die-permanent-modifier-badge';
                modifierBadge.textContent = permanentModifier > 0 ? `*+${permanentModifier}` : `*${permanentModifier}`;
                modifierBadge.style.cssText = `
                    position: absolute;
                    bottom: -8px;
                    right: -8px;
                    padding: 2px 6px;
                    background: ${permanentModifier > 0 ? '#4CAF50' : '#F44336'};
                    border-radius: 4px;
                    font-size: 10px;
                    color: white;
                    font-weight: bold;
                    border: 1px solid var(--stone-terracotta-dark);
                    z-index: 10;
                `;
                dieEl.appendChild(modifierBadge);
            }
            
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
                row.classList.add('used');
                scoreDisplay.textContent = gameState.scorecard[category];
            } else {
                row.classList.remove('used');
                
                if (gameState.hasRolled && window.game) {
                    let { pips, favour, isValid } = window.game.calculateScore(category);
                    
                    if (isValid) {
                        // Apply joker effects to the potential score display
                        let eventData = { category, pips, favour };
                        gameState.jokers.forEach(joker => {
                            eventData = joker.onEvent('score', gameState, eventData);
                        });
                        
                        pips = eventData.pips;
                        favour = eventData.favour;
                        
                        scoreDisplay.innerHTML = `${pips} <span style="color: var(--accent-red-desat)">(x${favour})</span>`;
                    } else {
                        scoreDisplay.textContent = '-';
                    }
                } else {
                    scoreDisplay.textContent = '-';
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
        this.updateJokerUI(gameState);
        this.updateConsumableUI(gameState, gameEngine);
        this.updateArtifactUI(gameState);
    }

    updateJokerUI(gameState) {
        const container = this.dom.jokerSlots;
        
        // Add error handling for missing element
        if (!container) {
            console.warn('jokerSlots element not found');
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
            console.warn('consumableSlots element not found');
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
                    console.error('No game engine available for useConsumable');
                }
            });
            
            container.appendChild(cardEl);
        });
    }

    updateArtifactUI(gameState) {
        const container = this.dom.artifactSlots;
        
        // Add error handling for missing element
        if (!container) {
            console.warn('artifactSlots element not found');
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



    // Shop functionality
    openShop(gameState, gameEngine) {
        gameState.usedFreeReroll = false;
        
        // Apply interest
        const interestCap = 5 + (gameState.artifacts.some(a => a.id === 'cornucopia') ? 1 : 0);
        const interest = Math.min(interestCap, Math.floor(gameState.gold / 5));
        gameState.gold += interest;
        
        if (interest > 0) {
            gameEngine.showMessage(`+${interest} Gold from interest!`);
        }
        
        // Add null checks for shop elements
        if (!this.dom.shopOverlay) {
            console.warn('Shop overlay not found, attempting to restore...');
            // Try to find the shop overlay again
            const shopOverlay = document.getElementById('shopOverlay');
            if (shopOverlay) {
                this.dom.shopOverlay = shopOverlay;
        
            } else {
                console.error('Shop overlay still not found, cannot open shop');
                return;
            }
        }
        
        this.dom.shopOverlay.classList.remove('hidden');
        
        if (this.dom.shopGold) this.dom.shopGold.textContent = gameState.gold;
        if (this.dom.shopAnte) this.dom.shopAnte.textContent = gameState.ante;
        if (this.dom.interestDisplay) this.dom.interestDisplay.textContent = `+${interest}`;
        
        gameState.sellMode = false;
        this.dom.shopOverlay.classList.remove('sell-mode-active');
        
        const sellModeButton = document.getElementById('sellModeButton');
        if (sellModeButton) sellModeButton.textContent = '💰 Sell Mode';
        
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
        if (!this.dom.shopOverlay) {
            console.warn('Shop overlay not found, attempting to restore...');
            // Try to find the shop overlay again
            const shopOverlay = document.getElementById('shopOverlay');
            if (shopOverlay) {
                this.dom.shopOverlay = shopOverlay;
        
            } else {
                console.error('Shop overlay still not found, cannot close shop');
                return;
            }
        }
        
        this.dom.shopOverlay.classList.add('hidden');
        
        const modalContent = this.dom.shopOverlay.querySelector('.modal-content');
        if (modalContent) {
            modalContent.classList.remove('pack-opening-stage');
        }
    }

    generateShopStock(gameState, gameEngine) {

        const directSalesContainer = document.getElementById('shopDirectSales');
        const packsContainer = document.getElementById('shopPacksArea');
        const artifactsContainer = document.getElementById('shopArtifactsArea');
        
        // Add null checks for shop containers
        if (!directSalesContainer || !packsContainer || !artifactsContainer) {
            console.warn('Shop containers not found, cannot generate shop stock');
            return;
        }
        
        console.log('Generating shop stock...');
        
        // Clear containers
        directSalesContainer.innerHTML = '<h4>Wares</h4>';
        packsContainer.innerHTML = '<h4>Packs</h4>';
        artifactsContainer.innerHTML = '<h4>Divine Artifacts</h4>';
        
        // Generate artifacts
        this.generateArtifactStock(artifactsContainer, gameState, gameEngine);
        
        // Generate direct sales
        this.generateDirectSales(directSalesContainer, gameState, gameEngine);
        
        // Generate packs
        this.generatePackStock(packsContainer, gameState, gameEngine);
        
        console.log('Shop stock generation complete');
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
        
        console.log(`Artifact pool size: ${artifactPool.length}`);
        
        if (artifactPool.length > 0) {
            const artifactData = artifactPool[Math.floor(gameEngine.prng.random() * artifactPool.length)];
            const artifactEl = document.createElement('div');
            artifactEl.className = 'pack-card';
            artifactEl.setAttribute('data-tooltip', JSON.stringify({
                title: artifactData.name,
                description: artifactData.effect,
                cost: `${artifactData.cost} Gold`
            }));
            artifactEl.innerHTML = '';
            artifactEl.addEventListener('click', () => {
                this.buyArtifact(artifactData, gameState, gameEngine, artifactEl);
            });
            container.appendChild(artifactEl);
            console.log(`Added artifact: ${artifactData.name}`);
        } else {
            container.innerHTML += '<p style="opacity: 0.7; text-align: center;">No new artifacts available.</p>';
            console.log('No artifacts available');
        }
    }

    // Helper function to filter cards based on unlocked categories
    filterCardsByUnlockedCategories(cardPool, gameState) {
        // Temporarily return all cards to fix pack contents
        return cardPool;
        
        // Original filtering logic (commented out for now)
        /*
        return cardPool.filter(card => {
            // Check if this card is associated with a locked category
            const lockedCards = {
                // Worship cards for locked categories
                'worship_pleiades': 'Sevens',
                'worship_poseidon_eights': 'Eights', 
                'worship_muses': 'Nines',
                // Boon cards for locked categories
                'poseidon_eights_rare': 'Eights'
            };
            
            const associatedCategory = lockedCards[card.id];
            if (associatedCategory) {
                // Only include if the category is unlocked
                return gameState.unlockedCategories[associatedCategory];
            }
            
            // Include all other cards
            return true;
        });
        */
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
        
        for (let i = 0; i < 2; i++) {
            const cardData = filteredCards[Math.floor(gameEngine.prng.random() * filteredCards.length)];
            let card;
            
            switch (cardData.class) {
                case 'Joker':
                    card = new Joker(cardData);
                    break;
                case 'WorshipCard':
                    card = new WorshipCard(cardData);
                    break;
                case 'HouseRuleCard':
                    card = new HouseRuleCard(cardData);
                    break;
                default:
                    card = new Card(cardData);
            }
            
    
            const cardEl = card.render(true, true);
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
        const libationsAvailable = this.filterCardsByUnlockedCategories(CardData.houseRules, gameState).length;
        
        console.log(`Available cards - Jokers: ${jokersAvailable}, Worship: ${worshipAvailable}, Libations: ${libationsAvailable}`);
        
        // Filter out pack types that would have no available cards
        packPool = packPool.filter(pack => {
            switch (pack.type) {
                case 'joker':
                    return jokersAvailable > 0;
                case 'worship':
                    return worshipAvailable > 0;
                case 'house_rule':
                    return libationsAvailable > 0;
                case 'chaos':
                    return jokersAvailable > 0 || worshipAvailable > 0 || libationsAvailable > 0;
                default:
                    return true;
            }
        });
        
        console.log(`Pack pool size after filtering: ${packPool.length}`);
        
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
        
        gameState.gold -= artifactData.cost;
        gameState.artifacts.push(artifactData);
        gameEngine.showMessage(`Acquired: ${artifactData.name}!`);
        
        element.remove();
        this.dom.shopGold.textContent = gameState.gold;
        
        gameEngine.applyArtifactEffects();
        gameEngine.updateAllUI();
    }

    buyCard(card, gameState, gameEngine, element) {

        
        if (gameState.gold < card.cost) {
    
            gameEngine.showMessage("Not enough gold!");
            return;
        }
        

        gameState.gold -= card.cost;

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
                    gameState.gold += card.cost;
                }
                return;
            }
            
            if (window.dataManager) {
                window.dataManager.unlockItem('boons', card.id);
            }
            gameState.jokers.push(card);
            
        } else if (card instanceof WorshipCard) {
    
            card.applyWorship(gameState);
            
        } else if (card instanceof HouseRuleCard) {
    
            if (gameState.consumables.length >= gameState.consumableSlots) {
        
                gameEngine.showMessage("Offering slots are full!");
                if (element?.parentNode?.id === 'shopDirectSales') {
                    gameState.gold += card.cost;
                }
                return;
            }
            gameState.consumables.push(card);
        }
        
        if (element) {
            element.remove();
        }
        
        this.dom.shopGold.textContent = gameState.gold;
        gameEngine.updateAllUI();
        
        // Check if this was claimed from a pack opening view
        if (element?.parentNode?.id === 'packRevealedCards') {
            console.log('Card claimed from pack, closing pack opening view...');
            // Close the pack opening view and return to shop
            this.closePackOpeningView();
        }
    }

    useConsumable(card, gameState, gameEngine) {
        if (!card.canUse()) {
            gameEngine.showMessage("Cannot use this libation right now.");
            return;
        }
        
        let success = false;
        let message = "";
        
        // Handle different card types
        if (card instanceof HouseRuleCard) {
            success = card.applyRule(gameState, gameEngine);
            message = success ? `House Rule activated: ${card.name}!` : "Failed to activate house rule.";
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
        
        const rerollCost = 2;
        if (gameState.gold < rerollCost) {
            gameEngine.showMessage("Not enough gold to reroll!");
            return;
        }
        
        gameState.gold -= rerollCost;
        this.generateShopStock(gameState, gameEngine);
        this.dom.shopGold.textContent = gameState.gold;
    }

    toggleSellMode(gameState, gameEngine) {
        gameState.sellMode = !gameState.sellMode;
        const shop = this.dom.shopOverlay;
        const btn = document.getElementById('sellModeButton');
        
        if (gameState.sellMode) {
            shop.classList.add('sell-mode-active');
            btn.textContent = 'Back to Buying';
            btn.style.background = 'var(--accent-red-desat)';
            this.displaySellableCards(gameState, gameEngine);
        } else {
            shop.classList.remove('sell-mode-active');
            btn.textContent = '💰 Sell Mode';
            btn.style.background = '';
            this.generateShopStock(gameState, gameEngine);
        }
    }

    displaySellableCards(gameState, gameEngine) {
        const salesContainer = document.getElementById('shopDirectSales');
        const packsContainer = document.getElementById('shopPacksArea');
        
        salesContainer.innerHTML = '<h4>Your Boons (Click to Sell)</h4>';
        packsContainer.innerHTML = '<h4>Your Libations (Click to Sell)</h4>';
        
        gameState.jokers.forEach(joker => {
            const cardEl = joker.render();
            cardEl.addEventListener('click', () => {
                this.sellCard(joker, gameState, gameEngine);
            });
            salesContainer.appendChild(cardEl);
        });
        
        gameState.consumables.forEach(consumable => {
            const cardEl = consumable.render();
            cardEl.addEventListener('click', () => {
                this.sellCard(consumable, gameState, gameEngine);
            });
            packsContainer.appendChild(cardEl);
        });
    }

    sellCard(cardToSell, gameState, gameEngine) {
        if (!gameState.sellMode) return;
        
        let inventory = cardToSell.type === 'joker' ? gameState.jokers : gameState.consumables;
        const cardIndex = inventory.findIndex(c => c.id === cardToSell.id);
        
        if (cardIndex > -1) {
            const soldCard = inventory.splice(cardIndex, 1)[0];
            gameState.gold += soldCard.sellValue;
            gameEngine.showMessage(`Sold ${soldCard.name} for ${soldCard.sellValue} Gold.`);
            this.displaySellableCards(gameState, gameEngine);
            this.dom.shopGold.textContent = gameState.gold;
            gameEngine.updateAllUI();
        }
    }

    buyPack(packType, gameState, gameEngine) {
        const packData = CardData.packs.find(p => p.type === packType);
        if (gameState.gold < packData.cost) {
            gameEngine.showMessage("Not enough gold!");
            return;
        }
        
        gameState.gold -= packData.cost;
        
        this.dom.shopDefaultView.classList.add('hidden');
        this.dom.packOpeningView.classList.remove('hidden');
        this.dom.shopOverlay.querySelector('.modal-content').classList.add('pack-opening-stage');
        
        const revealedContainer = document.getElementById('packRevealedCards');
        revealedContainer.innerHTML = '<h4>Click to Select, Double-Click to Claim</h4>';
        
        this.updatePackConsumables(gameState, gameEngine);
        
        // Generate pack contents based on type
        this.generatePackContents(packType, revealedContainer, gameState, gameEngine);
        
        this.dom.shopGold.textContent = gameState.gold;
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
            case 'house_rule':
                cardPool = CardData.houseRules;
                CardClass = HouseRuleCard;
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
        
        // Store the cards and selected card for this pack
        const packCards = [];
        let selectedCard = null;
        
        for (let i = 0; i < cardCount; i++) {
            const cardData = filteredPool[Math.floor(gameEngine.prng.random() * filteredPool.length)];
            const card = new CardClass(cardData);
            const cardEl = card.render(true, false);
            
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
            { pool: CardData.houseRules, class: HouseRuleCard, name: 'Libation' }
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
        
        // Store the cards and selected card for this pack
        const packCards = [];
        let selectedCard = null;
        
        for (let i = 0; i < 3; i++) {
            // Randomly select which card pool to use (from available pools only)
            const poolIndex = Math.floor(gameEngine.prng.random() * availablePools.length);
            const selectedPool = availablePools[poolIndex];
            
            // Get a random card from the filtered pool
            const cardData = selectedPool.filteredPool[Math.floor(gameEngine.prng.random() * selectedPool.filteredPool.length)];
            const card = new selectedPool.class(cardData);
            const cardEl = card.render(true, false);
            
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

    // New method to close pack opening view
    closePackOpeningView() {
        console.log('Closing pack opening view...');
        
        // Check if DOM elements exist before trying to access them
        if (!this.dom.packOpeningView) {
            console.error('packOpeningView element not found!');
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