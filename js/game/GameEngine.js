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
            dice: Array(5).fill(0).map((_, index) => new Die(index + 1)),
            held: Array(5).fill(false),
            rollsLeft: 3, // FIXED: Always start with 3 rolls
            hasRolled: false,
            
            // Scoring
            scorecard: {},
            totalScore: 0,
            scoreThreshold: 300,
            
            // Progression
            turn: 1,
            ante: 1,
            maxTurns: 13,
            endlessMode: false,
            
            // Economy
            gold: 15,
            baseFavour: 1.5,
            
            // Collections
            jokers: [],
            artifacts: [],
            consumables: [],
            
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
        
        // Shop buttons
        const closeShopBtn = document.getElementById('closeShop');
        if (closeShopBtn) {
            closeShopBtn.addEventListener('click', () => this.closeShop());
        }
        
        const rerollShopBtn = document.getElementById('rerollShop');
        if (rerollShopBtn) {
            rerollShopBtn.addEventListener('click', () => this.rerollShop());
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

    startAnte() {
        const anteIndex = this.state.ante - 1;
        let currentAnteData;
        
        if (this.state.endlessMode) {
            const randomBlindIndex = Math.floor(this.prng.random() * AnteData.length);
            currentAnteData = AnteData[randomBlindIndex];
        } else {
            currentAnteData = AnteData[anteIndex] || AnteData[AnteData.length - 1];
        }
        
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

    // Dice rolling and holding
    rollDice() {
        // FIXED: Simple, bulletproof roll mechanics
        if (this.state.rollsLeft <= 0 || this.state.gameOver || this.state.isAwaitingApi) {
            return;
        }
        
        // Apply joker effects that trigger at turn start (Balatro-inspired timing)
        this.applyJokerTurnStartEffects();
        
        // Apply joker effects that trigger at roll start (legacy)
        this.applyJokerRollEffects();
        
        // FIXED: Simple decrement - no complex logic
        this.state.rollsLeft--;
        this.state.hasRolled = true;
        
        // Add Balatro-style rolling effects
        if (window.balatroEffects && this.dom.diceContainer) {
            const diceElements = this.dom.diceContainer.querySelectorAll('.die');
            diceElements.forEach((dieElement, index) => {
                if (!this.state.held[index]) {
                    // Add rolling animation with slight delay for each die
                    setTimeout(() => {
                        window.balatroEffects.addDiceRollEffect(dieElement);
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
                        this.state.gold -= 1;
                        window.game?.showMessage?.("Achilles' Heel: -1 Gold!");
                    }
                    break;
            }
        });
    }

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

    // Scoring system
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
            
            this.state.scorecard[category] = finalScore;
            this.state.totalScore += finalScore;
        } else {
            this.state.scorecard[category] = 0;
        }

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
        
        // Gain gold for scoring (increased from +1 to +2 for better economy)
        this.state.gold += 2;
        this.showMessage("+2 Gold for scoring!");
        
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

    cancelScore() {
        this.state.pendingCategory = null;
        if (this.domReady && this.dom.confirmOverlay) {
            this.dom.confirmOverlay.classList.add('hidden');
        }
    }

    calculateScore(category) {
        // Check if category is locked (for 7s, 8s, 9s)
        if (['Sevens', 'Eights', 'Nines'].includes(category) && !this.state.unlockedCategories[category]) {
            return { pips: 0, favour: 0, isValid: false };
        }
        
        const faces = this.state.dice.map(d => {
            let face = d.getEffectiveFace();
            
            // Apply substitutions
            if (this.state.diceSubstitutions.foursAsFives && face === 4) {
                face = 5;
            }
            
            return face;
        });
        
        const counts = faces.reduce((acc, val) => {
            acc[val] = (acc[val] || 0) + 1;
            return acc;
        }, {});
        
        let pips = 0;
        let isValid = false;
        
        // Calculate base score
        switch (category) {
            case "Ones": case "Twos": case "Threes": case "Fours": case "Fives": case "Sixes":
            case "Sevens": case "Eights": case "Nines":
                const num = parseInt(category.match(/\d/)?.[0] || category === "Ones" ? 1 : category === "Twos" ? 2 : category === "Threes" ? 3 : category === "Fours" ? 4 : category === "Fives" ? 5 : category === "Sixes" ? 6 : category === "Sevens" ? 7 : category === "Eights" ? 8 : 9);
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
                if (Object.values(counts).some(c => c >= 3)) {
                    pips = faces.reduce((a, b) => a + b, 0);
                    if (this.state.pipsBonuses.threeOfKindBonus) {
                        pips += this.state.pipsBonuses.threeOfKindBonus;
                    }
                    isValid = true;
                }
                break;
                
            case "Four of a Kind":
                if (Object.values(counts).some(c => c >= 4)) {
                    pips = faces.reduce((a, b) => a + b, 0);
                    if (this.state.pipsBonuses.fourOfKindBonus) {
                        pips += this.state.pipsBonuses.fourOfKindBonus;
                    }
                    isValid = true;
                }
                break;
                
            case "Full House":
                if (Object.values(counts).includes(3) && Object.values(counts).includes(2)) {
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
                            if (run >= 4) break;
                        } else if (uniqueFaces[i] !== uniqueFaces[i-1]) {
                            run = 1;
                        }
                    }
                    if (run >= 4) {
                        pips = 30;
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
                            if (run >= 5) break;
                        } else if (uniqueFaces[i] !== uniqueFaces[i-1]) {
                            run = 1;
                        }
                    }
                    if (run >= 5) {
                        pips = 40;
                        isValid = true;
                    }
                }
                break;
                
            case "Yahtzee":
                if (Object.values(counts).some(c => c >= 5)) {
                    pips = 50;
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
        if (isValid) {
            const lowerSectionBonuses = {
                'Three of a Kind': 15,
                'Four of a Kind': 20,
                'Full House': 25,
                'Small Straight': 30,
                'Large Straight': 40,
                'Yahtzee': 50
            };
            if (lowerSectionBonuses[category]) {
                pips += lowerSectionBonuses[category];
            }
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
                this.state.gold += 1;
                window.game?.showMessage?.("Gold enhancement: +1 Gold!");
            }
            
            // Iron enhancement provides +5 pips when scored (face-specific only)
            if (die.hasEnhancementForCurrentFace && die.hasEnhancementForCurrentFace('iron')) {
                pips += 5;
                window.game?.showMessage?.("Iron enhancement: +5 Pips!");
            }
            
            // Parchment enhancement: 1/6 chance for +1 favour, 1/15 chance for 15 gold (face-specific only)
            if (die.hasEnhancementForCurrentFace && die.hasEnhancementForCurrentFace('parchment')) {
                const parchmentRoll = Math.random();
                if (parchmentRoll < 1/6) {
                    favour += 1;
                    window.game?.showMessage?.("Parchment blessing: +1 Favour!");
                }
                if (parchmentRoll < 1/15) {
                    this.state.gold += 15;
                    window.game?.showMessage?.("Parchment fortune: +15 Gold!");
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
                const wildEffect = Math.random() < 0.5 ? 1 : -1;
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
            let boonSlots = 5;
            let consumableSlots = 2;
            
            this.state.artifacts.forEach(artifact => {
                switch (artifact.id) {
                    case 'faded_map_plus':
                        boonSlots += 1;
                        break;
                    case 'offering_pouch':
                        consumableSlots += 1;
                        break;
                    case 'offering_pouch_plus':
                        consumableSlots += 2;
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
                    const libation = new HouseRuleCard(CardData.libations[Math.floor(this.prng.random() * CardData.libations.length)]);
                    this.state.consumables.push(libation);
                    this.showMessage(`Ritual fulfilled! Gained ${libation.name}.`);
                    if (hasRitualKnife && !hasSacrificialDagger) this.state.lowerSanctumStreak = 0;
                } else {
                    this.showMessage("Ritual fulfilled, but your Offering slots are full!");
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
    showMessage(text, duration = 3000) {
        if (this.domReady && this.dom.messagePopup) {
            this.dom.messagePopup.textContent = text;
            this.dom.messagePopup.classList.add('show');
            setTimeout(() => {
                this.dom.messagePopup.classList.remove('show');
            }, duration);
        }
    }

    // Shop methods (will be expanded in next file)
    openShop() {
        // Shop logic will be handled by a separate module
        if (window.shopManager) {
            window.shopManager.openShop(this.state, this);
        }
    }

    closeShop() {
        if (window.shopManager) {
            window.shopManager.closeShop();
        }
        
        // If this was an end-of-ante shop, start the next ante
        if (this.state.turn === 1 && this.state.scorecard && Object.keys(this.state.scorecard).length === 0) {
            this.startAnte();
        }
        
        this.updateAllUI();
    }

    rerollShop() {
        if (window.shopManager) {
            window.shopManager.rerollShop(this.state, this);
        }
    }

    // toggleSellMode removed - using direct sell method instead
    


    // Save/Load functionality
    saveGame() {
        this.dataManager.saveGame(this.state);
    }

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