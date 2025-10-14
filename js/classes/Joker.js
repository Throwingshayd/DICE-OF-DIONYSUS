// Joker class - Represents Boons that provide ongoing effects

class Joker extends Card {
    constructor(data) {
        super(data);
        this.type = 'joker';
        this.triggers = data.triggers || ['score']; // When this joker activates
        this.stackable = data.stackable || false; // Can you have multiple copies
        this.conditions = data.conditions || {}; // Conditions for activation
        
        // Balatro-inspired timing system
        this.timing = data.timing || {
            'before_roll': false,    // Effects that trigger before dice are rolled
            'after_roll': false,     // Effects that trigger after dice are rolled
            'before_score': false,   // Effects that trigger before scoring
            'after_score': false,    // Effects that trigger after scoring
            'turn_start': false,     // Effects that trigger at turn start
            'turn_end': false,       // Effects that trigger at turn end
            'shop_enter': false,     // Effects that trigger when entering shop
            'shop_exit': false,      // Effects that trigger when leaving shop
            'hand_effect': false     // Effects that modify the current hand
        };
        
        // Balatro-style dynamic stats tracking (for display on card)
        this.dynamicStats = {
            pips: 0,           // Extra pips provided (e.g., "+20 Pips")
            favour: 0,         // Multiplier bonus (e.g., "x3 Favour")
            gold: 0,           // Gold earned/bonus (e.g., "+5 Gold")
            other: null        // Custom stat (e.g., "3/5 Charges")
        };
    }

    // Main event handler - called when events occur in the game
    onEvent(event, gameState, eventData) {
        if (!this.canUse() || !this.triggers.includes(event)) {
            return eventData;
        }

        // Check conditions if any exist
        if (!this.checkConditions(gameState, eventData)) {
            return eventData;
        }

        // Apply the joker's effect
        const result = this.applyEffect(event, gameState, eventData);
        
        // Track usage
        if (result !== eventData) {
            this.use();
            this.totalValue += this.calculateValueAdded(eventData, result);
        }

        return result;
    }

    // Balatro-inspired timing system
    onTimingEvent(timingEvent, gameState, eventData = null) {
        // Special handling for Proteus' Disguise - mimics other boons
        if (this.id === 'proteus_disguise') {
            return this.applyProteusEffect(timingEvent, gameState, eventData);
        }
        
        if (!this.canUse() || !this.timing[timingEvent]) {
            return eventData;
        }

        // Check conditions if any exist
        if (!this.checkConditions(gameState, eventData)) {
            return eventData;
        }

        // Track boon triggers for Eruption of Etna
        if (timingEvent === 'before_score' && this.id !== 'eruption_of_etna') {
            gameState.boonTriggersThisTurn = (gameState.boonTriggersThisTurn || 0) + 1;
        }

        // Apply the joker's effect based on timing
        const result = this.applyTimingEffect(timingEvent, gameState, eventData);
        
        // Track usage
        if (result !== eventData) {
            this.use();
            this.totalValue += this.calculateValueAdded(eventData, result);
        }

        return result;
    }

    // Apply effects based on timing events
    applyTimingEffect(timingEvent, gameState, eventData) {
        // For turn_start events, we don't need to track value changes
        if (timingEvent === 'turn_start') {
            this.applyTurnStartEffect(gameState, eventData || {});
            return eventData; // Return unchanged to avoid value tracking
        }
        
        const result = eventData ? { ...eventData } : {};

        switch (timingEvent) {
            case 'before_roll':
                return this.applyBeforeRollEffect(gameState, result);
            case 'after_roll':
                return this.applyAfterRollEffect(gameState, result);
            case 'before_score':
                return this.applyBeforeScoreEffect(gameState, result);
            case 'after_score':
                return this.applyAfterScoreEffect(gameState, result);
            case 'turn_end':
                return this.applyTurnEndEffect(gameState, result);
            case 'shop_enter':
                return this.applyShopEnterEffect(gameState, result);
            case 'shop_exit':
                return this.applyShopExitEffect(gameState, result);
            case 'hand_effect':
                return this.applyHandEffect(gameState, result);
            default:
                return result;
        }
    }

    // Check if conditions are met for activation
    checkConditions(gameState, eventData) {
        for (const [condition, value] of Object.entries(this.conditions)) {
            if (!this.checkCondition(condition, value, gameState, eventData)) {
                return false;
            }
        }
        return true;
    }

    // Check a specific condition
    checkCondition(condition, value, gameState, eventData) {
        switch (condition) {
            case 'category':
                return eventData.category === value;
            case 'minPips':
                return eventData.pips >= value;
            case 'maxPips':
                return eventData.pips <= value;
            case 'minDice':
                return gameState.dice.filter(d => d.face === value).length >= this.conditions.minCount;
            case 'turn':
                return gameState.turn === value;
            case 'ante':
                return gameState.ante === value;
            default:
                return true;
        }
    }

    // Apply the specific effect of this joker
    applyEffect(event, gameState, eventData) {
        const result = { ...eventData };

        switch (this.id) {
            // Boons from CSV database only
            case 'hestias_hearth':
                // If all 5 of your dice are odd or all 5 are even the hand gains +3 Favour
                const allOdd = gameState.dice.every(d => d.face % 2 === 1);
                const allEven = gameState.dice.every(d => d.face % 2 === 0);
                if (allOdd || allEven) {
                    result.favour += 3;
                    window.game?.showMessage?.("Hestia's Hearth: +3 Favour!");
                }
                break;

            case 'charons_ferry_fare':
                // Gain +1 Gold after scoring any hand (does not trigger on a scratch)
                if (result.pips > 0) {
                    gameState.gold += 1;
                    window.game?.showMessage?.("Charon's Ferry Fare: +1 Gold!");
                }
                break;

            case 'achilles_heel':
                // All scores gain +10 Pips but you lose 1 Gold at the start of each roll
                result.pips += 10;
                // Gold loss handled in turn start
                break;

            case 'midas_touch':
                // Gain +5 pips for every 10 Gold you have when scoring
                const goldBonus = Math.floor(gameState.gold / 10) * 5;
                result.pips += goldBonus;
                if (goldBonus > 0) {
                    window.game?.showMessage?.(`Midas Touch: +${goldBonus} Pips!`);
                }
                break;

            case 'icarus_wings':
                // Each unused re-roll at the end of a turn gives +10 Pips to the score. Chance to break after turn 1 in 6
                const unusedRerolls = gameState.rollsLeft;
                const rerollBonus = Math.max(0, unusedRerolls * 10);
                result.pips += rerollBonus;
                if (rerollBonus > 0) {
                    window.game?.showMessage?.(`Icarus' Wings: +${rerollBonus} Pips!`);
                }
                // Break chance handled in turn end
                break;

            case 'lethe_waters':
                // All dice with a value of 2 or less are not counted for scoring but your final score gains +15 Pips
                const lowDice = gameState.dice.filter(d => d.face <= 2);
                if (lowDice.length > 0) {
                    result.pips += 15;
                    window.game?.showMessage?.("Lethe Waters: +15 Pips!");
                }
                break;

            case 'forge_of_hephaestus':
                // Gain x0.5 Favour for each unused re-roll you have at the end of the turn (Max x1.5)
                const unusedRerollsForge = gameState.rollsLeft;
                const favourBonus = Math.min(Math.max(0, unusedRerollsForge) * 0.5, 1.5);
                result.favour += favourBonus;
                if (favourBonus > 0) {
                    window.game?.showMessage?.(`Forge of Hephaestus: +${favourBonus} Favour!`);
                }
                break;

            case 'prometheus_gift':
                // Gives +3 Favour to all hands but you have one less re-roll each turn
                result.favour += 3;
                // Reroll penalty handled in turn start
                break;

            case 'chaos_primordial':
                // All Favour gains are increased by 50% but Pips are randomized (1-40)
                result.favour = Math.floor(result.favour * 1.5);
                result.pips = Math.floor(Math.random() * 40) + 1;
                window.game?.showMessage?.("Chaos Primordial: Favour +50%, Pips randomized!");
                break;

            case 'artemis_common':
                // Gain +1 Gold whenever you score 'Ones'
                if (result.category === 'Ones') {
                    gameState.gold += 1;
                    window.game?.showMessage?.("Artemis' Blessing: +1 Gold!");
                }
                break;

            case 'persephone_common':
                // Twos give +2 Pips each when scored
                if (result.category === 'Twos') {
                    const twos = gameState.dice.filter(d => d.face === 2).length;
                    result.pips += twos * 2;
                }
                break;

            case 'persephone_uncommon':
                // After scoring 'Twos' gain +1 Gold per 2 in the hand
                if (result.category === 'Twos') {
                    const twos = gameState.dice.filter(d => d.face === 2).length;
                    gameState.gold += twos;
                    window.game?.showMessage?.(`Spring's Return: +${twos} Gold!`);
                }
                break;

            case 'morpheus_common':
                // Threes give +1 Favour each when scored
                if (result.category === 'Threes') {
                    const threes = gameState.dice.filter(d => d.face === 3).length;
                    result.favour += threes;
                }
                break;

            case 'heracles_rare':
                // gains x1 favour per worship used
                const worshipCount = Object.values(gameState.worshipLevels || {}).reduce((sum, level) => sum + level, 0);
                result.favour += worshipCount;
                if (worshipCount > 0) {
                    window.game?.showMessage?.(`Mt Olympus: +${worshipCount} Favour!`);
                }
                break;

            case 'hera_uncommon':
                // After scoring 'Fours' all other dice in your hand are re-rolled. Add their new values as bonus Pips
                if (result.category === 'Fours') {
                    const nonFours = gameState.dice.filter(d => d.face !== 4);
                    const rerollBonus = nonFours.reduce((sum, die) => sum + Math.floor(Math.random() * 6) + 1, 0);
                    result.pips += rerollBonus;
                    window.game?.showMessage?.(`Queen's Authority: +${rerollBonus} Pips!`);
                }
                break;

            case 'athena_common':
                // For every 5 in a scored 'Fives' hand gain +10 Pips
                if (result.category === 'Fives') {
                    const fives = gameState.dice.filter(d => d.face === 5).length;
                    result.pips += fives * 10;
                }
                break;

            case 'athena_uncommon':
                // After scoring 'Fives' you may hold one extra die above the normal limit for the next turn
                if (result.category === 'Fives') {
                    // Extra hold handled in turn start
                    window.game?.showMessage?.("Strategic Mind: +1 hold capacity next turn!");
                }
                break;

            case 'poseidon_eights_rare':
                // Eights count as 10s for scoring
                if (result.category === 'Eights') {
                    const eights = gameState.dice.filter(d => d.face === 8).length;
                    result.pips += eights * 2; // +2 per eight (8 becomes 10)
                }
                break;

            case 'scaled_of_justice':
                // Balance pips as dice to the average value (rounded)
                const totalPips = gameState.dice.reduce((sum, die) => sum + die.face, 0);
                const averagePips = Math.round(totalPips / 5);
                result.pips = averagePips * 5;
                window.game?.showMessage?.(`Scales of Justice: Balanced to ${averagePips} average!`);
                break;

            case 'parmenides':
                // Lowest 2 dice show -1 (min 0); highest 2 dice show +1 (max 9)
                const sortedDice = [...gameState.dice].sort((a, b) => a.face - b.face);
                const lowestTwo = sortedDice.slice(0, 2);
                const highestTwo = sortedDice.slice(-2);
                
                let adjustment = 0;
                lowestTwo.forEach(die => {
                    if (die.face > 0) adjustment -= 1;
                });
                highestTwo.forEach(die => {
                    if (die.face < 9) adjustment += 1;
                });
                
                result.pips += adjustment;
                if (adjustment !== 0) {
                    window.game?.showMessage?.(`Parmenides: ${adjustment > 0 ? '+' : ''}${adjustment} Pips!`);
                }
                break;

            // Divine Artifacts from CSV database
            case 'artifact_temple_market':
                // Shop inventory size increased by 1
                gameState.shopInventorySize = (gameState.shopInventorySize || 3) + 1;
                window.game?.showMessage?.("Temple Market: Shop inventory size increased by 1!");
                break;

            case 'artifact_clearance_sale':
                // All shop prices reduced by 25%
                gameState.shopPriceMultiplier = (gameState.shopPriceMultiplier || 1) * 0.75;
                window.game?.showMessage?.("Merchants Arrival: All shop prices reduced by 25%!");
                break;

            case 'artifact_crystal_ball':
                // +1 Libation slot
                gameState.libationSlots = (gameState.libationSlots || 3) + 1;
                window.game?.showMessage?.("Crystal Ball: +1 Libation slot!");
                break;

            case 'artifact_telescope':
                // +1 Worship card slot (removed - worship area no longer exists)
                window.game?.showMessage?.("Altar: Worship area removed!");
                break;

            case 'artifact_antimatter':
                // +1 Boon slot
                gameState.boonSlots = (gameState.boonSlots || GAME_BALANCE.STARTING_BOON_SLOTS) + 1;
                window.game?.showMessage?.("Antikythra: +1 Boon slot!");
                break;

            // === NEW BOONS - Epic Tier ===
            case 'sisyphus_boulder':
                // +5 Pips for every time you've rerolled this turn
                const totalRerolls = (GAME_BALANCE.STARTING_ROLLS - gameState.rollsLeft);
                const boulderBonus = totalRerolls * 5;
                result.pips += boulderBonus;
                this.dynamicStats.pips = boulderBonus;
                if (boulderBonus > 0) {
                    window.game?.showMessage?.(`Sisyphus' Boulder: +${boulderBonus} Pips!`);
                }
                break;
            
            case 'hephaestus_forge':
                // Pairs (2 of same number) count as Three of a Kind - handled in scoring logic
                window.game?.showMessage?.("Hephaestus' Forge: Pairs count as Three of a Kind!");
                break;
            
            case 'kronos_hourglass':
                // +2 Rolls permanently (handled in turn_start), score threshold +20% per ante
                break;
            
            case 'the_fates_loom':
                // All dice that show consecutive numbers give ×3 Favour instead of ×2
                // Check for consecutive numbers
                const sortedFaces = [...gameState.dice].map(d => d.face).sort((a, b) => a - b);
                let hasConsecutive = false;
                for (let i = 0; i < sortedFaces.length - 1; i++) {
                    if (sortedFaces[i + 1] === sortedFaces[i] + 1) {
                        hasConsecutive = true;
                        break;
                    }
                }
                if (hasConsecutive) {
                    result.favour += 3; // +3 instead of normal +2
                    window.game?.showMessage?.("The Fates' Loom: ×3 Favour for consecutive dice!");
                }
                break;
            
            case 'pandoras_jar':
                // Every 3rd turn, randomly destroy a Boon and gain ×4 Favour
                if (gameState.turn % 3 === 0 && gameState.boons && gameState.boons.length > 1) {
                    result.favour += 4;
                    window.game?.showMessage?.("Pandora's Jar: ×4 Favour! (Boon destroyed)");
                    // Destruction handled in turn_start
                }
                break;
            
            // === NEW BOONS - Vibrant Tier ===
            case 'demeters_harvest':
                // Each turn, one random die permanently gains +1 (handled in turn_start)
                break;
            
            case 'medusas_gaze':
                // Any die showing 6 cannot be rerolled (handled in after_roll)
                break;
            
            case 'dionysus_revelry':
                // After scoring, randomly set one die (handled in after_score)
                break;
            
            case 'apollos_oracle':
                // Before rolling, see next roll (handled in before_roll)
                break;
            
            case 'hydras_heads':
                // Whenever you score with exactly 2 dice, gain +30 Pips
                const diceUsedCount = gameState.dice.filter(d => d.face > 0).length;
                if (diceUsedCount === 2) {
                    result.pips += 30;
                    window.game?.showMessage?.("Hydra's Heads: +30 Pips for using 2 dice!");
                }
                break;
            
            case 'tantalus_curse':
                // +1 Favour for each gold, but cannot spend gold
                const tantalusFavour = Math.floor(gameState.gold * 1);
                result.favour += tantalusFavour;
                this.dynamicStats.favour = tantalusFavour;
                if (tantalusFavour > 0) {
                    window.game?.showMessage?.(`Tantalus' Curse: +${tantalusFavour} Favour from gold!`);
                }
                // Gold blocking handled in shop
                break;
            
            case 'pegasus_flight':
                // Dice with values 5+ give ×0.5 extra Favour
                const highDice = gameState.dice.filter(d => d.face >= 5).length;
                if (highDice > 0) {
                    result.favour += highDice * 0.5;
                    window.game?.showMessage?.(`Pegasus' Flight: +${highDice * 0.5} Favour from high dice!`);
                }
                break;
            
            case 'cerberus_watch':
                // The first 3 dice you hold each turn gain +5 Pips each
                const heldDice = gameState.dice.filter(d => d.held).slice(0, 3);
                const cerberusBonus = heldDice.length * 5;
                result.pips += cerberusBonus;
                if (cerberusBonus > 0) {
                    window.game?.showMessage?.(`Cerberus' Watch: +${cerberusBonus} Pips for held dice!`);
                }
                break;
            
            case 'orpheus_lyre':
                // Scoring same category twice in a row gives ×2 Favour
                if (gameState.lastScoredCategory === result.category) {
                    result.favour += 2;
                    window.game?.showMessage?.("Orpheus' Lyre: ×2 Favour for repeat category!");
                }
                break;
            
            case 'trojan_horse':
                // After Turn 10, all Boons give ×2 effect
                if (gameState.turn > 10) {
                    result.pips *= 2;
                    result.favour *= 2;
                    window.game?.showMessage?.("The Trojan Horse: ×2 to all Boon effects!");
                }
                break;
            
            // === NEW BOONS - Rustic Tier ===
            case 'lucky_dice_bag':
                // Reroll 1s automatically (handled in after_roll)
                break;
            
            case 'weighted_dice':
                // +1 to all dice values when scoring
                result.pips += gameState.dice.length;
                window.game?.showMessage?.(`Weighted Dice: +${gameState.dice.length} Pips!`);
                break;
            
            case 'philosophers_stone':
                // Convert +3 Favour into +1 Gold (handled in after_score)
                break;
            
            case 'gamblers_charm':
                // 50% chance +2 Gold (handled in after_score)
                break;
            
            case 'marathon_runner':
                // Gain +2 Pips per turn completed this Ante
                const marathonBonus = (gameState.turn - 1) * 2;
                result.pips += marathonBonus;
                this.dynamicStats.pips = marathonBonus;
                if (marathonBonus > 0) {
                    window.game?.showMessage?.(`Marathon Runner: +${marathonBonus} Pips!`);
                }
                break;
            
            case 'golden_touch':
                // Better interest rate (handled in shop/economy)
                break;
            
            case 'the_pantheon':
                // +0.5 Favour for each unique god in Boons
                const gods = new Set();
                gameState.boons.forEach(boon => {
                    if (boon.god) gods.add(boon.god);
                });
                const pantheonFavour = gods.size * 0.5;
                result.favour += pantheonFavour;
                this.dynamicStats.favour = pantheonFavour;
                if (pantheonFavour > 0) {
                    window.game?.showMessage?.(`The Pantheon: +${pantheonFavour} Favour from ${gods.size} gods!`);
                }
                break;
            
            // === NEW BOONS - Wave 2 ===
            case 'mathematicians_compass':
                // +10 Pips if dice sum to even number
                const diceSum = gameState.dice.reduce((sum, die) => sum + die.face, 0);
                if (diceSum % 2 === 0) {
                    result.pips += 10;
                    window.game?.showMessage?.(`Mathematician's Compass: +10 Pips (sum: ${diceSum})!`);
                }
                break;
            
            case 'prime_time':
                // Prime number dice (2,3,5,7) give +1 Pips each (only if unlocked)
                const primes = [2, 3, 5];
                // Add 7 only if Sevens unlocked
                if (gameState.unlockedCategories?.Sevens) {
                    primes.push(7);
                }
                
                const primeCount = gameState.dice.filter(die => primes.includes(die.face)).length;
                
                if (primeCount > 0) {
                    const primeBonus = primeCount * 1;
                    result.pips += primeBonus;
                    window.game?.showMessage?.(`Prime Time: +${primeBonus} Pips from ${primeCount} primes!`);
                }
                break;
            
            case 'the_locksmith':
                // Held dice gain +1 pips for each roll they were held
                let locksmithBonus = 0;
                
                gameState.dice.forEach(die => {
                    if (die.rollsHeld) {
                        locksmithBonus += die.rollsHeld;
                    }
                });
                
                if (locksmithBonus > 0) {
                    result.pips += locksmithBonus;
                    this.dynamicStats.pips = locksmithBonus;
                    window.game?.showMessage?.(`The Locksmith: +${locksmithBonus} Pips from held rolls!`);
                }
                break;
            
            case 'the_heretic':
                // Gain stacking pips (resets on worship use or ante end)
                const hereticPips = gameState.hereticStacks || 0;
                if (hereticPips > 0) {
                    result.pips += hereticPips;
                    this.dynamicStats.pips = hereticPips;
                    window.game?.showMessage?.(`The Heretic: +${hereticPips} Pips!`);
                }
                break;
            
            case 'reckless_abandon':
                // +50 Pips flat bonus
                result.pips += 50;
                window.game?.showMessage?.("Reckless Abandon: +50 Pips!");
                break;
            
            case 'typhon':
                // Apply stored typhon bonus if triggered
                if (gameState.typhonBonus > 0) {
                    result.pips += gameState.typhonBonus;
                    window.game?.showMessage?.(`🌋 Typhon's Power: +${gameState.typhonBonus} Pips!`, 5000);
                    gameState.typhonBonus = 0; // Reset after use
                }
                break;
            
            case 'early_bird':
                // Turns 1-3: +20 Pips, turns 6-13: -5 Pips
                if (gameState.turn >= 1 && gameState.turn <= 3) {
                    result.pips += 20;
                    window.game?.showMessage?.("Early Bird: +20 Pips!");
                } else if (gameState.turn >= 6 && gameState.turn <= 13) {
                    result.pips -= 5;
                    window.game?.showMessage?.("Early Bird: -5 Pips (late game penalty)");
                }
                break;
            
            case 'the_symposium':
                // Each 4 of a kind or greater gives +×1 Favour
                const symposiumFaceCounts = {};
                gameState.dice.forEach(die => {
                    symposiumFaceCounts[die.face] = (symposiumFaceCounts[die.face] || 0) + 1;
                });
                
                const hasFourOfKind = Object.values(symposiumFaceCounts).some(count => count >= 4);
                
                if (hasFourOfKind) {
                    result.favour += 1;
                    window.game?.showMessage?.("The Symposium: +×1 Favour!");
                }
                break;
            
            case 'assembly_of_heroes':
                // If all boon slots are full, gain +15 Pips
                const maxBoonSlots = gameState.boonSlots || GAME_BALANCE.STARTING_BOON_SLOTS;
                const currentBoons = gameState.jokers?.length || 0;
                
                if (currentBoons >= maxBoonSlots) {
                    result.pips += 15;
                    window.game?.showMessage?.(`Assembly of Heroes: +15 Pips (slots full!)!`);
                }
                break;
            
            case 'divine_synergy':
                // Boons of same rarity amplify each other (+5 Pips per match)
                const rarityCounts = {};
                gameState.jokers.forEach(boon => {
                    rarityCounts[boon.rarity] = (rarityCounts[boon.rarity] || 0) + 1;
                });
                
                let synergyBonus = 0;
                Object.values(rarityCounts).forEach(count => {
                    if (count >= 2) {
                        synergyBonus += (count - 1) * 5; // Each match beyond first gives +5
                    }
                });
                
                if (synergyBonus > 0) {
                    result.pips += synergyBonus;
                    this.dynamicStats.pips = synergyBonus;
                    window.game?.showMessage?.(`Divine Synergy: +${synergyBonus} Pips!`);
                }
                break;
            
            case 'first_blood':
                // First score each ante gives +50 Pips
                const categoriesScored = Object.keys(gameState.scorecard).length;
                
                if (categoriesScored === 0) {
                    result.pips += 50;
                    window.game?.showMessage?.("First Blood: +50 Pips!");
                }
                break;
            
            case 'midnight_oil':
                // Turn 12+ gives +24 Pips
                if (gameState.turn >= 12) {
                    result.pips += 24;
                    window.game?.showMessage?.("Midnight Oil: +24 Pips!");
                }
                break;
            
            case 'doubling_season':
                // Double even numbers, -1 to odd numbers except 1
                let seasonAdjustment = 0;
                
                gameState.dice.forEach(die => {
                    if (die.face % 2 === 0) {
                        // Even: double the value (add the face value)
                        seasonAdjustment += die.face;
                    } else if (die.face > 1) {
                        // Odd (except 1): -1
                        seasonAdjustment -= 1;
                    }
                    // 1 stays as is (no adjustment)
                });
                
                if (seasonAdjustment !== 0) {
                    result.pips += seasonAdjustment;
                    window.game?.showMessage?.(`Doubling Season: ${seasonAdjustment > 0 ? '+' : ''}${seasonAdjustment} Pips!`);
                }
                break;
            
            case 'symmetry':
                // Apply accumulated favour from palindromes
                if (this.symmetryFavour > 0) {
                    result.favour += this.symmetryFavour;
                    this.dynamicStats.favour = this.symmetryFavour;
                }
                break;
            
            case 'misery':
                // If you have 0 gold, gain ×2 Favour
                if (gameState.gold === 0) {
                    result.favour += 2;
                    window.game?.showMessage?.("Misery: ×2 Favour (broke!)");
                }
                break;
            
            case 'the_zealot':
                // Give +1 favour if scoring matches last worship god's category
                if (gameState.lastWorshipGod) {
                    const godToCategory = {
                        'Artemis': 'Ones', 'Persephone': 'Twos', 'Morpheus': 'Threes',
                        'Hera': 'Fours', 'Athena': 'Fives', 'Heracles': 'Sixes',
                        'The Pleiades': 'Sevens', 'Poseidon': 'Eights', 'The Nine Muses': 'Nines',
                        'Hephaestus': 'Three of a Kind', 'Ares': 'Four of a Kind', 
                        'Dionysus': 'Full House', 'Hermes': 'Small Straight', 
                        'Apollo': 'Large Straight', 'Zeus': 'Yahtzee', 'Nyx': 'Chance'
                    };
                    
                    const zealotCategory = godToCategory[gameState.lastWorshipGod];
                    
                    if (result.category === zealotCategory) {
                        result.favour += 1;
                        window.game?.showMessage?.(`The Zealot: +×1 Favour (${gameState.lastWorshipGod})!`);
                    }
                }
                break;
            
            case 'the_odyssey':
                // If all available categories are scored, gain +500 pips
                const allCategories = [
                    'Ones', 'Twos', 'Threes', 'Fours', 'Fives', 'Sixes',
                    'Three of a Kind', 'Four of a Kind', 'Full House',
                    'Small Straight', 'Large Straight', 'Yahtzee', 'Chance'
                ];
                
                // Add unlocked categories (7s, 8s, 9s)
                if (gameState.unlockedCategories?.Sevens) allCategories.push('Sevens');
                if (gameState.unlockedCategories?.Eights) allCategories.push('Eights');
                if (gameState.unlockedCategories?.Nines) allCategories.push('Nines');
                
                const odysseyScored = allCategories.filter(cat => gameState.scorecard[cat] !== undefined).length;
                const odysseyTotal = allCategories.length;
                
                if (odysseyScored === odysseyTotal && !gameState.odysseyAwarded) {
                    result.pips += 500;
                    gameState.odysseyAwarded = true;
                    window.game?.showMessage?.(`🏆 THE ODYSSEY COMPLETE! +500 Pips! (${odysseyTotal}/${odysseyTotal})`, 6000);
                }
                break;
            
            case 'eruption_of_etna':
                // If 3+ boons triggered this turn, +1 favour (cumulative, doesn't reset)
                const etnaTriggersThisTurn = gameState.boonTriggersThisTurn || 0;
                
                if (etnaTriggersThisTurn >= 3) {
                    if (!this.etnaFavourStacks) {
                        this.etnaFavourStacks = 0;
                    }
                    this.etnaFavourStacks += 1;
                    window.game?.showMessage?.(`🌋 Eruption of Etna: +×1 Favour (${etnaTriggersThisTurn} boons)!`);
                }
                
                // Apply accumulated favour
                if (this.etnaFavourStacks > 0) {
                    result.favour += this.etnaFavourStacks;
                    this.dynamicStats.favour = this.etnaFavourStacks;
                }
                break;

            default:
                // Unknown joker effect - log for debugging but don't break the game
                Logger.warn(`Unknown joker effect: ${this.id} - this boon may not function correctly`);
                // Return unchanged result to prevent game-breaking
                break;
        }

        return result;
    }

    // Balatro-inspired timing effect methods
    applyBeforeRollEffect(gameState, result) {
        switch (this.id) {
            case 'achilles_heel':
                // Achilles Heel: lose 1 Gold at the start of each roll
                if (gameState.gold > 0) {
                    gameState.gold -= 1;
                    window.game?.showMessage?.("Achilles' Heel: -1 Gold!");
                }
                break;
            case 'prometheus_gift':
                // Prometheus' Gift: one less re-roll each turn
                gameState.rollsLeft = Math.max(1, gameState.rollsLeft - 1);
                window.game?.showMessage?.("Prometheus' Gift: -1 re-roll!");
                break;
        }
        return result;
    }

    applyAfterRollEffect(gameState, result) {
        // Effects that trigger after dice are rolled
        switch (this.id) {
            case 'lucky_dice_bag':
                // Reroll any 1s automatically (once per die per turn)
                gameState.dice.forEach(die => {
                    if (die.face === 1 && !die.hasBeenRerolled) {
                        die.roll();
                        die.hasBeenRerolled = true;
                        window.game?.showMessage?.("Lucky Dice Bag: Rerolled a 1!");
                    }
                });
                break;
            
            case 'medusas_gaze':
                // Any die showing 6 cannot be rerolled (auto-hold)
                gameState.dice.forEach(die => {
                    if (die.face === 6) {
                        die.held = true;
                    }
                });
                window.game?.showMessage?.("Medusa's Gaze: All 6s are held!");
                break;
            
            case 'the_locksmith':
                // Track rolls held for each die
                gameState.dice.forEach(die => {
                    if (die.held) {
                        die.rollsHeld = (die.rollsHeld || 0) + 1;
                    }
                });
                break;
            
            case 'reckless_abandon':
                // Force all dice to be unheld - no strategy allowed!
                gameState.dice.forEach(die => {
                    die.held = false;
                });
                break;
            
            case 'symmetry':
                // Detect palindromic dice patterns and add permanent favour
                const symmetryValues = gameState.dice.map(d => d.face);
                const isSymmetric = symmetryValues.every((val, idx) => 
                    val === symmetryValues[symmetryValues.length - 1 - idx]
                );
                
                if (isSymmetric) {
                    if (!this.symmetryFavour) {
                        this.symmetryFavour = 0;
                    }
                    this.symmetryFavour += 0.5;
                    
                    window.game?.showMessage?.(`✨ Symmetry: Palindrome detected! [${symmetryValues.join('-')}] Card gains +0.5 Favour!`, 4000);
                    Logger.info(`Symmetry triggered! Pattern: [${symmetryValues.join('-')}], Total favour: ${this.symmetryFavour}`);
                }
                break;
            
            case 'typhon':
                // Check if this is the first roll of the turn and all dice show 1
                const isFirstRoll = (gameState.rollsLeft === (GAME_BALANCE.STARTING_ROLLS - 1));
                const allOnes = gameState.dice.every(die => die.face === 1);
                
                if (isFirstRoll && allOnes) {
                    const typhonBonus = Math.floor(gameState.scoreThreshold * 0.9);
                    gameState.typhonBonus = typhonBonus;
                    window.game?.showMessage?.(`🌋 TYPHON AWAKENS! All 1s = +${typhonBonus} Pips!`, 6000);
                    Logger.info(`Typhon triggered! Incredibly rare event - 1 in 7,776 chance!`);
                }
                break;
            
            case 'smog_of_morpheus':
                // After final roll, transform 2s and 4s to 3s
                if (gameState.rollsLeft === 0) {
                    let morpheusTransformed = 0;
                    
                    gameState.dice.forEach(die => {
                        if (die.face === 2 || die.face === 4) {
                            die.face = 3;
                            morpheusTransformed++;
                        }
                    });
                    
                    if (morpheusTransformed > 0) {
                        window.game?.showMessage?.(`Smog of Morpheus: ${morpheusTransformed} dice → 3 (final roll)!`, 3000);
                    }
                }
                break;
        }
        return result;
    }
    
    // Special handler for Proteus - mimics other boons
    applyProteusEffect(timingEvent, gameState, eventData) {
        // Get the boon to mimic this turn
        if (!gameState.proteusMimicId) {
            return eventData; // No mimic selected yet
        }
        
        // Find the boon to mimic
        const mimickedBoon = gameState.jokers?.find(b => b.id === gameState.proteusMimicId);
        if (!mimickedBoon || !mimickedBoon.timing[timingEvent]) {
            return eventData; // Boon not found or doesn't have this timing
        }
        
        // Execute the mimicked boon's timing effect
        try {
            return mimickedBoon.applyTimingEffect(timingEvent, gameState, eventData);
        } catch (error) {
            Logger.error(`Proteus failed to mimic ${gameState.proteusMimicId}:`, error);
            return eventData;
        }
    }

    applyBeforeScoreEffect(gameState, result) {
        switch (this.id) {
            case 'hestias_hearth':
                // Hestia's Hearth favour is now applied directly in favour calculation
                // This case is kept for compatibility but doesn't add favour here
                break;

            case 'achilles_heel':
                // All scores gain +15 Pips
                result.pips += 15;
                break;

            case 'midas_touch':
                // Gain +5 pips for every 10 Gold you have when scoring
                const goldBonus = Math.floor(gameState.gold / 10) * 5;
                result.pips += goldBonus;
                if (goldBonus > 0) {
                    window.game?.showMessage?.(`Midas Touch: +${goldBonus} Pips!`);
                }
                break;

            case 'icarus_wings':
                // Each unused re-roll at the end of a turn gives +15 Pips to the score
                const unusedRerolls = gameState.rollsLeft;
                const rerollBonus = Math.max(0, unusedRerolls * 15);
                result.pips += rerollBonus;
                if (rerollBonus > 0) {
                    window.game?.showMessage?.(`Icarus' Wings: +${rerollBonus} Pips!`);
                }
                break;

            case 'lethe_waters':
                // All dice with a value of 2 or less are not counted for scoring but your final score gains +25 Pips
                const lowDice = gameState.dice.filter(d => d.face <= 2);
                if (lowDice.length > 0) {
                    result.pips += 25;
                    window.game?.showMessage?.("Lethe Waters: +25 Pips!");
                }
                break;

            case 'forge_of_hephaestus':
                // Forge of Hephaestus favour is now applied directly in favour calculation
                // This case is kept for compatibility but doesn't add favour here
                break;

            case 'prometheus_gift':
                // Prometheus' Gift favour is now applied directly in favour calculation
                // This case is kept for compatibility but doesn't add favour here
                break;

            case 'chaos_primordial':
                // All Favour gains are increased by 50% but Pips are randomized (1-40)
                result.favour = Math.floor(result.favour * 1.5);
                result.pips = Math.floor(Math.random() * 40) + 1;
                window.game?.showMessage?.("Chaos Primordial: Favour +50%, Pips randomized!");
                break;

            case 'persephone_common':
                // Twos give +2 Pips each when scored
                if (result.category === 'Twos') {
                    const twos = gameState.dice.filter(d => d.face === 2).length;
                    result.pips += twos * 2;
                }
                break;

            case 'morpheus_common':
                // Morpheus' Dream favour is now applied directly in favour calculation
                // This case is kept for compatibility but doesn't add favour here
                break;

            case 'heracles_rare':
                // Mt Olympus favour is now applied directly in favour calculation
                // This case is kept for compatibility but doesn't add favour here
                break;

            case 'athena_common':
                // For every 5 in a scored 'Fives' hand gain +10 Pips
                if (result.category === 'Fives') {
                    const fives = gameState.dice.filter(d => d.face === 5).length;
                    result.pips += fives * 10;
                }
                break;

            case 'poseidon_eights_rare':
                // Eights count as 10s for scoring
                if (result.category === 'Eights') {
                    const eights = gameState.dice.filter(d => d.face === 8).length;
                    result.pips += eights * 2; // +2 per eight (8 becomes 10)
                }
                break;

            case 'scaled_of_justice':
                // Balance pips as dice to the average value (rounded)
                const totalPips = gameState.dice.reduce((sum, die) => sum + die.face, 0);
                const averagePips = Math.round(totalPips / 5);
                result.pips = averagePips * 5;
                window.game?.showMessage?.(`Scales of Justice: Balanced to ${averagePips} average!`);
                break;

            case 'parmenides':
                // Lowest 2 dice show -1 (min 0); highest 2 dice show +1 (max 9)
                const sortedDice = [...gameState.dice].sort((a, b) => a.face - b.face);
                const lowestTwo = sortedDice.slice(0, 2);
                const highestTwo = sortedDice.slice(-2);
                
                let adjustment = 0;
                lowestTwo.forEach(die => {
                    if (die.face > 0) adjustment -= 1;
                });
                highestTwo.forEach(die => {
                    if (die.face < 9) adjustment += 1;
                });
                
                result.pips += adjustment;
                if (adjustment !== 0) {
                    window.game?.showMessage?.(`Parmenides: ${adjustment > 0 ? '+' : ''}${adjustment} Pips!`);
                }
                break;
        }
        return result;
    }

    applyAfterScoreEffect(gameState, result) {
        switch (this.id) {
            case 'charons_ferry_fare':
                // Gain +1 Gold after scoring any hand (does not trigger on a scratch)
                if (result.pips > 0) {
                    gameState.gold += 1;
                    window.game?.showMessage?.("Charon's Ferry Fare: +1 Gold!");
                }
                break;

            case 'artemis_common':
                // Gain +1 Gold whenever you score 'Ones'
                if (result.category === 'Ones') {
                    gameState.gold += 1;
                    window.game?.showMessage?.("Artemis' Blessing: +1 Gold!");
                }
                break;

            case 'persephone_uncommon':
                // After scoring 'Twos' gain +1 Gold per 2 in the hand
                if (result.category === 'Twos') {
                    const twos = gameState.dice.filter(d => d.face === 2).length;
                    gameState.gold += twos;
                    window.game?.showMessage?.(`Spring's Return: +${twos} Gold!`);
                }
                break;

            case 'hera_uncommon':
                // After scoring 'Fours' all other dice in your hand are re-rolled. Add their new values as bonus Pips
                if (result.category === 'Fours') {
                    const nonFours = gameState.dice.filter(d => d.face !== 4);
                    const rerollBonus = nonFours.reduce((sum, die) => sum + Math.floor(Math.random() * 6) + 1, 0);
                    result.pips += rerollBonus;
                    window.game?.showMessage?.(`Queen's Authority: +${rerollBonus} Pips!`);
                }
                break;

            case 'athena_uncommon':
                // After scoring 'Fives' you may hold one extra die above the normal limit for the next turn
                if (result.category === 'Fives') {
                    // Extra hold handled in turn start
                    window.game?.showMessage?.("Strategic Mind: +1 hold capacity next turn!");
                }
                break;
            
            // === NEW BOONS - After Score ===
            case 'dionysus_revelry':
                // After scoring, randomly set one die to random value 1-6 for next turn
                const revelryDie = gameState.dice[Math.floor(Math.random() * gameState.dice.length)];
                const randomValue = Math.floor(Math.random() * 6) + 1;
                revelryDie.face = randomValue;
                window.game?.showMessage?.(`Dionysus' Revelry: One die set to ${randomValue}!`);
                break;
            
            case 'philosophers_stone':
                // Convert +3 Favour into +1 Gold
                if (result.favour >= 3) {
                    const goldGained = Math.floor(result.favour / 3);
                    if (window.game && typeof window.game.updateGoldAnimated === 'function') {
                        window.game.updateGoldAnimated(goldGained, "Philosopher's Stone");
                    } else {
                        gameState.gold += goldGained;
                    }
                    window.game?.showMessage?.(`Philosopher's Stone: +${goldGained} Gold from Favour!`);
                }
                break;
            
            case 'gamblers_charm':
                // 50% chance to gain +2 Gold
                if (Math.random() < 0.5) {
                    if (window.game && typeof window.game.updateGoldAnimated === 'function') {
                        window.game.updateGoldAnimated(2, "Gambler's Charm");
                    } else {
                        gameState.gold += 2;
                    }
                    window.game?.showMessage?.("Gambler's Charm: +2 Gold! Lucky!");
                } else {
                    window.game?.showMessage?.("Gambler's Charm: No luck this time.");
                }
                break;
            
            case 'early_bird':
                // Turns 4-5: +2 Gold
                if (gameState.turn === 4 || gameState.turn === 5) {
                    if (window.game && typeof window.game.updateGoldAnimated === 'function') {
                        window.game.updateGoldAnimated(2, "Early Bird");
                    } else {
                        gameState.gold += 2;
                    }
                    window.game?.showMessage?.("Early Bird: +2 Gold!");
                }
                break;
        }
        return result;
    }

    applyTurnStartEffect(gameState, result) {
        switch (this.id) {
            case 'achilles_heel':
                // Achilles Heel: lose 1 Gold at the start of each roll
                if (gameState.gold > 0) {
                    gameState.gold -= 1;
                    window.game?.showMessage?.("Achilles' Heel: -1 Gold!");
                }
                break;
            case 'prometheus_gift':
                // Prometheus' Gift: one less re-roll each turn
                gameState.rollsLeft = Math.max(1, gameState.rollsLeft - 1);
                window.game?.showMessage?.("Prometheus' Gift: -1 re-roll!");
                break;
            
            // === NEW BOONS - Turn Start ===
            case 'kronos_hourglass':
                // +2 Rolls permanently
                gameState.rollsLeft = (GAME_BALANCE.STARTING_ROLLS + 2);
                window.game?.showMessage?.("Kronos' Hourglass: +2 rolls!");
                break;
            
            case 'pandoras_jar':
                // Every 3rd turn, randomly destroy a Boon
                if (gameState.turn % 3 === 0 && gameState.boons && gameState.boons.length > 1) {
                    const randomIndex = Math.floor(Math.random() * gameState.boons.length);
                    const destroyed = gameState.boons.splice(randomIndex, 1)[0];
                    window.game?.showMessage?.(`Pandora's Jar: ${destroyed.name} destroyed!`, 3000);
                }
                break;
            
            case 'demeters_harvest':
                // Each turn, one random die permanently gains +1 (max 9)
                const harvestDie = gameState.dice[Math.floor(Math.random() * gameState.dice.length)];
                const faceKeys = Object.keys(harvestDie.faces);
                const randomFaceKey = faceKeys[Math.floor(Math.random() * faceKeys.length)];
                const currentValue = harvestDie.faces[randomFaceKey].modifiedValue || harvestDie.faces[randomFaceKey].value;
                
                if (currentValue < 9) {
                    harvestDie.faces[randomFaceKey].modifiedValue = currentValue + 1;
                    window.game?.showMessage?.(`Demeter's Harvest: Die face ${randomFaceKey} → ${currentValue + 1}!`);
                }
                break;
            
            case 'the_locksmith':
                // Reset roll tracking at start of each turn
                gameState.dice.forEach(die => {
                    die.rollsHeld = 0;
                });
                break;
            
            case 'the_heretic':
                // Increment heretic stacks each turn
                if (!gameState.hereticStacks) {
                    gameState.hereticStacks = 0;
                }
                gameState.hereticStacks += 2;
                break;
            
            case 'midnight_oil':
                // Turn 12+: lose 1 roll
                if (gameState.turn >= 12) {
                    gameState.rollsLeft = Math.max(1, gameState.rollsLeft - 1);
                    window.game?.showMessage?.("Midnight Oil: -1 roll!");
                }
                break;
            
            case 'parmenides_die':
                // Clear previous parmenides marks
                gameState.dice.forEach(d => {
                    d.isParmenidesDie = false;
                    d.oppositeValue = null;
                });
                
                // Mark one random die as dual-value
                const parmenidesDie = gameState.dice[Math.floor(Math.random() * gameState.dice.length)];
                parmenidesDie.isParmenidesDie = true;
                parmenidesDie.oppositeValue = 7 - parmenidesDie.face;
                
                window.game?.showMessage?.(`Parmenides: Die showing ${parmenidesDie.face} is now dual-value (${parmenidesDie.face}↔${parmenidesDie.oppositeValue})!`, 4000);
                Logger.info(`Parmenides activated: Die value ${parmenidesDie.face} also counts as ${parmenidesDie.oppositeValue}`);
                break;
            
            case 'proteus_disguise':
                // Pick a random boon to mimic (cannot repeat last turn's choice)
                const proteusOtherBoons = gameState.jokers.filter(b => 
                    b.id !== 'proteus_disguise' && b.id !== gameState.proteusLastMimicId
                );
                
                if (proteusOtherBoons.length > 0) {
                    const randomBoon = proteusOtherBoons[Math.floor(Math.random() * proteusOtherBoons.length)];
                    gameState.proteusLastMimicId = gameState.proteusMimicId; // Store last for next turn
                    gameState.proteusMimicId = randomBoon.id;
                    
                    window.game?.showMessage?.(`Proteus' Disguise: Now mimicking ${randomBoon.name}!`, 3000);
                    Logger.info(`Proteus mimicking: ${randomBoon.name}`);
                } else {
                    gameState.proteusMimicId = null;
                }
                break;
        }
        // No return value needed for turn_start effects
    }

    applyTurnEndEffect(gameState, result) {
        switch (this.id) {
            case 'icarus_wings':
                // Chance to break after turn 1 in 8
                if (gameState.turn > 1 && Math.random() < 1/8) {
                    // Break the joker (remove it)
                    const jokerIndex = gameState.jokers.findIndex(j => j.id === this.id);
                    if (jokerIndex !== -1) {
                        gameState.jokers.splice(jokerIndex, 1);
                        window.game?.showMessage?.("Icarus' Wings: The wings broke!");
                    }
                }
                break;
        }
        return result;
    }

    applyShopEnterEffect(gameState, result) {
        // Effects that trigger when entering the shop
        return result;
    }

    applyShopExitEffect(gameState, result) {
        // Effects that trigger when leaving the shop
        return result;
    }

    applyHandEffect(gameState, result) {
        // Effects that modify the current hand
        return result;
    }

    // Helper method to check for three of the same face
    hasThreeOfSameFace(dice) {
        const counts = {};
        dice.forEach(die => {
            counts[die.face] = (counts[die.face] || 0) + 1;
        });
        return Object.values(counts).some(count => count >= 3);
    }

    // Helper method to check for exactly three of a kind
    hasExactlyThreeOfAKind(dice) {
        const counts = {};
        dice.forEach(die => {
            counts[die.face] = (counts[die.face] || 0) + 1;
        });
        return Object.values(counts).some(count => count === 3);
    }

    // Helper method to count pairs
    countPairs(dice) {
        const counts = {};
        dice.forEach(die => {
            counts[die.face] = (counts[die.face] || 0) + 1;
        });
        return Object.values(counts).filter(count => count === 2).length;
    }

    // Calculate value added by this joker
    calculateValueAdded(original, modified) {
        // Handle null/undefined cases (e.g., turn_start events)
        if (!original || !modified) {
            return 0;
        }
        
        // Ensure both objects have the required properties
        const originalPips = original.pips || 0;
        const originalFavour = original.favour || 0;
        const modifiedPips = modified.pips || 0;
        const modifiedFavour = modified.favour || 0;
        
        const originalTotal = originalPips * originalFavour;
        const modifiedTotal = modifiedPips * modifiedFavour;
        return modifiedTotal - originalTotal;
    }

    // Get ongoing effects this joker provides
    getOngoingEffects() {
        const effects = [];
        
        switch (this.id) {
            case 'hermes_sandals':
                effects.push({ type: 'extra_roll', value: 1 });
                break;
            case 'cerberus_collar':
                effects.push({ type: 'base_favour', value: 1 });
                effects.push({ type: 'rolls_penalty', value: -1 });
                break;
            case 'cornucopia':
                effects.push({ type: 'interest_cap', value: 1 });
                break;
            case 'titans_grip':
                effects.push({ type: 'max_held', value: 2 });
                break;
            default:
                // No ongoing effects
                break;
        }
        
        return effects;
    }

    // Check if this joker affects dice rolling
    affectsDiceRoll() {
        return ['aegis_shield', 'fate_spinner', 'probability_god'].includes(this.id);
    }

    // Apply dice roll effects
    applyDiceRollEffect(dice, gameState, prng) {
        switch (this.id) {
            case 'aegis_shield':
                // Duplicate first held die
                const firstHeld = gameState.held.findIndex(h => h);
                if (firstHeld !== -1 && gameState.held.filter(h => h).length === 1) {
                    const heldDie = dice[firstHeld];
                    dice.forEach((die, index) => {
                        if (!gameState.held[index] && die.face === 0) {
                            die.face = heldDie.face;
                            return; // Exit the forEach early
                        }
                    });
                }
                break;
                
            case 'probability_god':
                dice.forEach(die => {
                    if (prng.random() < 0.5) {
                        while (die.face !== 6 && prng.random() < 0.8) {
                            die.roll(prng);
                        }
                    }
                });
                break;
                
            default:
                // No dice roll effects
                break;
        }
    }

    // Get description with current state
    getDetailedDescription() {
        let desc = this.effect;
        
        if (this.timesTriggered > 0) {
            desc += ` (Triggered ${this.timesTriggered} times, +${this.totalValue} value)`;
        }
        
        if (!this.isActive) {
            desc += ' [DISABLED]';
        }
        
        return desc;
    }

    // Check synergy with other jokers
    synergizesWith(otherCard) {
        if (!(otherCard instanceof Joker)) return false;
        
        // God-based synergies
        if (this.god && otherCard.god && this.god === otherCard.god) {
            return true;
        }
        
        // Effect-based synergies
        const synergies = {
            'high_roller': ['lions_mane'], // Both benefit from 6s
            'warrior_rage': ['god_killer'], // Both boost of-a-kind hands
            'golden_fleece': ['chaos_primordial'], // High pip synergy
        };
        
        return synergies[this.id]?.includes(otherCard.id) || 
               synergies[otherCard.id]?.includes(this.id);
    }

    // Get the current favour value this boon provides (for display on card)
    getCurrentFavourValue(gameState) {
        if (!gameState) return 0;
        
        switch (this.id) {
            case 'heracles_rare': // Mt Olympus
                // +1 favour per worship used
                const worshipCount = Object.values(gameState.worshipLevels || {}).reduce((sum, level) => sum + level, 0);
                return worshipCount;
                
            case 'prometheus_gift':
                // +3 favour to all hands
                return 3;
                
            case 'forge_of_hephaestus':
                // +0.5 favour per unused reroll (max 1.5)
                const unusedRerolls = gameState.rollsLeft || 0;
                return Math.min(Math.max(0, unusedRerolls) * 0.5, 1.5);
                
            case 'morpheus_common':
                // +1 favour per three in the current hand
                if (gameState.dice && gameState.dice.length > 0) {
                    const threes = gameState.dice.filter(d => d.getEffectiveFace() === 3).length;
                    return threes;
                }
                return 0;
                
            case 'hestias_hearth':
                // +3 favour if all dice are odd or even
                if (gameState.dice && gameState.dice.length > 0) {
                    const allFaces = gameState.dice.map(d => d.getEffectiveFace());
                    const allOdd = allFaces.every(face => face % 2 === 1);
                    const allEven = allFaces.every(face => face % 2 === 0);
                    return (allOdd || allEven) ? 3 : 0;
                }
                return 0;
                
            default:
                return 0;
        }
    }

    /**
     * Balatro-style dynamic stat display - Returns array of stats to show on card
     * @param {Object} gameState - Current game state
     * @returns {Array<{value: string, type: string}>} Array of stats to display
     * @example
     * // Returns: [{ value: "+20 Pips", type: "pips" }, { value: "x3", type: "favour" }]
     */
    getDynamicDisplayStats(gameState) {
        if (!gameState) return [];
        
        const stats = [];
        
        // Check dynamic stats tracking
        if (this.dynamicStats.pips > 0) {
            stats.push({ value: `+${this.dynamicStats.pips}`, type: 'pips' });
        }
        
        if (this.dynamicStats.favour > 0) {
            stats.push({ value: `x${this.dynamicStats.favour}`, type: 'favour' });
        } else {
            // Check for favour from getCurrentFavourValue() for backwards compatibility
            const favour = this.getCurrentFavourValue(gameState);
            if (favour > 0) {
                stats.push({ value: `x${favour}`, type: 'favour' });
            }
        }
        
        if (this.dynamicStats.gold > 0) {
            stats.push({ value: `+${this.dynamicStats.gold}g`, type: 'gold' });
        }
        
        if (this.dynamicStats.other) {
            stats.push({ value: this.dynamicStats.other, type: 'other' });
        }
        
        // Boon-specific dynamic displays (examples from your creative ideas)
        switch (this.id) {
            case 'experience_points':
                // Example: "Experience Points" boon that gains pips per 100 score
                const totalScore = Object.values(gameState.scorecard || {})
                    .filter(v => typeof v === 'number')
                    .reduce((sum, v) => sum + v, 0);
                const gainedPips = Math.floor(totalScore / 100) * 10;
                if (gainedPips > 0) {
                    stats.push({ value: `+${gainedPips}`, type: 'pips' });
                }
                break;
                
            case 'lucky_sevens':
                // Example: Shows count of 7s rolled this game
                const sevenCount = this.timesTriggered || 0;
                if (sevenCount > 0) {
                    stats.push({ value: `${sevenCount} 7s`, type: 'other' });
                }
                break;
                
            case 'interest_accumulator':
                // Example: Shows gold earned from interest
                const goldEarned = this.dynamicStats.gold || 0;
                if (goldEarned > 0) {
                    stats.push({ value: `+${goldEarned}g`, type: 'gold' });
                }
                break;
                
            case 'charge_based_boon':
                // Example: Shows charges (e.g., "3/5")
                if (this.maxUses > 0) {
                    stats.push({ value: `${this.usesLeft}/${this.maxUses}`, type: 'other' });
                }
                break;
        }
        
        return stats;
    }

    // Static method to create joker from game data
    static fromData(data) {
        return new Joker(data);
    }
}