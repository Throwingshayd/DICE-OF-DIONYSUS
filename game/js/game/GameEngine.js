// GameEngine - Main game logic and state management

class GameEngine {
    constructor(seed) {
        this.prng = new SeededRNG(seed);
        this.dataManager = new DataManager();
        this.initializeGameState(seed);
        this.setupEventListeners();
    }

    /** Balatro: G.SETTINGS.GAMESPEED — scale animation delays (2x = half delay, 4x = quarter) */
    scaleDelay(ms) {
        const speed = (window.dataManager?.getSettings?.()?.gameSpeed) ?? 2;
        return Math.max(1, Math.round(ms / speed));
    }

    initializeGameState(seed) {
        // Check for test mode in URL
        const urlParams = new URLSearchParams(window.location.search);
        const testMode = urlParams.get('test');
        
        this.state = {
            /** Seed for determinism; stored for save/load (Balatro: G.GAME.pseudorandom.seed) */
            seed: seed || 'NEWRUN',
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
            packs: [], // Track opened packs for collection
            
            // Slots (capacities)
            boonSlots: GAME_BALANCE.STARTING_BOON_SLOTS,
            consumableSlots: GAME_BALANCE.STARTING_LIBATION_SLOTS,
            
            // Worship system (gods from GOD_TO_CATEGORY / GOD_METADATA)
            worshipLevels: {
                'Artemis': 0, 'Persephone': 0, 'Morpheus': 0, 'Hera': 0,
                'Athena': 0, 'Heracles': 0, 'Hephaestus': 0, 'Ares': 0,
                'Dionysus': 0, 'Hermes': 0, 'Apollo': 0, 'Zeus': 0, 'Nyx': 0,
                'The Pleiades': 0, 'Poseidon': 0, 'The Nine Muses': 0,
                "Pandora's Box": 0
            },
            
            // Enhancements and effects
            enhancementMap: {},
            tempPips: 0,
            tempFavour: 0,
            
            // Boss blinds
            activeBlind: null,
            
            // UI state
            pendingCategory: null,
            gameOver: false,
            isAwaitingApi: false,
            /** Libation die-targeting: { libation, enhancementType } when active; null otherwise */
            libationTargetingMode: null,
            /** Eucharist god-targeting: { libation } when active; null otherwise */
            eucharistTargetingMode: null,
            
            // Streaks for artifacts
            upperSanctumStreak: 0,
            lowerSanctumStreak: 0,
            
            // Shop state
            usedFreeReroll: false,
            /** Scores this round (since last shop) - gold awarded at cashout (Balatro-style) */
            scoresThisRound: 0,
            
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
            
            // Capacity limits (maxHeld not in GAME_BALANCE)
            maxHeld: 5,
            
            // Bonus Yahtzee system
            bonusYahtzees: 0,
            rolledBonusYahtzees: 0,
            upperBonusAwarded: false,
            lowerBonusAwarded: false,
            unlockedCategories: {
                'Sevens': false,
                'Eights': false,
                'Nines': false,
                "Pandora's Box": false
            },
            // Message in a Bottle: track if any other boon triggered this ante
            hadOtherBoonsThisAnte: false,
            /** Resume point: 'play' | 'shop' — where player was when saved */
            resumePhase: 'play'
        };
        
        // Apply test mode if enabled
        if (testMode === 'highfaces') {
            this.applyHighFacesTestMode();
        }
        if (testMode === 'winning') {
            this.applyWinningHandsTestMode();
            this.state.winningTestMode = true; // Skips mid-ante shop for playtests
        }
        this.updateMaxTurns();
        // ?test=boon:boonid - inject boon for playtesting
        if (testMode && testMode.startsWith('boon:')) {
            const boonId = testMode.replace('boon:', '').trim();
            this.applyBoonTestMode(boonId);
        }
        // ?test=libation:libationid - inject libation for playtesting
        if (testMode && testMode.startsWith('libation:')) {
            const libId = testMode.replace('libation:', '').trim();
            this.applyLibationTestMode(libId);
        }
    }

    /**
     * Test mode: Inject a boon for playtesting
     * @param {string} boonId - e.g. 'hestias_hearth', 'the_gambler'
     */
    applyBoonTestMode(boonId) {
        const boonData = typeof CardData !== 'undefined' && CardData.jokers
            ? CardData.jokers.find(j => j.id === boonId)
            : null;
        if (!boonData) {
            if (typeof Logger !== 'undefined') Logger.warn(`Test mode: Boon "${boonId}" not found`);
            return;
        }
        const joker = new Joker(boonData);
        this.state.jokers.push(joker);
        this.state.gold = Math.max(this.state.gold, 20); // Ensure enough gold for boons that cost per roll
        if (typeof Logger !== 'undefined') Logger.info(`🧪 TEST MODE: Injected boon "${boonId}"`);
    }

    /**
     * Test mode: Inject a libation for playtesting
     * @param {string} libId - e.g. 'kyphi_mead', 'ambrosial_krasi'
     */
    applyLibationTestMode(libId) {
        const libData = typeof CardData !== 'undefined' && CardData.libations
            ? CardData.libations.find(l => l.id === libId)
            : null;
        if (!libData) {
            if (typeof Logger !== 'undefined') Logger.warn(`Test mode: Libation "${libId}" not found`);
            return;
        }
        const libation = new LibationCard(libData);
        this.state.consumables.push(libation);
        if (typeof Logger !== 'undefined') Logger.info(`🧪 TEST MODE: Injected libation "${libId}"`);
    }
    
    /**
     * Test mode: Set up dice with 7s, 8s, and 9s for testing
     */
    applyHighFacesTestMode() {
        Logger.info('🧪 TEST MODE: High Faces (7s, 8s, 9s) enabled');
        
        // Unlock all high categories
        this.state.unlockedCategories.Sevens = true;
        this.state.unlockedCategories.Eights = true;
        this.state.unlockedCategories.Nines = true;
        
        // Modify dice faces to have 7s, 8s, and 9s
        // Die 1: Face 6 → 7
        this.state.dice[0].faces[6].modifiedValue = 7;
        Logger.debug('Die 1: Face 6 → 7');
        
        // Die 2: Face 6 → 8
        this.state.dice[1].faces[6].modifiedValue = 8;
        Logger.debug('Die 2: Face 6 → 8');
        
        // Die 3: Face 6 → 9
        this.state.dice[2].faces[6].modifiedValue = 9;
        Logger.debug('Die 3: Face 6 → 9');
        
        // Die 4: Face 5 → 7
        this.state.dice[3].faces[5].modifiedValue = 7;
        Logger.debug('Die 4: Face 5 → 7');
        
        // Die 5: Face 4 → 8
        this.state.dice[4].faces[4].modifiedValue = 8;
        Logger.debug('Die 5: Face 4 → 8');
        
        // Give extra gold for testing
        this.state.gold = 50;
        
        Logger.info('✅ Test mode applied: Dice now have faces with values 7, 8, and 9');
        Logger.info('📋 Test Setup:');
        Logger.info('  - Die 1: Face 6 = 7');
        Logger.info('  - Die 2: Face 6 = 8');
        Logger.info('  - Die 3: Face 6 = 9');
        Logger.info('  - Die 4: Face 5 = 7');
        Logger.info('  - Die 5: Face 4 = 8');
        Logger.info('  - Categories Sevens, Eights, Nines unlocked');
        Logger.info('  - Starting gold: 50');
    }

    /**
     * Test mode: Force dice to produce valid hands for each category in order.
     * Enables playtesting with guaranteed ante passes. ?test=winning
     */
    applyWinningHandsTestMode() {
        if (typeof Logger !== 'undefined') Logger.info('🧪 TEST MODE: Winning Hands — dice forced to valid hands per turn');
        this.state.forcedDiceValues = this.state.forcedDiceValues || {};
        this.state.forcedDiceValues.winningSequence = [
            [1, 2, 3, 4, 5],   // Chance (always valid)
            [1, 1, 1, 1, 1],   // Ones
            [2, 2, 2, 2, 2],   // Twos
            [3, 3, 3, 3, 3],   // Threes
            [4, 4, 4, 4, 4],   // Fours
            [5, 5, 5, 5, 5],   // Fives
            [6, 6, 6, 6, 6],   // Sixes
            [2, 2, 2, 4, 5],   // Three of a Kind
            [1, 2, 3, 4, 6],   // Small Straight
            [3, 3, 3, 5, 5],   // Full House
            [4, 4, 4, 4, 5],   // Four of a Kind
            [1, 2, 3, 4, 5],   // Large Straight
            [6, 6, 6, 6, 6]    // Yahtzee
        ];
        this.state.gold = Math.max(this.state.gold, 25);
        if (typeof Logger !== 'undefined') Logger.info('  - 13 hands pre-set (Chance→Yahtzee), gold: 25');
    }

    setupEventListeners() {
        // This will be called after DOM elements are available
        this.domReady = false;
    }

    bindDOMElements() {
        this.dom = {
            diceContainer: document.getElementById('diceContainer'),
            diceRollZone: document.getElementById('diceRollZone'),
            rollButton: document.getElementById('rollButton'),
            liveScoreDisplay: document.getElementById('liveScoreDisplay'),
            gnosisCashoutContent: document.getElementById('gnosisCashoutContent'),
            gnosisCashoutTitle: document.getElementById('gnosisCashoutTitle'),
            gnosisCashoutLines: document.getElementById('gnosisCashoutLines'),
            gnosisMessage: document.getElementById('gnosisMessage'),
            
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
            shopStage: document.getElementById('shopStage'),
            libationOverlay: document.getElementById('libationOverlay'),
            pantheonTotalOverlay: document.getElementById('pantheonTotalOverlay'),
            pantheonOverlayContent: document.getElementById('pantheonOverlayContent'),
            
            // Shop views
            shopDefaultView: document.getElementById('shopDefaultView'),
            packOpeningView: document.getElementById('packOpeningView'),
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
            Logger.warn('Roll button not found, game may not function properly');
        }
        if (!this.dom.diceContainer) {
            Logger.warn('Dice container not found, game may not function properly');
        }
        
        this.setupDOMEventListeners();
        this.domReady = true;
    }

    setupDOMEventListeners() {
        // Roll button (Balatro: button SFX)
        if (this.dom.rollButton) {
            this.dom.rollButton.addEventListener('click', () => {
                if (window.soundManager) window.soundManager.play('button', { volume: 0.5 });
                this.rollDice();
            });
        }

        // Right-click on dice area: unhold all dice
        if (this.dom.diceContainer) {
            this.dom.diceContainer.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.unholdAllDice();
            });
        }
        
        // Scorecard rows
        if (this.dom.scorecardRows) {
            this.dom.scorecardRows.forEach(row => {
                const category = row.dataset.category;
                if (!category) return;
                if (category === "Pandora's Box") {
                    row.addEventListener('click', () => {
                        if (this.state.eucharistTargetingMode && this.state.unlockedCategories?.["Pandora's Box"]) {
                            this.handleEucharistSelect(category);
                        }
                    });
                } else {
                    row.addEventListener('click', () => {
                        if (this.state.eucharistTargetingMode) {
                            this.handleEucharistSelect(category);
                            return;
                        }
                        this.promptScore(category);
                    });
                    row.addEventListener('mouseenter', () => {
                        if (!this.isScoring) this.scheduleLiveScorePreview(category);
                    });
                    row.addEventListener('mouseleave', () => {
                        if (!this.isScoring) this.cancelLiveScorePreview();
                    });
                }
            });
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

        // Menu button handled by document-level delegation in Main.js (showPauseMenu)

        // ESC cancels libation or eucharist targeting mode
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && (this.state.libationTargetingMode || this.state.eucharistTargetingMode)) {
                this.cancelTargetingMode();
            }
        });
    }

    cancelTargetingMode() {
        if (this.state.libationTargetingMode) {
            this.state.libationTargetingMode = null;
            this.showMessage('Libation targeting cancelled.');
            if (window.uiManager && this.dom.diceContainer) {
                this.dom.diceContainer.classList.remove('libation-targeting');
                this.dom.diceContainer.querySelector('.libation-targeting-cancel')?.remove();
            }
        }
        if (this.state.eucharistTargetingMode) {
            this.state.eucharistTargetingMode = null;
            this.showMessage('Eucharist selection cancelled.');
            const scorecard = document.getElementById('scorecard');
            if (scorecard) {
                scorecard.classList.remove('eucharist-targeting');
                scorecard.querySelector('.eucharist-targeting-cancel')?.remove();
            }
        }
        this.updateAllUI();
    }

    cancelLibationTargeting() {
        this.cancelTargetingMode();
    }

    handleEucharistSelect(category) {
        const mode = this.state.eucharistTargetingMode;
        if (!mode || !mode.libation) return;
        window.balatroEffects?.hideAllTooltips();
        const god = typeof GOD_TO_CATEGORY !== 'undefined' ? GOD_TO_CATEGORY[category] : null;
        if (!god) return;
        if (god === "Pandora's Box" && !this.state.unlockedCategories?.["Pandora's Box"]) return;
        this.state.worshipLevels[god] = (this.state.worshipLevels[god] || 0) + 1;
        mode.libation.use();
        const idx = this.state.consumables.findIndex(c => c.id === mode.libation.id);
        if (idx !== -1) this.state.consumables.splice(idx, 1);
        this.state.eucharistTargetingMode = null;
        this.showMessage(`The Eucharist: ${god} worship increased by 1!`);
        const scorecard = document.getElementById('scorecard');
        if (scorecard) {
            scorecard.classList.remove('eucharist-targeting');
            scorecard.querySelector('.eucharist-targeting-cancel')?.remove();
        }
        this.updateAllUI();
        window.balatroEffects?.hideAllTooltips();
    }

    // Game flow methods
    startGame() {
        this.startAnte();
        
        // Wait a brief moment to ensure DOM is ready, then update UI
        setTimeout(() => {
            this.updateAllUI();
            this.updateLiveScoreDisplay(null); // Ensure Gnosis appears from game start
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
        if (window.GameStateManager) window.GameStateManager.setState(window.GAME_STATES?.ROUND || 'ROUND');
        // When BOSS_BLINDS_DISABLED, treat all antes as "none" - no special effects
        const bossBlindsDisabled = typeof DEBUG_FLAGS !== 'undefined' && DEBUG_FLAGS.BOSS_BLINDS_DISABLED;
        this.state.activeBlind = bossBlindsDisabled ? 'none' : currentAnteData.blindId;
        
        // Set score threshold from AnteData (Balatro-style progression)
        this.state.scoreThreshold = currentAnteData.scoreThreshold;
        
        // Apply boss blind effects (skipped when BOSS_BLINDS_DISABLED)
        if (!bossBlindsDisabled && this.state.activeBlind === 'score_penalty') {
            this.state.scoreThreshold = Math.floor(this.state.scoreThreshold * 1.5);
        }
        
        // Reset Message in a Bottle tracker at start of each ante
        this.state.hadOtherBoonsThisAnte = false;
        
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
        if (window.GameStateManager) window.GameStateManager.setState(window.GAME_STATES?.BLIND_SELECT || 'BLIND_SELECT');
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
     * RNG + effects, then update UI with bounce on rolled dice.
     */
    executeRoll() {
        // Apply joker effects that trigger at roll start
        this.applyJokerRollEffects();
        
        // FIXED: Simple decrement - no complex logic
        this.state.rollsLeft--;
        this.state.hasRolled = true;
        
        // Balatro SFX: dice roll (chips2)
        if (window.soundManager) window.soundManager.play('chips2', { pitch: 0.95 + this.prng.random() * 0.1 });
        
        // Shuffle dice positions (dice can appear in random slots) — before physics
        this.shuffleDicePositions();

        // Sync DOM to shuffled state so physics uses correct dice/held mapping
        if (this.domReady) this.updateAllUI();

        const diceElements = this.dom.diceContainer?.querySelectorAll('.die');
        const held = [...this.state.held];
        const anyToRoll = held.some(h => !h);

        let finalFaces = null;
        if (anyToRoll) {
            const seq = this.state.forcedDiceValues?.winningSequence;
            if (seq && seq.length > 0) {
                const idx = (this.state.turn - 1) % seq.length;
                const faces = seq[idx];
                if (faces && faces.length >= 5) {
                    this.state.dice.forEach((die, i) => die.setFace(faces[i] ?? 1));
                } else {
                    this.state.dice.forEach((die, index) => {
                        if (!held[index]) die.roll(this.prng);
                    });
                }
            } else if (this.state.forcedDiceValues?.allThrees && this.state.rollsLeft === 2) {
                this.state.dice.forEach(die => die.setFace(3));
            } else {
                this.state.dice.forEach((die, index) => {
                    if (!held[index]) {
                        die.roll(this.prng);
                        if (this.state.diceTransformations?.onesBecomeSixes && die.face === 1) die.setFace(6);
                    }
                });
            }
            this.state.dice.forEach((die, index) => die.processMotherOfPearl(this.state.dice, index, this.prng));
            this.state.jokers.forEach(joker => {
                if (joker.affectsDiceRoll?.()) joker.applyDiceRollEffect(this.state.dice, this.state, this.prng);
            });
            finalFaces = this.state.dice.map(d => (typeof d.getEffectiveFace === 'function' ? d.getEffectiveFace() : d.face) || 1);
        }
        
        const doPostPhysicsRoll = () => {
            this.dom.diceRollZone?.closest('.center-game-area')?.classList?.remove('dice-rolling');
            this.checkTriggerEffects();
            this.previewUnlockBonusCategoriesOnRoll();

            const counts = {};
            this.state.dice.forEach((d) => {
                const f = typeof d.getEffectiveFace === 'function' ? d.getEffectiveFace() : (d.face ?? 0);
                counts[f] = (counts[f] || 0) + 1;
            });
            const rolledYahtzee = Object.values(counts).some((c) => c >= 5);
            if (rolledYahtzee) {
                if (window.balatroEffects) window.balatroEffects.screenShake(20, 800);
                if (window.soundManager) window.soundManager.play('timpani', { pitch: 0.9, volume: 0.8 });
            }

            if (this.domReady) this.updateAllUI();

            // Landing bounce on dice after UI refresh
            if (window.balatroEffects && this.dom.diceContainer) {
                const els = this.dom.diceContainer.querySelectorAll('.die');
                held.forEach((h, i) => {
                    if (!h && els[i]) window.balatroEffects.addDiceBounceEffect(els[i]);
                });
            }
            if (this.canSave()) this.saveGame();
        };

        // Original non-physics roll: immediate completion with bounce on rolled dice
        doPostPhysicsRoll();
    }

    // Apply joker effects that trigger at turn start (Balatro-inspired timing)
    applyJokerTurnStartEffects() {
        this.state.jokers.forEach(joker => {
            joker.onTimingEvent('turn_start', this.state);
        });
    }

    // Apply joker effects that trigger at roll start
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
        
        // Reckless Abandon: cannot hold dice
        const hasRecklessAbandon = this.state.jokers?.some(j => j.id === 'reckless_abandon');
        if (hasRecklessAbandon) {
            this.showMessage("Reckless Abandon: You cannot hold dice!");
            return;
        }
        
        const bossBlindsDisabled = typeof DEBUG_FLAGS !== 'undefined' && DEBUG_FLAGS.BOSS_BLINDS_DISABLED;
        const maxHeld = (!bossBlindsDisabled && this.state.activeBlind === 'max_3_hold') ? 3 : this.state.maxHeld;
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

    /**
     * Unhold all dice (right-click on dice area)
     */
    unholdAllDice() {
        if (!this.state.hasRolled || this.state.isAwaitingApi) return;
        const hasRecklessAbandon = this.state.jokers?.some(j => j.id === 'reckless_abandon');
        if (hasRecklessAbandon) return;
        if (this.state.held.every(h => !h)) return;
        this.state.held.fill(false);
        if (this.domReady) this.updateAllUI();
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
        
        Logger.trace('Dice positions shuffled');
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
                this.updateGoldAnimated(goldGained, "dice effects");
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
        if (changed) {
            this.updateMaxTurns();
            if (this.domReady) this.updateAllUI();
        }
    }

    /**
     * Prompt user to confirm scoring in a category
     * Shows confirmation dialog with score details
     * @param {string} category - Category to score
     */
    promptScore(category) {
        if (this.isScoring) return;
        if (this.state.scorecard[category] !== undefined || this.state.isAwaitingApi) return;
        if (!this.state.hasRolled) {
            this.showMessage("You must roll the dice first!");
            return;
        }
        this.isScoring = true;
        this.state.pendingCategory = category;
        // Score directly without confirmation overlay
        this.confirmScore();
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
        
        let { pips, favour, isValid, fromPipeline } = this.calculateScore(category, true);
        let finalScore = 0;
        
        if (isValid) {
            if (!fromPipeline) {
                pips += this.state.tempPips;
                favour += this.state.tempFavour;
                let eventData = { category, pips, favour, favourMult: 1 };
                this.state.jokers.forEach((joker) => {
                    eventData = joker.onTimingEvent('before_score', this.state, eventData);
                });
                pips = eventData.pips;
                favour = eventData.favour * (eventData.favourMult || 1);
                pips = Math.max(0, pips);
                favour = Math.max(0.1, favour);
                if (this.state.globalBonuses.fivesToAll) {
                    const fivesCount = this.state.dice.filter((die) => (die.getEffectiveFace ? die.getEffectiveFace() : die.currentFace) === 5).length;
                    pips += fivesCount * 5;
                }
            }
            finalScore = Math.floor(pips * favour);
            
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
            joker.onTimingEvent('after_score', this.state, { category, pips, favour, finalScore });
        });
        
        // Track scores for cashout - gold awarded at round end before shop (not per-score)
        if (finalScore > 0) {
            this.state.scoresThisRound = (this.state.scoresThisRound || 0) + 1;
        }
        
        // Reset temporary modifiers
        this.state.tempPips = 0;
        this.state.tempFavour = 0;
        
        // Apply post-score artifact effects
        this.applyArtifactEffects('score');
        
        // Check win conditions
        this.checkWinConditions();
        
        this.cancelScore();
        this.isScoring = false;
        if (this.canSave()) this.saveGame();
        this.nextTurn();
    }
    
    /**
     * Balatro-style animated score reveal with sequential dice and boon animations
     * Shows dice adding pips one by one, boons triggering, then final calculation
     * @param {string} category - Scoring category
     * @param {number} pips - Base pips
     * @param {number} favour - Multiplier
     * @param {number} finalScore - Final calculated score
     * @param {Function} callback - Called when animation completes
     */
    animateScoreUpdate(category, pips, favour, finalScore, callback) {
        const row = document.querySelector(`[data-category="${category}"]`);
        const scoreDisplay = row?.querySelector('.potential-score');
        
        // SUSPENSEFUL CALCULATION IN GNOSIS!
        // Show the calculation with count-up animation, then place result in pantheon
        if (!this.domReady || !this.dom.liveScoreDisplay) {
            // Fallback if no Gnosis display
            if (scoreDisplay) scoreDisplay.innerHTML = finalScore;
            this.state.scorecard[category] = finalScore;
            this.state.totalScore += finalScore;
            callback();
            return;
        }
        
        const el = this.dom.liveScoreDisplay;
        
        // BALATRO-STYLE SEQUENTIAL SCORING:
        // 1. Dice jiggle and add pips one by one
        // 2. Boons jiggle and add bonuses
        // 3. Show final multiplication
        // 4. Count up to final score
        
        this.animateSequentialScoring(category, pips, favour, finalScore, el, scoreDisplay, callback);
    }
    
    /**
     * BALATRO-STYLE SEQUENTIAL SCORING ANIMATION
     * Dice jiggle and add pips one by one, then boons trigger and add bonuses
     * @param {string} category - Scoring category
     * @param {number} pips - Final pips after all bonuses
     * @param {number} favour - Final favour after all bonuses
     * @param {number} finalScore - Final calculated score
     * @param {HTMLElement} liveScoreEl - Live score display element
     * @param {HTMLElement} scorecardEl - Scorecard cell element
     * @param {Function} callback - Called when complete
     */
    animateSequentialScoring(category, pips, favour, finalScore, liveScoreEl, scorecardEl, callback) {
        this.isScoring = true;
        const god = this.getGodForCategory(category);
        const offeringName = category === 'Yahtzee' ? 'Heureka' : category;
        const levelBonus = this.getCategoryLevelBonuses(category);
        const labelPips = Math.floor(levelBonus.pips);
        const categoryLabel = god ? `Offering of ${offeringName} made to ${god}` : (category === 'Yahtzee' ? 'HEUREKA' : category).toUpperCase().replace(/\s+/g, ' ');
        const basePips = this.calculateBasePips(category);
        const worshipLevel = god ? (this.state.worshipLevels?.[god] || 0) : 0;
        // Category base favour = 1 + worship level (matches ScoringEngine pipeline)
        const categoryBaseFavour = 1 + worshipLevel;
        const diceContributions = this.getDiceContributions(category);
        const boonContributions = this.getBoonContributions(category, basePips, categoryBaseFavour);
        const favourLabel = worshipLevel > 0 ? `favour (Lv.${worshipLevel})` : 'favour';

        const up = (o) => this.updateLiveScoreValues(liveScoreEl, { ...o, category: categoryLabel, pipsLabel: `${labelPips} pips`, favourLabel, showNa: false });

        let currentPips = 0;
        let currentFavour = categoryBaseFavour;
        let delay = 0;

        // Start
        up({ pips: '0', pipsAdd: false, favour: this.formatFavour(categoryBaseFavour), favourAdd: false, showEquals: false, scorePreview: '' });
        liveScoreEl.classList.add('visible');

        // Step 1: Dice adding pips — show accumulation only (e.g. 2, 4, 8, 13, 17)
        diceContributions.forEach((contrib) => {
            delay += this.scaleDelay(180);
            setTimeout(() => {
                currentPips += contrib.pips;
                this.jiggleDie(contrib.dieIndex);
                this.showPipPopupOnDie(contrib.dieIndex, contrib.pips, contrib.label);

                up({ pips: String(currentPips), pipsAdd: false, pipsPulse: true, favour: this.formatFavour(currentFavour), favourAdd: false });
            }, delay);
        });

        // Step 1.5: Pips bonus (category bonus if any) — accumulate after dice
        const categoryBonus = LOWER_SECTION_BONUSES[category] || 0;
        const shouldShowBonus = categoryBonus > 0 && !['Small Straight', 'Large Straight', 'Yahtzee', 'Full House', 'Three of a Kind', 'Four of a Kind'].includes(category);
        if (shouldShowBonus) {
            delay += this.scaleDelay(220);
            setTimeout(() => {
                currentPips += categoryBonus;
                up({ pips: String(currentPips), pipsAdd: false, pipsPulse: true, favour: this.formatFavour(currentFavour), favourAdd: false });
            }, delay);
        }

        // Step 2: Boons (pips/favour from boons) — accumulate
        delay += this.scaleDelay(280);
        boonContributions.forEach((contrib) => {
            delay += this.scaleDelay(180);
            setTimeout(() => {
                const prevFavour = currentFavour;
                if (contrib.pips > 0) currentPips += contrib.pips;
                if (contrib.favour > 0) currentFavour += contrib.favour;
                this.jiggleBoon(contrib.boonId);

                if (contrib.pips > 0) {
                    up({ pips: String(Math.floor(currentPips)), pipsAdd: false, pipsPulse: true, favour: this.formatFavour(currentFavour), favourAdd: false });
                } else if (contrib.favour > 0) {
                    up({ pips: String(Math.floor(currentPips)), pipsAdd: false, favour: this.formatFavour(prevFavour), favourAdd: true, favourContrib: this.formatFavour(contrib.favour) });
                    setTimeout(() => {
                        up({ pips: String(Math.floor(currentPips)), pipsAdd: false, favour: this.formatFavour(currentFavour), favourAdd: false, favourPulse: true });
                    }, this.scaleDelay(140));
                }
            }, delay);
        });

        // Step 3: × favour then final score count up
        delay += this.scaleDelay(350);
        setTimeout(() => {
            up({ pips: String(Math.floor(pips)), pipsAdd: false, favour: this.formatFavour(favour), favourAdd: false, showEquals: true, scorePreview: '0' });
            if (window.juiceManager) window.juiceManager.juiceUp(liveScoreEl, 0.2);
            const finalSpan = liveScoreEl.querySelector('[data-live="score-preview"]');

            // Step 4: Count up
            this.animateNumberCount(finalSpan, 0, finalScore, this.scaleDelay(900), () => {
                // Step 5: Update game state
                this.state.scorecard[category] = finalScore;
                this.state.totalScore += finalScore;
                this.lastScoredBreakdown = { category, pips, favour, finalScore };

                // Balatro SFX: score placed (multhit1/multhit2)
                if (window.soundManager) {
                    window.soundManager.play(finalScore >= 100 ? 'multhit2' : 'multhit1', { pitch: 0.9 + Math.random() * 0.2, volume: 0.7 });
                }
                // Particles only for big scores; screen shake only for rolling Eurekas (see executeRoll)
                if (finalScore >= 200 && window.balatroEffects && scorecardEl) {
                    this.createScoreParticles(scorecardEl, finalScore);
                }
                
                // Place final number in pantheon scorecard (after brief pause)
                setTimeout(() => {
                    if (scorecardEl) {
                        scorecardEl.innerHTML = finalScore;
                        scorecardEl.classList.add('score-flash');
                        
                        setTimeout(() => {
                            scorecardEl.classList.remove('score-flash');
                        }, this.scaleDelay(400));
                    }
                    
                    // Clear scoring flag to allow hover previews again
                    this.isScoring = false;

                    // Keep "Offering of [category] made to [god]" and final score visible for 2.5s
                    setTimeout(() => {
                        this.updateLiveScoreDisplay(null);
                    }, this.scaleDelay(2500));

                    this.updateAllUI();
                    callback();
                }, this.scaleDelay(300));
            });
        }, delay);
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
        if (!element) {
            Logger.warn('animateNumberCount: No element provided');
            if (callback) callback();
            return;
        }
        
        // Validate numbers
        if (typeof start !== 'number' || typeof end !== 'number' || isNaN(start) || isNaN(end)) {
            Logger.error(`Invalid numbers for animation: start=${start}, end=${end}`);
            element.textContent = end || 0;
            if (callback) callback();
            return;
        }
        
        // Steppier animation: discrete steps instead of smooth interpolation
        const difference = end - start;
        const stepCount = Math.max(8, Math.min(20, Math.abs(difference)));
        const stepDuration = duration / stepCount;
        let currentStep = 0;
        
        const step = () => {
            currentStep++;
            const progress = currentStep / stepCount;
            const current = Math.floor(start + (difference * Math.min(progress, 1)));
            element.textContent = current;
            
            if (currentStep < stepCount) {
                setTimeout(step, stepDuration);
            } else {
                element.textContent = end;
                if (callback) callback();
            }
        };
        
        step();
    }
    
    /**
     * Calculate base pips before any bonuses
     * @param {string} category - Scoring category
     * @returns {number} Base pips from dice only
     */
    calculateBasePips(category) {
        const faces = this.state.dice.map(die => die.getEffectiveFace());
        const counts = {};
        faces.forEach(face => {
            if (face > 0) counts[face] = (counts[face] || 0) + 1;
        });
        
        // Simple calculation for upper sanctum
        if (["Ones", "Twos", "Threes", "Fours", "Fives", "Sixes", "Sevens", "Eights", "Nines"].includes(category)) {
            const num = CATEGORY_TO_NUMBER[category];
            return (counts[num] || 0) * num;
        }
        
        // Lower sanctum returns sum of all dice
        return faces.reduce((a, b) => a + b, 0);
    }
    
    /**
     * Get individual dice contributions to score
     * Includes base pips AND enhancement bonuses
     * @param {string} category - Scoring category
     * @returns {Array} Array of {pips, dieIndex, source} objects
     */
    getDiceContributions(category) {
        const contributions = [];
        const num = CATEGORY_TO_NUMBER[category];
        
        this.state.dice.forEach((die, index) => {
            const face = die.getEffectiveFace();
            let basePips = 0;
            
            // For upper sanctum, only count matching dice
            if (num && face === num) {
                basePips = face;
            }
            // For lower sanctum, count all dice
            else if (!num && face > 0) {
                basePips = face;
            }
            
            // Add base die contribution
            if (basePips > 0) {
                contributions.push({ pips: basePips, dieIndex: index, source: 'die' });
                
                // Check for enhancement bonuses (lower sanctum only)
                if (die.hasEnhancementForCurrentFace && die.hasEnhancementForCurrentFace('iron')) {
                    contributions.push({ 
                        pips: ENHANCEMENT_BONUSES.IRON_PIPS, 
                        dieIndex: index, 
                        source: 'iron',
                        label: 'Iron'
                    });
                }
                
                // Mother of Pearl bonus
                if (die.hasEnhancementForCurrentFace && die.hasEnhancementForCurrentFace('mother_of_pearl') && die.motherOfPearlBonus) {
                    contributions.push({ 
                        pips: die.motherOfPearlBonus, 
                        dieIndex: index, 
                        source: 'mother_of_pearl',
                        label: 'Pearl'
                    });
                }
            }
        });
        
        return contributions;
    }
    
    /**
     * Get boon contributions to score
     * Calculates what each boon added, plus enhancement favour bonuses
     * @param {string} category - Scoring category
     * @param {number} basePips - Pips before boons
     * @param {number} baseFavour - Favour before boons
     * @returns {Array} Array of {boonId, boonName, pips, favour, source} objects
     */
    getBoonContributions(category, basePips, baseFavour) {
        const contributions = [];
        
        // Add enhancement favour bonuses first (from parchment)
        this.state.dice.forEach((die, index) => {
            if (die.hasEnhancementForCurrentFace && die.hasEnhancementForCurrentFace('parchment')) {
                const parchmentRoll = this.prng.random();
                if (parchmentRoll >= ENHANCEMENT_CHANCES.PARCHMENT_GOLD_CHANCE && 
                    parchmentRoll < ENHANCEMENT_CHANCES.PARCHMENT_GOLD_CHANCE + ENHANCEMENT_CHANCES.PARCHMENT_FAVOUR_CHANCE) {
                    // 25% chance for +1 favour
                    contributions.push({
                        boonId: `parchment_${index}`,
                        boonName: 'Parchment',
                        pips: 0,
                        favour: ENHANCEMENT_BONUSES.PARCHMENT_FAVOUR,
                        source: 'enhancement',
                        dieIndex: index
                    });
                }
            }
        });
        
        // Simulate scoring with each boon individually to see contribution
        this.state.jokers.forEach(joker => {
            if (!joker.timing.before_score) return;
            
            // Test what this boon adds
            const testData = { category, pips: basePips, favour: baseFavour, favourMult: 1 };
            const resultData = joker.onTimingEvent('before_score', this.state, testData);
            
            const pipsAdded = (resultData.pips || 0) - basePips;
            const favourAdded = (resultData.favour || 0) - baseFavour;
            
            if (pipsAdded !== 0 || favourAdded !== 0) {
                contributions.push({
                    boonId: joker.id,
                    boonName: joker.name,
                    pips: pipsAdded,
                    favour: favourAdded,
                    source: 'boon'
                });
            }
        });
        
        return contributions;
    }
    
    /**
     * Get per-die bonus preview for boons that affect individual dice.
     * Used when hovering a boon to show +pips/mult popups over affected dice.
     * @param {string} boonId - Boon ID (e.g. 'pegasus_flight', 'cerberus_watch')
     * @returns {Array<{dieIndex: number, label: string}>} Affected dice and their bonus labels
     */
    getBoonDicePreview(boonId) {
        const state = this.state;
        if (!state?.dice) return [];
        const result = [];
        const held = state.held || [];

        switch (boonId) {
            case 'pegasus_flight':
                state.dice.forEach((die, i) => {
                    const face = die.getEffectiveFace ? die.getEffectiveFace() : die.face;
                    if (face >= 6) result.push({ dieIndex: i, label: '×0.5 favour' });
                });
                break;
            case 'cerberus_watch':
                state.dice.forEach((die, i) => {
                    if (held[i] && result.length < 3) result.push({ dieIndex: i, label: '+3 pips' });
                });
                break;
            case 'morpheus_common':
                state.dice.forEach((die, i) => {
                    const face = die.getEffectiveFace ? die.getEffectiveFace() : die.face;
                    if (face === 3) result.push({ dieIndex: i, label: '×1 favour' });
                });
                break;
            case 'prime_time':
                const primes = [2, 3, 5];
                if (state.unlockedCategories?.Sevens) primes.push(7);
                const primeDice = state.dice
                    .map((d, i) => ({ i, face: d.getEffectiveFace ? d.getEffectiveFace() : d.face }))
                    .filter(({ face }) => primes.includes(face));
                const primeBonusSeq = [0, 1, 2, 3, 5, 7];
                const totalBonus = primeDice.length > 0 ? (primeBonusSeq[primeDice.length] || 0) : 0;
                const perDie = primeDice.length > 0 ? Math.round((totalBonus / primeDice.length) * 10) / 10 : 0;
                primeDice.forEach(({ i }) => result.push({ dieIndex: i, label: `+${perDie} pips` }));
                break;
            case 'the_locksmith':
                state.dice.forEach((die, i) => {
                    const heldRolls = die.rollsHeld || 0;
                    if (heldRolls > 0) result.push({ dieIndex: i, label: `+${heldRolls} pips` });
                });
                break;
            default:
                break;
        }

        // Worship pipsBonuses (twos/sixes) - shown when hovering any card for consistency
        // Actually user asked for boons - skip worship for now
        return result;
    }

    /**
     * Jiggle a die with animation
     * @param {number} dieIndex - Index of die to jiggle
     */
    jiggleDie(dieIndex) {
        const dieElements = document.querySelectorAll('.die');
        const dieElement = dieElements[dieIndex];
        
        // Jiggle any die that contributed to the score (held or not)
        if (dieElement) {
            dieElement.classList.add('die-scoring-jiggle');
            setTimeout(() => {
                dieElement.classList.remove('die-scoring-jiggle');
            }, 400);
        }
    }
    
    /**
     * Show pip number popup over a die (Balatro-style chips on cards → pips on dice)
     * @param {number} dieIndex - Index of die
     * @param {number} pips - Pip value to display
     * @param {string} [label] - Optional label (e.g. 'Iron', 'Pearl')
     */
    showPipPopupOnDie(dieIndex, pips, label = '') {
        const dieElements = document.querySelectorAll('.die');
        const dieElement = dieElements[dieIndex];
        if (!dieElement) return;
        
        const rect = dieElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const topY = rect.top - 8;
        
        const popup = document.createElement('div');
        popup.className = 'die-pip-popup';
        const text = label ? `${label}+${pips}` : `+${pips}`;
        popup.textContent = text;
        
        popup.style.position = 'fixed';
        popup.style.left = `${centerX}px`;
        popup.style.top = `${topY}px`;
        popup.style.transform = 'translate(-50%, 0)';
        popup.style.zIndex = '10000';
        popup.style.pointerEvents = 'none';
        
        document.body.appendChild(popup);
        
        setTimeout(() => popup.remove(), 900);
    }
    
    /**
     * Jiggle a boon card with animation
     * @param {string} boonId - ID of boon to jiggle
     */
    jiggleBoon(boonId) {
        // Find boon card in the collection area
        const boonCards = document.querySelectorAll('.card');
        boonCards.forEach(card => {
            const cardData = card.dataset;
            if (cardData.id === boonId || card.querySelector(`[data-id="${boonId}"]`)) {
                card.classList.add('boon-trigger-jiggle');
                
                // Add glow effect
                card.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.8)';
                
                setTimeout(() => {
                    card.classList.remove('boon-trigger-jiggle');
                    card.style.boxShadow = '';
                }, 600);
            }
        });
    }
    
    /**
     * Show floating text above element
     * @param {number|string} value - Value to display
     * @param {number} index - Index for positioning
     * @param {string} type - 'die' or 'boon'
     * @param {string} label - Optional label
     */
    showFloatingText(value, index, type, label = '') {
        const container = type === 'die' ? document.getElementById('diceContainer') : document.getElementById('jokersArea');
        if (!container) return;
        
        const text = document.createElement('div');
        text.className = 'floating-score-text';
        
        // Format value (could be number or already formatted string like "+3" or "+1.5×")
        const valueStr = typeof value === 'string' ? value : `+${value}`;
        text.textContent = label ? `${label}: ${valueStr}` : valueStr;
        
        // Position based on type and index
        if (type === 'die') {
            text.style.position = 'absolute';
            text.style.left = `${(index * 80) + 40}px`;
            text.style.top = '-20px';
        } else {
            // For boons, position relative to card in collection
            text.style.position = 'absolute';
            text.style.left = `${(index * 140) + 70}px`;
            text.style.top = '10px';
        }
        
        text.style.color = '#9370DB'; // Purple for all pips (Balatro-style consistency)
        text.style.fontWeight = 'bold';
        text.style.fontSize = type === 'die' ? '18px' : '16px';
        text.style.zIndex = '1000';
        text.style.pointerEvents = 'none';
        text.style.animation = 'floatUp 1s ease-out forwards';
        text.style.textShadow = '0 0 10px rgba(147, 112, 219, 0.8), 2px 2px 4px rgba(0, 0, 0, 0.9)';
        
        container.appendChild(text);
        
        setTimeout(() => {
            text.remove();
        }, 1000);
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
        // Defensive: Validate inputs
        if (typeof change !== 'number' || isNaN(change)) {
            Logger.error(`Invalid gold change: ${change}`);
            return;
        }
        
        const oldGold = this.state.gold || 0;
        const newGold = Math.max(0, oldGold + change); // Prevent negative gold
        this.state.gold = newGold;
        
        Logger.trace(`Gold: ${oldGold} → ${newGold} (${change >= 0 ? '+' : ''}${change})`, reason);
        
        // Get gold display elements (gold in gnosis-gold-box - shop no longer overlay)
        const goldDisplays = [
            document.getElementById('goldDisplay'),
            ...document.querySelectorAll('.gold-display')
        ].filter(el => el !== null);
        
        if (goldDisplays.length === 0) {
            Logger.warn('No gold display elements found');
            return;
        }
        if (change > 0 && window.soundManager) {
            window.soundManager.play(change >= 10 ? 'coin6' : 'coin3', { pitch: 0.9 + Math.random() * 0.1, volume: 0.6 });
        }
        goldDisplays.forEach(goldElement => {
            // Flash color
            if (change > 0) {
                goldElement.classList.add('gold-gain');
                this.showFloatingGold(`+${change}g`, goldElement, 'positive');
            } else if (change < 0) {
                goldElement.classList.add('gold-loss');
                this.showFloatingGold(`${change}g`, goldElement, 'negative');
            }
            
            // Animate count only if both values are valid numbers
            if (!isNaN(oldGold) && !isNaN(newGold)) {
                this.animateNumberCount(goldElement, oldGold, newGold, 500);
            } else {
                // Fallback: Just set the value directly
                goldElement.textContent = newGold;
            }
            
            // Reset color after animation
            setTimeout(() => {
                goldElement.classList.remove('gold-gain', 'gold-loss');
            }, 600);
        });
        
        // Don't call updateAllUI() here - it can interrupt animations
        // The UI will update naturally after animations complete
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
    
    /**
     * Show Balatro-style game over screen
     * @param {boolean} isVictory - True if player won, false if lost
     */
    showGameOverScreen(isVictory) {
        if (window.soundManager) window.soundManager.play(isVictory ? 'win' : 'negative', { volume: 0.8 });
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';
        overlay.style.opacity = '0';
        
        const modal = document.createElement('div');
        modal.className = 'game-over-modal';
        
        // Calculate stats
        const totalScore = this.state.totalScore;
        const highestScore = Math.max(...Object.values(this.state.scorecard).filter(v => typeof v === 'number'));
        const categoriesCompleted = Object.values(this.state.scorecard).filter(v => v !== undefined).length;
        
        modal.innerHTML = `
            <div class="game-over-header ${isVictory ? 'victory' : 'defeat'}">
                <h1 class="game-over-title">${isVictory ? 'Victory!' : 'Defeat'}</h1>
                <div class="game-over-subtitle">${isVictory ? 'The Gods Smile Upon You' : 'The Gods Turn Away'}</div>
            </div>
            
            <div class="game-over-stats">
                <div class="stat-row">
                    <span class="stat-label">Ante Reached</span>
                    <span class="stat-value">${this.state.ante}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Total Score</span>
                    <span class="stat-value stat-highlight">${totalScore}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Highest Single Score</span>
                    <span class="stat-value">${highestScore}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Categories Completed</span>
                    <span class="stat-value">${categoriesCompleted}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Gold Remaining</span>
                    <span class="stat-value">${this.state.gold}g</span>
                </div>
                ${this.state.bonusYahtzees > 0 ? `
                <div class="stat-row special">
                    <span class="stat-label">Bonus Heurekas</span>
                    <span class="stat-value">${this.state.bonusYahtzees}</span>
                </div>` : ''}
            </div>
            
            <div class="game-over-actions">
                <button class="game-over-button new-run" id="gameOverNewRun">
                    <span class="button-icon">🎲</span>
                    <span class="button-text">New Run</span>
                </button>
                <button class="game-over-button exit-menu" id="gameOverExit">
                    <span class="button-icon">🏛️</span>
                    <span class="button-text">Exit to Menu</span>
                </button>
            </div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Fade in
        requestAnimationFrame(() => {
            overlay.style.transition = 'opacity 0.6s ease-out';
            overlay.style.opacity = '1';
        });
        
        // Button handlers
        const newRunBtn = modal.querySelector('#gameOverNewRun');
        const exitBtn = modal.querySelector('#gameOverExit');
        
        newRunBtn.addEventListener('click', () => {
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.remove();
                this.startNewRun();
            }, 600);
        });
        
        exitBtn.addEventListener('click', () => {
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.remove();
                this.exitToMenu();
            }, 600);
        });
    }
    
    /**
     * Start a new run (reset game state)
     */
    startNewRun() {
        // Clear saved game
        if (this.dataManager) {
            this.dataManager.deleteSave('auto');
        }
        
        // Reload the page to start fresh
        window.location.reload();
    }
    
    /**
     * Exit to main menu (Balatro: go_to_menu — save run then return)
     * Uses central exitToMenuAndSave so save always runs.
     */
    exitToMenu() {
        if (window.app?.exitToMenuAndSave) {
            window.app.exitToMenuAndSave();
        } else {
            if (this.canSave()) this.saveGame();
            if (window.app) {
                window.app.switchToScreen('start');
                window.app.currentScreen = 'start';
                window.app.updateContinueButton?.();
            }
        }
    }

    // Award classic Yahtzee upper bonus (+35) when Ones..Sixes total reaches 63
    checkAndAwardUpperBonus() {
        if (this.state.upperBonusAwarded) return;
        const upperCats = ["Ones", "Twos", "Threes", "Fours", "Fives", "Sixes"];
        const sumUpper = upperCats.reduce((sum, cat) => sum + (this.state.scorecard[cat] || 0), 0);
        if (sumUpper >= 63) {
            const bonus = this.getPandoraBoxBonusAmount();
            this.state.upperBonusAwarded = true;
            this.state.totalScore += bonus;
            this.showMessage(`Pandora's Box (Upper) bonus: +${bonus}!`);
            this.checkAndUnlockPandoraBox();
            if (this.domReady) {
                this.updateAllUI();
            }
        }
    }

    // Award lower-section completion bonus: all lower categories scored (non-undefined)
    checkAndAwardLowerBonus() {
        if (this.state.lowerBonusAwarded) return;
        const lowerCats = [
            "Three of a Kind", "Small Straight", "Full House",
            "Four of a Kind", "Large Straight", "Yahtzee", "Chance"
        ];
        const allScored = lowerCats.every(cat => this.state.scorecard[cat] !== undefined);
        if (allScored) {
            const bonus = this.getPandoraBoxBonusAmount();
            this.state.lowerBonusAwarded = true;
            this.state.totalScore += bonus;
            this.showMessage(`Pandora's Box (Lower) bonus: +${bonus}!`);
            this.checkAndUnlockPandoraBox();
            if (this.domReady) {
                this.updateAllUI();
            }
        }
    }

    getPandoraBoxBonusAmount() {
        const base = 35;
        const worshipLevel = this.state.worshipLevels?.["Pandora's Box"] || 0;
        const hasWorshipCard = this.state.consumables?.some(c => c && c.id === 'worship_pandora');
        return base + worshipLevel + (hasWorshipCard ? 1 : 0);
    }

    checkAndUnlockPandoraBox() {
        if (this.state.unlockedCategories["Pandora's Box"]) return;
        if (this.state.upperBonusAwarded && this.state.lowerBonusAwarded) {
            this.state.unlockedCategories["Pandora's Box"] = true;
            this.showMessage("Pandora's Box worship unlocked!", 4000);
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
                this.updateMaxTurns();
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
    }

    /**
     * Calculate the score for a given category with the current dice
     * @param {string} category - Scoring category (e.g., "Ones", "Three of a Kind", "Yahtzee")
     * @returns {{pips: number, favour: number, isValid: boolean}} Score calculation result
     * @example
     * const result = engine.calculateScore("Full House");
     * // { pips: 23, favour: 2, isValid: true }
     */
    calculateScore(category, isActualScoring = false) {
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
                
                const faceData = d.faces[d.currentFace];
                Logger.trace(`Die ${index}: face=${face}`, faceData);
                
                // Validate face value
                if (typeof face !== 'number' || isNaN(face)) {
                    Logger.warn(`Die ${index} returned invalid face: ${face}. Using 0.`);
                    return 0;
                }
                
                // Apply substitutions
                if (this.state.diceSubstitutions && this.state.diceSubstitutions.foursAsFives && face === 4) {
                    face = 5;
                }
                
                return face;
            } catch (error) {
                Logger.error(`Error getting face for die ${index}:`, error);
                return 0;
            }
        });
        
        // Build counts with safe defaults
        const counts = {};
        this.state.dice.forEach((die, index) => {
            const val = faces[index];
            if (val > 0) {  // Only count valid faces
                counts[val] = (counts[val] || 0) + 1;
            }
        });
        
        Logger.trace(`Scoring ${category}: faces=[${faces.join(',')}]`, counts);

        let pips, favour, isValid, fromPipeline = false;
        if (typeof ScoringEngine !== 'undefined' && typeof ScoringEngine.runPipeline === 'function') {
            const pipeResult = ScoringEngine.runPipeline(category, this.state, {
                tempPips: isActualScoring ? (this.state.tempPips || 0) : 0,
                tempFavour: isActualScoring ? (this.state.tempFavour || 0) : 0
            });
            pips = pipeResult.pips;
            favour = pipeResult.favour * (pipeResult.favourMult || 1);
            isValid = pipeResult.isValid;
            fromPipeline = true;
        } else {
            const context = typeof ScoringEngine !== 'undefined'
                ? ScoringEngine.buildContext(this.state)
                : { pipsBonuses: this.state.pipsBonuses || {}, jokers: this.state.jokers || [], activeBlind: this.state.activeBlind || null, unlockedCategories: this.state.unlockedCategories || {} };
            let evalResult = typeof ScoringEngine !== 'undefined'
                ? ScoringEngine.evaluateCategory(category, faces, counts, context)
                : { pips: 0, isValid: false };
            pips = evalResult.pips;
            isValid = evalResult.isValid;
            favour = this.getFavourForCategory(category);
            const god = this.getGodForCategory(category);
            // Worship bonus only on non-zero dice entries; boons apply even on scratch
            const hasValidDiceScore = pips > 0;
            if (hasValidDiceScore) {
                if (god && this.state.worshipLevels[god]) favour += this.state.worshipLevels[god];
                const worshipLevel = (god && this.state.worshipLevels[god]) ? this.state.worshipLevels[god] : 0;
                const pipsPerLevel = (typeof CATEGORY_PIPS_PER_LEVEL !== 'undefined' && CATEGORY_PIPS_PER_LEVEL[category]) || 0;
                pips += worshipLevel * pipsPerLevel;
                this.state.consumables.forEach((consumable) => {
                    if (consumable instanceof WorshipCard) {
                        const worshipResult = consumable.applyBasicWorshipEffect(this.state, { category, pips, favour });
                        favour = worshipResult.favour;
                    }
                });
            }
        }

        // Side-effect messages (only when actually scoring, not previewing)
        if (isActualScoring && isValid) {
            const hasBellows = this.state.jokers?.some(j => j.id === 'bellows_of_war');
            const hasDionysus = this.state.jokers?.some(j => j.id === 'dionysus_revelry');
            if (hasBellows && ['Three of a Kind', 'Four of a Kind'].includes(category)) {
                window.game?.showMessage?.("Bellows of War: Virtual die added!", 2000);
            }
            if (hasDionysus && category === 'Full House') {
                const has3 = Object.values(counts).includes(SCORING_THRESHOLDS.FULL_HOUSE_THREE);
                const has2 = Object.values(counts).includes(SCORING_THRESHOLDS.FULL_HOUSE_TWO);
                const pairCount = Object.values(counts).filter(c => c === 2).length;
                if (pairCount >= 2 && !(has3 && has2)) {
                    window.game?.showMessage?.("Dionysus' Revelry: 2 pairs counted as Full House!", 3000);
                }
            }
        }

        // Apply enhancement effects (gold, parchment) - only when actually scoring a valid hand
        if (isActualScoring && isValid) {
            this.state.dice.forEach((die, index) => {
                const currentFace = die.currentFace;
                const currentFaceData = die.faces[currentFace];
                if (currentFaceData?.enhancements?.size > 0) {
                    Logger.trace(`Die ${index + 1} enhancements:`, Array.from(currentFaceData.enhancements));
                }
                if (die.hasEnhancementForCurrentFace && die.hasEnhancementForCurrentFace('gold')) {
                    this.updateGoldAnimated(ENHANCEMENT_BONUSES.GOLD_COINS, "gold enhancement");
                    window.game?.showMessage?.("Gold enhancement: +1 Gold!");
                }
                if (die.hasEnhancementForCurrentFace && die.hasEnhancementForCurrentFace('parchment')) {
                    const parchmentRoll = this.prng.random(); // Use seeded RNG for determinism
                    if (parchmentRoll < ENHANCEMENT_CHANCES.PARCHMENT_GOLD_CHANCE) {
                        this.updateGoldAnimated(ENHANCEMENT_BONUSES.PARCHMENT_GOLD, "parchment");
                        window.game?.showMessage?.(`Parchment fortune: +${ENHANCEMENT_BONUSES.PARCHMENT_GOLD} Gold!`);
                    }
                }
            });
        }
        
        // Apply enhancement effects that only trigger on VALID hands (pips, favour)
        // When using runPipeline, iron/mop/wild are already included; only run parchment favour + side-effect messages
        const usePipeline = typeof ScoringEngine !== 'undefined' && typeof ScoringEngine.runPipeline === 'function';
        if (isValid) {
            this.state.dice.forEach((die, index) => {
                if (!usePipeline) {
                    if (die.hasEnhancementForCurrentFace && die.hasEnhancementForCurrentFace('iron')) {
                        pips += ENHANCEMENT_BONUSES.IRON_PIPS;
                        window.game?.showMessage?.(`Iron enhancement: +${ENHANCEMENT_BONUSES.IRON_PIPS} Pips!`);
                    }
                    if (die.hasEnhancementForCurrentFace && die.hasEnhancementForCurrentFace('mother_of_pearl') && die.motherOfPearlBonus !== undefined) {
                        pips += die.motherOfPearlBonus;
                    }
                    // Wild: getEffectiveFace() already includes wildValue in base pips - no extra pips
                }
                if (die.hasEnhancementForCurrentFace && die.hasEnhancementForCurrentFace('parchment')) {
                    const parchmentRoll = this.prng.random();
                    if (parchmentRoll >= ENHANCEMENT_CHANCES.PARCHMENT_GOLD_CHANCE &&
                        parchmentRoll < ENHANCEMENT_CHANCES.PARCHMENT_GOLD_CHANCE + ENHANCEMENT_CHANCES.PARCHMENT_FAVOUR_CHANCE) {
                        favour += ENHANCEMENT_BONUSES.PARCHMENT_FAVOUR;
                        window.game?.showMessage?.("Parchment blessing: +1 Favour!");
                    }
                }
            });
        }
        
        return { pips, favour, isValid, fromPipeline };
    }

    getFavourForCategory(category) {
        // Base multiplier is always 1x
        // Worship level for the category's god is added separately in calculateScore
        return 1;
    }

    /**
     * Get the pips and mult associated with the current worship level (Balatro planet-card style)
     * @param {string} category
     * @returns {{ pips: number, mult: number }}
     */
    getCategoryLevelBonuses(category) {
        const god = this.getGodForCategory(category);
        const level = god ? (this.state.worshipLevels[god] || 0) : 0;
        const basePips = (typeof LOWER_SECTION_BONUSES !== 'undefined' && LOWER_SECTION_BONUSES[category]) || 0;
        const pipsPerLevel = (typeof CATEGORY_PIPS_PER_LEVEL !== 'undefined' && CATEGORY_PIPS_PER_LEVEL[category]) || 0;
        const pips = basePips + (level * (pipsPerLevel || 0));
        const mult = 1 + level;
        return { pips, mult };
    }

    getGodForCategory(category) {
        return typeof GodUtils !== 'undefined' ? GodUtils.getGodForCategory(category) : null;
    }

    // Turn and ante progression
    nextTurn() {
        // Apply TURN_END joker effects before advancing turn (Balatro-inspired timing)
        this.state.jokers.forEach(joker => {
            joker.onTimingEvent('turn_end', this.state);
        });
        
        // Reset boon trigger counter for Eruption of Etna
        this.state.boonTriggersThisTurn = 0;
        
        this.state.turn++;
        
        // Apply joker effects that modify abilities (like Strategic Mind)
        this.applyJokerAbilityEffects();
        
        // FIXED: Default 3 rolls (can be modified by turn_start effects)
        this.state.rollsLeft = GAME_BALANCE.STARTING_ROLLS;
        
        // Apply TURN_START effects AFTER setting default rolls (so Kronos can override)
        this.state.jokers.forEach(joker => {
            joker.onTimingEvent('turn_start', this.state);
        });
        
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
        } else if ([4, 8].includes(this.state.turn) && !this.state.winningTestMode) {
            // Show gold + interest calculation in Gnosis BEFORE opening shop (skipped in winning test mode)
            this.showInterestThenOpenShop();
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

    /**
     * Compute effective max turns based on unlocked categories.
     * Base 13 + one per unlocked high category (Sevens, Eights, Nines).
     */
    updateMaxTurns() {
        const base = GAME_BALANCE.MAX_TURNS_PER_ANTE;
        const highCount = ['Sevens', 'Eights', 'Nines'].filter(
            c => this.state.unlockedCategories?.[c]
        ).length;
        this.state.maxTurns = base + highCount;
    }

    /**
     * Check if all available score categories have been filled
     * @returns {boolean} True if all categories are scored
     */
    areAllCategoriesFilled() {
        // Get all available categories (including unlocked high categories)
        const upperCats = ["Ones", "Twos", "Threes", "Fours", "Fives", "Sixes"];
        const lowerCats = ["Three of a Kind", "Small Straight", "Full House", "Four of a Kind", "Large Straight", "Yahtzee", "Chance"];
        
        // Add high categories if unlocked
        const highCats = [];
        if (this.state.unlockedCategories.Sevens) highCats.push("Sevens");
        if (this.state.unlockedCategories.Eights) highCats.push("Eights");
        if (this.state.unlockedCategories.Nines) highCats.push("Nines");
        
        const allCategories = [...upperCats, ...lowerCats, ...highCats];
        
        // Check if all categories have been scored (not undefined)
        return allCategories.every(category => this.state.scorecard[category] !== undefined);
    }

    endAnte() {
        // Check if all categories are filled AND score threshold is reached
        const allCategoriesFilled = this.areAllCategoriesFilled();
        const scoreThresholdReached = this.state.totalScore >= this.state.scoreThreshold;
        
        // Player must complete all categories AND meet the score threshold
        if (allCategoriesFilled && scoreThresholdReached) {
            if (window.soundManager) window.soundManager.play('gong', { pitch: 0.9, volume: 0.5 });
            this.showMessage(`Ante ${this.state.ante} cleared! Score: ${this.state.totalScore}/${this.state.scoreThreshold}`);
            
            if (this.state.ante >= 13 && !this.state.endlessMode) {
                this.state.endlessMode = true;
                this.showMessage("The Apotheosis is complete! The Odyssey begins...");
            }

            // Compute tally numbers BEFORE resetting state
            const upperCats = ["Ones","Twos","Threes","Fours","Fives","Sixes"];
            const lowerCats = ["Three of a Kind","Small Straight","Full House","Four of a Kind","Large Straight","Yahtzee","Chance"];
            const sumUpper = upperCats.reduce((s,c)=> s + (this.state.scorecard[c] || 0), 0);
            const sumLower = lowerCats.reduce((s,c)=> s + (this.state.scorecard[c] || 0), 0);
            const upperBonus = sumUpper >= 63 ? 35 : 0;
            // Lower bonus only when all lower categories filled AND each has score > 0
            const lowerBonus = lowerCats.every(c => {
                const v = this.state.scorecard[c];
                return v !== undefined && (typeof v === 'number' ? v > 0 : true);
            }) ? 35 : 0;

            // Show dramatic tally, then reset state and open shop
            this.runEndOfAnteTallyThenOpenShop({ sumUpper, sumLower, upperBonus, lowerBonus });
        } else if (allCategoriesFilled && !scoreThresholdReached) {
            // All categories filled but didn't meet threshold - GAME OVER
            this.state.gameOver = true;
            
            this.showMessage(`Ante ${this.state.ante} failed! Score: ${this.state.totalScore}/${this.state.scoreThreshold}`);
            
            // Show Balatro-style game over screen
            this.showGameOverScreen(false);
            
            // Update statistics
            this.dataManager.updateStats({
                won: false,
                score: this.state.totalScore,
                ante: this.state.ante,
                goldEarned: this.state.gold
            });
        } else {
            // Not all categories filled yet - shouldn't reach here in normal flow
            Logger.warn('endAnte() called but not all categories filled yet', {
                filled: allCategoriesFilled,
                threshold: scoreThresholdReached,
                totalScore: this.state.totalScore,
                scoreThreshold: this.state.scoreThreshold
            });
        }
    }

    // Show pantheon total + interest/cashout overlay, then open shop (end of ante)
    runEndOfAnteTallyThenOpenShop({ sumUpper, sumLower, upperBonus, lowerBonus }) {
        const totalPantheon = (sumUpper + sumLower) + (upperBonus + lowerBonus);
        this.finishAnteAndOpenShop({ pantheonTotal: totalPantheon });
    }

    // Reset state for next ante and open shop (or mid-ante cashout)
    finishAnteAndOpenShop(opts = {}) {
        this.state.ante++;
        this.state.turn = 1;
        
        // === ANTE_END TIMING HOOK - MUST run BEFORE reset so Odyssey/Message in a Bottle can read scorecard ===
        this.state.jokers.forEach(joker => {
            if (joker.timing && joker.timing.ante_end) {
                joker.onTimingEvent('ante_end', this.state, {});
            }
        });
        
        // Now reset scorecard and totalScore for next ante
        this.state.scorecard = {};
        this.state.totalScore = 0;
        
        // Reset The Heretic stacks at end of ante
        if (this.state.hereticStacks) {
            this.state.hereticStacks = 0;
        }
        
        // Reset The Zealot's last worship god at end of ante
        this.state.lastWorshipGod = null;
        
        // Get threshold from AnteData array (Balatro-style progression)
        const nextAnteData = AnteData[this.state.ante - 1];
        if (nextAnteData) {
            this.state.scoreThreshold = nextAnteData.scoreThreshold;
        }
        // Cashout (scores gold + interest) in overlay, then open shop
        this.showInterestThenOpenShop(opts);
    }

    checkWinConditions() {
        // Check for twelve sixes win condition
        if (this.state.winConditions.twelveSixes) {
            const totalSixes = Object.entries(this.state.scorecard)
                .filter(([category, score]) => category === 'Sixes' && score > 0)
                .reduce((total, [_, score]) => total + Math.floor(score / 6), 0);
            
            if (totalSixes >= 12) {
                this.state.gameOver = true;
                
                // Show Balatro-style victory screen
                this.showGameOverScreen(true);
                
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
                    case 'artifact_trojan_horse':
                        // The Trojan Horse: After Turn 10, all boons give ×2 effect
                        if (this.state.turn >= 10) {
                            this.state.boonMultiplier = 2;
                            Logger.info(`Trojan Horse activated! All boons ×2 (Turn ${this.state.turn})`);
                        } else {
                            this.state.boonMultiplier = 1;
                        }
                        break;
                }
            });
            
            // Check for Trojan Horse BOON (not artifact) - fixes critical bug
            const hasTrojanHorseBoon = this.state.jokers?.some(j => j.id === 'trojan_horse');
            if (hasTrojanHorseBoon && this.state.turn >= 11) {
                this.state.boonMultiplier = 2;
                Logger.info(`Trojan Horse BOON activated! All boons ×2 (Turn ${this.state.turn})`);
            } else if (!hasTrojanHorseBoon) {
                // If no Trojan Horse boon, check artifacts
                const hasTrojanHorse = this.state.artifacts.some(a => a.id === 'artifact_trojan_horse');
                if (!hasTrojanHorse) {
                    this.state.boonMultiplier = 1;
                }
            }
            
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
                    this.showMessage("Ritual fulfilled, but your consumable slots are full!");
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
    /**
     * Refresh all gameplay UI. Coalesced with requestAnimationFrame so multiple calls
     * in the same frame result in a single render (buttery smoothness).
     * @param {boolean} [immediate=false] - If true, bypass coalescing (e.g. loadGame, modal open)
     */
    updateAllUI(immediate = false) {
        if (!window.uiManager || !this.domReady) return;
        if (!this.dom.diceContainer || !this.dom.rollButton) {
            if (this.dom.diceContainer || this.dom.rollButton) Logger.debug('Game elements not ready, skipping UI update');
            return;
        }
        const run = () => {
            window.uiManager.updateAll(this.state, this);
            this._updateAllUIScheduled = false;
        };
        if (immediate) {
            if (this._updateAllUIScheduled && this._updateAllUIRafId != null) {
                cancelAnimationFrame(this._updateAllUIRafId);
            }
            this._updateAllUIScheduled = false;
            run();
            return;
        }
        if (this._updateAllUIScheduled) return;
        this._updateAllUIScheduled = true;
        this._updateAllUIRafId = requestAnimationFrame(run);
    }

    /**
     * Debounced Gnosis preview for score row hover. Rapid hovers only trigger one calculation.
     */
    scheduleLiveScorePreview(category) {
        if (this._liveScorePreviewTimeout) clearTimeout(this._liveScorePreviewTimeout);
        this._liveScorePreviewTimeout = setTimeout(() => {
            this._liveScorePreviewTimeout = null;
            this.updateLiveScoreDisplay(category);
        }, typeof TIMING !== 'undefined' ? TIMING.LIVE_SCORE_DEBOUNCE_MS : 70);
    }

    cancelLiveScorePreview() {
        if (this._liveScorePreviewTimeout) {
            clearTimeout(this._liveScorePreviewTimeout);
            this._liveScorePreviewTimeout = null;
        }
        this.updateLiveScoreDisplay(null);
    }

    /**
     * Procedural live score update – textContent only, no innerHTML. Balatro-style smooth updates.
     * @param {HTMLElement} el - Live score display root
     * @param {Object} o - Values: category, pips, pipsLabel, pipsAdd, pipsContrib, favour, favourLabel, favourAdd, favourContrib, showEquals, scorePreview, showNa
     */
    updateLiveScoreValues(el, o) {
        if (!el || !el.hasAttribute('data-live-root')) return;
        const q = (key) => el.querySelector(`[data-live="${key}"]`);
        const set = (key, val) => { const n = q(key); if (n) n.textContent = val ?? ''; };
        const hide = (key) => { const n = q(key); if (n) n.setAttribute('hidden', ''); };
        const show = (key) => { const n = q(key); if (n) n.removeAttribute('hidden'); };

        set('category', o.category);
        const row = q('row');
        const rowNa = q('row-na');
        if (o.showNa) {
            if (row) row.setAttribute('hidden', '');
            if (rowNa) rowNa.removeAttribute('hidden');
            return;
        }
        if (row) row.removeAttribute('hidden');
        if (rowNa) rowNa.setAttribute('hidden', '');

        set('pips', o.pips);
        set('pips-label', o.pipsLabel);
        set('favour', o.favour);
        set('favour-label', o.favourLabel);

        if (o.pipsAdd != null) {
            set('pips-contrib', o.pipsContrib);
            o.pipsAdd ? show('pips-add') : hide('pips-add');
        }
        if (o.favourAdd != null) {
            set('favour-contrib', o.favourContrib);
            o.favourAdd ? show('favour-add') : hide('favour-add');
        }
        if (o.showEquals != null) {
            o.showEquals ? show('equals') : hide('equals');
        }
        if (o.scorePreview != null) {
            set('score-preview', o.scorePreview);
            o.scorePreview !== '' ? show('score-preview') : hide('score-preview');
        }
        if (o.pipsPulse) {
            const p = q('pips');
            if (p) { p.classList.add('pips-pulse'); setTimeout(() => p.classList.remove('pips-pulse'), 300); }
        }
        if (o.favourPulse) {
            const f = q('favour');
            if (f) { f.classList.add('favour-pulse'); setTimeout(() => f.classList.remove('favour-pulse'), 300); }
        }
    }

    updateLiveScoreDisplay(category) {
        if (!this.domReady || !this.dom.liveScoreDisplay) return;
        if (this.liveScoreAnimationTimeout) clearTimeout(this.liveScoreAnimationTimeout);
        const el = this.dom.liveScoreDisplay;
        if (window.juiceManager) window.juiceManager.cancelJuice(el);

        const god = category ? this.getGodForCategory(category) : null;
        const godLabel = god || '—';
        const catName = category ? (category === 'Yahtzee' ? 'HEUREKA' : category).toUpperCase().replace(/\s+/g, ' ') : 'Offering';

        if (!category || !this.state.hasRolled) {
            const levelBonus = category ? this.getCategoryLevelBonuses(category) : { pips: 0, mult: 1 };
            const worshipLevel = category && god ? (this.state.worshipLevels?.[god] || 0) : 0;
            const favourLabel = worshipLevel > 0 ? `favour (Lv.${worshipLevel})` : 'favour';
            this.updateLiveScoreValues(el, {
                category: catName,
                pips: '0',
                pipsLabel: `${Math.floor(levelBonus.pips)} pips`,
                pipsAdd: false,
                favour: category ? this.formatFavour(levelBonus.mult) : '0',
                favourLabel,
                favourAdd: false,
                showEquals: false,
                scorePreview: '',
                showNa: false
            });
            el.classList.add('visible');
            this.lastPreviewPips = 0;
            this.lastPreviewFavour = 0;
            return;
        }

        const { pips, favour, isValid, fromPipeline } = this.calculateScore(category);

        if (!isValid) {
            this.updateLiveScoreValues(el, { category: catName, showNa: true });
            el.classList.add('visible');
            return;
        }

        let p = pips, f = favour;
        if (!fromPipeline) {
            let eventData = { category, pips: p, favour: f, favourMult: 1 };
            this.state.jokers.forEach((j) => {
                if (j.timing?.before_score) eventData = j.onTimingEvent('before_score', this.state, eventData);
            });
            p = eventData.pips;
            f = eventData.favour * (eventData.favourMult || 1);
        }

        const levelBonus = this.getCategoryLevelBonuses(category);
        const offeringName = category === 'Yahtzee' ? 'Heureka' : category;
        const isScored = this.state.scorecard[category] !== undefined;
        const categoryLabel = isScored ? `Offering of ${offeringName} made to ${godLabel}` : catName;
        const worshipLevel = god ? (this.state.worshipLevels?.[god] || 0) : 0;
        const favourLabel = worshipLevel > 0 ? `favour (Lv.${worshipLevel})` : 'favour';

        this.updateLiveScoreValues(el, {
            category: categoryLabel,
            pips: String(Math.floor(p)),
            pipsLabel: `${Math.floor(levelBonus.pips)} pips`,
            pipsAdd: false,
            favour: this.formatFavour(f),
            favourLabel,
            favourAdd: false,
            showEquals: false,
            scorePreview: '',
            showNa: false
        });
        el.classList.add('visible');

        if (window.juiceManager && (this.lastPreviewPips !== undefined || this.lastPreviewFavour !== undefined)) {
            const dP = p - (this.lastPreviewPips ?? 0), dF = f - (this.lastPreviewFavour ?? 0);
            if (dP !== 0 || dF !== 0) window.juiceManager.juiceUp(el, 0.12);
        }
        this.lastPreviewPips = p;
        this.lastPreviewFavour = f;
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
        
        // Check for Golden Touch boon (better interest rate: 1 per 3 instead of 1 per 5)
        const hasGoldenTouch = this.state.jokers?.some(j => j.id === 'golden_touch');
        const interestRate = hasGoldenTouch ? 3 : GAME_BALANCE.INTEREST_RATE;
        
        const interest = Math.min(
            Math.floor(gold / interestRate),
            GAME_BALANCE.MAX_INTEREST
        );
        return interest;
    }

    // Unified pre-shop overlay: pantheon total (if end of ante) + interest/cashout, then open shop
    showInterestThenOpenShop(opts = {}) {
        if (this._cashoutInProgress) return;
        this._cashoutInProgress = true;
        this.state.transitioningToShop = true;
        this.updateAllUI(true);

        const pantheonTotal = opts.pantheonTotal;
        const scoresCount = this.state.scoresThisRound || 0;
        const scoresGold = scoresCount * GAME_BALANCE.GOLD_PER_SCORE;

        // 1. Award scores gold first (interest calculated on gold after scores)
        if (scoresGold > 0) {
            this.updateGoldAnimated(scoresGold, "scores");
            this.state.scoresThisRound = 0;
        }

        const goldAfterScores = this.state.gold;
        const interest = this.calculateInterest();
        const totalGold = goldAfterScores + interest;
        const hasGoldenTouch = this.state.jokers?.some(j => j.id === 'golden_touch');
        const rate = hasGoldenTouch ? 3 : GAME_BALANCE.INTEREST_RATE;

        const doOpenShop = () => {
            if (interest > 0) this.updateGoldAnimated(interest, "interest");
            this._cashoutInProgress = false;
            this.state.transitioningToShop = false;
            this.openShop();
        };

        const liveEl = this.dom.liveScoreDisplay;
        const cashoutContent = this.dom.gnosisCashoutContent;
        const cashoutTitle = this.dom.gnosisCashoutTitle;
        const cashoutLinesEl = this.dom.gnosisCashoutLines;
        if (!this.domReady || !liveEl || !cashoutContent || !cashoutTitle || !cashoutLinesEl) {
            if (interest > 0) this.updateGoldAnimated(interest, "interest");
            doOpenShop();
            return;
        }

        // Gold gained this round (scores + interest) - not total player gold
        const roundGained = scoresGold + interest;

        // Build stepped content: pantheon (if any), then hands scored, interest, round gained
        const steps = [];
        if (pantheonTotal != null) {
            steps.push({ type: 'pantheon', value: pantheonTotal });
        }
        if (scoresGold > 0) {
            steps.push({ type: 'scores', value: `${scoresCount} hands scored: +${scoresGold}g` });
        }
        if (interest > 0) {
            steps.push({ type: 'interest', value: `Interest (1 per ${rate}g): +${interest}g` });
        }
        if (roundGained > 0) {
            steps.push({ type: 'roundGained', value: roundGained });
        }

        if (steps.length === 0) {
            doOpenShop();
            return;
        }

        let i = 0;
        const stepMs = this.scaleDelay(750);

        const renderStep = (stepIndex) => {
            const s = steps[stepIndex];
            const isPantheon = s.type === 'pantheon';
            const isRoundGained = s.type === 'roundGained';
            cashoutTitle.textContent = isPantheon ? 'Pantheon Total' : 'Cashout';
            cashoutTitle.style.display = '';

            if (isRoundGained) {
                // Gold gained: count-up like scoring accumulation
                cashoutLinesEl.innerHTML = '<div class="gnosis-cashout-line">Gold gained: +<span class="gnosis-cashout-count">0</span>G</div>';
                const countSpan = cashoutLinesEl.querySelector('.gnosis-cashout-count');
                this.animateNumberCount(countSpan, 0, s.value, this.scaleDelay(600), () => {});
            } else {
                const lineHtml = isPantheon
                    ? `<div class="gnosis-cashout-line gnosis-pantheon-value">${s.value}</div>`
                    : `<div class="gnosis-cashout-line">${s.value}</div>`;
                cashoutLinesEl.innerHTML = lineHtml;
            }

            cashoutContent.classList.remove('hidden');
            liveEl.classList.add('cashout-mode');
        };

        const advance = () => {
            if (i >= steps.length) {
                setTimeout(() => {
                    liveEl.classList.remove('cashout-mode');
                    cashoutContent.classList.add('hidden');
                    cashoutTitle.textContent = '';
                    cashoutLinesEl.innerHTML = '';
                    this.updateLiveScoreDisplay(null);
                    Logger.info(`Cashout: scores ${scoresGold}g, interest ${interest}g`);
                    doOpenShop();
                }, this.scaleDelay(800));
                return;
            }
            renderStep(i);
            i++;
            setTimeout(advance, stepMs);
        };
        advance();
    }
    
    // Shop methods (will be expanded in next file)
    openShop() {
        // Interest is now awarded BEFORE shop opens (in showInterestThenOpenShop)
        // This method just opens the shop UI
        
        // Shop logic will be handled by a separate module
        if (window.shopManager) {
            window.shopManager.openShop(this.state, this);
        }
    }

    closeShop() {
        if (window.shopManager) {
            window.shopManager.closeShop();
        } else if (window.uiManager) {
            // Fallback to direct UIManager call
            window.uiManager.closeShop();
        } else {
            Logger.error('No shop manager available to close shop');
            return;
        }
        
        if (this.state.turn === 1 && this.state.scorecard && Object.keys(this.state.scorecard).length === 0) {
            this.startAnte();
        }
        
        // Refresh UI after stage swap so jokers/inventory render correctly
        this.updateAllUI();
    }

    rerollShop() {
        if (window.shopManager) {
            window.shopManager.rerollShop(this.state, this);
        }
    }

    /**
     * Check if game is in a safe state to save
     * Validates valid state, not processing. Saves allowed in shop for resume.
     * @returns {boolean} True if safe to save
     */
    canSave() {
        // Check for invalid game state
        if (!this.state || this.state.gameOver === undefined) {
            Logger.error('Cannot save: Invalid game state');
            return false;
        }
        
        // Check if dice array is valid
        if (!Array.isArray(this.state.dice) || this.state.dice.length !== 5) {
            Logger.error('Cannot save: Invalid dice array');
            return false;
        }
        
        // Check if currently animating
        if (this.state.isAwaitingApi) {
            Logger.debug('Cannot save: Game is processing');
            return false;
        }
        
        return true;
    }

    /**
     * Serialize state for save — ensure jokers, artifacts, consumables, dice, worshipLevels
     * and all critical mechanics are plain objects (guaranteed to persist).
     * @param {Object} state - Live game state
     * @returns {Object} Plain object safe for JSON.stringify
     */
    serializeStateForSave(state) {
        const toPlain = (obj) => (obj && typeof obj.toJSON === 'function' ? obj.toJSON() : obj);
        return {
            ...state,
            dice: Array.isArray(state.dice)
                ? state.dice.map((d, i) => toPlain(d) || { currentFace: 0, dieId: i + 1 })
                : [],
            jokers: Array.isArray(state.jokers)
                ? state.jokers.map(c => toPlain(c)).filter(Boolean)
                : [],
            artifacts: Array.isArray(state.artifacts)
                ? state.artifacts.map(c => toPlain(c)).filter(Boolean)
                : [],
            consumables: Array.isArray(state.consumables)
                ? state.consumables.map(c => toPlain(c)).filter(Boolean)
                : [],
            worshipLevels: state.worshipLevels && typeof state.worshipLevels === 'object'
                ? { ...state.worshipLevels }
                : {},
            scorecard: state.scorecard && typeof state.scorecard === 'object' ? { ...state.scorecard } : {},
            enhancementMap: state.enhancementMap && typeof state.enhancementMap === 'object' ? { ...state.enhancementMap } : {},
            unlockedCategories: state.unlockedCategories && typeof state.unlockedCategories === 'object'
                ? { ...state.unlockedCategories }
                : { 'Sevens': false, 'Eights': false, 'Nines': false, "Pandora's Box": false }
        };
    }

    /**
     * Save the current game state to localStorage
     * @returns {boolean} True if save was successful
     */
    saveGame() {
        if (!this.canSave()) {
            Logger.warn('Save aborted: Game not in safe state');
            return false;
        }
        
        if (this.dataManager) {
            try {
                this.updateResumePhase();
                const state = this.state;
                const serialized = this.serializeStateForSave(state);
                const payload = {
                    gameState: serialized,
                    prngState: this.prng?.getState?.() ?? null,
                    resumePhase: state.resumePhase ?? 'play'
                };
                this.dataManager.saveGame(payload);
                Logger.info('Game saved successfully');
                return true;
            } catch (error) {
                Logger.error('Save failed:', error);
                this.showMessage('Failed to save game!', 3000);
                return false;
            }
        } else {
            Logger.error('DataManager not available');
            return false;
        }
    }

    /**
     * Update state.resumePhase from current UI (shop vs play)
     */
    updateResumePhase() {
        if (!this.state) return;
        const shopStage = document.getElementById('shopStage');
        const inShop = shopStage && !shopStage.classList.contains('hidden');
        this.state.resumePhase = inShop ? 'shop' : 'play';
    }

    /**
     * Rehydrate plain objects from save into Die/Card instances (Balatro: Card:load, CardArea:load)
     * @param {Object} plain - Raw state from JSON.parse
     * @returns {Object} State with class instances restored
     */
    /** Default worship god keys for fallback when loading old saves */
    static get DEFAULT_WORSHIP_LEVELS() {
        return {
            'Artemis': 0, 'Persephone': 0, 'Morpheus': 0, 'Hera': 0,
            'Athena': 0, 'Heracles': 0, 'Hephaestus': 0, 'Ares': 0,
            'Dionysus': 0, 'Hermes': 0, 'Apollo': 0, 'Zeus': 0, 'Nyx': 0,
            'The Pleiades': 0, 'Poseidon': 0, 'The Nine Muses': 0,
            "Pandora's Box": 0
        };
    }

    rehydrateState(plain, prngState = null) {
        if (!plain) return plain;
        const state = { ...plain };

        // Restore PRNG
        const seed = state.seed || 'CONTINUED';
        this.prng = new SeededRNG(seed);
        if (prngState && this.prng?.setState) {
            this.prng.setState(prngState);
        }

        // Worship levels — ensure object with all gods (merge saved into defaults)
        const defaultWorship = GameEngine.DEFAULT_WORSHIP_LEVELS;
        state.worshipLevels = state.worshipLevels && typeof state.worshipLevels === 'object'
            ? { ...defaultWorship, ...state.worshipLevels }
            : { ...defaultWorship };

        // Scorecard, enhancementMap, unlockedCategories — ensure objects
        state.scorecard = state.scorecard && typeof state.scorecard === 'object' ? state.scorecard : {};
        state.enhancementMap = state.enhancementMap && typeof state.enhancementMap === 'object' ? state.enhancementMap : {};
        state.unlockedCategories = state.unlockedCategories && typeof state.unlockedCategories === 'object'
            ? { 'Sevens': false, 'Eights': false, 'Nines': false, "Pandora's Box": false, ...state.unlockedCategories }
            : { 'Sevens': false, 'Eights': false, 'Nines': false, "Pandora's Box": false };

        // held, packs — ensure arrays
        state.held = Array.isArray(state.held) ? state.held : Array(5).fill(false);
        if (state.held.length !== 5) state.held = [...state.held, ...Array(Math.max(0, 5 - state.held.length)).fill(false)].slice(0, 5);
        state.packs = Array.isArray(state.packs) ? state.packs : [];

        // Effect maps and abilities — ensure objects
        state.diceEffects = state.diceEffects && typeof state.diceEffects === 'object' ? state.diceEffects : {};
        state.pipsBonuses = state.pipsBonuses && typeof state.pipsBonuses === 'object' ? state.pipsBonuses : {};
        state.abilities = state.abilities && typeof state.abilities === 'object' ? state.abilities : {};
        state.globalBonuses = state.globalBonuses && typeof state.globalBonuses === 'object' ? state.globalBonuses : {};

        // Dice: plain objects → Die instances
        state.dice = Array.isArray(state.dice) ? state.dice : [];
        state.dice = state.dice.map((d, i) => {
            const die = new Die(i + 1);
            if (d && typeof die.fromJSON === 'function') die.fromJSON(d);
            return die;
        });
        if (state.dice.length < 5) {
            while (state.dice.length < 5) {
                state.dice.push(new Die(state.dice.length + 1));
            }
        }

        // Boons (jokers): plain objects → Joker instances
        state.jokers = Array.isArray(state.jokers) ? state.jokers : [];
        state.jokers = state.jokers.map((saved) => {
            if (!saved || !saved.id) return null;
            const data = CardData?.jokers?.find(j => j.id === saved.id) ?? null;
            if (!data) {
                Logger.warn(`Rehydrate: Boon "${saved.id}" not found in CardData`);
                return null;
            }
            const joker = new Joker(data);
            if (typeof joker.fromJSON === 'function') joker.fromJSON(saved);
            return joker;
        }).filter(Boolean);

        // Artifacts: plain objects → Artifact instances
        state.artifacts = Array.isArray(state.artifacts) ? state.artifacts : [];
        state.artifacts = state.artifacts.map((saved) => {
            if (!saved || !saved.id) return null;
            let data = null;
            if (CardData?.artifacts) {
                for (const pair of Object.values(CardData.artifacts)) {
                    if (pair?.base?.id === saved.id || pair?.upgraded?.id === saved.id) {
                        data = (pair.base?.id === saved.id ? pair.base : pair.upgraded) || pair.base;
                        break;
                    }
                }
            }
            if (!data) {
                Logger.warn(`Rehydrate: Artifact "${saved.id}" not found`);
                return null;
            }
            const artifact = new Artifact(data);
            if (typeof artifact.fromJSON === 'function') artifact.fromJSON(saved);
            return artifact;
        }).filter(Boolean);

        // Consumables: LibationCard or WorshipCard
        state.consumables = Array.isArray(state.consumables) ? state.consumables : [];
        state.consumables = state.consumables.map((saved) => {
            if (!saved || !saved.id) return null;
            const type = saved.type || 'libation';
            let data = (type === 'worship' && CardData?.worship)
                ? CardData.worship.find(c => c.id === saved.id)
                : (CardData?.libations ? CardData.libations.find(c => c.id === saved.id) : null);
            if (!data && CardData?.worship) data = CardData.worship.find(c => c.id === saved.id);
            if (!data) {
                Logger.warn(`Rehydrate: consumable "${saved.id}" not found`);
                return null;
            }
            const isWorship = CardData.worship?.some(w => w.id === saved.id);
            const card = isWorship ? new WorshipCard(data) : new LibationCard(data);
            if (typeof card.fromJSON === 'function') card.fromJSON(saved);
            return card;
        }).filter(Boolean);

        return state;
    }

    /**
     * Load a saved game from localStorage (Balatro: G.FUNCS.start_run with savetext)
     * Restores PRNG state, boons, consumables, and resume phase (shop vs play)
     * @returns {boolean} True if load was successful
     */
    loadGame() {
        const saved = this.dataManager.loadGame();
        if (!saved || !saved.gameState) return false;
        this.state = this.rehydrateState(saved.gameState, saved.prngState);
        this.state.resumePhase = saved.resumePhase ?? this.state.resumePhase ?? 'play';
        this.updateMaxTurns(); // Recompute for unlocked Sevens/Eights/Nines
        this.updateAllUI(true); // Immediate: restore from save
        if (this.state.resumePhase === 'shop' && window.uiManager) {
            // Return to shop: show shop stage and regenerate stock (PRNG restored = same stock)
            window.uiManager.openShop(this.state, this);
        }
        return true;
    }

    /**
     * Format favour value for display – always whole numbers (1, 2, 3).
     * Avoids showing "1.5 favour" from fractional bonuses like ×1.5 mult.
     * @param {number} favour - Favour value to format
     * @returns {string} Formatted favour string (integer)
     */
    formatFavour(favour) {
        const n = Number(favour);
        if (Number.isNaN(n) || n <= 0) return '1';
        return String(Math.round(n));
    }
}