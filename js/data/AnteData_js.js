// AnteData.js - Defines boss blinds and ante progression

const AnteData = [
    {
        name: "The Fool",
        blindName: "No Blind",
        blindId: "none",
        blindEffect: "No special effect",
        scoreThreshold: 300  // Linear start
    },
    {
        name: "The Magician", 
        blindName: "Rolling Stones",
        blindId: "no_held_dice",
        blindEffect: "Cannot hold dice between rolls",
        scoreThreshold: 450  // +150 (50% increase)
    },
    {
        name: "The High Priestess",
        blindName: "Sacred Silence", 
        blindId: "no_worship",
        blindEffect: "Worship cards do not appear in shop",
        scoreThreshold: 600  // +150 (33% increase)
    },
    {
        name: "The Empress",
        blindName: "Barren Fields",
        blindId: "half_upper_pips",
        blindEffect: "Upper Sanctum hands give half pips",
        scoreThreshold: 900  // +300 (50% increase) - Balatro-style ramp!
    },
    {
        name: "The Emperor",
        blindName: "Iron Fist",
        blindId: "max_3_hold", 
        blindEffect: "Can only hold 3 dice maximum",
        scoreThreshold: 1250  // +350 (39% increase) - Exponential!
    },
    {
        name: "The Hierophant",
        blindName: "Broken Ritual",
        blindId: "no_chance",
        blindEffect: "Chance hands cannot be scored",
        scoreThreshold: 1700  // +450 (36% increase)
    },

    {
        name: "The Chariot",
        blindName: "Reckless Speed",
        blindId: "score_penalty",
        blindEffect: "Score threshold increased by 50%",
        scoreThreshold: 2300  // +600 (35% increase)
    },
    {
        name: "Strength",
        blindName: "Primal Force",
        blindId: "joker_disable",
        blindEffect: "All Boons are disabled",
        scoreThreshold: 3100  // +800 (35% increase) - Getting hard!
    },
    {
        name: "The Hermit",
        blindName: "Solitary Path",
        blindId: "no_consumables",
        blindEffect: "Cannot use Libations",
        scoreThreshold: 4200  // +1100 (36% increase)
    },
    {
        name: "Wheel of Fortune",
        blindName: "Chaotic Fate",
        blindId: "random_effects",
        blindEffect: "Random effect each turn",
        scoreThreshold: 5700  // +1500 (36% increase)
    },
    {
        name: "Justice",
        blindName: "Perfect Balance", 
        blindId: "exact_score",
        blindEffect: "Must hit exact score threshold",
        scoreThreshold: 7700  // +2000 (35% increase)
    },
    {
        name: "The Hanged Man",
        blindName: "Inverted World",
        blindId: "flipped_scoring",
        blindEffect: "Lower hands score higher than upper hands",
        scoreThreshold: 10500  // +2800 (36% increase) - BRUTAL!
    }
];

// Helper function to get ante data by index
function getAnteData(anteIndex) {
    return AnteData[anteIndex] || AnteData[AnteData.length - 1];
}

// Helper function to get random ante for endless mode
function getRandomAnteData(prng) {
    const index = Math.floor(prng.random() * AnteData.length);
    return AnteData[index];
}