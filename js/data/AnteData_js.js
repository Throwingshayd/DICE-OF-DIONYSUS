// AnteData.js - Defines boss blinds and ante progression

const AnteData = [
    {
        name: "The Fool",
        blindName: "No Blind",
        blindId: "none",
        blindEffect: "No special effect",
        scoreThreshold: 300
    },
    {
        name: "The Magician", 
        blindName: "Rolling Stones",
        blindId: "no_held_dice",
        blindEffect: "Cannot hold dice between rolls",
        scoreThreshold: 450
    },
    {
        name: "The High Priestess",
        blindName: "Sacred Silence", 
        blindId: "no_worship",
        blindEffect: "Worship cards do not appear in shop",
        scoreThreshold: 600
    },
    {
        name: "The Empress",
        blindName: "Barren Fields",
        blindId: "half_upper_pips",
        blindEffect: "Upper Sanctum hands give half pips",
        scoreThreshold: 800
    },
    {
        name: "The Emperor",
        blindName: "Iron Fist",
        blindId: "max_3_hold", 
        blindEffect: "Can only hold 3 dice maximum",
        scoreThreshold: 1000
    },
    {
        name: "The Hierophant",
        blindName: "Broken Ritual",
        blindId: "no_chance",
        blindEffect: "Chance hands cannot be scored",
        scoreThreshold: 1200
    },

    {
        name: "The Chariot",
        blindName: "Reckless Speed",
        blindId: "score_penalty",
        blindEffect: "Score threshold increased by 50%",
        scoreThreshold: 1500
    },
    {
        name: "Strength",
        blindName: "Primal Force",
        blindId: "joker_disable",
        blindEffect: "All Boons are disabled",
        scoreThreshold: 1800
    },
    {
        name: "The Hermit",
        blindName: "Solitary Path",
        blindId: "no_consumables",
        blindEffect: "Cannot use Libations",
        scoreThreshold: 2100
    },
    {
        name: "Wheel of Fortune",
        blindName: "Chaotic Fate",
        blindId: "random_effects",
        blindEffect: "Random effect each turn",
        scoreThreshold: 2400
    },
    {
        name: "Justice",
        blindName: "Perfect Balance", 
        blindId: "exact_score",
        blindEffect: "Must hit exact score threshold",
        scoreThreshold: 2700
    },
    {
        name: "The Hanged Man",
        blindName: "Inverted World",
        blindId: "flipped_scoring",
        blindEffect: "Lower hands score higher than upper hands",
        scoreThreshold: 3000
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