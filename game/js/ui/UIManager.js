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
        /** @type {{ card: Card, element?: HTMLElement, gameState: Object, gameEngine: Object, refundGold?: number, packContainer?: HTMLElement, packType?: string } | null} */
        this.expulsionPending = null;
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
            
            // Play-area card slots (per 6-translator: G.jokers / G.consumeables)
            jokerSlots: document.getElementById('jokerSlots'),
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
        
        if (!this.dom.diceContainer || !this.dom.rollButton) return;
        
        this.updateInfoUI(gameState, gameEngine);
        this.updateDiceUI(gameState, gameEngine);
        this.updateScorecardUI(gameState, gameEngine);
        this.updatePlayAreaSlots(gameState, gameEngine);
        this.updateBlindUI(gameState);
    }

    updateInfoUI(gameState, gameEngine) {
        const anteIndex = gameState.ante - 1;
        let anteName;
        
        if (gameState.endlessMode) {
            anteName = `The Odyssey: ${gameState.ante}`;
        } else {
            const currentAnteData = AnteData[anteIndex] || AnteData[AnteData.length - 1];
            anteName = `${gameState.ante}: ${currentAnteData.name}`;
        }
        
        // Ante: just the number (no / 12)
        this.dom.anteDisplay.textContent = gameState.ante;
        
        // Check if all categories are filled
        const allCategoriesFilled = gameEngine.areAllCategoriesFilled();
        if (allCategoriesFilled) {
            this.dom.turnDisplay.textContent = `All Categories Filled!`;
            this.dom.turnDisplay.style.color = '#FFD700'; // Golden color
            this.dom.turnDisplay.style.fontWeight = 'bold';
        } else {
            this.dom.turnDisplay.textContent = gameState.turn;
            this.dom.turnDisplay.style.color = ''; // Reset color
            this.dom.turnDisplay.style.fontWeight = ''; // Reset weight
        }
        
        this.dom.rollsLeft.textContent = `Rolls Left: ${gameState.rollsLeft}`;
        this.dom.goldDisplay.textContent = gameState.gold;
        this.dom.totalScore.textContent = gameState.totalScore;
        if (this.dom.scoreThresholdDisplay) this.dom.scoreThresholdDisplay.textContent = gameState.scoreThreshold;
        // Optionally, we could show an indicator when upper bonus is achieved
        
        // Update roll button (disable during transition to shop: Gnosis cashout or ante tally)
        const transitioningToShop = !!gameState.transitioningToShop;
        this.dom.rollButton.disabled = gameState.rollsLeft <= 0 || gameState.gameOver || gameState.isAwaitingApi || transitioningToShop;
    }

    updateBlindUI(gameState) {
        const anteIndex = gameState.ante - 1;
        let currentAnteData;
        
        if (gameState.endlessMode) {
            // For endless mode, we'd need to store the current blind data
            const engine = gameEngine || window.game;
            const randomBlindIndex = Math.floor(engine.prng.random() * AnteData.length);
            currentAnteData = AnteData[randomBlindIndex];
        } else {
            currentAnteData = AnteData[anteIndex] || AnteData[AnteData.length - 1];
        }
        

    }

    updateDiceUI(gameState, gameEngine = null) {
        if (!this.dom.diceContainer) {
            Logger.warn('Dice container not found, cannot update dice UI');
            return;
        }
        const engine = gameEngine || window.game;

        // Clear die tooltips before rebuilding — prevents orphaned tooltip at top-left
        const diceWithTooltips = this.dom.diceContainer.querySelectorAll('[data-tooltip]');
        diceWithTooltips.forEach(el => window.balatroEffects?.hideTooltip(el));

        this.dom.diceContainer.innerHTML = '';
        
        const targetingMode = engine?.state?.libationTargetingMode;
        if (targetingMode && this.dom.diceContainer) {
            this.dom.diceContainer.classList.add('libation-targeting');
        } else if (this.dom.diceContainer) {
            this.dom.diceContainer.classList.remove('libation-targeting');
        }

        gameState.dice.forEach((die, index) => {
            const dieEl = document.createElement('div');
            dieEl.className = 'die';
            dieEl.dataset.dieIndex = String(index);
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
            const hasModifiedValue = currentFace > 0 && die.faces[currentFace] && die.faces[currentFace].modifiedValue && die.faces[currentFace].modifiedValue !== die.faces[currentFace].value;
            
            if (hasEnhancementsOnCurrentFace) {
                dieEl.style.boxShadow = '0 0 10px rgba(255, 215, 0, 0.6)';
                dieEl.style.border = '2px solid rgba(255, 215, 0, 0.8)';
                dieEl.setAttribute('data-enhanced', 'true');
            }
            
            // Add special indicator for permanently modified faces (Chalice/Elixir)
            if (hasModifiedValue) {
                dieEl.style.boxShadow = '0 0 15px rgba(138, 43, 226, 0.8)';
                dieEl.style.border = '3px solid rgba(138, 43, 226, 1)';
                dieEl.setAttribute('data-modified', 'true');
                
                // Add a small badge showing the modification
                const modBadge = document.createElement('div');
                modBadge.className = 'modification-badge';
                modBadge.textContent = `${die.faces[currentFace].value}→${die.faces[currentFace].modifiedValue}`;
                modBadge.style.cssText = `
                    position: absolute;
                    bottom: -8px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(138, 43, 226, 0.9);
                    color: white;
                    padding: 2px 6px;
                    border-radius: 8px;
                    font-size: 10px;
                    font-weight: bold;
                    white-space: nowrap;
                    z-index: 10;
                    border: 1px solid white;
                `;
                dieEl.appendChild(modBadge);
            }
            
            // Add indicator for wild enhancement showing the random modifier
            if (currentFace > 0 && die.hasEnhancementForCurrentFace('wild') && die.wildValue !== undefined) {
                const wildModifier = die.wildValue - currentFace;
                if (wildModifier !== 0) {
                    const wildBadge = document.createElement('div');
                    wildBadge.className = 'wild-badge';
                    wildBadge.textContent = wildModifier > 0 ? `+${wildModifier}` : `${wildModifier}`;
                    wildBadge.style.cssText = `
                        position: absolute;
                        top: -8px;
                        right: -8px;
                        background: rgba(147, 51, 234, 0.95);
                        color: white;
                        padding: 3px 7px;
                        border-radius: 50%;
                        font-size: 11px;
                        font-weight: bold;
                        z-index: 10;
                        border: 2px solid white;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    `;
                    dieEl.appendChild(wildBadge);
                }
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
            
            if (gameState.hasRolled && currentFace > 0) {
                Logger.trace(`Die ${index + 1}: face=${currentFace}, effective=${die.getEffectiveFace()}`);
            }
            
            // Balatro-style tooltip: data-tooltip for custom popup (replaces native title)
            const tooltipData = this.buildDieTooltipData(die, index, gameState, currentFace, hasModifiedValue);
            dieEl.setAttribute('data-tooltip', JSON.stringify(tooltipData));
            
            // Add click handler: in libation targeting mode, apply enhancement; otherwise toggle hold
            dieEl.addEventListener('click', () => {
                const game = window.game;
                if (!game) return;
                const targeting = game.state.libationTargetingMode;
                if (targeting) {
                    window.balatroEffects?.hideAllTooltips();
                    const { libation, enhancementType } = targeting;
                    // Use effective face (1-9) so libations work on high-category faces 7, 8, 9
                    const targetFace = gameState.hasRolled ? die.getEffectiveFace() : (die.currentFace || (index % 6) + 1);
                    libation.applyEnhancementToDie(gameState, index, enhancementType, targetFace, game);
                    libation.use();
                    if (window.soundManager) window.soundManager.play('foil1', { pitch: 0.95 + Math.random() * 0.1, volume: 0.55 });
                    const idx = gameState.consumables.findIndex(c => c.id === libation.id);
                    if (idx !== -1) gameState.consumables.splice(idx, 1);
                    game.state.libationTargetingMode = null;
                    game.updateAllUI();
                    window.balatroEffects?.hideAllTooltips();
                    return;
                }
                game.toggleHold(index);
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
                
                // No native title — parent die has data-tooltip with full info; avoids duplicate tooltip
                dieEl.appendChild(overlay);
            }
            
            // Wild enhancements are now handled automatically when rolling (no UI needed)
            
            // Also add face value overlays for modified faces (7, 8, 9)
            if (currentFace > 0 && currentFace >= 7) {
                const faceOverlay = document.createElement('div');
                faceOverlay.className = `die-enhancement-overlay face-${currentFace}`;
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

    /**
     * Build Balatro-style die tooltip data for data-tooltip attribute
     * @param {Die} die
     * @param {number} index
     * @param {Object} gameState
     * @param {number} currentFace
     * @param {boolean} hasModifiedValue
     * @returns {Object}
     */
    buildDieTooltipData(die, index, gameState, currentFace, hasModifiedValue) {
        const dieNum = index + 1;
        const held = gameState.held && gameState.held[index];
        const title = held ? `Die ${dieNum} — HELD` : `Die ${dieNum}`;

        const rows = [];

        if (currentFace > 0) {
            const effectiveFace = die.getEffectiveFace();
            let valueText = `Face ${currentFace} → Value ${effectiveFace}`;
            if (hasModifiedValue) {
                valueText += ` (Modified: ${die.faces[currentFace].value}→${die.faces[currentFace].modifiedValue})`;
            }
            if (die.wildValue !== undefined && die.hasEnhancementForCurrentFace('wild')) {
                const wildMod = die.wildValue - currentFace;
                valueText += ` • Wild ${wildMod > 0 ? '+' : ''}${wildMod}`;
            }
            rows.push(valueText);
        } else {
            rows.push('Not yet rolled');
        }

        const currentEnhancements = currentFace > 0 && die.faces[currentFace]
            ? Array.from(die.faces[currentFace].enhancements)
            : [];
        if (currentEnhancements.length > 0) {
            const enhNames = currentEnhancements.map(e => this.getEnhancementDisplayName(e));
            const enhDescriptions = currentEnhancements.map(e => die.getEnhancementDescription(e));
            rows.push({ type: 'enhancements', list: enhNames, descriptions: enhDescriptions, keys: currentEnhancements });
        }

        const allFacesEnh = [];
        Object.entries(die.faces).forEach(([faceNum, faceData]) => {
            if (faceData.enhancements.size > 0 && parseInt(faceNum, 10) !== currentFace) {
                allFacesEnh.push({
                    face: parseInt(faceNum, 10),
                    enhancements: Array.from(faceData.enhancements)
                });
            }
        });
        if (allFacesEnh.length > 0) {
            rows.push({ type: 'otherFaces', faces: allFacesEnh });
        }

        if (die.tempModifier !== 0 && gameState.hasRolled) {
            rows.push({ type: 'tempMod', value: die.tempModifier });
        }

        return {
            tooltipType: 'die',
            title,
            rows,
            dieId: die.dieId || dieNum
        };
    }

    getEnhancementDisplayName(enh) {
        const names = {
            parchment: 'Parchment', iron: 'Iron', gold: 'Gold',
            mother_of_pearl: 'Mother of Pearl', mirror: 'Mirror', wild: 'Wild',
            lucky: 'Lucky', cursed: 'Cursed', divine: 'Divine', chaos: 'Chaos'
        };
        return names[enh] || enh;
    }

    updateScorecardUI(gameState, gameEngine = null) {
        const engine = gameEngine || window.game;
        const scorecardEl = document.getElementById('scorecard');
        if (engine?.state?.eucharistTargetingMode && scorecardEl) {
            scorecardEl.classList.add('eucharist-targeting');
        } else if (scorecardEl) {
            scorecardEl.classList.remove('eucharist-targeting');
        }

        // Cache green-highlight results: recalc only when dice change (smoothness)
        const diceKey = (gameState.dice || []).map(d => (d.getEffectiveFace?.() ?? d.currentFace ?? 0)).join(',');
        if (!this._scorecardHighlightCache || this._scorecardHighlightCache.diceKey !== diceKey) {
            this._scorecardHighlightCache = { diceKey, results: {} };
        }
        const highlightCache = this._scorecardHighlightCache.results;

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
            
            // Pandora's Box: combined bonus; when unlocked, show worship level
            if (category === "Pandora's Box") {
                const isUnlocked = gameState.unlockedCategories?.["Pandora's Box"];
                if (isUnlocked) {
                    row.classList.add('pandora-unlocked');
                } else {
                    row.classList.remove('pandora-unlocked');
                }
                const upperSum = ['Ones','Twos','Threes','Fours','Fives','Sixes']
                    .reduce((sum, c) => sum + (gameState.scorecard[c] || 0), 0);
                const upperBonus = (Math.round(upperSum) >= 63) ? 35 : 0;
                const lowerCats = [
                    'Three of a Kind','Small Straight','Full House','Four of a Kind','Large Straight','Yahtzee','Chance'
                ];
                const lowerComplete = lowerCats.every(c => {
                    const v = gameState.scorecard[c];
                    return v !== undefined && (typeof v === 'number' ? v > 0 : true);
                });
                const lowerBonus = lowerComplete ? 35 : 0;
                const combined = upperBonus + lowerBonus;
                row.classList.remove('used');
                const worshipLevel = gameState.worshipLevels?.["Pandora's Box"] || 0;
                const categorySpan = row.querySelector('span');
                if (categorySpan && isUnlocked && worshipLevel > 0) {
                    categorySpan.textContent = `Pandora's Box (Lv.${worshipLevel})`;
                } else if (categorySpan && isUnlocked) {
                    categorySpan.textContent = "Pandora's Box";
                }
                row.querySelector('.potential-score').textContent = combined > 0 ? combined : '-';
                row.style.cursor = isUnlocked ? 'pointer' : 'default';
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
                
                // Display name mapping (UI-only). Level = effective favour tier (1 + worshipLevel)
                const displayCategory = category === 'Yahtzee' ? 'Heureka' : category;
                const god = godMapping[category];
                const worshipLevel = gameState.worshipLevels[god] || 0;
                const displayLevel = worshipLevel + 1;
                if (worshipLevel > 0) {
                    categorySpan.innerHTML = `${displayCategory} <span class="worship-tier" data-level="${displayLevel}">(${god} Lv.${displayLevel})</span>`;
                } else {
                    categorySpan.textContent = `${displayCategory} (${god})`;
                }
            }
            
            const scoreDisplay = row.querySelector('.potential-score');
            
            if (gameState.scorecard[category] !== undefined) {
                // Category already scored - show final score (rounded)
                row.classList.add('used');
                row.classList.remove('available-category');
                scoreDisplay.textContent = Math.round(gameState.scorecard[category]);
            } else {
                // Category not scored - don't show preview (that's what Gnosis is for!)
                row.classList.remove('used');
                scoreDisplay.textContent = '-';
                
                // Add green highlight if category is available to score with non-zero outcome
                if (gameState.hasRolled && window.game) {
                    let showGreen;
                    if (highlightCache[category] !== undefined) {
                        showGreen = highlightCache[category];
                    } else {
                        const { pips, favour, isValid } = window.game.calculateScore(category);
                        const hasPoints = isValid && (pips || 0) * (favour || 0) > 0;
                        const faceValue = typeof CATEGORY_TO_NUMBER !== 'undefined' ? CATEGORY_TO_NUMBER[category] : null;
                        const isUpperCategory = faceValue != null;
                        const counts = {};
                        (gameState.dice || []).forEach(d => {
                            const f = d.getEffectiveFace?.() ?? d.currentFace ?? 0;
                            if (f > 0) counts[f] = (counts[f] || 0) + 1;
                        });
                        const hasThreeOrMore = isUpperCategory && (counts[faceValue] || 0) >= 3;
                        showGreen = hasPoints && (!isUpperCategory || hasThreeOrMore);
                        highlightCache[category] = showGreen;
                    }
                    if (showGreen) {
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

    /**
     * Update play-area card slots (jokers, consumables, artifacts).
     * Per 6-translator: G.jokers / G.consumeables pattern.
     */
    updatePlayAreaSlots(gameState, gameEngine) {
        // Fingerprint: only rebuild slots when collections actually changed (smoothness)
        const jokerKey = (gameState.jokers || []).map(j => j.id).join(',');
        const consumableKey = (gameState.consumables || []).map(c => c.id).join(',');
        const artifactKey = (gameState.artifacts || []).map(a => a.id).join(',');
        const slotsKey = `${jokerKey}|${consumableKey}|${artifactKey}|${gameState.boonSlots ?? 5}|${gameState.consumableSlots ?? 2}`;
        if (this._playAreaSlotsKey === slotsKey) return;
        this._playAreaSlotsKey = slotsKey;

        this.updateJokerUI(gameState, gameEngine);
        this.updateConsumableUI(gameState, gameEngine);
        this.updateArtifactUI(gameState);

        // Update slot counters (0/5, 0/2)
        const boonCount = (gameState.jokers || []).length;
        const boonMax = gameState.boonSlots || (window.GAME_BALANCE?.STARTING_BOON_SLOTS ?? 5);
        const consumableCount = (gameState.consumables || []).length;
        const consumableMax = gameState.consumableSlots ?? (window.GAME_BALANCE?.STARTING_LIBATION_SLOTS ?? 2);
        if (this.dom.boonSlotCounter) this.dom.boonSlotCounter.textContent = `${boonCount}/${boonMax}`;
        if (this.dom.consumableSlotCounter) this.dom.consumableSlotCounter.textContent = `${consumableCount}/${consumableMax}`;
    }

    /**
     * Shared inventory card renderer — "call upon" this when adding buy/sell/use tags to any card type.
     * Renders a card, wires action labels, and toggles visibility on card click.
     * @param {Card} card - Card instance (Joker, LibationCard, WorshipCard)
     * @param {HTMLElement} container - Parent to append to (jokerSlots or consumableSlots)
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
                if (!e.target.closest('.card') || !e.target.closest(container)) {
                    container.querySelectorAll('.card').forEach(el => el.classList.remove('sell-label-visible'));
                }
            };
            document.addEventListener('click', container._sellLabelClickOutsideHandler);
        }

        container.appendChild(cardEl);
    }

    updateJokerUI(gameState, gameEngine) {
        const container = this.dom.jokerSlots;
        const boonsPanel = container?.closest('.inventory-panel-boons');
        if (!container) {
            Logger.warn('jokerSlots element not found');
            return;
        }
        container.innerHTML = '';
        const jokers = gameState.jokers || [];
        if (jokers.length === 0) {
            if (boonsPanel) boonsPanel.classList.remove('has-multiple-boons');
            return;
        }
        if (boonsPanel) boonsPanel.classList.toggle('has-multiple-boons', jokers.length >= 2);

        jokers.forEach(joker => {
            this.appendInventoryCard(joker, container, {
                onSell: (c) => this.sellCard(c, gameState, gameEngine),
                revealOn: 'click'
            });
        });

        this.setupBoonDragAndDrop(container, gameState, gameEngine);
    }

    /**
     * Setup drag-and-drop for boon reordering (Balatro-style: placement matters for abilities)
     * @param {HTMLElement} container - jokerSlots element
     * @param {Object} gameState - Game state
     * @param {Object} gameEngine - GameEngine instance
     */
    setupBoonDragAndDrop(container, gameState, gameEngine) {
        const cards = container.querySelectorAll('.card[data-id]');
        if (cards.length < 2) return;

        let draggedId = null;

        cards.forEach((cardEl) => {
            cardEl.draggable = true;
            cardEl.classList.add('boon-draggable');

            cardEl.addEventListener('dragstart', (e) => {
                draggedId = cardEl.dataset.id;
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', draggedId);
                e.dataTransfer.setDragImage(cardEl, cardEl.offsetWidth / 2, cardEl.offsetHeight / 2);
                cardEl.classList.add('boon-dragging');
            });

            cardEl.addEventListener('dragend', () => {
                cardEl.classList.remove('boon-dragging');
                container.querySelectorAll('.card').forEach(c => c.classList.remove('boon-drag-over'));
                container._boonDidDrag = true;
                setTimeout(() => { container._boonDidDrag = false; }, 100);
            });

            cardEl.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (draggedId && cardEl.dataset.id !== draggedId) {
                    cardEl.classList.add('boon-drag-over');
                }
            });

            cardEl.addEventListener('dragleave', () => {
                cardEl.classList.remove('boon-drag-over');
            });

            cardEl.addEventListener('drop', (e) => {
                e.preventDefault();
                cardEl.classList.remove('boon-drag-over');
                const targetId = cardEl.dataset.id;
                if (!draggedId || !targetId || draggedId === targetId) return;

                const jokers = gameState.jokers || [];
                const fromIndex = jokers.findIndex(j => j.id === draggedId);
                const toIndex = jokers.findIndex(j => j.id === targetId);
                if (fromIndex === -1 || toIndex === -1) return;

                const card = jokers[fromIndex];
                jokers.splice(fromIndex, 1);
                const insertIndex = fromIndex < toIndex ? toIndex - 1 : toIndex;
                jokers.splice(insertIndex, 0, card);

                if (gameEngine) {
                    gameEngine.updateAllUI();
                    if (window.soundManager) window.soundManager.play('button', { volume: 0.4 });
                }
            });
        });

        // Prevent click (toggle labels) from firing when we completed a drag (add once per container)
        if (!container._boonDragClickHandler) {
            container._boonDragClickHandler = (e) => {
                if (container._boonDidDrag && e.target.closest('.card')) {
                    e.stopPropagation();
                }
            };
            container.addEventListener('click', container._boonDragClickHandler, true);
        }
        container._boonDidDrag = false;
    }

    updateConsumableUI(gameState, gameEngine) {
        const container = this.dom.consumableSlots;
        if (!container) {
            Logger.warn('consumableSlots element not found');
            return;
        }
        container.innerHTML = '';
        const consumables = gameState.consumables || [];
        if (consumables.length === 0) return;

        consumables.forEach(card => {
            this.appendInventoryCard(card, container, {
                onSell: (c) => this.sellCard(c, gameState, gameEngine),
                onUse: (c) => {
                    const engine = gameEngine || window.game;
                    if ((c instanceof LibationCard || c instanceof WorshipCard) && engine) {
                        this.useConsumable(c, gameState, engine);
                    }
                },
                revealOn: 'click' // Left-click toggles Use + Sell tags
            });
        });
    }

    /**
     * Artifact display removed from play area.
     * Artifacts will be shown in the pause menu Current Run Stats page.
     */
    updateArtifactUI(gameState) {
        const container = this.dom.artifactSlots;
        if (!container) return;
        container.innerHTML = '';
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
        this.shopState.openedPacks = new Set();
        
        // Ensure shop elements are properly bound
        this.ensureShopElementsBound();
        
        // Reroll cost label
        const rerollBtn = document.getElementById('rerollShop');
        if (rerollBtn && window.GAME_BALANCE) {
            rerollBtn.textContent = `Reroll (${window.GAME_BALANCE.SHOP_REROLL_COST}g)`;
        }
        
        // Stage swap: hide play area, show shop (per 6-translator)
        if (!this.dom.playStage || !this.dom.shopStage) {
            this.dom.playStage = document.getElementById('playStage');
            this.dom.shopStage = document.getElementById('shopStage');
        }
        if (this.dom.playStage) this.dom.playStage.classList.add('hidden');
        if (this.dom.shopStage) {
            window.balatroEffects?.hideAllTooltips();
            this.dom.shopStage.classList.remove('hidden');
        } else {
            Logger.error('Shop stage not found, cannot open shop');
            return;
        }
        if (window.GameStateManager) window.GameStateManager.setState(window.GAME_STATES?.SHOP || 'SHOP');
        if (window.soundManager) window.soundManager.setMusicContext('shop');
        if (this.dom.shopAnte) this.dom.shopAnte.textContent = gameState.ante;
        if (this.dom.packOpeningView) this.dom.packOpeningView.classList.add('hidden');
        if (this.dom.shopDefaultView) this.dom.shopDefaultView.classList.remove('hidden');
        this.attachShopEventListeners();
        
        // Checkpoint: save at start of shop so resume returns here
        if (gameEngine?.canSave?.()) gameEngine.saveGame();
        
        // Defer stock generation to next frame - stage swap paints first (buttery open)
        requestAnimationFrame(() => this.generateShopStock(gameState, gameEngine));
    }

    closeShop() {
        if (!this.dom.playStage) this.dom.playStage = document.getElementById('playStage');
        if (!this.dom.shopStage) this.dom.shopStage = document.getElementById('shopStage');
        if (!this.dom.packOpeningView) this.dom.packOpeningView = document.getElementById('packOpeningView');
        if (!this.dom.shopDefaultView) this.dom.shopDefaultView = document.getElementById('shopDefaultView');

        this.dom.playStage?.classList.remove('hidden');
        this.dom.shopStage?.classList.add('hidden');
        this.dom.packOpeningView?.classList.add('hidden');
        this.dom.shopDefaultView?.classList.remove('hidden');
        if (window.soundManager) window.soundManager.setMusicContext('play');

        if (window.GameStateManager) window.GameStateManager.setState(window.GAME_STATES?.ROUND || 'ROUND');
        window.balatroEffects?.hideAllTooltips();
    }

    generateShopStock(gameState, gameEngine) {
        // Clear tooltips before rebuilding — prevents orphaned tooltips
        window.balatroEffects?.hideAllTooltips();
        const directSalesContainer = document.getElementById('shopDirectSales');
        const packsContainer = document.getElementById('shopPacksArea');
        const artifactsContainer = document.getElementById('shopArtifactsArea');
        
        // Add null checks for shop containers
        if (!directSalesContainer || !packsContainer || !artifactsContainer) {
            Logger.warn('Shop containers not found, cannot generate shop stock');
            return;
        }
        
        // Clear containers
        directSalesContainer.innerHTML = '<h4>Wares</h4>';
        packsContainer.innerHTML = '<h4>Packs</h4>';
        artifactsContainer.innerHTML = '<h4>Divine Artifacts</h4>';
        
        // Reset animation index for staggered entrance
        this.shopItemIndex = 0;
        
        // Generate with Balatro-style slide-in animations
        this.generateArtifactStock(artifactsContainer, gameState, gameEngine);
        this.generateDirectSales(directSalesContainer, gameState, gameEngine);
        this.generatePackStock(packsContainer, gameState, gameEngine);
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
        // Temple Market: +1 shop inventory size
        const templeMarketBonus = gameState.artifacts?.some(a => a.id === 'artifact_temple_market') ? 1 : 0;
        const numItems = 2 + Math.floor(gameEngine.prng.random() * 2) + templeMarketBonus;
        const selectedCards = new Set(); // Track selected card IDs to prevent duplicates
        
        // Cache filtered pools for this generate run (smoothness - avoid repeated filter per item)
        const unlockedKey = JSON.stringify(gameState.unlockedCategories || {});
        if (!this._shopFilterCache || this._shopFilterCache.key !== unlockedKey) {
            this._shopFilterCache = {
                key: unlockedKey,
                jokers: this.filterCardsByUnlockedCategories(
                    CardData.jokers.filter(card => !card.shopExclude), gameState),
                worship: this.filterCardsByUnlockedCategories(
                    CardData.worship.filter(card => !card.shopExclude), gameState),
                libations: CardData.libations.filter(card => !card.shopExclude)
            };
        }
        const { jokers: baseJokers, worship: baseWorship, libations: baseLibations } = this._shopFilterCache;
        const { jokerIds: ownedJokerIds, consumableIds: ownedConsumableIds } = this.getOwnedCardIds(gameState);
        
        for (let i = 0; i < numItems; i++) {
            const rand = gameEngine.prng.random();
            let cardData;
            let cardType;
            
            if (rand < 0.4) {
                // 40% chance for joker - exclude owned (no duplicate boons until sold)
                const availableJokers = baseJokers.filter(card => !selectedCards.has(card.id) && !ownedJokerIds.has(card.id));
                if (availableJokers.length > 0) {
                    cardData = this.selectCardByRarity(availableJokers, gameEngine, gameState);
                    cardType = 'joker';
                }
            } else if (rand < 0.7) {
                // 30% chance for worship - exclude owned (no duplicate worship until used/sold)
                const availableWorship = baseWorship.filter(card => !selectedCards.has(card.id) && !ownedConsumableIds.has(card.id));
                if (availableWorship.length > 0) {
                    cardData = availableWorship[Math.floor(gameEngine.prng.random() * availableWorship.length)];
                    cardType = 'worship';
                }
            } else {
                // 30% chance for libation - exclude owned (no duplicate libations until used/sold)
                const availableLibations = baseLibations.filter(card => !selectedCards.has(card.id) && !ownedConsumableIds.has(card.id));
                if (availableLibations.length > 0) {
                    cardData = availableLibations[Math.floor(gameEngine.prng.random() * availableLibations.length)];
                    cardType = 'libation';
                }
            }
            
            if (cardData) {
                // Mark this card as selected to prevent duplicates
                selectedCards.add(cardData.id);
                
                // Use createCardElement to ensure proper click handlers
                const cardElement = this.createCardElement(cardData, 'direct', gameState, gameEngine);
                
                if (cardElement) {
                    // Add slide-in animation
                    cardElement.classList.add('shop-item-slide-in');
                    cardElement.style.animationDelay = `${this.shopItemIndex * 0.08}s`;
                    this.shopItemIndex++;
                    
                    container.appendChild(cardElement);
                }
            }
        }
    }

    /**
     * Add one direct sale item to the shop (used when Temple Market is purchased mid-shop)
     */
    addOneDirectSale(gameState, gameEngine) {
        const container = document.getElementById('shopDirectSales');
        if (!container) return;
        const existingIds = new Set(
            Array.from(container.querySelectorAll('[data-card-id]')).map(el => el.dataset.cardId).filter(Boolean)
        );
        // Reuse filtered pools from generateDirectSales when available
        const unlockedKey = JSON.stringify(gameState.unlockedCategories || {});
        if (!this._shopFilterCache || this._shopFilterCache.key !== unlockedKey) {
            this._shopFilterCache = {
                key: unlockedKey,
                jokers: this.filterCardsByUnlockedCategories(
                    CardData.jokers.filter(card => !card.shopExclude), gameState),
                worship: this.filterCardsByUnlockedCategories(
                    CardData.worship.filter(card => !card.shopExclude), gameState),
                libations: CardData.libations.filter(card => !card.shopExclude)
            };
        }
        const { jokerIds: ownedJokerIds, consumableIds: ownedConsumableIds } = this.getOwnedCardIds(gameState);
        const rand = gameEngine.prng.random();
        let cardData;
        if (rand < 0.4) {
            const availableJokers = this._shopFilterCache.jokers.filter(card => !existingIds.has(card.id) && !ownedJokerIds.has(card.id));
            if (availableJokers.length > 0) cardData = this.selectCardByRarity(availableJokers, gameEngine, gameState);
        } else if (rand < 0.7) {
            const availableWorship = this._shopFilterCache.worship.filter(card => !existingIds.has(card.id) && !ownedConsumableIds.has(card.id));
            if (availableWorship.length > 0) cardData = availableWorship[Math.floor(gameEngine.prng.random() * availableWorship.length)];
        } else {
            const availableLibations = this._shopFilterCache.libations.filter(card => !existingIds.has(card.id) && !ownedConsumableIds.has(card.id));
            if (availableLibations.length > 0) cardData = availableLibations[Math.floor(gameEngine.prng.random() * availableLibations.length)];
        }
        if (cardData) {
            const cardElement = this.createCardElement(cardData, 'direct', gameState, gameEngine);
            if (cardElement) {
                cardElement.classList.add('shop-item-slide-in');
                cardElement.style.animationDelay = `${this.shopItemIndex * 0.08}s`;
                this.shopItemIndex++;
                container.appendChild(cardElement);
            }
        }
    }

    generatePackStock(container, gameState, gameEngine) {
        // Generate 1-2 packs (only types not yet opened this shop)
        const openedPacks = this.shopState.openedPacks || new Set();
        const availablePackTypes = ['joker', 'worship', 'libation'].filter(type => !openedPacks.has(type));
        if (availablePackTypes.length === 0) return;
        const numPacks = Math.min(2, availablePackTypes.length);
        const selectedPackTypes = new Set();
        
        for (let i = 0; i < numPacks; i++) {
            const remainingTypes = availablePackTypes.filter(type => !selectedPackTypes.has(type));
            if (remainingTypes.length === 0) break;
            const selectedType = remainingTypes[Math.floor(gameEngine.prng.random() * remainingTypes.length)];
            selectedPackTypes.add(selectedType);
            
            let packData;
            if (selectedType === 'joker') {
                packData = { type: 'joker', name: 'Boon Pack', cost: 4, description: 'Reveals 3 Boons - choose one to claim.' };
            } else if (selectedType === 'worship') {
                packData = { type: 'worship', name: 'Worship Pack', cost: 3, description: 'Reveals 3 Worship Cards - choose one to claim.' };
            } else {
                packData = { type: 'libation', name: 'Libation Pack', cost: 5, description: 'Reveals 3 Libations - choose one to claim.' };
            }
            packData = { ...packData, baseCost: packData.cost, cost: this.getShopPrice(packData.cost, gameState) };
            const packElement = this.createPackElement(packData, gameState, gameEngine);
            
            // Add slide-in animation
            packElement.classList.add('shop-item-slide-in');
            packElement.style.animationDelay = `${this.shopItemIndex * 0.08}s`;
            this.shopItemIndex++;
            
            container.appendChild(packElement);
        }
    }


    createCardElement(cardData, type, gameState, gameEngine) {
        let cardInstance;
        let cardEl;
        
        const displayData = (type === 'direct' || type === 'artifact') && gameState
            ? { ...cardData, baseCost: cardData.cost ?? 0, cost: this.getShopPrice(cardData.cost ?? 0, gameState) }
            : cardData;
        // Create proper card instance based on type
        if (type === 'artifact') {
            // Use Artifact class for artifacts (like Balatro vouchers)
            cardInstance = new Artifact(displayData);
            cardEl = cardInstance.render(true, true); // isShopItem, isDirectSale
        } else {
            // For other types, create appropriate instances
            Logger.debug('Creating card element:', { 
                cardId: cardData.id, 
                rarity: cardData.rarity, 
                type: type 
            });
            
            if (displayData.rarity === 'worship') {
                cardInstance = new WorshipCard(displayData);
            } else if (displayData.rarity === 'libation') {
                cardInstance = new LibationCard(displayData);
            } else {
                cardInstance = new Joker(displayData);
            }
            
            const isShopItem = true;
            const isDirectSale = type === 'direct' || type === 'artifact';
            cardEl = cardInstance.render(isShopItem, isDirectSale);
        }
        
        // Descriptions on hover (BalatroEffects tooltip), Buy/Take tag on click
        if (type === 'direct' || type === 'artifact') {
            const buyLabel = cardEl.querySelector('.buy-sell-label.buy');
            if (buyLabel) {
                buyLabel.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (type === 'artifact') {
                        this.buyArtifact(displayData, gameState, gameEngine, cardEl);
                    } else {
                        this.buyCard(cardInstance, gameState, gameEngine, cardEl);
                    }
                });
            }
            cardEl.addEventListener('click', (e) => {
                if (e.target.closest('.buy-sell-label')) return; // Let Buy handle its own click
                e.stopPropagation();
                this.revealShopItemTag(cardEl);
            });
        }
        
        // Store card ID for duplicate detection (e.g. when adding Temple Market item mid-shop)
        if (type === 'direct' && cardData?.id) {
            cardEl.dataset.cardId = cardData.id;
        }
        
        if (type === 'pack') {
            const claimPackCard = (e) => {
                e.stopPropagation();
                if (window.soundManager) window.soundManager.play(cardInstance instanceof Joker ? 'card1' : 'tarot1', { pitch: 0.92 + Math.random() * 0.1, volume: 0.55 });
                this.claimCard(cardInstance, gameState, gameEngine, cardEl);
            };
            const takeLabel = cardEl.querySelector('.buy-sell-label.take');
            if (takeLabel) {
                takeLabel.addEventListener('click', claimPackCard);
            }
            cardEl.addEventListener('click', (e) => {
                if (e.target.closest('.buy-sell-label')) return;
                this.revealShopItemTag(cardEl);
            });
        }
        
        return cardEl;
    }

    createPackElement(packData, gameState, gameEngine) {
        const pack = document.createElement('div');
        pack.className = `card pack-card pack-${packData.type}`;
        pack.dataset.packType = packData.type;
        pack.setAttribute('data-tooltip', JSON.stringify({
            title: packData.name,
            effect: packData.description,
            cost: packData.cost,
            type: 'pack'
        }));
        
        pack.innerHTML = `
            <div class="pack-title">${packData.name}</div>
            <div class="pack-description">${packData.description}</div>
            <div class="pack-cost">${packData.cost}g</div>
            <div class="buy-sell-label buy" data-pack-type="${packData.type}">Buy</div>
        `;
        
        const buyLabel = pack.querySelector('.buy-sell-label.buy');
        if (buyLabel) {
            buyLabel.addEventListener('click', (e) => {
                e.stopPropagation();
                this.purchasePack(packData, gameState, gameEngine, pack);
            });
        }
        pack.addEventListener('click', (e) => {
            if (e.target.closest('.buy-sell-label')) return;
            e.stopPropagation();
            this.revealShopItemTag(pack);
        });
        
        return pack;
    }

    /** Toggle Buy/Take tag visibility on click - deselect others, close on outside click */
    revealShopItemTag(element) {
        const shop = element.closest('#shopStage, #packOpeningView');
        if (!shop) return;
        shop.querySelectorAll('.shop-item-selected').forEach(el => {
            if (el !== element) el.classList.remove('shop-item-selected');
        });
        element.classList.toggle('shop-item-selected');
        if (element.classList.contains('shop-item-selected')) {
            if (window.soundManager) window.soundManager.play('highlight1', { volume: 0.35 });
            const close = (e) => {
                if (!element.contains(e.target) && !e.target.closest('.buy-sell-label')) {
                    element.classList.remove('shop-item-selected');
                    document.removeEventListener('click', close);
                }
            };
            setTimeout(() => document.addEventListener('click', close), 0);
        }
    }

    /** Merchant Arrival: effective shop price (baseCost * shopPriceMultiplier) */
    getShopPrice(baseCost, gameState) {
        const mult = gameState?.shopPriceMultiplier ?? 1;
        return Math.max(1, Math.floor(baseCost * mult));
    }

    getPackName(packType) {
        const packNames = {
            'joker': 'Boon Pack',
            'worship': 'Worship Pack', 
            'libation': 'Libation Pack',
            'chaos': 'Chaos Pack'
        };
        return packNames[packType] || 'Unknown Pack';
    }

    purchaseCard(cardData, type, gameState, gameEngine) {
        // Tantalus' Curse: Cannot spend gold while active
        const hasTantalusCurse = gameState.jokers?.some(j => j.id === 'tantalus_curse');
        if (hasTantalusCurse) {
            gameEngine.showMessage("💰 Tantalus' Curse: Cannot spend gold!");
            return;
        }
        
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
        
        // Remove the card from shop
        const cardElement = document.querySelector(`[data-card-id="${cardData.id}"]`);
        if (cardElement) {
            cardElement.remove();
        }
        
        gameEngine.showMessage(`Purchased ${cardData.name}!`);
    }

    purchasePack(packData, gameState, gameEngine, packElement) {
        const effectiveCost = this.getShopPrice(packData.baseCost ?? packData.cost, gameState);
        if (gameState.gold < effectiveCost) {
            if (window.soundManager) window.soundManager.play('cancel', { volume: 0.55 });
            gameEngine.showMessage("Not enough gold!");
            return;
        }
        
        if (window.soundManager) window.soundManager.play('crumple2', { pitch: 0.95, volume: 0.5 });
        gameEngine.updateGoldAnimated(-effectiveCost, "pack purchase");
        
        if (!this.shopState.openedPacks) this.shopState.openedPacks = new Set();
        this.shopState.openedPacks.add(packData.type);
        if (packElement) packElement.remove();
        
        this.openPack(packData, gameState, gameEngine);
    }

    openPack(packData, gameState, gameEngine) {
        // Switch to pack opening view — clear tooltips so they don't persist
        window.balatroEffects?.hideAllTooltips();
        if (this.dom.shopDefaultView) this.dom.shopDefaultView.classList.add('hidden');
        if (this.dom.packOpeningView) this.dom.packOpeningView.classList.remove('hidden');
        if (window.soundManager) {
            window.soundManager.setMusicContext('pack');
            window.soundManager.play('cardFan2', { pitch: 0.9, volume: 0.45 });
        }

        // Generate pack contents
        const packContents = this.generatePackContents(packData, gameState, gameEngine);
        
        // Safety check for pack contents
        if (!packContents || !Array.isArray(packContents) || packContents.length === 0) {
            Logger.error('Failed to generate pack contents:', { packData, packContents });
            gameEngine.showMessage('Failed to open pack - no contents generated');
            return;
        }
        
        // Display pack contents
        const packRevealedCards = document.getElementById('packRevealedCards');
        if (packRevealedCards) {
            packRevealedCards.innerHTML = '<h4>Pack Contents</h4>';
            packRevealedCards.dataset.packType = packData.type; // Store pack type for collection tracking
            // Reset the claimed flag for this new pack
            packRevealedCards.dataset.packClaimed = 'false';
            packContents.forEach(cardData => {
                const cardElement = this.createCardElement(cardData, 'pack', gameState, gameEngine);
                packRevealedCards.appendChild(cardElement);
            });
        }
    }

    generatePackContents(packData, gameState, gameEngine) {
        const contents = [];
        const numCards = 3;
        const selectedCards = new Set(); // Track selected card IDs to prevent duplicates
        const { jokerIds: ownedJokerIds, consumableIds: ownedConsumableIds } = this.getOwnedCardIds(gameState);
        const shopDisplayedIds = this.getShopDisplayedCardIds(); // Balatro: cards in shop don't appear in packs
        
        for (let i = 0; i < numCards; i++) {
            let cardData;
            let availableCards = [];
            
            if (packData.type === 'joker') {
                availableCards = CardData.jokers.filter(card => !card.shopExclude && !selectedCards.has(card.id) && !ownedJokerIds.has(card.id) && !shopDisplayedIds.has(card.id));
                availableCards = this.filterCardsByUnlockedCategories(availableCards, gameState);
                cardData = this.selectCardByRarity(availableCards, gameEngine, gameState);
            } else if (packData.type === 'worship') {
                availableCards = CardData.worship.filter(card => !selectedCards.has(card.id) && !ownedConsumableIds.has(card.id) && !shopDisplayedIds.has(card.id));
                availableCards = this.filterCardsByUnlockedCategories(availableCards, gameState);
                cardData = availableCards.length > 0 ? availableCards[Math.floor(gameEngine.prng.random() * availableCards.length)] : null;
            } else if (packData.type === 'libation') {
                availableCards = CardData.libations.filter(card => !selectedCards.has(card.id) && !ownedConsumableIds.has(card.id) && !shopDisplayedIds.has(card.id));
                cardData = availableCards.length > 0 ? availableCards[Math.floor(gameEngine.prng.random() * availableCards.length)] : null;
            }
            
            if (cardData) {
                selectedCards.add(cardData.id); // Mark as selected to prevent duplicates
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
            const shopStage = document.getElementById('shopStage');
            if (shopStage) {
                inventoryContainer = shopStage.querySelector('#shopInventory');
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

    /**
     * Get card IDs the player already owns — exclude these from shop and pack pools.
     * Until used or sold, no duplicate (e.g. Worship Ares) should appear.
     * @param {Object} gameState - Current game state
     * @returns {{ jokerIds: Set<string>, consumableIds: Set<string> }}
     */
    getOwnedCardIds(gameState) {
        const jokers = gameState.jokers || [];
        const consumables = gameState.consumables || [];
        return {
            jokerIds: new Set(jokers.map(j => j.id)),
            consumableIds: new Set(consumables.map(c => c.id))
        };
    }

    /**
     * Get card IDs currently displayed in shop direct sales (Wares).
     * Balatro-style: cards in shop should not appear in packs opened from that shop.
     * @returns {Set<string>}
     */
    getShopDisplayedCardIds() {
        const container = document.getElementById('shopDirectSales');
        if (!container) return new Set();
        const ids = Array.from(container.querySelectorAll('[data-card-id]'))
            .map(el => el.dataset.cardId)
            .filter(Boolean);
        return new Set(ids);
    }

    // Helper function to filter cards based on unlocked categories
    // This ensures that cards associated with 7's, 8's, and 9's categories
    // only appear in the shop after the required bonus Yahtzees have been scored
    filterCardsByUnlockedCategories(cardPool, gameState) {
        if (!cardPool || !Array.isArray(cardPool)) {
            Logger.warn('filterCardsByUnlockedCategories: cardPool is not a valid array:', cardPool);
            return [];
        }
        
        const filteredCards = cardPool.filter(card => {
            // Check if this card is associated with a locked category
            const lockedCards = {
                // Worship cards for locked categories
                'worship_pleiades': 'Sevens',      // Requires 1st bonus Yahtzee
                'worship_poseidon_eights': 'Eights', // Requires 2nd bonus Yahtzee
                'worship_muses': 'Nines',          // Requires 3rd bonus Yahtzee
                'worship_pandora': "Pandora's Box", // Requires both upper AND lower bonus
                // Boon cards for locked categories
                'poseidon_eights_rare': 'Eights',   // Requires 2nd bonus Yahtzee
                'carillon_of_the_muses': 'Nines'    // The Nine Muses - requires Nines unlocked
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
        
        // For testing: allow all cards (bypass shopExclude and locked categories)
        const availableCards = cardPool; // Use all cards for testing
        Logger.debug(`Card pool size: ${cardPool.length}, Available after filtering: ${availableCards.length}`);
        if (availableCards.length === 0) {
            Logger.warn(`No available cards after filtering. Card pool:`, cardPool.map(c => ({ id: c.id, name: c.name, shopExclude: c.shopExclude })));
            return null;
        }
        
        Logger.debug(`Selecting card from ${availableCards.length} available cards`);
        
        // Use global rarity weights (boons only - worship/libation/artifact have no rarity)
        const rarityWeights = {
            'rustic': RARITY_WEIGHTS.RUSTIC,
            'vibrant': RARITY_WEIGHTS.VIBRANT,
            'epic': RARITY_WEIGHTS.EPIC,
            'legendary': RARITY_WEIGHTS.LEGENDARY || 2
        };
        
        // Calculate weights for each card based on rarity
        const weights = availableCards.map(card => {
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
        
        Logger.debug(`Weights array:`, weights);
        Logger.debug(`Total weight:`, weights.reduce((sum, w) => sum + w, 0));
        
        // Use the game engine's weighted choice method
        let selectedCard = gameEngine.prng.weightedChoice(availableCards, weights);
        
        // Fallback: if weighted choice fails, use simple random selection
        if (!selectedCard) {
            const randomIndex = Math.floor(gameEngine.prng.random() * availableCards.length);
            selectedCard = availableCards[randomIndex];
            Logger.debug(`Weighted choice failed, using random selection:`, selectedCard ? { id: selectedCard.id, name: selectedCard.name } : 'null');
        } else {
            Logger.debug(`Selected card:`, selectedCard ? { id: selectedCard.id, name: selectedCard.name } : 'null');
        }
        
        return selectedCard;
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
        if (typeof Logger !== 'undefined') {
            Logger.debug('Rarity statistics:', { totalCards, rarityPercentages });
        }
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



    // Shop transaction methods
    buyArtifact(artifactData, gameState, gameEngine, element) {
        window.balatroEffects?.hideAllTooltips();
        Logger.debug('buyArtifact called:', { 
            artifactId: artifactData?.id, 
            artifactName: artifactData?.name,
            cost: artifactData?.cost,
            currentGold: gameState?.gold
        });
        
        // Tantalus' Curse: Cannot spend gold while active
        const hasTantalusCurse = gameState.jokers?.some(j => j.id === 'tantalus_curse');
        if (hasTantalusCurse) {
            gameEngine.showMessage("💰 Tantalus' Curse: Cannot spend gold!");
            Logger.debug('Artifact purchase blocked by Tantalus Curse');
            return;
        }
        
        const effectiveCost = this.getShopPrice(artifactData.baseCost ?? artifactData.cost ?? 10, gameState);
        if (gameState.gold < effectiveCost) {
            if (window.soundManager) window.soundManager.play('cancel', { volume: 0.55 });
            gameEngine.showMessage("Not enough gold for this artifact!");
            Logger.debug('Artifact purchase blocked: insufficient gold');
            return;
        }
        
        Logger.debug('Unlocking artifact...');
        if (window.dataManager) {
            window.dataManager.unlockItem('artifacts', artifactData.id);
        }
        
        Logger.debug('Deducting gold and adding artifact to state...');
        if (window.soundManager) window.soundManager.play('card1', { pitch: 0.9, volume: 0.6 });
        gameEngine.updateGoldAnimated(-effectiveCost, "artifact purchase");
        gameState.artifacts.push(artifactData);
        gameEngine.showMessage(`Acquired: ${artifactData.name}!`);
        
        Logger.debug('Removing element and updating UI...');
        element.remove();
        
        Logger.debug('Applying artifact effects...');
        gameEngine.applyArtifactEffects();
        gameEngine.updateAllUI();
        // Temple Market: instantly add one more wares item to the shop
        if (artifactData.id === 'artifact_temple_market') {
            this.addOneDirectSale(gameState, gameEngine);
        }
        Logger.debug('buyArtifact completed');
    }

    buyCard(card, gameState, gameEngine, element) {
        window.balatroEffects?.hideAllTooltips();
        Logger.debug('buyCard called:', { 
            cardId: card?.id, 
            cardName: card?.name,
            cardType: card?.constructor?.name,
            cost: card?.cost,
            currentGold: gameState?.gold
        });
        
        // Tantalus' Curse: Cannot spend gold while active
        const hasTantalusCurse = gameState.jokers?.some(j => j.id === 'tantalus_curse');
        if (hasTantalusCurse) {
            if (window.soundManager) window.soundManager.play('cancel', { volume: 0.55 });
            gameEngine.showMessage("💰 Tantalus' Curse: Cannot spend gold!");
            Logger.debug('Purchase blocked by Tantalus Curse');
            return;
        }
        
        const effectiveCost = window.uiManager?.getShopPrice(card.baseCost ?? card.cost, gameState) ?? card.cost;
        if (gameState.gold < effectiveCost) {
            if (window.soundManager) window.soundManager.play('cancel', { volume: 0.55 });
            gameEngine.showMessage("Not enough gold!");
            Logger.debug('Purchase blocked: insufficient gold');
            return;
        }
        
        Logger.debug('Deducting gold...');
        if (window.soundManager) window.soundManager.play('coin3', { pitch: 0.95 + Math.random() * 0.1, volume: 0.6 });
        gameEngine.updateGoldAnimated(-effectiveCost, "card purchase");

        // Add Balatro-style purchase effect
        if (window.balatroEffects && element) {
            Logger.debug('Adding purchase effect...');
            window.balatroEffects.addCardPurchaseEffect(element);
        }

        Logger.debug('Calling claimCard from buyCard...');
        this.claimCard(card, gameState, gameEngine, element);
    }

    claimCard(card, gameState, gameEngine, element) {
        window.balatroEffects?.hideAllTooltips();
        Logger.debug('claimCard called:', { 
            cardId: card?.id, 
            cardName: card?.name,
            cardType: card?.constructor?.name,
            elementId: element?.id,
            parentId: element?.parentNode?.id
        });
        
        const packContainer = element?.closest('#packRevealedCards');
        if (packContainer && packContainer.dataset.packClaimed === 'true') {
            return; // Pack already claimed, ignore
        }
        
        const isDirectPurchase = element?.parentNode?.id === 'shopDirectSales';
        const boonSlotsFull = card instanceof Joker && gameState.jokers.length >= gameState.boonSlots;
        const consumableSlotsFull = (card instanceof WorshipCard || card instanceof LibationCard) 
            && gameState.consumables.length >= gameState.consumableSlots;
        
        if (boonSlotsFull || consumableSlotsFull) {
            const inventory = card instanceof Joker ? gameState.jokers : gameState.consumables;
            if (inventory.length === 0) return;
            this.enterExpulsionMode(card, gameState, gameEngine, element, {
                refundGold: isDirectPurchase ? (window.uiManager?.getShopPrice(card.baseCost ?? card.cost, gameState) ?? card.cost) : undefined,
                packContainer: packContainer || undefined,
                packType: packContainer?.dataset?.packType || undefined
            });
            return;
        }
        
        if (card instanceof Joker) {
            if (window.dataManager) window.dataManager.unlockItem('boons', card.id);
            gameState.jokers.push(card);
        } else if (card instanceof WorshipCard || card instanceof LibationCard) {
            gameState.consumables.push(card);
            Logger.debug(card instanceof WorshipCard ? 'Worship' : 'Libation', 'card added to consumables:', { cardId: card.id });
        }
        
        if (element) element.remove();
        
        if (packContainer) {
            packContainer.dataset.packClaimed = 'true';
            const packType = packContainer.dataset.packType;
            if (packType) {
                gameState.packs.push({ type: packType, name: this.getPackName(packType), openedAt: Date.now() });
                Logger.debug('Pack added to collection:', { type: packType });
            }
            setTimeout(() => this.closePackOpeningView(), 150);
        }
        
        gameEngine.updateAllUI();
        Logger.debug('Card claimed successfully');
    }

    useConsumable(card, gameState, gameEngine) {
        window.balatroEffects?.hideAllTooltips();
        // Click libation again to cancel targeting (same for Eucharist)
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
            if (window.soundManager) window.soundManager.play('magic_crumple', { pitch: 0.95 + Math.random() * 0.1, volume: 0.55 });
            gameEngine.showMessage(message);
            
            // Remove the card from consumables
            const cardIndex = gameState.consumables.findIndex(c => c.id === card.id);
            if (cardIndex !== -1) {
                gameState.consumables.splice(cardIndex, 1);
            }
            
            gameEngine.updateAllUI();
            // Clear any tooltips orphaned by consumable slot rebuild (belt-and-suspenders)
            window.balatroEffects?.hideAllTooltips();
        } else {
            if (window.soundManager) window.soundManager.play('cancel', { volume: 0.5 });
            gameEngine.showMessage(message || "Failed to use libation.");
        }
    }

    rerollShop(gameState, gameEngine) {
        const hasChronosHourglass = gameState.artifacts.some(a => a.id === 'sundial_plus');
        
        if (hasChronosHourglass && !gameState.usedFreeReroll) {
            gameState.usedFreeReroll = true;
            if (window.soundManager) window.soundManager.play('whoosh', { pitch: 0.95, volume: 0.5 });
            gameEngine.showMessage("Used your free reroll from Chronos' Hourglass!");
            this.generateShopStock(gameState, gameEngine);
            return;
        }
        
        if (gameState.gold < GAME_BALANCE.SHOP_REROLL_COST) {
            if (window.soundManager) window.soundManager.play('cancel', { volume: 0.55 });
            gameEngine.showMessage("Not enough gold to reroll!");
            return;
        }
        
        if (window.soundManager) window.soundManager.play('whoosh', { pitch: 0.9 + Math.random() * 0.1, volume: 0.5 });
        // Balatro-style reroll: flip cards before regenerating (ONLY direct sales, NOT packs or artifacts)
        const directSalesContainer = document.getElementById('shopDirectSales');
        const directSalesItems = directSalesContainer?.querySelectorAll('.card') || [];
        
        directSalesItems.forEach((item, index) => {
            item.classList.add('shop-item-flip-out');
            item.style.animationDelay = `${index * 0.05}s`;
        });
        
        // Wait for flip animation before regenerating (ONLY direct sales)
        setTimeout(() => {
            gameEngine.updateGoldAnimated(-GAME_BALANCE.SHOP_REROLL_COST, "reroll");
            
            // Only regenerate direct sales, leave packs and artifacts untouched
            if (directSalesContainer) {
                directSalesContainer.innerHTML = '<h4>Wares</h4>';
                this.shopItemIndex = 0;
                this.generateDirectSales(directSalesContainer, gameState, gameEngine);
            }
        }, 400);
    }

    sellCard(cardToSell, gameState, gameEngine) {
        let inventory = cardToSell.type === 'joker' ? gameState.jokers : gameState.consumables;
        const cardIndex = inventory.findIndex(c => c.id === cardToSell.id);
        
        if (cardIndex > -1) {
            const soldCard = inventory.splice(cardIndex, 1)[0];
            let totalGold = soldCard.sellValue;
            
            // === SELL TIMING HOOK ===
            // Trigger all sell effects via timing system (Balatro-style)
            gameState.jokers.forEach(joker => {
                if (joker.timing && joker.timing.sell) {
                    joker.onTimingEvent('sell', gameState, { cardType: soldCard.type, card: soldCard });
                }
            });
            
            if (window.soundManager) window.soundManager.play('crumple1', { pitch: 0.9 + Math.random() * 0.1, volume: 0.5 });
            gameEngine.updateGoldAnimated(totalGold, "card sale");
            gameEngine.showMessage(`Sold ${soldCard.name} for ${totalGold} Gold.`);
            
            gameEngine.updateAllUI();
        }
    }

    /**
     * Balatro-style expulsion: when slots full, choose one to sell to make room for a new card.
     * @param {Card} card - Card to add (Joker, WorshipCard, LibationCard)
     * @param {Object} gameState - Game state
     * @param {Object} gameEngine - Game engine
     * @param {HTMLElement} [element] - Card element (shop or pack)
     * @param {{ refundGold?: number, packContainer?: HTMLElement, packType?: string }} opts - Refund on cancel, pack context
     */
    enterExpulsionMode(card, gameState, gameEngine, element, opts = {}) {
        if (this.expulsionPending) return;
        const inventoryType = card instanceof Joker ? 'joker' : 'consumable';
        const inventory = inventoryType === 'joker' ? gameState.jokers : gameState.consumables;
        if (inventory.length === 0) return;

        this.expulsionPending = {
            card,
            element: element || null,
            gameState,
            gameEngine,
            refundGold: opts.refundGold,
            packContainer: opts.packContainer || null,
            packType: opts.packType || null
        };

        const overlay = this.dom.expulsionOverlay || document.getElementById('expulsionOverlay');
        const titleEl = document.getElementById('expulsionTitle');
        const subtitleEl = document.getElementById('expulsionSubtitle');
        const gridEl = document.getElementById('expulsionCardGrid');
        const cancelBtn = document.getElementById('expulsionCancelBtn');

        if (!overlay || !gridEl) return;

        titleEl.textContent = 'No Space!';
        subtitleEl.textContent = `Choose one to sell and make room for ${card.name}:`;
        gridEl.innerHTML = '';

        inventory.forEach((c) => {
            const el = c.render();
            el.classList.add('sell-label-visible');
            const sellLabel = el.querySelector('.buy-sell-label.sell');
            if (sellLabel) {
                sellLabel.textContent = `Sell (+${c.sellValue || 1}g)`;
                sellLabel.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.completeExpulsion(c);
                });
            }
            el.addEventListener('click', (e) => {
                if (!e.target.closest('.buy-sell-label')) this.completeExpulsion(c);
            });
            gridEl.appendChild(el);
        });

        cancelBtn.onclick = () => this.cancelExpulsion();
        overlay.classList.remove('hidden');
        window.balatroEffects?.hideAllTooltips();
    }

    cancelExpulsion() {
        const p = this.expulsionPending;
        if (!p) return;

        if (window.soundManager) window.soundManager.play('cancel', { volume: 0.5 });
        if (p.refundGold && p.gameEngine) {
            p.gameEngine.updateGoldAnimated(p.refundGold, 'refund');
            p.gameEngine.showMessage('Cancelled.');
        }

        this.expulsionPending = null;
        const overlay = this.dom.expulsionOverlay || document.getElementById('expulsionOverlay');
        if (overlay) overlay.classList.add('hidden');
        p.gameEngine?.updateAllUI();
    }

    completeExpulsion(cardToSell) {
        const p = this.expulsionPending;
        if (!p || !p.gameState || !p.gameEngine) return;

        this.sellCard(cardToSell, p.gameState, p.gameEngine);

        const { card, gameState, gameEngine, element, packContainer, packType } = p;
        this.expulsionPending = null;

        const overlay = this.dom.expulsionOverlay || document.getElementById('expulsionOverlay');
        if (overlay) overlay.classList.add('hidden');

        this._addCardAfterExpulsion(card, gameState, gameEngine, element ?? null, packContainer ?? null, packType ?? null);
    }

    _addCardAfterExpulsion(card, gameState, gameEngine, element, packContainer, packType) {
        if (card instanceof Joker) {
            if (window.dataManager) window.dataManager.unlockItem('boons', card.id);
            gameState.jokers.push(card);
        } else if (card instanceof WorshipCard || card instanceof LibationCard) {
            gameState.consumables.push(card);
        }

        if (element) element.remove();
        gameEngine.updateAllUI();

        if (packContainer) {
            packContainer.dataset.packClaimed = 'true';
            if (packType && gameState.packs) {
                gameState.packs.push({ type: packType, name: this.getPackName?.(packType) || packType, openedAt: Date.now() });
            }
            setTimeout(() => this.closePackOpeningView(), 150);
        }

        Logger.debug('Card claimed after expulsion');
    }

    /**
     * Balatro-style pack opening with animations
     * @param {string} packType - Type of pack to open
     * @param {Object} gameState - Current game state
     * @param {Object} gameEngine - Game engine reference
     */
    buyPack(packType, gameState, gameEngine) {
        const packData = CardData.packs.find(p => p.type === packType);
        
        // Tantalus' Curse: Cannot spend gold while active
        const hasTantalusCurse = gameState.jokers?.some(j => j.id === 'tantalus_curse');
        if (hasTantalusCurse) {
            gameEngine.showMessage("💰 Tantalus' Curse: Cannot spend gold!");
            return;
        }
        
        if (gameState.gold < packData.cost) {
            gameEngine.showMessage("Not enough gold!");
            return;
        }
        
        gameState.gold -= packData.cost;
        
        // Mark pack as opened so it doesn't reappear in shop
        if (!this.shopState.openedPacks) {
            this.shopState.openedPacks = new Set();
        }
        this.shopState.openedPacks.add(packType);
        
        // Switch to pack opening view — clear tooltips so they don't persist
        window.balatroEffects?.hideAllTooltips();
        this.dom.shopDefaultView.classList.add('hidden');
        this.dom.packOpeningView.classList.remove('hidden');
        if (this.dom.shopStage) this.dom.shopStage.classList.add('pack-opening-stage');
        
        const revealedContainer = document.getElementById('packRevealedCards');
        revealedContainer.dataset.packType = packType;
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
                        if (window.soundManager) window.soundManager.play('highlight1', { volume: 0.35 });
                        
                        // Reset click count after delay
                        clickTimer = setTimeout(() => {
                            clickCount = 0;
                        }, 400);
                        
                    } else if (clickCount === 2) {
                        // Second click (double-click) - claim
                        clearTimeout(clickTimer);
                        clickCount = 0;
                        
                        cardWrapper.classList.add('claiming');
                        if (window.soundManager) window.soundManager.play(card instanceof Joker ? 'card1' : 'tarot1', { pitch: 0.92 + Math.random() * 0.1, volume: 0.55 });
                        
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
        
        const { jokerIds: ownedJokerIds, consumableIds: ownedConsumableIds } = this.getOwnedCardIds(gameState);
        const ownedIds = packType === 'joker' ? ownedJokerIds : ownedConsumableIds;
        const shopDisplayedIds = this.getShopDisplayedCardIds();
        const filteredPool = cardPool.filter(card => !ownedIds.has(card.id) && !shopDisplayedIds.has(card.id));
        
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
        const { jokerIds: ownedJokerIds, consumableIds: ownedConsumableIds } = this.getOwnedCardIds(gameState);
        const shopDisplayedIds = this.getShopDisplayedCardIds();
        const selectedCards = new Set();
        const cardTypes = [
            { pool: CardData.jokers, class: Joker, ownedIds: ownedJokerIds },
            { pool: CardData.worship, class: WorshipCard, ownedIds: ownedConsumableIds },
            { pool: CardData.libations, class: LibationCard, ownedIds: ownedConsumableIds }
        ];
        
        for (let i = 0; i < cardCount; i++) {
            const randomType = cardTypes[Math.floor(gameEngine.prng.random() * cardTypes.length)];
            const filteredPool = randomType.pool.filter(card => !randomType.ownedIds.has(card.id) && !shopDisplayedIds.has(card.id) && !selectedCards.has(card.id));
            
            if (filteredPool.length > 0) {
                const randomIndex = Math.floor(gameEngine.prng.random() * filteredPool.length);
                const cardData = filteredPool[randomIndex];
                selectedCards.add(cardData.id);
                const card = new randomType.class(cardData);
                result.push({ card, cardData });
            }
        }
        
        return result;
    }

    generatePackContentsForDisplay(packType, container, gameState, gameEngine) {
        let cardCount = 3;
        let cardPool = [], CardClass;
        
        switch (packType) {
            case 'joker':
                cardPool = CardData.jokers || [];
                CardClass = Joker;
                break;
            case 'worship':
                cardPool = CardData.worship || [];
                CardClass = WorshipCard;
                break;
            case 'libation':
                cardPool = CardData.libations || [];
                CardClass = LibationCard;
                break;
            case 'chaos':
                // Special handling for chaos pack
                this.generateChaosPackContents(container, gameState, gameEngine);
                return;
            default:
                Logger.error(`Unknown pack type: ${packType}`);
                return;
        }
        
        const { jokerIds: ownedJokerIds, consumableIds: ownedConsumableIds } = this.getOwnedCardIds(gameState);
        const ownedIds = packType === 'joker' ? ownedJokerIds : ownedConsumableIds;
        const shopDisplayedIds = this.getShopDisplayedCardIds();
        const filteredPool = cardPool.filter(card => !ownedIds.has(card.id) && !shopDisplayedIds.has(card.id));
        
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
        
        for (let i = 0; i < cardCount; i++) {
            // Temporarily use simple random selection to fix shop
            if (availableCards.length === 0) break;
            const randomIndex = Math.floor(gameEngine.prng.random() * availableCards.length);
            const cardData = availableCards.splice(randomIndex, 1)[0];
            
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
            
            // Add double-click functionality for pack cards
            cardEl.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                Logger.debug(`Double-clicked pack card: ${card.name}`);
                if (window.soundManager) window.soundManager.play(card instanceof Joker ? 'card1' : 'tarot1', { pitch: 0.92 + Math.random() * 0.1, volume: 0.55 });
        
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
            
            container.appendChild(cardEl);
            packCards.push({ card, element: cardEl });
        }
    }

    generateChaosPackContents(container, gameState, gameEngine) {
        const { jokerIds: ownedJokerIds, consumableIds: ownedConsumableIds } = this.getOwnedCardIds(gameState);
        const allCardPools = [
            { pool: CardData.jokers, class: Joker, name: 'Boon', ownedIds: ownedJokerIds },
            { pool: CardData.worship, class: WorshipCard, name: 'Worship', ownedIds: ownedConsumableIds },
            { pool: CardData.libations, class: LibationCard, name: 'Libation', ownedIds: ownedConsumableIds }
        ];
        
        const shopDisplayedIds = this.getShopDisplayedCardIds();
        const availablePools = allCardPools.map(p => ({
            ...p,
            filteredPool: p.pool.filter(card => !p.ownedIds.has(card.id) && !shopDisplayedIds.has(card.id))
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
                Logger.warn('No more cards available in chaos pack generation');
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
                if (window.soundManager) window.soundManager.play('highlight1', { volume: 0.35 });
            });
            
            // Add double-click functionality for chaos pack cards
            cardEl.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                Logger.debug(`Double-clicked chaos pack card: ${card.name}`);
                if (window.soundManager) window.soundManager.play(card instanceof Joker ? 'card1' : 'tarot1', { pitch: 0.92 + Math.random() * 0.1, volume: 0.55 });
        
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
            
            container.appendChild(cardEl);
            packCards.push({ card, element: cardEl });
        }
    }

    updatePackConsumables(gameState, gameEngine) {
        const consumablesContainer = document.getElementById('packPlayerConsumables');
        consumablesContainer.innerHTML = '<h4>Your Consumables</h4>';
        
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

    closePackOpeningView() {
        window.balatroEffects?.hideAllTooltips();

        if (!this.dom.packOpeningView) this.dom.packOpeningView = document.getElementById('packOpeningView');
        if (!this.dom.shopDefaultView) this.dom.shopDefaultView = document.getElementById('shopDefaultView');
        if (!this.dom.packOpeningView || !this.dom.shopDefaultView) return;

        const revealedContainer = document.getElementById('packRevealedCards');
        const packType = revealedContainer?.dataset?.packType;
        if (packType) {
            if (!this.shopState.openedPacks) this.shopState.openedPacks = new Set();
            this.shopState.openedPacks.add(packType);
            document.getElementById('shopPacksArea')?.querySelectorAll(`[data-pack-type="${packType}"]`).forEach(el => el.remove());
        }

        this.dom.packOpeningView.classList.add('hidden');
        this.dom.shopDefaultView.classList.remove('hidden');
        this.dom.shopStage?.classList.remove('pack-opening-stage');
        if (window.soundManager) window.soundManager.setMusicContext('shop');

        if (revealedContainer) {
            revealedContainer.innerHTML = '';
            revealedContainer.dataset.packClaimed = 'false';
        }
    }

    /**
     * Create Balatro-style ripple effect on button click
     * @param {HTMLElement} button - The button element clicked
     * @param {MouseEvent} event - The click event
     */
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