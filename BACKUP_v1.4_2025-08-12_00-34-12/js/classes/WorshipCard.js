// WorshipCard class - Represents worship cards that increase god favor

class WorshipCard extends Card {
    constructor(data) {
        super(data);
        this.type = 'worship';
        this.god = data.god;
        this.worshipType = data.worshipType || 'level'; // 'level', 'bonus', 'special'
        this.worshipValue = data.worshipValue || 1;
        this.category = this.getCategory(); // Which scorecard category this affects
    }

    // Get the scorecard category this worship affects
    getCategory() {
        const godToCategory = {
            'Aphrodite': 'Ones',
            'Ares': 'Twos', 
            'Artemis': 'Threes',
            'Hera': 'Fours',
            'Athena': 'Fives',
            'Heracles': 'Sixes',
            'Hephaestus': '3 of a Kind',
            'Dionysus': 'Full House',
            'Hermes': 'Sm. Straight',
            'Apollo': 'Lg. Straight',
            'Zeus': 'Yahtzee',
            'Nyx': 'Chance',
            'The Pleiades': 'Sevens',
            'Poseidon': 'Eights',
            'The Nine Muses': 'Nines'
        };
        return godToCategory[this.god];
    }

    // Apply the worship effect
    applyWorship(gameState) {
        if (!this.canUse()) return false;

        switch (this.worshipType) {
            case 'level':
                this.levelUpWorship(gameState);
                break;
            case 'bonus':
                this.applyBonusEffect(gameState);
                break;
            case 'special':
                this.applySpecialEffect(gameState);
                break;
        }

        this.use();
        return true;
    }

    // Standard level up worship
    levelUpWorship(gameState) {
        gameState.worshipLevels[this.god] = (gameState.worshipLevels[this.god] || 0) + this.worshipValue;
        
        // Apply any additional effects based on specific cards
        this.applyCardSpecificEffects(gameState);
        
        window.game?.showMessage?.(`${this.god} worship increased to level ${gameState.worshipLevels[this.god]}!`);
    }

    // Apply bonus effects (temporary boosts)
    applyBonusEffect(gameState) {
        switch (this.id) {
            case 'artemis_2': // Huntress' Mark
                // First die each turn locks to 1
                gameState.diceEffects = gameState.diceEffects || {};
                gameState.diceEffects.firstDieLockTo1 = true;
                break;
                
            case 'persephone_2': // Spring's Return  
                // Twos give +2 Pips each
                gameState.pipsBonuses = gameState.pipsBonuses || {};
                gameState.pipsBonuses.twosBonus = 2;
                break;
                
            case 'morpheus_2': // Dream Walker
                // Can reroll 3s once per turn
                gameState.rerollAbilities = gameState.rerollAbilities || {};
                gameState.rerollAbilities.rerollThrees = true;
                break;
                
            case 'hera_2': // Queen's Authority
                // Fours count as 5s for scoring
                gameState.diceSubstitutions = gameState.diceSubstitutions || {};
                gameState.diceSubstitutions.foursAsFives = true;
                break;
                
            case 'athena_2': // Strategic Mind
                // See next roll before deciding holds
                gameState.abilities = gameState.abilities || {};
                gameState.abilities.seeNextRoll = true;
                break;
                
            case 'heracles_2': // Hero's Courage
                // Sixes give +10 Pips each
                gameState.pipsBonuses = gameState.pipsBonuses || {};
                gameState.pipsBonuses.sixesBonus = 10;
                break;
        }
    }

    // Apply special powerful effects
    applySpecialEffect(gameState) {
        switch (this.id) {
            case 'artemis_3': // Moon's Grace
                // Ones category can be scored twice
                gameState.doubleScoringAllowed = gameState.doubleScoringAllowed || [];
                gameState.doubleScoringAllowed.push('Ones');
                break;
                
            case 'persephone_3': // Underworld Queen
                // Gain +1 Gold per 2 rolled
                gameState.goldPerDie = gameState.goldPerDie || {};
                gameState.goldPerDie[2] = 1;
                break;
                
            case 'morpheus_3': // Master of Sleep
                // All dice become 3s before first roll
                gameState.forcedDiceValues = gameState.forcedDiceValues || {};
                gameState.forcedDiceValues.allThrees = true;
                break;
                
            case 'hera_3': // Queen's Wrath
                // Reroll all dice when you roll 4 Fours
                gameState.triggerEffects = gameState.triggerEffects || {};
                gameState.triggerEffects.fourFoursReroll = true;
                break;
                
            case 'athena_3': // Goddess of War
                // Fives add their value to ALL other scores
                gameState.globalBonuses = gameState.globalBonuses || {};
                gameState.globalBonuses.fivesToAll = true;
                break;
                
            case 'heracles_3': // Twelve Labors
                // Win immediately with 12 total Sixes scored
                gameState.winConditions = gameState.winConditions || {};
                gameState.winConditions.twelveSixes = true;
                break;
                
            case 'zeus_3': // Lord of Olympus
                // Each Yahtzee permanently increases Base Favour by 1
                gameState.yahtzeeEffects = gameState.yahtzeeEffects || {};
                gameState.yahtzeeEffects.increaseFavour = true;
                break;
                
            case 'apollo_3': // God of Prophecy
                // Know all dice results for rest of ante after Large Straight
                gameState.prophecyEffects = gameState.prophecyEffects || {};
                gameState.prophecyEffects.seeAllAfterStraight = true;
                break;
                
            case 'nyx_3': // Primordial Darkness
                // Chance can be scored in any category once per ante
                gameState.flexibleScoring = gameState.flexibleScoring || {};
                gameState.flexibleScoring.chanceAnywhere = true;
                break;
        }
    }

    // Apply card-specific effects during level up
    applyCardSpecificEffects(gameState) {
        // This method can be overridden for cards that do more than just level up
        // For example, some cards might also provide immediate bonuses
    }

    // Apply basic worship effects from CSV database
    applyBasicWorshipEffect(gameState, result) {
        if (!this.canUse()) return result;

        // Basic worship cards provide +1 Favour when scoring their category
        const worshipEffects = {
            'worship_artemis': 'Ones',
            'worship_persephone': 'Twos',
            'worship_morpheus': 'Threes',
            'worship_hera': 'Fours',
            'worship_athena': 'Fives',
            'worship_heracles': 'Sixes',
            'worship_hephaestus': 'Three of a Kind',
            'worship_ares': 'Four of a Kind',
            'worship_dionysus': 'Full House',
            'worship_hermes': 'Small Straight',
            'worship_apollo': 'Large Straight',
            'worship_zeus': 'Yahtzee',
            'worship_nyx': 'Chance',
            'worship_pleiades': 'Sevens',
            'worship_poseidon_eights': 'Eights',
            'worship_muses': 'Nines'
        };

        const targetCategory = worshipEffects[this.id];
        if (targetCategory && result.category === targetCategory) {
            // Check if category is unlocked (for 7s, 8s, 9s)
            if (['Sevens', 'Eights', 'Nines'].includes(targetCategory)) {
                if (!gameState.unlockedCategories[targetCategory]) {
                    return result; // Don't apply effect if category is locked
                }
            }
            
            result.favour += 1;
            window.game?.showMessage?.(`${this.name}: +1 Favour!`);
        }

        return result;
    }

    // Get the current worship level for this god
    getCurrentWorshipLevel(gameState) {
        return gameState.worshipLevels[this.god] || 0;
    }

    // Calculate the effective favour bonus this provides
    getFavourBonus(gameState) {
        return this.getCurrentWorshipLevel(gameState);
    }

    // Check if this worship card has special ongoing effects
    hasOngoingEffects() {
        const ongoingEffects = [
            'artemis_2', 'persephone_2', 'morpheus_2', 'hera_2',
            'athena_2', 'heracles_2', 'artemis_3', 'persephone_3',
            'morpheus_3', 'hera_3', 'athena_3', 'heracles_3',
            'zeus_3', 'apollo_3', 'nyx_3'
        ];
        return ongoingEffects.includes(this.id);
    }

    // Get description of ongoing effects
    getOngoingEffectDescription() {
        const descriptions = {
            'artemis_2': 'First die each turn automatically becomes 1',
            'persephone_2': 'Each 2 provides +2 extra pips when scoring',
            'morpheus_2': 'Can reroll any 3s once per turn for free',
            'hera_2': 'All 4s count as 5s for scoring purposes',
            'athena_2': 'Can preview next dice roll before choosing holds',
            'heracles_2': 'Each 6 provides +10 extra pips when scoring',
            'artemis_3': 'Ones category can be scored multiple times',
            'persephone_3': 'Gain 1 gold for each 2 rolled this turn',
            'morpheus_3': 'All dice start as 3s each turn',
            'hera_3': 'Rolling four 4s triggers a free reroll',
            'athena_3': 'Fives add their value to every score',
            'heracles_3': 'Win instantly upon scoring 12 total sixes',
            'zeus_3': 'Each Yahtzee permanently increases base favour',
            'apollo_3': 'Large Straight reveals all future dice rolls',
            'nyx_3': 'Chance hand can substitute for any category once per ante'
        };
        return descriptions[this.id] || '';
    }

    // Get the god's domain/theme
    getGodDomain() {
        const domains = {
            'Artemis': 'Hunt & Moon',
            'Persephone': 'Underworld & Spring',
            'Morpheus': 'Dreams & Sleep',
            'Poseidon': 'Sea & Earthquakes',
            'Athena': 'Wisdom & War',
            'Heracles': 'Strength & Heroes',
            'Hephaestus': 'Power & Might',
            'Ares': 'War & Courage',
            'Dionysus': 'Wine & Ecstasy',
            'Hermes': 'Speed & Messages',
            'Apollo': 'Sun & Prophecy',
            'Zeus': 'Sky & Thunder',
            'Nyx': 'Night & Chaos'
        };
        return domains[this.god] || 'Unknown';
    }

    // Check if this worship synergizes with others
    synergizesWith(otherCard) {
        if (otherCard instanceof WorshipCard) {
            // Same god synergy
            if (this.god === otherCard.god) return true;
            
            // Complementary god synergies
            const synergies = {
                'Artemis': ['Persephone'], // 1s and 2s
                'Morpheus': ['Hera'],      // 3s and 4s
                'Athena': ['Heracles'],    // 5s and 6s
                'Hephaestus': ['Ares'],    // 3 and 4 of a kind
                'Hermes': ['Apollo'],      // Small and large straights
                'Zeus': ['Nyx']            // Yahtzee and Chance
            };
            
            return synergies[this.god]?.includes(otherCard.god) ||
                   synergies[otherCard.god]?.includes(this.god);
        }
        
        // Synergy with jokers of same god
        if (otherCard instanceof Joker && otherCard.god === this.god) {
            return true;
        }
        
        return false;
    }

    // Static method to create worship card from data
    static fromData(data) {
        return new WorshipCard(data);
    }

    // Get worship progress visualization
    getWorshipProgress(gameState) {
        const currentLevel = this.getCurrentWorshipLevel(gameState);
        const maxLevel = 10; // Arbitrary max for display
        const percentage = Math.min(100, (currentLevel / maxLevel) * 100);
        
        return {
            level: currentLevel,
            maxLevel: maxLevel,
            percentage: percentage,
            nextLevelBenefit: this.getNextLevelBenefit(currentLevel)
        };
    }

    // Get what the next worship level would provide
    getNextLevelBenefit(currentLevel) {
        const nextLevel = currentLevel + 1;
        return `Level ${nextLevel}: +${nextLevel} Favour when scoring ${this.category}`;
    }
}