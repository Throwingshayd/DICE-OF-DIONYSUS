// Game Data - All cards, antes, and configurations

// AnteData is now defined in AnteData_js.js

const CardData = {
    jokers: [
        // Boons from CSV database only
        { id: "hestias_hearth", name: "Hestia's Hearth", rarity: "vibrant", cost: 3, sellValue: 1, effect: "If all 5 of your dice are odd or all 5 are even the hand gains +3 Favour." },
        { id: "charons_ferry_fare", name: "Charon's Ferry Fare", rarity: "vibrant", cost: 3, sellValue: 1, effect: "Gain +1 Gold after scoring any hand (does not trigger on a scratch)." },
        { id: "achilles_heel", name: "Achilles' Heel", rarity: "rustic", cost: 3, sellValue: 1, effect: "All scores gain +10 Pips but you lose 1 Gold at the start of each roll." },
        { id: "midas_touch", name: "Midas Touch", rarity: "rustic", cost: 4, sellValue: 2, effect: "Gain +5 pips for every 10 Gold you have when scoring." },
        { id: "icarus_wings", name: "Icarus' Wings", rarity: "vibrant", cost: 4, sellValue: 2, effect: "Each unused re-roll at the end of a turn gives +10 Pips to the score. Chance to break after turn 1 in 6." },
        { id: "lethe_waters", name: "Lethe Waters", rarity: "rustic", cost: 4, sellValue: 2, effect: "All dice with a value of 2 or less are not counted for scoring but your final score gains +15 Pips." },
        { id: "forge_of_hephaestus", name: "Forge of Hephaestus", rarity: "vibrant", cost: 6, sellValue: 3, effect: "Gain x0.5 Favour for each unused re-roll you have at the end of the turn (Max x1.5)." },
        { id: "prometheus_gift", name: "Prometheus' Gift", rarity: "vibrant", cost: 6, sellValue: 3, effect: "Gives +3 Favour to all hands but you have one less re-roll each turn." },
        { id: "chaos_primordial", name: "Chaos Primordial", rarity: "epic", cost: 10, sellValue: 8, effect: "All Favour gains are doubled but Pips are randomized (1-40)." },
        { id: "artemis_common", name: "Artemis' Blessing", rarity: "rustic", cost: 3, sellValue: 1, effect: "Gain +1 Gold whenever you score 'Ones'." },
        { id: "persephone_common", name: "Persephone's Gift", rarity: "rustic", cost: 3, sellValue: 1, effect: "Twos give +2 Pips each when scored." },
        { id: "persephone_uncommon", name: "Spring's Return", rarity: "vibrant", cost: 4, sellValue: 2, effect: "After scoring 'Twos' gain +1 Gold per 2 in the hand." },
        { id: "morpheus_common", name: "Morpheus' Dream", rarity: "rustic", cost: 3, sellValue: 1, effect: "Threes give +1 Favour each when scored." },
        { id: "heracles_rare", name: "Mt Olympus", rarity: "epic", cost: 6, sellValue: 3, effect: "Gains x1 favour per worship used." },
        { id: "hera_uncommon", name: "Queen's Authority", rarity: "vibrant", cost: 4, sellValue: 2, effect: "After scoring 'Fours' all other dice in your hand are re-rolled. Add their new values as bonus Pips." },
        { id: "athena_common", name: "Athena's Wisdom", rarity: "vibrant", cost: 3, sellValue: 1, effect: "For every 5 in a scored 'Fives' hand gain +10 Pips." },
        { id: "athena_uncommon", name: "Strategic Mind", rarity: "epic", cost: 4, sellValue: 2, effect: "After scoring 'Fives' you may hold one extra die above the normal limit for the next turn." },
        { id: "poseidon_eights_rare", name: "Ocean's Depth", rarity: "epic", cost: 7, sellValue: 4, effect: "Eights count as 10s for scoring." },
        { id: "scaled_of_justice", name: "Scales of Justice", rarity: "vibrant", cost: 4, sellValue: 2, effect: "Balance pips as dice to the average value (rounded)." },
        { id: "parmenides", name: "Parmenides", rarity: "epic", cost: 4, sellValue: 2, effect: "Lowest 2 dice show -1 (min 0); highest 2 dice show +1 (max 9)." },
    ],

    worship: [
        // Worship cards from CSV database only
        { id: "worship_artemis", name: "Blessing of Artemis", god: "Artemis", rarity: "planet", cost: 3, effect: "+1 Favour when scoring Ones." },
        { id: "worship_persephone", name: "Blessing of Persephone", god: "Persephone", rarity: "planet", cost: 3, effect: "+1 Favour when scoring Twos." },
        { id: "worship_morpheus", name: "Blessing of Morpheus", god: "Morpheus", rarity: "planet", cost: 3, effect: "+1 Favour when scoring Threes." },
        { id: "worship_hera", name: "Blessing of Hera", god: "Hera", rarity: "planet", cost: 3, effect: "+1 Favour when scoring Fours." },
        { id: "worship_athena", name: "Blessing of Athena", god: "Athena", rarity: "planet", cost: 3, effect: "+1 Favour when scoring Fives." },
        { id: "worship_heracles", name: "Blessing of Heracles", god: "Heracles", rarity: "planet", cost: 3, effect: "+1 Favour when scoring Sixes." },
        { id: "worship_hephaestus", name: "Blessing of Hephaestus", god: "Hephaestus", rarity: "planet", cost: 3, effect: "+1 Favour when scoring Three of a Kind." },
        { id: "worship_ares", name: "Blessing of Ares", god: "Ares", rarity: "planet", cost: 3, effect: "+1 Favour when scoring Four of a Kind." },
        { id: "worship_dionysus", name: "Blessing of Dionysus", god: "Dionysus", rarity: "planet", cost: 3, effect: "+1 Favour when scoring Full House." },
        { id: "worship_hermes", name: "Blessing of Hermes", god: "Hermes", rarity: "planet", cost: 3, effect: "+1 Favour when scoring Small Straight." },
        { id: "worship_apollo", name: "Blessing of Apollo", god: "Apollo", rarity: "planet", cost: 3, effect: "+1 Favour when scoring Large Straight." },
        { id: "worship_zeus", name: "Blessing of Zeus", god: "Zeus", rarity: "planet", cost: 3, effect: "+1 Favour when scoring Heureka." },
        { id: "worship_nyx", name: "Blessing of Nyx", god: "Nyx", rarity: "planet", cost: 3, effect: "+1 Favour when scoring Chance." },
        { id: "worship_pleiades", name: "Blessing of the Pleiades", god: "The Pleiades", rarity: "planet", cost: 3, effect: "+1 Favour when scoring Sevens." },
        { id: "worship_poseidon_eights", name: "Blessing of Poseidon (Eights)", god: "Poseidon", rarity: "planet", cost: 3, effect: "+1 Favour when scoring Eights." },
        { id: "worship_muses", name: "Blessing of the Nine Muses", god: "The Nine Muses", rarity: "planet", cost: 3, effect: "+1 Favour when scoring Nines." },
    ],

    houseRules: [
        // Libations from CSV database only
        { id: "kyphi_mead", name: "Kyphi Mead", rarity: "worship", cost: 3, sellValue: 0, effect: "Enhance a die face to Parchment.", type: "instant" },
        { id: "tisane_hephaestus", name: "Tisane of Hephaestus", rarity: "worship", cost: 3, sellValue: 0, effect: "Enhance a die face to Steel.", type: "instant" },
        { id: "ambrosial_krasi", name: "Ambrosial Krasi", rarity: "worship", cost: 3, sellValue: 0, effect: "Enhance a die face to Gold.", type: "instant" },
        { id: "retsina_echoes", name: "Retsina of Echoes", rarity: "worship", cost: 3, sellValue: 0, effect: "Enhance a die face to Mirror.", type: "instant" },
        { id: "soma_wild", name: "Soma of the Wild", rarity: "worship", cost: 3, sellValue: 0, effect: "Enhance a die face to Wild.", type: "instant" },
        { id: "kylix_hermit", name: "Kylix of the Hermit", rarity: "worship", cost: 4, sellValue: 0, effect: "Destroy a boon, Double your money (max 20).", type: "instant" },
        { id: "elixir_lethe", name: "Elixir of Lethe", rarity: "worship", cost: 3, sellValue: 0, effect: "Reduce a die face by 1.", type: "instant" },
        { id: "chalice_helios", name: "Chalice of Helios", rarity: "worship", cost: 3, sellValue: 0, effect: "Increase a die face by 1.", type: "instant" },
        { id: "distillate_masks", name: "Distillate of Masks", rarity: "worship", cost: 3, sellValue: 0, effect: "Apply a random enhancement to a random Boon.", type: "instant" },
        { id: "the_eucharist", name: "The Eucharist", rarity: "worship", cost: 3, sellValue: 0, effect: "Gain +1 worship level in god of choice.", type: "instant" },
        { id: "divine_guidance", name: "Divine Guidance", rarity: "worship", cost: 3, sellValue: 0, effect: "Gain 2 random levels in any 2 scores.", type: "instant" },
    ],

    packs: [
        { type: 'joker', name: 'Boon Pack', cost: 4, description: 'Reveals 3 Boons - choose one to claim.' },
        { type: 'worship', name: 'Worship Pack', cost: 4, description: 'Reveals 3 Worship cards - choose one to claim.' },
        { type: 'house_rule', name: 'Libation Pack', cost: 4, description: 'Reveals 3 Libations - choose one to claim.' },
        { type: 'chaos', name: 'Chaos Pack', cost: 6, description: 'Reveals 3 random cards - choose one from any combination of Boons, Worship, and Libations!' }
    ],

    artifacts: {
        'temple_market': {
            base: { id: "artifact_temple_market", name: "Temple Market", cost: 10, effect: "Shop inventory size increased by 1." }
        },
        'clearance_sale': {
            base: { id: "artifact_clearance_sale", name: "Merchants Arrival", cost: 10, effect: "All shop prices reduced by 25%." }
        },
        'crystal_ball': {
            base: { id: "artifact_crystal_ball", name: "Crystal Ball", cost: 10, effect: "+1 Libation slot." }
        },
        'telescope': {
            base: { id: "artifact_telescope", name: "Altar", cost: 10, effect: "+1 Worship card slot." }
        },
        'antimatter': {
            base: { id: "artifact_antimatter", name: "Antikythra", cost: 10, effect: "+1 Boon slot." }
        }
    },

    getAllCards: function() {
        return [
            ...this.jokers.map(c => ({...c, class: 'Joker'})),
            ...this.worship.map(c => ({...c, class: 'WorshipCard'})),
            ...this.houseRules.map(c => ({...c, class: 'HouseRuleCard'}))
        ];
    }
};