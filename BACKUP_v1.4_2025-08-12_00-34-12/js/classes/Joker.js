// Joker class - Represents Boons that provide ongoing effects

class Joker extends Card {
    constructor(data) {
        super(data);
        this.type = 'joker';
        this.triggers = data.triggers || ['score']; // When this joker activates
        this.stackable = data.stackable || false; // Can you have multiple copies
        this.conditions = data.conditions || {}; // Conditions for activation
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
                // All Favour gains are doubled but Pips are randomized (1-40)
                result.favour *= 2;
                result.pips = Math.floor(Math.random() * 40) + 1;
                window.game?.showMessage?.("Chaos Primordial: Favour doubled, Pips randomized!");
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
                gameState.boonSlots = (gameState.boonSlots || 5) + 1;
                window.game?.showMessage?.("Antikythra: +1 Boon slot!");
                break;

            default:
                console.warn(`Unknown joker effect: ${this.id}`);
                break;
        }

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
        const originalTotal = original.pips * original.favour;
        const modifiedTotal = modified.pips * modified.favour;
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

    // Static method to create joker from game data
    static fromData(data) {
        return new Joker(data);
    }
}