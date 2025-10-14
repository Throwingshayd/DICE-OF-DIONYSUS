// GameEngine - Main game logic and state management

class GameEngine {
    constructor(seed) {
        this.prng = new SeededRNG(seed);
        this.dataManager = new DataManager();
        this.initializeGameState();
        this.setupEventListeners();
    }

    initializeGameState() {
        this.state = {
            // Core game state
            dice: Array(GAME_BALANCE.STARTING_DICE_COUNT).fill(0).map((_, index) => new Die(index + 1)),
            held: Array(GAME_BALANCE.STARTING_DICE_COUNT).fill(false),
            rollsLeft: GAME_BALANCE.STARTING_ROLLS,
            hasRolled: false,
            
            // Scoring
            scorecard: {},
            totalScore: 0,
            scoreThreshold: GAME_BALANCE.STARTING_SCORE_THRESHOLD,
            
            // Progression
            turn: 1,
            ante: GAME_BALANCE.STARTING_ANTE,
            maxTurns: GAME_BALANCE.MAX_TURNS_PER_ANTE,
            endlessMode: false,
            
            // Economy
            gold: GAME_BALANCE.STARTING_GOLD,
            baseFavour: GAME_BALANCE.BASE_FAVOUR,
            
            // Collections
            jokers: [],
            artifacts: [],
            consumables: [],
            
            // Slots (capacities)
            boonSlots: GAME_BALANCE.STARTING_BOON_SLOTS,
            consumableSlots: GAME_BALANCE.STARTING_LIBATION_SLOTS,
            
            // Worship system
            worshipLevels: {
                'Aphrodite': 0, 'Ares': 0, 'Artemis': 0, 'Hera': 0,
                'Athena': 0, 'Heracles': 0, 'Dionysus': 0, 'Hermes': 0,
                'Apollo': 0, 'Zeus': 0, 'Nyx': 0, 'Hephaestus': 0,
                'The Pleiades': 0, 'Poseidon': 0, 'The Nine Muses': 0
            },
            
            // Enhancements and effects
            enhancementMap: {},
            tempPips: 0,
            tempFavour: 0,
            
            // Boss blinds
            activeBlind: null,
            
            // UI state
            pendingCategory: null,
            // sellMode removed - using direct sell method instead
            gameOver: false,
            isAwaitingApi: false,
            
            // Streaks for artifacts
            upperSanctumStreak: 0,
            lowerSanctumStreak: 0,
            
            // Shop state
            usedFreeReroll: false,
            
            // Special effects and abilities
            diceEffects: {},
            pipsBonuses: {},
            rerollAbilities: {},
            diceSubstitutions: {},
            abilities: {},
            doubleScoringAllowed: [],
            goldPerDie: {},
            forcedDiceValues: {},
            triggerEffects: {},
            globalBonuses: {},
            winConditions: {},
            yahtzeeEffects: {},
            prophecyEffects: {},
            flexibleScoring: {},
            diceTransformations: {},
            
            // Capacity limits - FIXED: No roll modifications
            boonSlots: 5,
            consumableSlots: 2,
            maxHeld: 5,
            
            // Bonus Yahtzee system
            bonusYahtzees: 0,
            rolledBonusYahtzees: 0,
            upperBonusAwarded: false,
            lowerBonusAwarded: false,
            unlockedCategories: {
                'Sevens': false,
                'Eights': false,
                'Nines': false
            }
        };
    }

    setupEventListeners() {
        // This will be called after DOM elements are available
        this.domReady = false;
    }

    bindDOMElements() {
        this.dom = {
            diceContainer: document.getElementById('diceContainer'),
            rollButton: document.getElementById('rollButton'),
            liveScoreDisplay: document.getElementById('liveScoreDisplay'),
            
            // Info displays
            anteDisplay: document.getElementById('anteDisplay'),
            turnDisplay: document.getElementById('turnDisplay'),
            rollsLeft: document.getElementById('rollsLeft'),
            goldDisplay: document.getElementById('goldDisplay'),
            totalScore: document.getElementById('totalScore'),
            
            // Boss blind info
            bossBlindName: document.getElementById('bossBlindName'),
            bossBlindEffect: document.getElementById('bossBlindEffect'),
            
            // Scorecard
            scorecardRows: document.querySelectorAll('.score-row'),
            
            // Card slots
            jokerSlots: document.getElementById('jokerSlots'),
            consumableSlots: document.getElementById('consumableSlots'),
            artifactSlots: document.getElementById('artifactSlots'),

            
            // Shop
            shopOverlay: document.getElementById('shopOverlay'),
            confirmOverlay: document.getElementById('confirmOverlay'),
            libationOverlay: document.getElementById('libationOverlay'),
            
            // Shop views
            shopDefaultView: document.getElementById('shopDefaultView'),
            packOpeningView: document.getElementById('packOpeningView'),
            // sellModeButton removed - using direct sell method instead
            
            // Confirm dialog
            confirmText: document.getElementById('confirmText'),
            confirmDetails: document.getElementById('confirmDetails'),
            confirmYes: document.getElementById('confirmYes'),
            confirmNo: document.getElementById('confirmNo'),
            
            // Libation selection
            libationChoices: document.getElementById('libationChoices'),
            
            // Messages
            messagePopup: document.getElementById('message-popup')
        };
        
        // Ensure correct styling class for live score display
        if (this.dom.liveScoreDisplay && !this.dom.liveScoreDisplay.classList.contains('live-score-display')) {
            this.dom.liveScoreDisplay.classList.add('live-score-display');
        }
        
        // Check if essential elements exist
        if (!this.dom.rollButton) {
            console.warn('Roll button not found, game may not function properly');
        }
        if (!this.dom.diceContainer) {
            console.warn('Dice container not found, game may not function properly');
        }
        
        this.setupDOMEventListeners();
        this.domReady = true;
    }

    setupDOMEventListeners() {
        // Roll button
        if (this.dom.rollButton) {
            this.dom.rollButton.addEventListener('click', () => this.rollDice());
        }
        
        // Scorecard rows
        if (this.dom.scorecardRows) {
            this.dom.scorecardRows.forEach(row => {
                const category = row.dataset.category;
                if (category && category !== 'Upper Bonus' && category !== 'Lower Bonus') {
                    row.addEventListener('click', () => this.promptScore(category));
                    row.addEventListener('mouseenter', () => this.updateLiveScoreDisplay(category));
                    row.addEventListener('mouseleave', () => this.updateLiveScoreDisplay(null));
                }
            });
        }
        
        // Confirmation dialog
        if (this.dom.confirmYes) {
            this.dom.confirmYes.addEventListener('click', () => this.confirmScore());
        }
        if (this.dom.confirmNo) {
            this.dom.confirmNo.addEventListener('click', () => this.cancelScore());
        }
        
        // Shop buttons - Note: Event listeners also attached by UIManager when shop is restored
        const closeShopBtn = document.getElementById('closeShop');
        if (closeShopBtn) {
            closeShopBtn.addEventListener('click', () => {
                Logger.debug('Close shop clicked from GameEngine listener');
                this.closeShop();
            });
        }
        
        const rerollShopBtn = document.getElementById('rerollShop');
        if (rerollShopBtn) {
            rerollShopBtn.addEventListener('click', () => {
                Logger.debug('Reroll shop clicked from GameEngine listener');
                this.rerollShop();
            });
        }
        
        // Sell mode button removed - using direct sell method instead
        

    }

    // Game flow methods
    startGame() {
        this.startAnte();
        
        // Wait a brief moment to ensure DOM is ready, then update UI
        setTimeout(() => {
            this.updateAllUI();
        }, 100);
    }

    /**
     * Start ante with Balatro-style transition screen
     * Shows boss reveal, score threshold, and "Begin" button
     */
    startAnte() {
        const anteIndex = this.state.ante - 1;
        let currentAnteData;
        
        if (this.state.endlessMode) {
            const randomBlindIndex = Math.floor(this.prng.random() * AnteData.length);
            currentAnteData = AnteData[randomBlindIndex];
        } else {
            currentAnteData = AnteData[anteIndex] || AnteData[AnteData.length - 1];
        }
        
        // Show Balatro-style ante transition screen
        if (this.domReady && this.state.ante > 1) {
            // Show transition for ante 2+ (not first ante)
            this.showAnteTransition(currentAnteData, () => {
                this.finalizeAnteStart(currentAnteData);
            });
        } else {
            // First ante or no DOM - start immediately
            this.finalizeAnteStart(currentAnteData);
        }
    }
    
    /**
     * Finalize ante start after transition screen
     */
    finalizeAnteStart(currentAnteData) {
        this.state.activeBlind = currentAnteData.blindId;
        
        // Set score threshold from AnteData (Balatro-style progression)
        this.state.scoreThreshold = currentAnteData.scoreThreshold;
        
        // Apply boss blind effects
        if (this.state.activeBlind === 'score_penalty') {
            this.state.scoreThreshold = Math.floor(this.state.scoreThreshold * 1.5);
        }
        
        this.applyArtifactEffects();
        
        // Reset transient bonus-yahtzee roll counter each ante
        this.state.rolledBonusYahtzees = 0;

        if (this.domReady) {
            this.updateAllUI();
        }
    }
    
    /**
     * Show Balatro-style ante transition screen
     * Displays boss name, blind effect, score threshold with animations
     * @param {Object} anteData - Current ante data
     * @param {Function} callback - Called when player clicks "Begin"
     */
    showAnteTransition(anteData, callback) {
        // Create transition overlay
        const overlay = document.createElement('div');
        overlay.className = 'ante-transition-overlay';
        overlay.style.opacity = '0';
        
        const modal = document.createElement('div');
        modal.className = 'ante-transition-modal';
        
        modal.innerHTML = `
            <div class="ante-header">
                <div class="ante-number">Ante ${this.state.ante}</div>
                <div class="ante-boss-name">${anteData.name}</div>
            </div>
            
            <div class="ante-blind-section">
                <div class="blind-label">Boss Blind</div>
                <div class="blind-name">${anteData.blindName}</div>
                <div class="blind-effect">${anteData.blindEffect}</div>
            </div>
            
            <div class="ante-threshold-section">
                <div class="threshold-label">Score to Beat</div>
                <div class="threshold-value">${anteData.scoreThreshold}</div>
            </div>
            
            <div class="ante-actions">
                <button class="ante-begin-button" id="anteBeginButton">
                    <span class="button-text">Begin Ante</span>
                    <span class="button-arrow">→</span>
                </button>
            </div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Fade in overlay
        requestAnimationFrame(() => {
            overlay.style.transition = 'opacity 0.5s ease-out';
            overlay.style.opacity = '1';
        });
        
        // Begin button handler
        const beginButton = modal.querySelector('#anteBeginButton');
        beginButton.addEventListener('click', () => {
            // Fade out
            overlay.style.opacity = '0';
            setTimeout(() => {
                if (overlay.parentNode) {
                    document.body.removeChild(overlay);
                }
                callback();
            }, 500);
        });
    }

    /**
     * Roll all non-held dice
     * Applies joker effects, animations, and decrements rolls
     */
    rollDice() {
        // FIXED: Simple, bulletproof roll mechanics
        if (this.state.rollsLeft <= 0 || this.state.gameOver || this.state.isAwaitingApi) {
            return;
        }
        
        // Balatro-style pre-roll anticipation: dice jiggle before rolling
        if (this.dom.diceContainer) {
            const diceElements = this.dom.diceContainer.querySelectorAll('.die');
            diceElements.forEach((dieElement, index) => {
                if (!this.state.held[index]) {
                    dieElement.classList.add('pre-roll-jiggle');
                    setTimeout(() => {
                        dieElement.classList.remove('pre-roll-jiggle');
                    }, 400);
                }
            });
        }
        
        // Wait for jiggle before actual roll
        setTimeout(() => {
            this.executeRoll();
        }, 250);
    }
    
    /**
     * Execute the actual dice roll (called after pre-roll animation)
     */
    executeRoll() {
        // Apply joker effects that trigger at turn start (Balatro-inspired timing)
        this.applyJokerTurnStartEffects();
        
        // Apply joker effects that trigger at roll start (legacy)
        this.applyJokerRollEffects();
        
        // FIXED: Simple decrement - no complex logic
        this.state.rollsLeft--;
        this.state.hasRolled = true;
        
        // Add Balatro-style rolling effects with enhanced landing
        if (window.balatroEffects && this.dom.diceContainer) {
            const diceElements = this.dom.diceContainer.querySelectorAll('.die');
            diceElements.forEach((dieElement, index) => {
                if (!this.state.held[index]) {
                    // Add rolling animation with slight delay for each die
                    setTimeout(() => {
                        window.balatroEffects.addDiceRollEffect(dieElement);
                        
                        // Add landing bounce after roll
                        setTimeout(() => {
                            dieElement.classList.add('dice-land');
                            setTimeout(() => dieElement.classList.remove('dice-land'), 500);
                        }, 600);
                    }, index * 100);
                }
            });
        }
        
        // Shuffle dice positions (dice can appear in random slots)
        this.shuffleDicePositions();
        
        // Apply forced dice values (like Morpheus effect)
        if (this.state.forcedDiceValues.allThrees && this.state.rollsLeft === 2) {
            this.state.dice.forEach(die => die.setFace(3));
        } else {
            // Normal rolling
            this.state.dice.forEach((die, index) => {
                if (!this.state.held[index]) {
                    die.roll(this.prng);
                    
                    // Apply transformations
                    if (this.state.diceTransformations.onesBecomeSixes && die.face === 1) {
                        die.setFace(6);
                    }
                    
                    // Apply enhancements (legacy system - no longer used with new face-specific system)
                    // const enhancement = this.state.enhancementMap[die.face];
                    // if (enhancement) {
                    //     die.addEnhancement(enhancement);
                    // } else {
                    //     die.enhancements.clear();
                    // }
                }
            });
        }
        
        // Apply joker dice roll effects
        this.state.jokers.forEach(joker => {
            if (joker.affectsDiceRoll && joker.affectsDiceRoll()) {
                joker.applyDiceRollEffect(this.state.dice, this.state, this.prng);
            }
        });
        
        // Check for trigger effects
        this.checkTriggerEffects();

        // If a bonus Heureka (Yahtzee) was rolled and Yahtzee is already scored,
        // preview-unlock extra categories (7s, 8s, 9s) immediately for UI without
        // altering bonus count mechanics (actual bonus increments on scoring only)
        this.previewUnlockBonusCategoriesOnRoll();
        
        if (this.domReady) {
            this.updateAllUI();
        }
    }

    // Apply joker effects that trigger at turn start (Balatro-inspired timing)
    applyJokerTurnStartEffects() {
        this.state.jokers.forEach(joker => {
            joker.onTimingEvent('turn_start', this.state);
        });
    }

    // Apply joker effects that trigger at roll start (legacy method)
    applyJokerRollEffects() {
        this.state.jokers.forEach(joker => {
            switch (joker.id) {
                case 'achilles_heel':
                    // Achilles Heel: lose 1 Gold at the start of each roll
                    if (this.state.gold > 0) {
                        this.updateGoldAnimated(-1, "Achilles' Heel");
                        window.game?.showMessage?.("Achilles' Heel: -1 Gold!");
                    }
                    break;
            }
        });
    }

    /**
     * Toggle hold status for a specific die
     * @param {number} index - Die index (0-4)
     */
    toggleHold(index) {
        if (!this.state.hasRolled || this.state.isAwaitingApi) return;
        
        const maxHeld = this.state.activeBlind === 'max_3_hold' ? 3 : this.state.maxHeld;
        const currentHeldCount = this.state.held.filter(h => h).length;
        
        // Check for Strategic Mind extra hold capacity
        const extraHoldCapacity = this.state.abilities?.strategicMindExtraHold || 0;
        const effectiveMaxHeld = maxHeld + extraHoldCapacity;
        
        if (!this.state.held[index] && currentHeldCount >= effectiveMaxHeld) {
            this.showMessage(`You can only hold ${effectiveMaxHeld} dice.`);
            return;
        }
        
        this.state.held[index] = !this.state.held[index];
        
        if (this.domReady) {
            this.updateAllUI();
        }
    }

    // Shuffle dice positions while maintaining their individual properties
    shuffleDicePositions() {
        // Only shuffle if this is the first roll of the turn (rollsLeft === 2)
        if (this.state.rollsLeft !== 2) {
            return;
        }
        
        // Create a copy of the dice array
        const diceCopy = [...this.state.dice];
        const heldCopy = [...this.state.held];
        
        // Fisher-Yates shuffle algorithm
        for (let i = diceCopy.length - 1; i > 0; i--) {
            const j = Math.floor(this.prng.random() * (i + 1));
            
            // Swap dice
            [diceCopy[i], diceCopy[j]] = [diceCopy[j], diceCopy[i]];
            
            // Swap held status
            [heldCopy[i], heldCopy[j]] = [heldCopy[j], heldCopy[i]];
        }
        
        // Update the state
        this.state.dice = diceCopy;
        this.state.held = heldCopy;
        
        console.log('Dice positions shuffled for new turn');
    }

    checkTriggerEffects() {
        // Check for four fours effect
        if (this.state.triggerEffects.fourFoursReroll) {
            const fourCount = this.state.dice.filter(die => die.getEffectiveFace() === 4).length;
            if (fourCount >= 4) {
                this.showMessage("Earthquake Lord: Rerolling all dice!");
                this.state.dice.forEach(die => die.roll(this.prng));
                this.state.held.fill(false);
            }
        }
        
        // Check for gold per die effects
        if (Object.keys(this.state.goldPerDie).length > 0) {
            let goldGained = 0;
            this.state.dice.forEach(die => {
                const faceValue = die.getEffectiveFace();
                if (this.state.goldPerDie[faceValue]) {
                    goldGained += this.state.goldPerDie[faceValue];
                }
            });
            if (goldGained > 0) {
                this.state.gold += goldGained;
                this.showMessage(`Gained ${goldGained} gold from dice!`);
            }
        }
    }

    // Preview-unlock bonus categories when rolling a bonus Heureka, so the rows
    // appear as soon as the second Yahtzee is rolled. Does not change bonus count.
    previewUnlockBonusCategoriesOnRoll() {
        // Only relevant if Yahtzee category has already been scored once
        const yahtzeeAlreadyScored = this.state.scorecard && this.state.scorecard['Yahtzee'] !== undefined;
        if (!yahtzeeAlreadyScored) return;

        // Determine if current dice show a Yahtzee
        const faces = this.state.dice.map(d => d.getEffectiveFace());
        const counts = faces.reduce((acc, val) => {
            acc[val] = (acc[val] || 0) + 1;
            return acc;
        }, {});
        const rolledYahtzee = Object.values(counts).some(c => c >= 5);
        if (!rolledYahtzee) return;

        // Count this as a newly rolled bonus Yahtzee for preview purposes
        this.state.rolledBonusYahtzees = Math.min(3, (this.state.rolledBonusYahtzees || 0) + 1);

        // Determine how many categories should be visible:
        // 1st preview unlocks Sevens, 2nd unlocks Eights, 3rd unlocks Nines
        const unlockOrder = ['Sevens', 'Eights', 'Nines'];
        const shouldUnlockCount = Math.min(
            unlockOrder.length,
            (this.state.bonusYahtzees || 0) + (this.state.rolledBonusYahtzees || 0)
        );

        let changed = false;
        for (let i = 0; i < shouldUnlockCount; i++) {
            const cat = unlockOrder[i];
            if (!this.state.unlockedCategories[cat]) {
                this.state.unlockedCategories[cat] = true;
                changed = true;
            }
        }
        if (changed && this.domReady) this.updateAllUI();
    }

    /**
     * Prompt user to confirm scoring in a category
     * Shows confirmation dialog with score details
     * @param {string} category - Category to score
     */
    promptScore(category) {
        if (this.state.scorecard[category] !== undefined || this.state.isAwaitingApi) return;
        if (!this.state.hasRolled) {
            this.showMessage("You must roll the dice first!");
            return;
        }
        
        this.state.pendingCategory = category;
        const { pips, favour, isValid } = this.calculateScore(category);
        
        if (this.domReady && this.dom.confirmText && this.dom.confirmDetails && this.dom.confirmOverlay) {
            if (isValid) {
                const displayCategory = category === 'Yahtzee' ? 'Heureka' : category;
                this.dom.confirmText.textContent = `Score ${displayCategory}?`;
                this.dom.confirmDetails.innerHTML = `${pips} Pips <span style="color: var(--accent-red-desat)">(x${favour})</span> = ${pips * favour} Score`;
            } else {
                const displayCategory = category === 'Yahtzee' ? 'Heureka' : category;
                this.dom.confirmText.textContent = `Scratch ${displayCategory}?`;
                this.dom.confirmDetails.textContent = "This hand does not qualify. Scratch for 0 points.";
            }
            this.dom.confirmOverlay.classList.remove('hidden');
        } else {
            // Fallback: directly score without confirmation dialog
            this.confirmScore();
        }
    }

    /**
     * Confirm and execute the scoring action
     * Called when user confirms in the scoring dialog
     */
    confirmScore() {
        const category = this.state.pendingCategory;
        if (!category) return;
        
        // Track streaks
        const isUpper = ["Ones", "Twos", "Threes", "Fours", "Fives", "Sixes"].includes(category);
        if (isUpper) {
            this.state.upperSanctumStreak++;
            this.state.lowerSanctumStreak = 0;
        } else {
            this.state.lowerSanctumStreak++;
            this.state.upperSanctumStreak = 0;
        }
        
        let { pips, favour, isValid } = this.calculateScore(category);
        let finalScore = 0;
        
        if (isValid) {
            // Add temporary modifiers
            pips += this.state.tempPips;
            favour += this.state.tempFavour;
            
            // Apply BEFORE_SCORE joker effects (Balatro-inspired timing)
            let eventData = { category, pips, favour };
            this.state.jokers.forEach(joker => {
                eventData = joker.onTimingEvent('before_score', this.state, eventData);
            });
            
            pips = eventData.pips;
            favour = eventData.favour;
            
            // Apply global bonuses
            if (this.state.globalBonuses.fivesToAll) {
                const fivesCount = this.state.dice.filter(die => die.face === 5).length;
                pips += fivesCount * 5;
            }
            
            finalScore = pips * favour;
            
            // Check for bonus Yahtzee and unlock categories
            if (category === 'Yahtzee' && this.state.scorecard['Yahtzee'] !== undefined) {
                this.state.bonusYahtzees++;
                // Consuming any previewed rolls
                this.state.rolledBonusYahtzees = 0;
                this.unlockBonusCategories();
                this.showMessage(`Bonus Heureka! (${this.state.bonusYahtzees} total)`, 3000);
            }
            
            // BALATRO-STYLE ANIMATED SCORING
            // Show pips × favour breakdown, count up, particles, enhanced shake
            this.animateScoreUpdate(category, pips, favour, finalScore, () => {
                // Callback after animation completes
                this.finalizeScoring(category, pips, favour, finalScore);
            });
            
        } else {
            this.state.scorecard[category] = 0;
            // Still finalize for zero score
            this.finalizeScoring(category, pips, favour, 0);
        }
    }
    
    /**
     * Finalize scoring after animation completes
     * Runs bonuses, effects, and advances turn
     */
    finalizeScoring(category, pips, favour, finalScore) {
        // Check and award Upper Sanctum bonus (Yahtzee rule):
        // If sum of Ones..Sixes >= 63 and not yet awarded, grant +35 points
        this.checkAndAwardUpperBonus();
        // Check and award Lower Sanctum bonus (Pandora's Box theme):
        // If all lower categories have been scored (non-undefined), grant +35 pips once
        this.checkAndAwardLowerBonus();
        
        // Apply AFTER_SCORE joker effects (Balatro-inspired timing)
        this.state.jokers.forEach(joker => {
            joker.onTimingEvent('after_score', this.state, { category, pips, favour });
        });
        
        // Gain gold for scoring with animation (increased from +1 to +2 for better economy)
        this.updateGoldAnimated(GAME_BALANCE.GOLD_PER_SCORE, "scoring");
        
        // Reset temporary modifiers
        this.state.tempPips = 0;
        this.state.tempFavour = 0;
        
        // Apply post-score artifact effects
        this.applyArtifactEffects('score');
        
        // Check win conditions
        this.checkWinConditions();
        
        this.cancelScore();
        this.nextTurn();
    }
    
    /**
     * Balatro-style animated score reveal
     * Shows pips, favour, multiplication, count-up, particles, and screen shake
     * @param {string} category - Scoring category
     * @param {number} pips - Base pips
     * @param {number} favour - Multiplier
     * @param {number} finalScore - Final calculated score
     * @param {Function} callback - Called when animation completes
     */
    animateScoreUpdate(category, pips, favour, finalScore, callback) {
        const row = document.querySelector(`[data-category="${category}"]`);
        if (!row) {
            // Fallback if no row found
            this.state.scorecard[category] = finalScore;
            this.state.totalScore += finalScore;
            callback();
            return;
        }
        
        const scoreDisplay = row.querySelector('.potential-score');
        if (!scoreDisplay) {
            this.state.scorecard[category] = finalScore;
            this.state.totalScore += finalScore;
            callback();
            return;
        }
        
        // Step 1: Show pips with pop animation (500ms)
        scoreDisplay.innerHTML = `<span class="score-pips-anim">${pips}</span>`;
        scoreDisplay.classList.add('score-animating');
        
        setTimeout(() => {
            // Step 2: Show × favour (500ms)
            scoreDisplay.innerHTML = `
                <span class="score-pips-anim">${pips}</span>
                <span class="score-multiply-anim"> × </span>
                <span class="score-favour-anim">${favour}</span>
            `;
            
            setTimeout(() => {
                // Step 3: Show equals sign briefly (300ms)
                scoreDisplay.innerHTML = `
                    <span class="score-pips-anim fade-out">${pips}</span>
                    <span class="score-multiply-anim fade-out"> × </span>
                    <span class="score-favour-anim fade-out">${favour}</span>
                    <span class="score-equals-anim"> = </span>
                `;
                
                setTimeout(() => {
                    // Step 4: Count up to final score (1000ms)
                    scoreDisplay.innerHTML = `<span class="score-final-anim">0</span>`;
                    const finalSpan = scoreDisplay.querySelector('.score-final-anim');
                    
                    this.animateNumberCount(finalSpan, 0, finalScore, 1000, () => {
                        // Step 5: Add glow effect
                        scoreDisplay.classList.add('score-glow-effect');
                        
                        // Update game state
                        this.state.scorecard[category] = finalScore;
                        this.state.totalScore += finalScore;
                        
                        // Screen shake based on score magnitude
                        if (window.balatroEffects) {
                            if (category === 'Yahtzee') {
                                window.balatroEffects.screenShake(20, 800);
                            } else if (finalScore >= 200) {
                                const intensity = Math.min(finalScore / 10, 35);
                                window.balatroEffects.screenShake(intensity, 600);
                            } else if (finalScore >= 100) {
                                window.balatroEffects.screenShake(12, 400);
                            }
                        }
                        
                        // Particle effects for high scores
                        if (finalScore >= 200 && window.balatroEffects) {
                            this.createScoreParticles(scoreDisplay, finalScore);
                        }
                        
                        // Remove animation classes after delay
                        setTimeout(() => {
                            scoreDisplay.classList.remove('score-animating', 'score-glow-effect');
                            scoreDisplay.innerHTML = finalScore;
                            this.updateAllUI();
                            
                            // Call callback to continue game flow
                            callback();
                        }, 800);
                    });
                }, 300);
            }, 500);
        }, 500);
    }
    
    /**
     * Animate number counting from start to end
     * @param {HTMLElement} element - Element to update
     * @param {number} start - Starting number
     * @param {number} end - Ending number
     * @param {number} duration - Animation duration in ms
     * @param {Function} callback - Called when complete
     */
    animateNumberCount(element, start, end, duration, callback) {
        const startTime = Date.now();
        const difference = end - start;
        
        const step = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out cubic)
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (difference * eased));
            
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                element.textContent = end; // Ensure final value is exact
                if (callback) callback();
            }
        };
        
        step();
    }
    
    /**
     * Create particle effects for high scores
     * @param {HTMLElement} element - Anchor element
     * @param {number} score - Score value
     */
    createScoreParticles(element, score) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // More particles for higher scores
        const particleCount = Math.min(Math.floor(score / 20), 30);
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'score-particle';
            particle.style.left = centerX + 'px';
            particle.style.top = centerY + 'px';
            
            const angle = (i / particleCount) * Math.PI * 2;
            const distance = 30 + Math.random() * 40;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            
            particle.style.setProperty('--tx', `${tx}px`);
            particle.style.setProperty('--ty', `${ty}px`);
            particle.style.animationDelay = `${i * 0.02}s`;
            
            // Color based on score
            if (score >= 300) {
                particle.style.background = 'radial-gradient(circle, #ff6b6b 0%, #ffd700 50%, transparent 100%)';
            } else {
                particle.style.background = 'radial-gradient(circle, #ffd700 0%, #ffed4e 50%, transparent 100%)';
            }
            
            document.body.appendChild(particle);
            
            setTimeout(() => particle.remove(), 1200);
        }
    }
    
    /**
     * Update gold with Balatro-style animations
     * @param {number} change - Gold change amount (can be negative)
     * @param {string} reason - Optional reason for the change
     */
    updateGoldAnimated(change, reason = null) {
        const oldGold = this.state.gold;
        const newGold = oldGold + change;
        this.state.gold = newGold;
        
        // Get gold display elements
        const goldDisplays = [
            document.getElementById('goldDisplay'),
            document.getElementById('shopGold'),
            ...document.querySelectorAll('.gold-display')
        ].filter(el => el !== null);
        
        goldDisplays.forEach(goldElement => {
            // Flash color
            if (change > 0) {
                goldElement.classList.add('gold-gain');
                this.showFloatingGold(`+${change}g`, goldElement, 'positive');
            } else if (change < 0) {
                goldElement.classList.add('gold-loss');
                this.showFloatingGold(`${change}g`, goldElement, 'negative');
            }
            
            // Animate count
            this.animateNumberCount(goldElement, oldGold, newGold, 500);
            
            // Reset color after animation
            setTimeout(() => {
                goldElement.classList.remove('gold-gain', 'gold-loss');
            }, 600);
        });
        
        // Update UI
        this.updateAllUI();
    }
    
    /**
     * Show floating +/- gold number
     * @param {string} text - Text to display (e.g., "+5g" or "-3g")
     * @param {HTMLElement} anchor - Element to position relative to
     * @param {string} type - 'positive' or 'negative'
     */
    showFloatingGold(text, anchor, type) {
        const float = document.createElement('div');
        float.className = `floating-gold ${type}`;
        float.textContent = text;
        
        const rect = anchor.getBoundingClientRect();
        float.style.left = (rect.left + rect.width / 2 - 30) + 'px';
        float.style.top = (rect.top - 30) + 'px';
        
        document.body.appendChild(float);
        
        setTimeout(() => float.remove(), 1200);
    }

    // Award classic Yahtzee upper bonus (+35) when Ones..Sixes total reaches 63
    checkAndAwardUpperBonus() {
        if (this.state.upperBonusAwarded) return;
        const upperCats = ["Ones", "Twos", "Threes", "Fours", "Fives", "Sixes"];
        const sumUpper = upperCats.reduce((sum, cat) => sum + (this.state.scorecard[cat] || 0), 0);
        if (sumUpper >= 63) {
            const bonus = 35;
            this.state.upperBonusAwarded = true;
            this.state.totalScore += bonus;
            this.showMessage(`Pandora's Box (Upper) bonus: +${bonus}!`);
            if (this.domReady) {
                this.updateAllUI();
            }
        }
    }

    // Award lower-section completion bonus: all lower categories scored (non-undefined)
    checkAndAwardLowerBonus() {
        if (this.state.lowerBonusAwarded) return;
        const lowerCats = [
            "Three of a Kind", "Four of a Kind", "Full House",
            "Small Straight", "Large Straight", "Yahtzee", "Chance"
        ];
        const allScored = lowerCats.every(cat => this.state.scorecard[cat] !== undefined);
        if (allScored) {
            const bonus = 35;
            this.state.lowerBonusAwarded = true;
            this.state.totalScore += bonus;
            this.showMessage(`Pandora's Box (Lower) bonus: +${bonus}!`);
            if (this.domReady) {
                this.updateAllUI();
            }
        }
    }

    // Unlock bonus categories based on bonus Yahtzees
    unlockBonusCategories() {
        const unlockOrder = ['Sevens', 'Eights', 'Nines'];
        const yahtzeeCount = this.state.bonusYahtzees;
        
        for (let i = 0; i < yahtzeeCount && i < unlockOrder.length; i++) {
            const category = unlockOrder[i];
            if (!this.state.unlockedCategories[category]) {
                this.state.unlockedCategories[category] = true;
                this.showMessage(`${category} category unlocked!`, 4000);
                
                // Update UI to show the new category
                if (this.domReady) {
                    this.updateAllUI();
                }
            }
        }
    }

    /**
     * Cancel the scoring action
     * Hides confirmation dialog
     */
    cancelScore() {
        this.state.pendingCategory = null;
        if (this.domReady && this.dom.confirmOverlay) {
            this.dom.confirmOverlay.classList.add('hidden');
        }
    }

    /**
     * Calculate the score for a given category with the current dice
     * @param {string} category - Scoring category (e.g., "Ones", "Three of a Kind", "Yahtzee")
     * @returns {{pips: number, favour: number, isValid: boolean}} Score calculation result
     * @example
     * const result = engine.calculateScore("Full House");
     * // { pips: 23, favour: 2, isValid: true }
     */
    calculateScore(category) {
        // ===== DEFENSIVE PROGRAMMING: Validate inputs =====
        
        // Validate category exists
        if (!category || typeof category !== 'string') {
            console.error('Invalid category provided to calculateScore:', category);
            return { pips: 0, favour: 0, isValid: false };
        }
        
        // Validate game state exists
        if (!this.state) {
            console.error('Game state is undefined');
            return { pips: 0, favour: 0, isValid: false };
        }
        
        // Validate dice array
        if (!Array.isArray(this.state.dice)) {
            console.error('Dice array is not an array:', this.state.dice);
            return { pips: 0, favour: 0, isValid: false };
        }
        
        if (this.state.dice.length !== GAME_BALANCE.STARTING_DICE_COUNT) {
            console.error(`Invalid dice count: ${this.state.dice.length}. Expected ${GAME_BALANCE.STARTING_DICE_COUNT}.`);
            return { pips: 0, favour: 0, isValid: false };
        }
        
        // Validate each die object
        for (let i = 0; i < this.state.dice.length; i++) {
            const die = this.state.dice[i];
            if (!die || typeof die.getEffectiveFace !== 'function') {
                console.error(`Invalid die at index ${i}:`, die);
                return { pips: 0, favour: 0, isValid: false };
            }
        }
        
        // ===== END VALIDATION =====
        
        // Check if category is locked (for 7s, 8s, 9s)
        if (['Sevens', 'Eights', 'Nines'].includes(category) && !this.state.unlockedCategories[category]) {
            return { pips: 0, favour: 0, isValid: false };
        }
        
        // Get face values with safe fallbacks
        const faces = this.state.dice.map((d, index) => {
            try {
                let face = d.getEffectiveFace();
                
                // Validate face value
                if (typeof face !== 'number' || isNaN(face)) {
                    console.warn(`Die ${index} returned invalid face: ${face}. Using 0.`);
                    return 0;
                }
                
                // Apply substitutions
                if (this.state.diceSubstitutions && this.state.diceSubstitutions.foursAsFives && face === 4) {
                    face = 5;
                }
                
                return face;
            } catch (error) {
                console.error(`Error getting face for die ${index}:`, error);
                return 0;
            }
        });
        
        // Build counts with safe defaults
        const counts = faces.reduce((acc, val) => {
            if (val > 0) {  // Only count valid faces
                acc[val] = (acc[val] || 0) + 1;
            }
            return acc;
        }, {});
        
        let pips = 0;
        let isValid = false;
        
        // Calculate base score
        switch (category) {
            case "Ones": case "Twos": case "Threes": case "Fours": case "Fives": case "Sixes":
            case "Sevens": case "Eights": case "Nines":
                const num = CATEGORY_TO_NUMBER[category];
                pips = (counts[num] || 0) * num;
                
                // Apply pips bonuses
                if (category === "Twos" && this.state.pipsBonuses.twosBonus) {
                    pips += (counts[2] || 0) * this.state.pipsBonuses.twosBonus;
                }
                if (category === "Sixes" && this.state.pipsBonuses.sixesBonus) {
                    pips += (counts[6] || 0) * this.state.pipsBonuses.sixesBonus;
                }
                
                isValid = true;
                break;
                
            case "Three of a Kind":
                if (Object.values(counts).some(c => c >= SCORING_THRESHOLDS.THREE_OF_KIND_REQUIRED)) {
                    pips = faces.reduce((a, b) => a + b, 0);
                    if (this.state.pipsBonuses.threeOfKindBonus) {
                        pips += this.state.pipsBonuses.threeOfKindBonus;
                    }
                    isValid = true;
                }
                break;
                
            case "Four of a Kind":
                if (Object.values(counts).some(c => c >= SCORING_THRESHOLDS.FOUR_OF_KIND_REQUIRED)) {
                    pips = faces.reduce((a, b) => a + b, 0);
                    if (this.state.pipsBonuses.fourOfKindBonus) {
                        pips += this.state.pipsBonuses.fourOfKindBonus;
                    }
                    isValid = true;
                }
                break;
                
            case "Full House":
                if (Object.values(counts).includes(SCORING_THRESHOLDS.FULL_HOUSE_THREE) && 
                    Object.values(counts).includes(SCORING_THRESHOLDS.FULL_HOUSE_TWO)) {
                    pips = faces.reduce((a, b) => a + b, 0);
                    isValid = true;
                }
                break;
                
            case "Small Straight":
                {
                    const uniqueFaces = [...new Set(faces)].sort((a,b) => a-b);
                    // Allow any run of 4 consecutive numbers (supports 4-5-6-7, 5-6-7-8, etc.)
                    let run = 1;
                    for (let i = 1; i < uniqueFaces.length; i++) {
                        if (uniqueFaces[i] === uniqueFaces[i-1] + 1) {
                            run++;
                            if (run >= SCORING_THRESHOLDS.SMALL_STRAIGHT_LENGTH) break;
                        } else if (uniqueFaces[i] !== uniqueFaces[i-1]) {
                            run = 1;
                        }
                    }
                    if (run >= SCORING_THRESHOLDS.SMALL_STRAIGHT_LENGTH) {
                        pips = BASE_SCORES.SMALL_STRAIGHT;
                        isValid = true;
                    }
                }
                break;
                
            case "Large Straight":
                {
                    const uniqueFaces = [...new Set(faces)].sort((a,b) => a-b);
                    // Allow any run of 5 consecutive numbers (supports 3-4-5-6-7, 4-5-6-7-8, etc.)
                    let run = 1;
                    for (let i = 1; i < uniqueFaces.length; i++) {
                        if (uniqueFaces[i] === uniqueFaces[i-1] + 1) {
                            run++;
                            if (run >= SCORING_THRESHOLDS.LARGE_STRAIGHT_LENGTH) break;
                        } else if (uniqueFaces[i] !== uniqueFaces[i-1]) {
                            run = 1;
                        }
                    }
                    if (run >= SCORING_THRESHOLDS.LARGE_STRAIGHT_LENGTH) {
                        pips = BASE_SCORES.LARGE_STRAIGHT;
                        isValid = true;
                    }
                }
                break;
                
            case "Yahtzee":
                if (Object.values(counts).some(c => c >= SCORING_THRESHOLDS.YAHTZEE_REQUIRED)) {
                    pips = BASE_SCORES.YAHTZEE;
                    isValid = true;
                }
                break;
                
            case "Chance":
                if (this.state.activeBlind !== 'no_chance') {
                    pips = faces.reduce((a, b) => a + b, 0);
                    isValid = true;
                }
                break;
        }
        
        // Apply flat pip bonuses for lower section categories to reward scoring there
        if (isValid && LOWER_SECTION_BONUSES[category]) {
            pips += LOWER_SECTION_BONUSES[category];
        }

        // Apply boss blind penalties
        if (this.state.activeBlind === 'half_upper_pips' && 
            ["Ones", "Twos", "Threes", "Fours", "Fives", "Sixes"].includes(category)) {
            pips = Math.floor(pips / 2);
        }
        
        // Calculate favour
        let favour = this.getFavourForCategory(category); // base 1x
        const god = this.getGodForCategory(category);
        if (god && this.state.worshipLevels[god]) {
            favour += this.state.worshipLevels[god]; // +1 per worship level → first worship makes it 2x
        }
        
        // Apply worship card effects
        this.state.consumables.forEach(consumable => {
            if (consumable instanceof WorshipCard) {
                const worshipResult = consumable.applyBasicWorshipEffect(this.state, { category, pips, favour });
                favour = worshipResult.favour;
            }
        });
        
        // Apply enhancement effects
        this.state.dice.forEach((die, index) => {
            if (!isValid) return; // Only apply effects if the hand is valid
            
            // Removed excessive logging for cleaner console
            
            // Gold enhancement provides bonus gold when scored (face-specific only)
            if (die.hasEnhancementForCurrentFace && die.hasEnhancementForCurrentFace('gold')) {
                console.log(`Die ${index + 1} triggered gold enhancement!`);
                this.updateGoldAnimated(ENHANCEMENT_BONUSES.GOLD_COINS, "gold enhancement");
                window.game?.showMessage?.("Gold enhancement: +1 Gold!");
            }
            
            // Iron enhancement provides +5 pips when scored (face-specific only)
            if (die.hasEnhancementForCurrentFace && die.hasEnhancementForCurrentFace('iron')) {
                pips += ENHANCEMENT_BONUSES.IRON_PIPS;
                window.game?.showMessage?.(`Iron enhancement: +${ENHANCEMENT_BONUSES.IRON_PIPS} Pips!`);
            }
            
            // Parchment enhancement: chance for +1 favour OR chance for gold (face-specific only)
            if (die.hasEnhancementForCurrentFace && die.hasEnhancementForCurrentFace('parchment')) {
                const parchmentRoll = Math.random();
                if (parchmentRoll < ENHANCEMENT_CHANCES.PARCHMENT_GOLD_CHANCE) {
                    this.updateGoldAnimated(ENHANCEMENT_BONUSES.PARCHMENT_GOLD, "parchment");
                    window.game?.showMessage?.(`Parchment fortune: +${ENHANCEMENT_BONUSES.PARCHMENT_GOLD} Gold!`);
                } else if (parchmentRoll < ENHANCEMENT_CHANCES.PARCHMENT_FAVOUR_CHANCE) {
                    favour += ENHANCEMENT_BONUSES.PARCHMENT_FAVOUR;
                    window.game?.showMessage?.("Parchment blessing: +1 Favour!");
                }
            }
            
            // Mother of Pearl enhancement: adds adjacent dice pips (face-specific only)
            if (die.hasEnhancementForCurrentFace && die.hasEnhancementForCurrentFace('mother_of_pearl')) {
                const adjacentIndices = [];
                if (index > 0) adjacentIndices.push(index - 1);
                if (index < this.state.dice.length - 1) adjacentIndices.push(index + 1);
                
                let adjacentPips = 0;
                adjacentIndices.forEach(adjIndex => {
                    const adjacentDie = this.state.dice[adjIndex];
                    adjacentPips += adjacentDie.getEffectiveFace();
                });
                
                if (adjacentPips > 0) {
                    pips += adjacentPips;
                    window.game?.showMessage?.(`Mother of Pearl: Added ${adjacentPips} pips from adjacent dice!`);
                }
            }
            
            // Wild enhancement (face-specific): counts as either +1/-1 only if applied to the rolled face
            if (die.hasEnhancementForCurrentFace && die.hasEnhancementForCurrentFace('wild')) {
                const wildEffect = Math.random() < ENHANCEMENT_CHANCES.WILD_EFFECT_CHANCE ? 
                    ENHANCEMENT_BONUSES.WILD_PIPS_MAX : ENHANCEMENT_BONUSES.WILD_PIPS_MIN;
                pips += wildEffect;
                window.game?.showMessage?.(wildEffect > 0 ? "Wild (face) +1 pips!" : "Wild (face) -1 pips!");
            }
        });
        
        return { pips, favour, isValid };
    }

    getFavourForCategory(category) {
        // Base multiplier is always 1x
        // Worship level for the category's god is added separately in calculateScore
        return 1;
    }

    getGodForCategory(category) {
        const godToCategory = {
            'Ones': 'Artemis', 'Twos': 'Persephone', 'Threes': 'Morpheus', 
            'Fours': 'Hera', 'Fives': 'Athena', 'Sixes': 'Heracles',
            'Sevens': 'The Pleiades', 'Eights': 'Poseidon', 'Nines': 'The Nine Muses',
            'Three of a Kind': 'Hephaestus', 'Four of a Kind': 'Ares', 'Full House': 'Dionysus',
            'Small Straight': 'Hermes', 'Large Straight': 'Apollo', 'Yahtzee': 'Zeus', 'Chance': 'Nyx',
            // Thematic owner for section bonuses
            'Upper Bonus': "Pandora's Box",
            'Lower Bonus': "Pandora's Box"
        };
        return godToCategory[category];
    }

    // Turn and ante progression
    nextTurn() {
        // Apply TURN_END joker effects before advancing turn (Balatro-inspired timing)
        this.state.jokers.forEach(joker => {
            joker.onTimingEvent('turn_end', this.state);
        });
        
        this.state.turn++;
        
        // Apply joker effects that modify abilities (like Strategic Mind)
        this.applyJokerAbilityEffects();
        
        // FIXED: ALWAYS 3 rolls - no exceptions
        this.state.rollsLeft = 3;
        
        // Reset turn state
        this.state.hasRolled = false;
        this.state.held.fill(false);
        this.state.dice.forEach(die => {
            die.reset();
            // Keep permanent modifiers (baseFace and face value remain unchanged)
            // Only reset temporary modifiers
            die.resetTempModifier();
        });
        
        this.updateLiveScoreDisplay(null);
        
        if (this.state.turn > this.state.maxTurns) {
            this.endAnte();
        } else if ([4, 8].includes(this.state.turn)) {
            this.openShop();
        } else if (this.domReady) {
            this.updateAllUI();
        }
    }



    // Apply joker effects that modify abilities (like Strategic Mind)
    applyJokerAbilityEffects() {
        this.state.abilities = this.state.abilities || {};
        
        this.state.jokers.forEach(joker => {
            switch (joker.id) {
                case 'athena_uncommon':
                    // Strategic Mind: +1 hold capacity next turn
                    this.state.abilities.strategicMindExtraHold = 1;
                    break;
            }
        });
    }

    endAnte() {
        if (this.state.totalScore >= this.state.scoreThreshold) {
            if (this.state.ante >= 13 && !this.state.endlessMode) {
                this.state.endlessMode = true;
                this.showMessage("The Apotheosis is complete! The Odyssey begins...");
            } else {
                this.showMessage(`Ante ${this.state.ante} cleared!`);
            }

            // Compute tally numbers BEFORE resetting state
            const upperCats = ["Ones","Twos","Threes","Fours","Fives","Sixes"];
            const lowerCats = ["Three of a Kind","Four of a Kind","Full House","Small Straight","Large Straight","Yahtzee","Chance"];
            const sumUpper = upperCats.reduce((s,c)=> s + (this.state.scorecard[c] || 0), 0);
            const sumLower = lowerCats.reduce((s,c)=> s + (this.state.scorecard[c] || 0), 0);
            const upperBonus = sumUpper >= 63 ? 35 : 0;
            const lowerBonus = lowerCats.every(c => this.state.scorecard[c] !== undefined) ? 35 : 0;

            // Show dramatic tally, then reset state and open shop
            this.runEndOfAnteTallyThenOpenShop({ sumUpper, sumLower, upperBonus, lowerBonus });
        } else {
            this.state.gameOver = true;
            this.showMessage("Game Over! Score threshold not met.", 5000);
            
            // Update statistics
            this.dataManager.updateStats({
                won: false,
                score: this.state.totalScore,
                ante: this.state.ante,
                goldEarned: this.state.gold
            });
        }
    }

    // Show a dramatic tally sequence in the live score display, then open the shop and reset for next ante
    runEndOfAnteTallyThenOpenShop({ sumUpper, sumLower, upperBonus, lowerBonus }) {
        if (!this.domReady || !this.dom.liveScoreDisplay) {
            this.finishAnteAndOpenShop();
            return;
        }

        const upperWithBonus = sumUpper + upperBonus;
        const lowerWithBonus = sumLower + lowerBonus;
        const totalPantheon = upperWithBonus + lowerWithBonus;

        const frames = [
            { html: `<span class="pips">Upper Sanctum</span> <span class="multiply-symbol">:</span> <span class="favour">${sumUpper}</span>` },
            { html: `<span class="pips">Bonus</span> <span class="multiply-symbol">+</span> <span class="favour">${upperBonus}</span>` },
            { html: `<span class="pips">=</span> <span class="favour">${upperWithBonus}</span>` },
            { html: `<span class="pips">Lower Sanctum</span> <span class="multiply-symbol">:</span> <span class="favour">${sumLower}</span>` },
            { html: `<span class="pips">Bonus</span> <span class="multiply-symbol">+</span> <span class="favour">${lowerBonus}</span>` },
            { html: `<span class="pips">=</span> <span class="favour">${lowerWithBonus}</span>` },
            { html: `<span class="pips">Pantheon Total</span> <span class="multiply-symbol">:</span> <span class="favour">${totalPantheon}</span>` },
        ];

        const el = this.dom.liveScoreDisplay;
        el.classList.add('visible');

        let i = 0;
        const step = () => {
            if (i >= frames.length) {
                setTimeout(() => {
                    el.classList.remove('visible');
                    this.finishAnteAndOpenShop();
                }, 700);
                return;
            }
            el.innerHTML = frames[i].html;
            i++;
            setTimeout(step, 900);
        };
        step();
    }

    // Reset state for next ante and open shop
    finishAnteAndOpenShop() {
        this.state.ante++;
        this.state.turn = 1;
        this.state.scorecard = {};
        this.state.totalScore = 0;
        // Get threshold from AnteData array (Balatro-style progression)
        const nextAnteData = AnteData[this.state.ante - 1];
        if (nextAnteData) {
            this.state.scoreThreshold = nextAnteData.scoreThreshold;
        }
        // Open shop at end of ante
        this.openShop();
    }

    checkWinConditions() {
        // Check for twelve sixes win condition
        if (this.state.winConditions.twelveSixes) {
            const totalSixes = Object.entries(this.state.scorecard)
                .filter(([category, score]) => category === 'Sixes' && score > 0)
                .reduce((total, [_, score]) => total + Math.floor(score / 6), 0);
            
            if (totalSixes >= 12) {
                this.state.gameOver = true;
                this.showMessage("Twelve Labors completed! Victory!", 10000);
                this.dataManager.updateStats({
                    won: true,
                    score: this.state.totalScore,
                    ante: this.state.ante,
                    goldEarned: this.state.gold
                });
            }
        }
        
        // Check for Yahtzee effects
        if (this.state.yahtzeeEffects.increaseFavour && this.state.pendingCategory === 'Yahtzee') {
            this.state.baseFavour++;
            this.showMessage("Zeus' blessing increases your Base Favour!");
        }
    }

    // Artifact effects
    applyArtifactEffects(eventType = 'general') {
        if (eventType === 'general') {
            // FIXED: Only handle capacity bonuses - NO ROLL MODIFICATIONS
            let boonSlots = GAME_BALANCE.STARTING_BOON_SLOTS;
            let consumableSlots = GAME_BALANCE.STARTING_LIBATION_SLOTS;
            
            this.state.artifacts.forEach(artifact => {
                switch (artifact.id) {
                    case 'faded_map_plus':
                        boonSlots += 1;
                        break;
                    case 'libation_pouch':
                        consumableSlots += 1;
                        break;
                    case 'libation_pouch_plus':
                        consumableSlots += 2;  // +2 slots for upgraded version
                        break;
                    case 'bronze_crown':
                        this.state.baseFavour += 1;
                        break;
                    case 'golden_crown':
                        this.state.baseFavour += 2;
                        break;
                }
            });
            
            // FIXED: Never touch roll mechanics
            this.state.boonSlots = boonSlots;
            this.state.consumableSlots = consumableSlots;
        }
        
        if (eventType === 'score') {
            // Ritual effects
            const hasRitualKnife = this.state.artifacts.some(a => a.id === 'ritual_knife');
            const hasSacrificialDagger = this.state.artifacts.some(a => a.id === 'ritual_knife_plus');
            
            if (hasSacrificialDagger || (hasRitualKnife && this.state.lowerSanctumStreak >= 2)) {
                if (this.state.consumables.length < this.state.consumableSlots) {
                    const libation = new LibationCard(CardData.libations[Math.floor(this.prng.random() * CardData.libations.length)]);
                    this.state.consumables.push(libation);
                    this.showMessage(`Ritual fulfilled! Gained ${libation.name}.`);
                    if (hasRitualKnife && !hasSacrificialDagger) this.state.lowerSanctumStreak = 0;
                } else {
                    this.showMessage("Ritual fulfilled, but your Libation slots are full!");
                }
            }
            
            // Devotion effects
            const hasDevotionBeads = this.state.artifacts.some(a => a.id === 'devotion_beads');
            const hasTheurgistsRosary = this.state.artifacts.some(a => a.id === 'devotion_beads_plus');
            
            if ((hasDevotionBeads || hasTheurgistsRosary) && this.state.upperSanctumStreak >= 2) {
                let worshipPool = CardData.worship;
                if (hasTheurgistsRosary) {
                    worshipPool = CardData.worship.filter(w => w.rarity === 'uncommon' || w.rarity === 'rare');
                    if (worshipPool.length === 0) worshipPool = CardData.worship;
                }
                const worshipData = worshipPool[Math.floor(this.prng.random() * worshipPool.length)];
                this.state.worshipLevels[worshipData.god]++;
                this.showMessage(`Devotion rewarded! ${worshipData.god} worship increased!`);
                this.state.upperSanctumStreak = 0;
            }
        }
    }

    // UI Updates (this will be called by UIManager)
    updateAllUI() {
        if (window.uiManager && this.domReady) {
            // Only update UI if critical elements are available
            if (this.dom.diceContainer && this.dom.rollButton) {
                window.uiManager.updateAll(this.state, this);
            } else {
                console.log('Game elements not ready, skipping UI update');
            }
        }
    }

    updateLiveScoreDisplay(category) {
        if (!this.domReady) {
            return;
        }
        // Resting/default state: show 0 x 0 when nothing is selected or before first roll
        if (!category || !this.state.hasRolled) {
            this.dom.liveScoreDisplay.innerHTML = `
                <span class="pips">0</span>
                <span class="multiply-symbol">x</span>
                <span class="favour">0</span>
            `;
            this.dom.liveScoreDisplay.classList.add('visible');
            return;
        }
        
        let { pips, favour, isValid } = this.calculateScore(category);
        
        if (isValid) {
            // Apply joker effects to the live score display
            let eventData = { category, pips, favour };
            this.state.jokers.forEach(joker => {
                eventData = joker.onEvent('score', this.state, eventData);
            });
            
            pips = eventData.pips;
            favour = eventData.favour;
            
            this.dom.liveScoreDisplay.innerHTML = `
                <span class="pips">${pips}</span>
                <span class="multiply-symbol">x</span>
                <span class="favour">${favour}</span>
            `;
        } else {
            this.dom.liveScoreDisplay.innerHTML = `
                <span class="n-letter">N</span>
                <span class="slash-symbol">/</span>
                <span class="a-letter">A</span>
            `;
        }
        this.dom.liveScoreDisplay.classList.add('visible');
    }

    // Utility methods
    /**
     * Display a message to the user
     * @param {string} text - Message to display
     * @param {number} [duration=3000] - How long to show message (ms)
     */
    showMessage(text, duration = 3000) {
        if (this.domReady && this.dom.messagePopup) {
            this.dom.messagePopup.textContent = text;
            this.dom.messagePopup.classList.add('show');
            setTimeout(() => {
                this.dom.messagePopup.classList.remove('show');
            }, duration);
        }
    }

    /**
     * Calculate interest earned based on saved gold (Balatro-inspired)
     * @returns {number} Interest gold earned
     */
    calculateInterest() {
        const gold = this.state.gold;
        const interest = Math.min(
            Math.floor(gold / GAME_BALANCE.INTEREST_RATE),
            GAME_BALANCE.MAX_INTEREST
        );
        return interest;
    }

    // Shop methods (will be expanded in next file)
    openShop() {
        // Calculate and award interest (Balatro-inspired economy)
        const interest = this.calculateInterest();
        if (interest > 0) {
            this.updateGoldAnimated(interest, "interest");
            this.showMessage(`💰 Interest earned: +${interest} Gold! (${Math.floor((this.state.gold - interest) / GAME_BALANCE.INTEREST_RATE)} × ${GAME_BALANCE.INTEREST_RATE}g)`, 4000);
            Logger.info(`Interest earned: ${interest}g from ${this.state.gold - interest}g saved`);
        }
        
        // Shop logic will be handled by a separate module
        if (window.shopManager) {
            window.shopManager.openShop(this.state, this);
        }
    }

    closeShop() {
        Logger.debug('GameEngine.closeShop() called');
        
        if (window.shopManager) {
            window.shopManager.closeShop();
        } else if (window.uiManager) {
            // Fallback to direct UIManager call
            window.uiManager.closeShop();
        } else {
            Logger.error('No shop manager available to close shop');
            return;
        }
        
        // If this was an end-of-ante shop, start the next ante
        if (this.state.turn === 1 && this.state.scorecard && Object.keys(this.state.scorecard).length === 0) {
            this.startAnte();
        }
        
        this.updateAllUI();
        Logger.info('Shop closed, game resumed');
    }

    rerollShop() {
        if (window.shopManager) {
            window.shopManager.rerollShop(this.state, this);
        }
    }

    // toggleSellMode removed - using direct sell method instead
    


    /**
     * Check if game is in a safe state to save
     * Validates no open dialogs, valid state, not processing
     * @returns {boolean} True if safe to save
     */
    canSave() {
        // Check for active overlays/dialogs
        const confirmOverlay = document.getElementById('confirmOverlay');
        const shopOverlay = document.getElementById('shopOverlay');
        
        if (confirmOverlay && !confirmOverlay.classList.contains('hidden')) {
            console.log('Cannot save: Confirmation dialog is open');
            return false;
        }
        
        if (shopOverlay && !shopOverlay.classList.contains('hidden')) {
            console.log('Cannot save: Shop is open');
            return false;
        }
        
        // Check for invalid game state
        if (!this.state || this.state.gameOver === undefined) {
            console.error('Cannot save: Invalid game state');
            return false;
        }
        
        // Check if dice array is valid
        if (!Array.isArray(this.state.dice) || this.state.dice.length !== 5) {
            console.error('Cannot save: Invalid dice array');
            return false;
        }
        
        // Check if currently animating
        if (this.state.isAwaitingApi) {
            console.log('Cannot save: Game is processing');
            return false;
        }
        
        return true;
    }

    /**
     * Save the current game state to localStorage
     * @returns {boolean} True if save was successful
     */
    saveGame() {
        if (!this.canSave()) {
            console.warn('Save aborted: Game not in safe state');
            return false;
        }
        
        if (this.dataManager) {
            try {
                this.dataManager.saveGame(this.state);
                console.log('Game saved successfully');
                return true;
            } catch (error) {
                console.error('Save failed:', error);
                this.showMessage('Failed to save game!', 3000);
                return false;
            }
        } else {
            console.error('DataManager not available');
            return false;
        }
    }

    /**
     * Load a saved game from localStorage
     * @returns {boolean} True if load was successful
     */
    loadGame() {
        const savedState = this.dataManager.loadGame();
        if (savedState) {
            this.state = savedState;
            this.updateAllUI();
            return true;
        }
        return false;
    }

    // Cash out functionality removed as requested

    // All cash out methods removed as requested
}