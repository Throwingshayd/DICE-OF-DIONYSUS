// Game Data - All cards, antes, and configurations

// AnteData is now defined in AnteData_js.js

// Rarity weights for shop generation (inspired by Balatro)
// Import from constants for consistency
const RarityWeights = {
    // Boon rarities
    'rustic': RARITY_WEIGHTS.RUSTIC,
    'vibrant': RARITY_WEIGHTS.VIBRANT,
    'epic': RARITY_WEIGHTS.EPIC,
    
    // Worship rarities
    'worship': RARITY_WEIGHTS.WORSHIP,
    
    // Libation rarities
    'libation': RARITY_WEIGHTS.LIBATION,
    
    // Artifact rarities (all artifacts are equally rare)
    'artifact': RARITY_WEIGHTS.ARTIFACT
};

const CardData = {
    jokers: [
        // Boons from CSV database only with Balatro-inspired timing
        { 
            id: "hestias_hearth", 
            name: "Hestia's Hearth", 
            rarity: "vibrant", 
            cost: 5, 
            sellValue: 1, 
            effect: "If all 5 of your dice are odd or all 5 are even the hand gains +3 Favour.",
            timing: { before_score: true }
        },
        { 
            id: "charons_ferry_fare", 
            name: "Charon's Ferry Fare", 
            rarity: "vibrant", 
            cost: 5, 
            sellValue: 1, 
            effect: "Gain +1 Gold after scoring any hand (does not trigger on a scratch).",
            timing: { after_score: true }
        },
        { 
            id: "achilles_heel", 
            name: "Achilles' Heel", 
            rarity: "rustic", 
            cost: 3, 
            sellValue: 1, 
            effect: "All scores gain +15 Pips but you lose 1 Gold at the start of each roll.",
            timing: { before_score: true, turn_start: true }
        },
        { 
            id: "midas_touch", 
            name: "Midas Touch", 
            rarity: "rustic", 
            cost: 4, 
            sellValue: 2, 
            effect: "Gain +5 pips for every 10 Gold you have when scoring.",
            timing: { before_score: true }
        },
        { 
            id: "icarus_wings", 
            name: "Icarus' Wings", 
            rarity: "vibrant", 
            cost: 5, 
            sellValue: 1, 
            effect: "Each unused re-roll at the end of a turn gives +15 Pips to the score. Chance to break after turn 1 in 8.",
            timing: { before_score: true, turn_end: true }
        },
        { 
            id: "lethe_waters", 
            name: "Lethe Waters", 
            rarity: "rustic", 
            cost: 4, 
            sellValue: 2, 
            effect: "All dice with a value of 2 or less are not counted for scoring but your final score gains +25 Pips.",
            timing: { before_score: true }
        },
        { 
            id: "forge_of_hephaestus", 
            name: "Forge of Hephaestus", 
            rarity: "vibrant", 
            cost: 5, 
            sellValue: 1, 
            effect: "Gain x0.5 Favour for each unused re-roll you have at the end of the turn (Max x1.5).",
            timing: { before_score: true }
        },
        { 
            id: "prometheus_gift", 
            name: "Prometheus' Gift", 
            rarity: "vibrant", 
            cost: 5, 
            sellValue: 1, 
            effect: "Gives +3 Favour to all hands but you have one less re-roll each turn.",
            timing: { before_score: true, turn_start: true }
        },
        { 
            id: "chaos_primordial", 
            name: "Chaos Primordial", 
            rarity: "epic", 
            cost: 8, 
            sellValue: 2, 
            effect: "Doubles all Favour gains but you have one less re-roll each turn.",
            timing: { before_score: true, turn_start: true }
        },
        { 
            id: "mt_olympus", 
            name: "Mt Olympus", 
            rarity: "epic", 
            cost: 8, 
            sellValue: 2, 
            effect: "Gain +1 Favour for each Worship card you have used this run.",
            timing: { after_score: true }
        }
    ],

    consumables: [
        {
            id: "ambrosia",
            name: "Ambrosia",
            rarity: "vibrant",
            cost: 3,
            effect: "Gain +2 Favour for this turn only.",
            description: "The food of the gods. Provides temporary divine favor."
        },
        {
            id: "nectar",
            name: "Nectar",
            rarity: "rustic",
            cost: 2,
            effect: "Gain +1 Favour for this turn only.",
            description: "The drink of the gods. Provides temporary divine favor."
        },
        {
            id: "olive_oil",
            name: "Olive Oil",
            rarity: "rustic",
            cost: 1,
            effect: "Gain +5 pips for this turn only.",
            description: "Sacred oil that enhances your dice rolls."
        }
    ],

    artifacts: [
        {
            id: "cornucopia",
            name: "Cornucopia",
            rarity: "epic",
            cost: 8,
            effect: "Increases interest cap by 1.",
            description: "The horn of plenty. Increases your maximum interest earnings."
        },
        {
            id: "caduceus",
            name: "Caduceus",
            rarity: "vibrant",
            cost: 5,
            effect: "Gain +1 Favour when you score a Yahtzee.",
            description: "The staff of Hermes. Rewards perfect dice combinations."
        },
        {
            id: "aegis",
            name: "Aegis",
            rarity: "epic",
            cost: 7,
            effect: "Protects against negative effects from jokers.",
            description: "The shield of Zeus. Protects you from harmful joker effects."
        }
    ],

    boons: [
        {
            id: "zeus_lightning",
            name: "Zeus's Lightning",
            rarity: "epic",
            effect: "Gain +5 Favour and +20 pips for this turn.",
            description: "The power of the king of the gods courses through you."
        },
        {
            id: "athena_wisdom",
            name: "Athena's Wisdom",
            rarity: "vibrant",
            effect: "Gain +3 Favour and reroll any dice once.",
            description: "The goddess of wisdom grants you insight and favor."
        },
        {
            id: "apollo_inspiration",
            name: "Apollo's Inspiration",
            rarity: "vibrant",
            effect: "Gain +2 Favour and +10 pips for this turn.",
            description: "The god of music and poetry inspires your dice."
        },
        {
            id: "hermes_speed",
            name: "Hermes's Speed",
            rarity: "rustic",
            effect: "Gain +1 Favour and +5 pips for this turn.",
            description: "The messenger god grants you swift favor."
        },
        {
            id: "dionysus_revelry",
            name: "Dionysus's Revelry",
            rarity: "rustic",
            effect: "Gain +1 Favour and reroll one die.",
            description: "The god of wine and celebration brings good fortune."
        }
    ],

    worship: [
        // Worship cards from CSV database only
        { id: "worship_artemis", name: "Blessing of Artemis", god: "Artemis", rarity: "worship", cost: 3, effect: "+1 Favour when scoring Ones." },
        { id: "worship_persephone", name: "Blessing of Persephone", god: "Persephone", rarity: "worship", cost: 3, effect: "+1 Favour when scoring Twos." },
        { id: "worship_morpheus", name: "Blessing of Morpheus", god: "Morpheus", rarity: "worship", cost: 3, effect: "+1 Favour when scoring Threes." },
        { id: "worship_hera", name: "Blessing of Hera", god: "Hera", rarity: "worship", cost: 3, effect: "+1 Favour when scoring Fours." },
        { id: "worship_athena", name: "Blessing of Athena", god: "Athena", rarity: "worship", cost: 3, effect: "+1 Favour when scoring Fives." },
        { id: "worship_heracles", name: "Blessing of Heracles", god: "Heracles", rarity: "worship", cost: 3, effect: "+1 Favour when scoring Sixes." },
        { id: "worship_hephaestus", name: "Blessing of Hephaestus", god: "Hephaestus", rarity: "worship", cost: 3, effect: "+1 Favour when scoring Three of a Kind." },
        { id: "worship_ares", name: "Blessing of Ares", god: "Ares", rarity: "worship", cost: 3, effect: "+1 Favour when scoring Four of a Kind." },
        { id: "worship_dionysus", name: "Blessing of Dionysus", god: "Dionysus", rarity: "worship", cost: 3, effect: "+1 Favour when scoring Full House." },
        { id: "worship_hermes", name: "Blessing of Hermes", god: "Hermes", rarity: "worship", cost: 3, effect: "+1 Favour when scoring Small Straight." },
        { id: "worship_apollo", name: "Blessing of Apollo", god: "Apollo", rarity: "worship", cost: 3, effect: "+1 Favour when scoring Large Straight." },
        { id: "worship_zeus", name: "Blessing of Zeus", god: "Zeus", rarity: "worship", cost: 3, effect: "+1 Favour when scoring Heureka." },
        { id: "worship_nyx", name: "Blessing of Nyx", god: "Nyx", rarity: "worship", cost: 3, effect: "+1 Favour when scoring Chance." },
        { id: "worship_pleiades", name: "Blessing of the Pleiades", god: "The Pleiades", rarity: "worship", cost: 3, effect: "+1 Favour when scoring Sevens." },
        { id: "worship_poseidon_eights", name: "Blessing of Poseidon (Eights)", god: "Poseidon", rarity: "worship", cost: 3, effect: "+1 Favour when scoring Eights." },
        { id: "worship_muses", name: "Blessing of the Nine Muses", god: "The Nine Muses", rarity: "worship", cost: 3, effect: "+1 Favour when scoring Nines." },
    ],

    libations: [
        // Libations from CSV database only
        { id: "kyphi_mead", name: "Kyphi Mead", rarity: "libation", cost: 2, sellValue: 0, effect: "Enhance a die face to Parchment.", type: "instant" },
        { id: "tisane_hephaestus", name: "Tisane of Hephaestus", rarity: "libation", cost: 2, sellValue: 0, effect: "Enhance a die face to Steel.", type: "instant" },
        { id: "ambrosial_krasi", name: "Ambrosial Krasi", rarity: "libation", cost: 2, sellValue: 0, effect: "Enhance a die face to Gold.", type: "instant" },
        { id: "retsina_echoes", name: "Retsina of Echoes", rarity: "libation", cost: 2, sellValue: 0, effect: "Enhance a die face to Mirror.", type: "instant" },
        { id: "soma_wild", name: "Soma of the Wild", rarity: "libation", cost: 2, sellValue: 0, effect: "Enhance a die face to Wild.", type: "instant" },
        { id: "kylix_hermit", name: "Kylix of the Hermit", rarity: "libation", cost: 3, sellValue: 0, effect: "Destroy a boon, Double your money (max 20).", type: "instant" },
        { id: "elixir_lethe", name: "Elixir of Lethe", rarity: "libation", cost: 2, sellValue: 0, effect: "Reduce a die face by 1.", type: "instant" },
        { id: "chalice_helios", name: "Chalice of Helios", rarity: "libation", cost: 2, sellValue: 0, effect: "Increase a die face by 1.", type: "instant" },
        { id: "distillate_masks", name: "Distillate of Masks", rarity: "libation", cost: 2, sellValue: 0, effect: "Apply a random enhancement to a random Boon.", type: "instant" },
        { id: "the_eucharist", name: "The Eucharist", rarity: "libation", cost: 2, sellValue: 0, effect: "Gain +1 worship level in god of choice.", type: "instant" },
        { id: "divine_guidance", name: "Divine Guidance", rarity: "libation", cost: 2, sellValue: 0, effect: "Gain 2 random levels in any 2 scores.", type: "instant" },
    ],

    packs: [
        { type: 'joker', name: 'Boon Pack', cost: 4, description: 'Reveals 3 Boons - choose one to claim.' },
        { type: 'worship', name: 'Worship Pack', cost: 4, description: 'Reveals 3 Worship cards - choose one to claim.' },
        { type: 'libation', name: 'Libation Pack', cost: 4, description: 'Reveals 3 Libations - choose one to claim.' },
        { type: 'chaos', name: 'Chaos Pack', cost: 6, description: 'Reveals 3 random cards - choose one from any combination of Boons, Worship, and Libations!' }
    ],

    artifacts: {
        'temple_market': {
            base: { id: "artifact_temple_market", name: "Temple Market", cost: 12, effect: "Shop inventory size increased by 1.", rarity: "artifact" }
        },
        'clearance_sale': {
            base: { id: "artifact_clearance_sale", name: "Merchants Arrival", cost: 12, effect: "All shop prices reduced by 25%.", rarity: "artifact" }
        },
        'crystal_ball': {
            base: { id: "artifact_crystal_ball", name: "Crystal Ball", cost: 12, effect: "+1 Libation slot.", rarity: "artifact" }
        },
        'telescope': {
            base: { id: "artifact_telescope", name: "Altar", cost: 12, effect: "+1 Worship card slot.", rarity: "artifact" }
        },
        'antimatter': {
            base: { id: "artifact_antimatter", name: "Antikythra", cost: 12, effect: "+1 Boon slot.", rarity: "artifact" }
        }
    },

    getAllCards: function() {
        return [
            ...this.jokers.map(c => ({...c, class: 'Joker'})),
            ...this.worship.map(c => ({...c, class: 'WorshipCard'})),
            ...this.libations.map(c => ({...c, class: 'LibationCard'}))
        ];
    }
};