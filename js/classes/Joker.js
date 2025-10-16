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
        let result = this.applyTimingEffect(timingEvent, gameState, eventData);
        
        // Reflection of Narcissus: Apply effect a second time (but not for narcissus itself)
        const hasNarcissus = gameState.jokers?.some(j => j.id === 'reflection_of_narcissus');
        if (hasNarcissus && this.id !== 'reflection_of_narcissus' && !gameState.narcissusDoubling) {
            gameState.narcissusDoubling = true; // Prevent infinite loops
            result = this.applyTimingEffect(timingEvent, gameState, result);
            gameState.narcissusDoubling = false;
        }
        
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
        
        // For ante_end events, handle similarly
        if (timingEvent === 'ante_end') {
            this.applyAnteEndEffect(gameState, eventData || {});
            return eventData;
        }
        
        // For sell events, handle similarly
        if (timingEvent === 'sell') {
            this.applySellEffect(gameState, eventData || {});
            return eventData;
        }
        
        const result = eventData ? { ...eventData } : {};

        let processedResult;
        switch (timingEvent) {
            case 'before_roll':
                processedResult = this.applyBeforeRollEffect(gameState, result);
                break;
            case 'after_roll':
                processedResult = this.applyAfterRollEffect(gameState, result);
                break;
            case 'before_score':
                processedResult = this.applyBeforeScoreEffect(gameState, result);
                break;
            case 'after_score':
                processedResult = this.applyAfterScoreEffect(gameState, result);
                break;
            case 'turn_end':
                processedResult = this.applyTurnEndEffect(gameState, result);
                break;
            case 'shop_enter':
                processedResult = this.applyShopEnterEffect(gameState, result);
                break;
            case 'shop_exit':
                processedResult = this.applyShopExitEffect(gameState, result);
                break;
            case 'hand_effect':
                processedResult = this.applyHandEffect(gameState, result);
                break;
            default:
                processedResult = result;
                break;
        }
        
        // Apply The Trojan Horse artifact multiplier (if active)
        const multiplier = gameState.boonMultiplier || 1;
        if (multiplier !== 1 && processedResult) {
            if (processedResult.pips !== undefined) {
                processedResult.pips = Math.floor(processedResult.pips * multiplier);
                // EDGE CASE: Ensure pips never negative
                processedResult.pips = Math.max(0, processedResult.pips);
            }
            if (processedResult.favour !== undefined) {
                processedResult.favour = processedResult.favour * multiplier;
                // EDGE CASE: Ensure favour never negative
                processedResult.favour = Math.max(0, processedResult.favour);
            }
            if (processedResult.favourMult !== undefined && processedResult.favourMult > 1) {
                // Apply multiplier to multiplicative favour as well
                processedResult.favourMult = processedResult.favourMult * multiplier;
                // EDGE CASE: Ensure favourMult never below 1
                processedResult.favourMult = Math.max(1, processedResult.favourMult);
            }
            if (processedResult.gold !== undefined) {
                processedResult.gold = Math.floor(processedResult.gold * multiplier);
            }
        }
        
        return processedResult;
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

    // === TIMING-BASED EFFECT METHODS (Main Implementation) ===

    // Apply effects before rolling dice
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
                let medusaSixes = 0;
                gameState.dice.forEach(die => {
                    if (die.face === 6) {
                        die.held = true;
                        medusaSixes++;
                    }
                });
                if (medusaSixes > 0) {
                    window.game?.showMessage?.(`Medusa's Gaze: ${medusaSixes} sixes held!`);
                }
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
            
            case 'marathon_runner':
                // Increment pips after each roll
                if (!this.marathonPips) {
                    this.marathonPips = 0;
                }
                this.marathonPips += 1;
                
                // Update dynamic display to show progress towards 42km goal
                this.dynamicStats.pips = this.marathonPips;
                const scratchCount = this.marathonScratches || 0;
                this.dynamicStats.other = scratchCount > 0 ? `💀${scratchCount}/3` : `${this.marathonPips}/42`;
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
        // Ensure favourMult is initialized (for Balatro-style multiplicative favour)
        if (result.favourMult === undefined) {
            result.favourMult = 1;
        }
        
        switch (this.id) {
            case 'sisyphus_boulder':
                // +5 Pips for every time you've rerolled this turn
                const totalRerolls = (GAME_BALANCE.STARTING_ROLLS - gameState.rollsLeft);
                const boulderBonus = totalRerolls * BOON_EFFECTS.SISYPHUS_BOULDER.PIPS_PER_REROLL;
                result.pips += boulderBonus;
                this.dynamicStats.pips = boulderBonus;
                if (boulderBonus > 0) {
                    window.game?.showMessage?.(`Sisyphus' Boulder: +${boulderBonus} Pips!`);
                }
                break;
            
            
            case 'pandoras_jar':
                // Every 3rd turn, randomly destroy a Boon and gain +2 Favour (stacking)
                if (gameState.turn % 3 === 0 && gameState.jokers && gameState.jokers.length > 1) {
                    // Stack favour on the boon itself
                    if (!this.pandoraFavourStacks) {
                        this.pandoraFavourStacks = 0;
                    }
                    this.pandoraFavourStacks += 2;
                    window.game?.showMessage?.("Pandora's Jar: +2 Favour (stacking)! Boon will be destroyed.");
                    // Destruction handled in turn_start
                }
                
                // Apply accumulated stacks
                if (this.pandoraFavourStacks > 0) {
                    result.favour += this.pandoraFavourStacks;
                    this.dynamicStats.favour = this.pandoraFavourStacks;
                }
                break;
            
            // === CORE BOONS - Previously Missing ===
            case 'achilles_heel':
                // +15 Pips (in addition to -1 gold penalty in turn_start)
                result.pips += 15;
                window.game?.showMessage?.("Achilles' Heel: +15 Pips!");
                break;
            
            case 'midas_touch':
                // +1 pip per 5 Gold
                const midasGold = Math.floor(gameState.gold / 5);
                const midasBonus = midasGold * 1;
                if (midasBonus > 0) {
                    result.pips += midasBonus;
                    this.dynamicStats.pips = midasBonus;
                    window.game?.showMessage?.(`Midas Touch: +${midasBonus} Pips from ${midasGold * 5} gold!`);
                }
                break;
            
            case 'lethe_waters':
                // +25 Pips flat bonus (ignoring 1-2s is cosmetic/handled elsewhere)
                result.pips += 25;
                window.game?.showMessage?.("Lethe Waters: +25 Pips!");
                break;
            
            case 'icarus_wings':
                // +10 Pips per unused roll (in addition to break chance in turn_end)
                const unusedRolls = gameState.rollsLeft;
                const icarusBonus = unusedRolls * 10;
                if (icarusBonus > 0) {
                    result.pips += icarusBonus;
                    this.dynamicStats.pips = icarusBonus;
                    window.game?.showMessage?.(`Icarus' Wings: +${icarusBonus} Pips from ${unusedRolls} unused rolls!`);
                }
                break;
            
            case 'hestias_hearth':
                // +3 Favour if all dice are odd OR all dice are even
                const allOdd = gameState.dice.every(die => die.face % 2 === 1);
                const allEven = gameState.dice.every(die => die.face % 2 === 0);
                
                if (allOdd || allEven) {
                    result.favour += 3;
                    window.game?.showMessage?.(`Hestia's Hearth: +3 Favour (all ${allOdd ? 'odd' : 'even'})!`);
                }
                break;
            
            case 'prometheus_gift':
                // +3 Favour all hands (in addition to -1 roll penalty in turn_start)
                result.favour += 3;
                window.game?.showMessage?.("Prometheus' Gift: +3 Favour!");
                break;
            
            case 'forge_of_hephaestus':
                // +0.5 Favour per unused roll (max +1.5)
                const forgeUnusedRolls = gameState.rollsLeft;
                const forgeFavour = Math.min(forgeUnusedRolls * 0.5, 1.5);
                if (forgeFavour > 0) {
                    result.favour += forgeFavour;
                    this.dynamicStats.favour = forgeFavour;
                    window.game?.showMessage?.(`Forge of Hephaestus: +${forgeFavour} Favour from ${forgeUnusedRolls} unused rolls!`);
                }
                break;
            
            case 'mt_olympus':
                // +1 Favour for each Worship card used this run
                const worshipUsed = gameState.worshipCardsUsed || 0;
                if (worshipUsed > 0) {
                    result.favour += worshipUsed;
                    this.dynamicStats.favour = worshipUsed;
                    window.game?.showMessage?.(`Mt Olympus: +${worshipUsed} Favour from worship cards!`);
                }
                break;
            
            case 'chaos_primordial':
                // Doubles all Favour gains (applied by multiplying final favour before score calculation)
                // This acts like a permanent ×2 on the favour component
                // Since favour is already calculated, we add the current favour again (doubling it)
                const currentFavour = result.favour || 0;
                result.favour += currentFavour; // Effectively doubles it
                if (currentFavour > 0) {
                    window.game?.showMessage?.(`Chaos Primordial: Favour doubled!`);
                }
                break;
            
            // === NEW BOONS - Vibrant Tier ===
            // (Placeholder cases removed - effects now in proper timing methods)
            
            case 'hydras_heads':
                // Whenever you score with exactly 2 dice, gain +3 Favour
                const diceUsedCount = gameState.dice.filter(d => d.face > 0).length;
                if (diceUsedCount === 2) {
                    result.favour += 3;
                    window.game?.showMessage?.("Hydra's Heads: +×3 Favour for using 2 dice!");
                }
                break;
            
            case 'medusas_gaze':
                // Lower sanctum scores give ×0.5 favour bonus
                const lowerSanctum = ['Three of a Kind', 'Four of a Kind', 'Full House', 
                                     'Small Straight', 'Large Straight', 'Yahtzee', 'Chance'];
                if (lowerSanctum.includes(result.category)) {
                    result.favour += 0.5;
                    window.game?.showMessage?.("Medusa's Gaze: ×0.5 Favour (lower sanctum)!");
                }
                break;
            
            case 'tantalus_curse':
                // +0.1 Favour for each gold, but cannot spend gold
                const tantalusFavour = gameState.gold * 0.1;
                result.favour += tantalusFavour;
                this.dynamicStats.favour = tantalusFavour;
                if (tantalusFavour > 0) {
                    window.game?.showMessage?.(`Tantalus' Curse: +${tantalusFavour} Favour from gold!`);
                }
                // Gold blocking handled in shop
                break;
            
            case 'pegasus_flight':
                // Dice with values 6+ give ×0.5 extra Favour
                const highDice = gameState.dice.filter(d => d.face >= 6).length;
                if (highDice > 0) {
                    result.favour += highDice * 0.5;
                    window.game?.showMessage?.(`Pegasus' Flight: +${highDice * 0.5} Favour from high dice!`);
                }
                break;
            
            case 'cerberus_watch':
                // The first 3 dice you hold each turn gain +3 Pips each
                const heldDice = gameState.dice.filter(d => d.held).slice(0, 3);
                const cerberusBonus = heldDice.length * 3;
                result.pips += cerberusBonus;
                if (cerberusBonus > 0) {
                    window.game?.showMessage?.(`Cerberus' Watch: +${cerberusBonus} Pips for held dice!`);
                }
                break;
            
            case 'apollos_oracle':
                // Apollo's Oracle: reduce score by 20%
                result.pips = Math.floor(result.pips * 0.8);
                window.game?.showMessage?.("Apollo's Oracle: -20% score penalty!");
                break;
            
            case 'trojan_horse':
                // After Turn 10, all Boons give ×2 effect (handled by global multiplier in applyTimingEffect)
                // Show big activation message at turn 11
                if (gameState.turn === 11) {
                    window.game?.showMessage?.("🐴 THE TROJAN HORSE ACTIVATES! All boons now ×2!", 5000);
                    Logger.info("Trojan Horse activated at turn 11 - all boons now doubled!");
                }
                break;
            
            // === NEW BOONS - Rustic Tier ===
            case 'lucky_dice_bag':
                // Reroll 1s automatically (handled in after_roll)
                break;
            
            case 'gamblers_charm':
                // 50% chance +2 Gold (handled in after_score)
                break;
            
            case 'marathon_runner':
                // Gain +1 Pips per roll taken (stacks, destroyed at 42+ or scratch)
                const marathonPips = this.marathonPips || 0;
                
                if (marathonPips > 0) {
                    result.pips += marathonPips;
                    this.dynamicStats.pips = marathonPips;
                    window.game?.showMessage?.(`Marathon Runner: +${marathonPips} Pips!`);
                }
                break;
            
            case 'golden_touch':
                // Better interest rate (handled in shop/economy)
                break;
            
            // === NEW BOONS - Wave 2 ===
            case 'mathematicians_compass':
                // +10 Pips if dice sum is divisible by 10
                const diceSum = gameState.dice.reduce((sum, die) => sum + die.face, 0);
                if (diceSum % 10 === 0) {
                    result.pips += 10;
                    window.game?.showMessage?.(`Mathematician's Compass: +10 Pips (sum: ${diceSum})!`);
                }
                break;
            
            case 'prime_time':
                // Prime dice (2,3,5,7) give bonus based on count: [1,2,3,5,7]
                const primes = [2, 3, 5];
                // Add 7 only if Sevens unlocked
                if (gameState.unlockedCategories?.Sevens) {
                    primes.push(7);
                }
                
                const primeCount = gameState.dice.filter(die => primes.includes(die.face)).length;
                
                // Bonus sequence: 1 prime=+1, 2=+2, 3=+3, 4=+5, 5=+7
                const primeBonusSequence = [0, 1, 2, 3, 5, 7]; // Index 0 unused, index 1-5 are bonuses
                
                if (primeCount > 0) {
                    const primeBonus = primeBonusSequence[primeCount] || 0;
                    result.pips += primeBonus;
                    this.dynamicStats.pips = primeBonus;
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
                    this.dynamicStats.other = `🚫 No Worship`;
                    window.game?.showMessage?.(`The Heretic: +${hereticPips} Pips (stacking)!`);
                } else {
                    this.dynamicStats.other = 'Building...';
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
                    window.game?.showMessage?.("🌅 Early Bird: +20 Pips! (Morning phase)");
                    this.dynamicStats.other = '☀️ Morning';
                } else if (gameState.turn >= 6 && gameState.turn <= 13) {
                    result.pips -= 5;
                    window.game?.showMessage?.("Early Bird: -5 Pips (late game penalty)");
                    this.dynamicStats.other = '🌙 Evening';
                } else {
                    // Turns 4-5 (gold phase)
                    this.dynamicStats.other = '💰 Midday';
                }
                break;
            
            case 'the_symposium':
                // Each 4 of a kind or greater gives +0.05 Favour (stacking)
                const symposiumFaceCounts = {};
                gameState.dice.forEach(die => {
                    symposiumFaceCounts[die.face] = (symposiumFaceCounts[die.face] || 0) + 1;
                });
                
                const hasFourOfKind = Object.values(symposiumFaceCounts).some(count => count >= 4);
                
                if (hasFourOfKind) {
                    // Stack favour on the boon itself
                    if (!this.symposiumFavourStacks) {
                        this.symposiumFavourStacks = 0;
                    }
                    this.symposiumFavourStacks += 0.05;
                    result.favour += this.symposiumFavourStacks;
                    this.dynamicStats.favour = this.symposiumFavourStacks;
                    window.game?.showMessage?.(`The Symposium: +${this.symposiumFavourStacks.toFixed(2)} Favour!`);
                } else if (this.symposiumFavourStacks > 0) {
                    // Still apply accumulated stacks even if not triggering this turn
                    result.favour += this.symposiumFavourStacks;
                    this.dynamicStats.favour = this.symposiumFavourStacks;
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
                    result.pips += BOON_EFFECTS.FIRST_BLOOD.FIRST_SCORE_BONUS;
                    window.game?.showMessage?.("⚔️ First Blood: +50 Pips! (First score of Ante)", 3000);
                    this.dynamicStats.other = '✓ USED';
                } else {
                    this.dynamicStats.other = '✗ Next Ante';
                }
                break;
            
            case 'midnight_oil':
                // Turn 12+ gives +24 Pips
                if (gameState.turn >= BOON_EFFECTS.MIDNIGHT_OIL.LATE_GAME_TURN) {
                    result.pips += BOON_EFFECTS.MIDNIGHT_OIL.PIPS_BONUS;
                    window.game?.showMessage?.("🕯️ Midnight Oil: +24 Pips! (Late game boost)", 2500);
                    this.dynamicStats.other = '✓ ACTIVE';
                } else {
                    this.dynamicStats.other = `T${BOON_EFFECTS.MIDNIGHT_OIL.LATE_GAME_TURN - gameState.turn}`;
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
            
            case 'eruption_of_etna':
                // If 3+ boons triggered this turn, +1 favour (cumulative, doesn't reset)
                const etnaTriggersThisTurn = gameState.boonTriggersThisTurn || 0;
                
                if (etnaTriggersThisTurn >= 3) {
                    if (!this.etnaFavourStacks) {
                        this.etnaFavourStacks = 0;
                    }
                    this.etnaFavourStacks += 1;
                    window.game?.showMessage?.(`🌋 Eruption of Etna: +×1 Favour (${etnaTriggersThisTurn} boons triggered)!`, 3000);
                }
                
                // Apply accumulated favour
                if (this.etnaFavourStacks > 0) {
                    result.favour += this.etnaFavourStacks;
                    this.dynamicStats.favour = this.etnaFavourStacks;
                }
                
                // Always show trigger count for player feedback
                this.dynamicStats.other = `🎴${etnaTriggersThisTurn}`;
                break;
            
            case 'ascetics_vow':
                // Gain +1 favour for each empty boon slot
                const asceticMaxSlots = gameState.boonSlots || GAME_BALANCE.STARTING_BOON_SLOTS;
                const asceticFilledSlots = gameState.jokers?.length || 0;
                const asceticEmptySlots = asceticMaxSlots - asceticFilledSlots;
                
                if (asceticEmptySlots > 0) {
                    result.favour += asceticEmptySlots;
                    this.dynamicStats.favour = asceticEmptySlots;
                    window.game?.showMessage?.(`Ascetic's Vow: +×${asceticEmptySlots} Favour (${asceticEmptySlots} empty)!`);
                }
                break;
            
            case 'nyxian_seduction':
                // Chance category: +69 Pips, seduce (reduce) random god's favour
                if (result.category === 'Chance') {
                    result.pips += 69;
                    
                    // Pick a random god to seduce (75% male preference)
                    const maleGods = ['Ares', 'Apollo', 'Zeus', 'Hermes', 'Heracles', 
                                     'Hephaestus', 'Dionysus', 'Morpheus'];
                    const femaleGods = ['Artemis', 'Persephone', 'Hera', 'Athena', 'Nyx'];
                    
                    // Add unlocked gods
                    if (gameState.unlockedCategories?.Eights) maleGods.push('Poseidon');
                    if (gameState.unlockedCategories?.Sevens) femaleGods.push('The Pleiades');
                    if (gameState.unlockedCategories?.Nines) femaleGods.push('The Nine Muses');
                    
                    // 75% male, 25% female
                    const targetPool = Math.random() < 0.75 ? maleGods : femaleGods;
                    const seducedGod = targetPool[Math.floor(Math.random() * targetPool.length)];
                    
                    // Reduce their worship level
                    if (gameState.worshipLevels[seducedGod] > 0) {
                        gameState.worshipLevels[seducedGod] -= 1;
                        window.game?.showMessage?.(`💋 Nyxian Seduction: +69 Pips, ${seducedGod} worship -1!`, 3000);
                    }
                }
                break;
            
            case 'gold_standard':
                // All gold enhancements give +3 Pips
                let goldEnhancementCount = 0;
                
                gameState.dice.forEach(die => {
                    const currentFace = die.face;
                    if (die.faces[currentFace] && die.faces[currentFace].enhancements.has('gold')) {
                        goldEnhancementCount++;
                    }
                });
                
                if (goldEnhancementCount > 0) {
                    const goldBonus = goldEnhancementCount * 3;
                    result.pips += goldBonus;
                    window.game?.showMessage?.(`Gold Standard: +${goldBonus} Pips from ${goldEnhancementCount} gold!`);
                }
                break;
            
            case 'carillon_of_the_muses':
                // If all 5 dice have enhancements, gain ×3 Favour (×5 if all same)
                let carillonEnhancedCount = 0;
                const carillonEnhancementTypes = new Set();
                
                gameState.dice.forEach(die => {
                    const currentFace = die.face;
                    if (die.faces[currentFace] && die.faces[currentFace].enhancements.size > 0) {
                        carillonEnhancedCount++;
                        // Track first enhancement type for each die
                        const firstEnhancement = Array.from(die.faces[currentFace].enhancements)[0].enhancement;
                        carillonEnhancementTypes.add(firstEnhancement);
                    }
                });
                
                if (carillonEnhancedCount === 5) {
                    if (carillonEnhancementTypes.size === 1) {
                        // SECRET BONUS: All same enhancement! (MULTIPLICATIVE!)
                        result.favourMult *= 2.5;  // ×2.5 MULTIPLICATIVE (Balatro-style)
                        window.game?.showMessage?.("🎵 Carillon of the Muses: PERFECT HARMONY! ×2.5 Favour!", 5000);
                        Logger.info("Carillon secret bonus triggered: All same enhancement - MULTIPLICATIVE!");
                    } else {
                        // All enhanced but different (ADDITIVE)
                        result.favour += 3;
                        window.game?.showMessage?.("Carillon of the Muses: +3 Favour!");
                    }
                }
                break;
            
            case 'journey_of_perseus':
                // Gain +10 pips per 100 total score
                const perseusTotal = gameState.totalScore || 0;
                const perseusBonus = Math.floor(perseusTotal / 100) * 10;
                
                if (perseusBonus > 0) {
                    result.pips += perseusBonus;
                    this.dynamicStats.pips = perseusBonus;
                    window.game?.showMessage?.(`Journey of Perseus: +${perseusBonus} Pips!`);
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
    applyAfterScoreEffect(gameState, result) {
        switch (this.id) {
            case 'charons_ferry_fare':
                // Gain +1 Gold after scoring any hand (does not trigger on a scratch)
                if (result.finalScore && result.finalScore > 0) {
                    if (window.game && typeof window.game.updateGoldAnimated === 'function') {
                        window.game.updateGoldAnimated(1, "Charon's Ferry Fare");
                    } else {
                        gameState.gold += 1;
                    }
                    window.game?.showMessage?.("Charon's Ferry Fare: +1 Gold!");
                }
                break;

            case 'artemis_common':
                // Gain +1 Gold whenever you score 'Ones' (not on scratches)
                if (result.category === 'Ones' && result.finalScore > 0) {
                    if (window.game && typeof window.game.updateGoldAnimated === 'function') {
                        window.game.updateGoldAnimated(1, "Artemis' Blessing");
                    } else {
                        gameState.gold += 1;
                    }
                    window.game?.showMessage?.("Artemis' Blessing: +1 Gold!");
                }
                break;

            case 'persephone_uncommon':
                // After scoring 'Twos' gain +1 Gold per 2 in the hand (not on scratches)
                if (result.category === 'Twos' && result.finalScore > 0) {
                    const twos = gameState.dice.filter(d => d.face === 2).length;
                    if (window.game && typeof window.game.updateGoldAnimated === 'function') {
                        window.game.updateGoldAnimated(twos, "Spring's Return");
                    } else {
                        gameState.gold += twos;
                    }
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
                // Dionysus' Revelry handled in scoring logic - allows 2 pairs to score as Full House
                // No after_score effect needed
                break;
            
            case 'gamblers_charm':
                // 50% chance +2 Gold, 50% chance lose 1 gold
                if (Math.random() < 0.5) {
                    if (window.game && typeof window.game.updateGoldAnimated === 'function') {
                        window.game.updateGoldAnimated(2, "Gambler's Charm");
                    } else {
                        gameState.gold += 2;
                    }
                    window.game?.showMessage?.("Gambler's Charm: +2 Gold! Lucky!");
                } else {
                    if (window.game && typeof window.game.updateGoldAnimated === 'function') {
                        window.game.updateGoldAnimated(-1, "Gambler's Charm");
                    } else {
                        gameState.gold = Math.max(0, gameState.gold - 1);
                    }
                    window.game?.showMessage?.("Gambler's Charm: -1 Gold! Unlucky!");
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
            
            case 'marathon_runner':
                // Track scratches (3 strikes, you're out!) or reaching 42km
                if (!result.isValid) {
                    // Increment scratch count
                    this.marathonScratches = (this.marathonScratches || 0) + 1;
                    
                    if (this.marathonScratches >= 3) {
                        // 3 scratches = destroyed!
                        const marathonIndex = gameState.jokers.findIndex(j => j.id === 'marathon_runner');
                        if (marathonIndex !== -1) {
                            gameState.jokers.splice(marathonIndex, 1);
                            window.game?.showMessage?.("💀 Marathon Runner: 3 scratches! Exhausted and destroyed!", 4000);
                            Logger.info("Marathon Runner destroyed - 3 scratches");
                        }
                    } else {
                        // Show warning
                        window.game?.showMessage?.(`⚠️ Marathon Runner: Scratch ${this.marathonScratches}/3!`, 3000);
                        // Reset pips on scratch
                        this.marathonPips = 0;
                    }
                } else if (this.marathonPips >= 42) {
                    // Reached 42km - destroy with fanfare!
                    const marathonIndex = gameState.jokers.findIndex(j => j.id === 'marathon_runner');
                    if (marathonIndex !== -1) {
                        gameState.jokers.splice(marathonIndex, 1);
                        window.game?.showMessage?.("🏅 Marathon Runner: 42km complete! Mission accomplished!", 5000);
                        Logger.info("Marathon Runner destroyed - 42km (marathon) reached");
                    }
                }
                break;
        }
        return result;
    }

    applyTurnStartEffect(gameState, result) {
        // Reset dynamic stats at turn start for clean slate
        this.dynamicStats = {
            pips: 0,
            favour: 0,
            gold: 0,
            other: null
        };
        
        // Reset boon trigger counter for Eruption of Etna tracking
        gameState.boonTriggersThisTurn = 0;
        
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
            
            case 'chaos_primordial':
                // Chaos Primordial: one less re-roll each turn (in addition to favour doubling)
                gameState.rollsLeft = Math.max(1, gameState.rollsLeft - 1);
                window.game?.showMessage?.("Chaos Primordial: -1 re-roll!");
                break;
            
            case 'apollos_oracle':
                // Apollo's Oracle: +1 reroll per turn
                gameState.rollsLeft += 1;
                window.game?.showMessage?.("Apollo's Oracle: +1 reroll!");
                break;
            
            // === NEW BOONS - Turn Start ===
            case 'kronos_hourglass':
                // At start of turn, set a random number of rerolls for this turn (1-5)
                // Use seeded RNG if available on gameEngine; fall back to Math.random()
                try {
                    const engine = window.game || null;
                    const rand = (engine && engine.prng && typeof engine.prng.random === 'function')
                        ? engine.prng.random()
                        : Math.random();
                    // Rolls per turn = random integer in [1, 5]
                    const rollsThisTurn = Math.floor(rand * 5) + 1;
                    gameState.rollsLeft = rollsThisTurn;
                    window.game?.showMessage?.(`Kronos' Hourglass: ${rollsThisTurn} rerolls this turn!`);
                } catch (e) {
                    // Safe fallback
                    const rollsThisTurn = Math.floor(Math.random() * 5) + 1;
                    gameState.rollsLeft = rollsThisTurn;
                    window.game?.showMessage?.(`Kronos' Hourglass: ${rollsThisTurn} rerolls this turn!`);
                }
                break;
            
            case 'pandoras_jar':
                // Every 3rd turn, randomly destroy a Boon
                if (gameState.turn % 3 === 0 && gameState.jokers && gameState.jokers.length > 1) {
                    // Don't destroy Pandora's Jar itself
                    const otherJokers = gameState.jokers.filter(j => j.id !== 'pandoras_jar');
                    if (otherJokers.length > 0) {
                        const randomIndex = Math.floor(Math.random() * otherJokers.length);
                        const destroyed = otherJokers[randomIndex];
                        // Remove from main array
                        const mainIndex = gameState.jokers.findIndex(j => j.id === destroyed.id);
                        if (mainIndex !== -1) {
                            gameState.jokers.splice(mainIndex, 1);
                            window.game?.showMessage?.(`💔 Pandora's Jar: ${destroyed.name} destroyed!`, 3000);
                        }
                    }
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
            
            case 'marathon_runner':
                // Reset marathon pips each turn
                this.marathonPips = 0;
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
                    d.parmenideEnhanced = false;
                });
                
                // Pick one random die and randomly enhance one of its faces for this turn
                const parmenidesDie = gameState.dice[Math.floor(Math.random() * gameState.dice.length)];
                const parmenidesFaceKey = Math.floor(Math.random() * 6) + 1;
                
                // Mark which die and face is enhanced
                parmenidesDie.parmenideEnhanced = true;
                parmenidesDie.parmenideEnhancedFace = parmenidesFaceKey;
                
                // Add a random enhancement type (parchment, iron, gold, mother_of_pearl, wild)
                const enhancementTypes = ['parchment', 'iron', 'gold', 'mother_of_pearl', 'wild'];
                const randomEnhancement = enhancementTypes[Math.floor(Math.random() * enhancementTypes.length)];
                
                parmenidesDie.faces[parmenidesFaceKey].enhancements.add(randomEnhancement);
                
                window.game?.showMessage?.(`Parmenides Die: Face ${parmenidesFaceKey} enhanced with ${randomEnhancement} for this turn!`, 4000);
                Logger.info(`Parmenides activated: Enhanced face ${parmenidesFaceKey} with ${randomEnhancement}`);
                break;
            
            case 'proteus_disguise':
                // Pick a random boon to mimic (cannot repeat last turn's choice)
                const proteusOtherBoons = (gameState.jokers || []).filter(b => 
                    b.id !== 'proteus_disguise' && b.id !== gameState.proteusLastMimicId
                );
                
                if (proteusOtherBoons.length > 0) {
                    const randomBoon = proteusOtherBoons[Math.floor(Math.random() * proteusOtherBoons.length)];
                    gameState.proteusLastMimicId = gameState.proteusMimicId; // Store last for next turn
                    gameState.proteusMimicId = randomBoon.id;
                    
                    window.game?.showMessage?.(`🎭 Proteus' Disguise: Transforming into ${randomBoon.name}!`, 3500);
                    Logger.info(`Proteus mimicking: ${randomBoon.name}`);
                    
                    // Update dynamic display
                    this.dynamicStats.other = `→${randomBoon.name}`;
                } else {
                    gameState.proteusMimicId = null;
                    this.dynamicStats.other = 'No target';
                }
                break;
            
            case 'reflection_of_narcissus':
                // Reduce rolls by 2
                gameState.rollsLeft = Math.max(1, GAME_BALANCE.STARTING_ROLLS - 2);
                window.game?.showMessage?.("Reflection of Narcissus: -2 rolls (boons doubled)!");
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

    applySellEffect(gameState, result) {
        // Effects that trigger when selling cards
        switch (this.id) {
            case 'the_merchant':
                // Selling libation and worship cards gives +1 extra gold
                if (result.cardType === 'worship' || result.cardType === 'libation') {
                    const bonusGold = 1;
                    gameState.gold += bonusGold;
                    window.game?.showMessage?.("The Merchant: +1 bonus Gold from sale!", 2500);
                    Logger.info(`The Merchant: +1 bonus gold from selling ${result.cardType}`);
                }
                break;
            
            case 'mortal_vineyard':
                // Selling a Boon gives you a random Libation
                if (result.cardType === 'joker' && window.CardData && window.CardData.libations) {
                    const randomLibation = window.CardData.libations[Math.floor(Math.random() * window.CardData.libations.length)];
                    
                    // Add libation to consumables
                    if (gameState.consumables && randomLibation) {
                        const newLibation = new LibationCard(randomLibation);
                        gameState.consumables.push(newLibation);
                        window.game?.showMessage?.(`🍷 Mortal Vineyard: Gained ${randomLibation.name}!`, 3500);
                        Logger.info(`Mortal Vineyard: Converted boon sale into ${randomLibation.name}`);
                    }
                }
                break;
        }
        // No return value needed for sell effects
    }

    applyAnteEndEffect(gameState, result) {
        // Effects that trigger at the end of an Ante
        switch (this.id) {
            case 'cornucopia_of_ploutos':
                // At end of Ante, multiply gold by 1.5 (rounded down)
                const originalGold = gameState.gold;
                gameState.gold = Math.floor(gameState.gold * 1.5);
                window.game?.showMessage?.(`🌽 Cornucopia of Ploutos: Gold ${originalGold} → ${gameState.gold}!`, 4000);
                Logger.info(`Cornucopia: Gold multiplied from ${originalGold} to ${gameState.gold}`);
                break;
            
            case 'the_odyssey':
                // If ALL categories filled with NO scratches, gain (total categories)² pips to final score
                const allCategories = ['Ones', 'Twos', 'Threes', 'Fours', 'Fives', 'Sixes',
                                      'Three of a Kind', 'Four of a Kind', 'Full House',
                                      'Small Straight', 'Large Straight', 'Yahtzee', 'Chance'];
                
                // Add unlocked categories
                const availableCategories = [...allCategories];
                if (gameState.unlockedCategories?.Sevens) availableCategories.push('Sevens');
                if (gameState.unlockedCategories?.Eights) availableCategories.push('Eights');
                if (gameState.unlockedCategories?.Nines) availableCategories.push('Nines');
                
                // Check if ALL filled and NO scratches (score = 0)
                const allFilled = availableCategories.every(cat => gameState.scorecard[cat] !== undefined);
                const noScratches = availableCategories.every(cat => 
                    gameState.scorecard[cat] === undefined || gameState.scorecard[cat] > 0
                );
                
                if (allFilled && noScratches) {
                    const odysseyBonus = availableCategories.length * availableCategories.length;
                    gameState.totalScore += odysseyBonus;
                    window.game?.showMessage?.(`⛵ The Odyssey: Perfect journey! +${odysseyBonus} points (${availableCategories.length}²)!`, 5000);
                    Logger.info(`The Odyssey: Perfect completion bonus ${odysseyBonus} points`);
                } else if (allFilled) {
                    window.game?.showMessage?.("⛵ The Odyssey: Journey complete, but with scratches (no bonus)", 3000);
                }
                break;
            
            case 'message_in_a_bottle':
                // If completed ante with no other boons entire ante, gain +50% of score threshold
                const hadOnlyBottle = !gameState.hadOtherBoonsThisAnte;
                
                if (hadOnlyBottle) {
                    const threshold = gameState.scoreThreshold || 300;
                    const bonus = Math.floor(threshold * 0.5);
                    gameState.totalScore += bonus;
                    window.game?.showMessage?.(`📜 Message in a Bottle: Solo journey! +${bonus} points (50% of threshold)!`, 5000);
                    Logger.info(`Message in a Bottle: Solo bonus ${bonus} points`);
                } else {
                    window.game?.showMessage?.("📜 Message in a Bottle: You had company this ante (no bonus)", 2000);
                }
                
                // Reset tracking for next ante
                gameState.hadOtherBoonsThisAnte = false;
                break;
            
            case 'betrayal_by_paris':
                // Destroy a random Boon at end of Ante, gain +10 Gold
                if (gameState.jokers && gameState.jokers.length > 1) {
                    // Don't destroy Betrayal by Paris itself
                    const otherBoons = gameState.jokers.filter(j => j.id !== 'betrayal_by_paris');
                    
                    if (otherBoons.length > 0) {
                        const randomIndex = Math.floor(Math.random() * otherBoons.length);
                        const destroyed = otherBoons[randomIndex];
                        
                        // Remove from main array
                        const mainIndex = gameState.jokers.findIndex(j => j.id === destroyed.id);
                        if (mainIndex !== -1) {
                            gameState.jokers.splice(mainIndex, 1);
                            gameState.gold += 10;
                            window.game?.showMessage?.(`💔 Betrayal by Paris: ${destroyed.name} destroyed! +10 Gold`, 4000);
                            Logger.info(`Betrayal by Paris destroyed ${destroyed.name}, gained 10 gold`);
                        }
                    } else {
                        // Only Paris left, still get gold
                        gameState.gold += 10;
                        window.game?.showMessage?.("Betrayal by Paris: No one left to betray! +10 Gold", 3000);
                    }
                } else {
                    // Only Paris, still get gold
                    gameState.gold += 10;
                    window.game?.showMessage?.("Betrayal by Paris: No one left to betray! +10 Gold", 3000);
                }
                break;
        }
        // No return value needed for ante_end effects
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