// Asset Mapping System - Maps card IDs to their corresponding image assets

const AssetMapping = {
    // Boon (Joker) Assets
    jokers: {
        'hestias_hearth': 'hestias hearth.png',
        'charons_ferry_fare': 'charon ferry fare.png',
        'achilles_heel': 'achiles heel.png',
        'midas_touch': 'midas touch.png',
        'icarus_wings': 'icarus wings.png',
        'lethe_waters': 'lethe waters.png',
        'forge_of_hephaestus': 'forge of hephestus.png',
        'prometheus_gift': 'promethues gift.png',
        'chaos_primordial': 'chaos primordial.png',
        'artemis_common': 'artemis rustic.png',
        'persephone_common': 'Persephones gift.png',
        'persephone_uncommon': 'queens authority (1).png',
        'morpheus_common': 'morpheus dream.png',
        'heracles_rare': 'Mt oplymus.png',
        'hera_uncommon': 'queens authority (1).png',
        'athena_common': 'athena shield .png',
        'athena_uncommon': 'athena shield .png',
        'poseidon_eights_rare': 'worship posiedon.png',
        'scaled_of_justice': 'scales of justice.png',
        'parmenides': 'parmenides.png' // Note: This asset might not exist yet
    },

    // Worship Card Assets
    worship: {
        'worship_artemis': 'artemis bow.png',
        'worship_persephone': 'persephone pomegranate.png',
        'worship_morpheus': 'morpheus poppy.png',
        'worship_hera': 'worship hera.png',
        'worship_athena': 'worship athena.png',
        'worship_heracles': 'worship heracles.png',
        'worship_hephaestus': 'worship heaphestus.png',
        'worship_ares': 'worship ares.png',
        'worship_dionysus': 'worship dionysus.png',
        'worship_hermes': 'worship hermes.png',
        'worship_apollo': 'worship apollo.png',
        'worship_zeus': 'worship zues.png', // Note: asset has typo "zues" instead of "zeus"
        'worship_nyx': 'worship nyx.png',
        'worship_pleiades': 'worship pleasdes.png', // Note: asset has typo "pleasdes" instead of "pleiades"
        'worship_poseidon_eights': 'worship posiedon.png', // Note: asset has typo "posiedon" instead of "poseidon"
        'worship_muses': 'worship muses.png'
    },

    // Libation Assets
    libations: {
        'kyphi_mead': 'mead.png',
        'tisane_hephaestus': 'tisane.png',
        'ambrosial_krasi': 'ambrosia.png',
        'retsina_echoes': 'retina of echoes.png',
        'soma_wild': 'soma of the wild.png',
        'kylix_hermit': 'kylix of hermit.png',
        'elixir_lethe': 'ekuxur of lethe.png',
        'chalice_helios': 'chalice of helios.png',
        'the_eucharist': 'the eucharist.png',
        'divine_guidance': 'dviine guidance.png'
    },

    // Artifact Assets - DISABLED: Artifacts now use fallback white box display
    artifacts: {
        // All artifacts will display as white boxes with text (no images)
    },

    // Pack Assets
    packs: {
        'joker': 'boon pack.png',
        'worship': 'worship pack.png',
        'libation': 'Libation pack.png',
        'chaos': 'chaos pack.png'
    },

    // Frame Assets
    frames: {
        'joker': null, // Use CSS-based frame for boons since we don't have a boon frame asset
        'worship': 'worship frame.png',
        'libation': 'libation frame.png'
    },

    // Dice Face Assets
    diceFaces: {
        1: 'die face 1.png',
        2: 'die face 2.png',
        3: 'die face 3.png',
        4: 'die face 4.png',
        5: 'die face 5.png',
        6: 'die face 6.png',
        7: 'die face 7.png',
        8: 'die face 8.png',
        9: 'die face 9.png',
        'question': 'dice face question mark.png'
    },

    // Die Face Enhancement Assets
    // NOTE: Enhancement visuals are now handled by CSS tinting instead of image assets
    enhancements: {
        'parchment': null, // Now handled by CSS: .enh-parchment
        'iron': null, // Now handled by CSS: .enh-iron (1.5x favour if not selected)
        'gold': null, // Now handled by CSS: .enh-gold
        'mother_of_pearl': null, // Now handled by CSS: .enh-mother_of_pearl
        'mirror': null, // Now handled by CSS: .enh-mirror
        'wild': null, // Now handled by CSS: .enh-wild
        'cursed': null, // Now handled by CSS: .enh-cursed
        'sevens': null, // Now handled by CSS: .face-7
        'eights': null, // Now handled by CSS: .face-8
        'nines': null // Now handled by CSS: .face-9
    },

    // UI Assets
    ui: {
        'background': 'new background .png',
        'diceTable': 'dice table.png',
        'rollButton': 'roll button.png',
        'title': 'Title art.png',
        'inGameTitle': 'in game title.png',
        'columnScroll': 'column scroll new.png',
        'boonSlots': 'boon slots.png',
        'boonSlotsWithPillars': 'boon slots with pillars .png',
        'libations': 'LIBATIONS NEW.png',
        'libationFinal': 'libation final .png',
        'boonSlotsNew': 'boon slots new.png',
        'shopfront': 'shopfront new (1).png',
        'artifactCrate': 'Artifact crate.png',
        'extraRollArtifact': 'extra roll artifact.png',
        'artifactUndecided': 'artifact undecided.png'
    },

    // God-specific Assets
    gods: {
        'Artemis': 'artemis bow.png',
        'Hera': 'heras peacock.png',
        'Morpheus': 'morpheus poppy.png',
        'Persephone': 'persephone pomegranate.png'
    },

    // Helper function to get asset path for a card
    getCardAsset(cardId, cardType) {
        // Map card types to the correct mapping keys
        const typeMapping = {
            'joker': 'jokers',
            'worship': 'worship',
            'libation': 'libations'
        };
        
        const mappingKey = typeMapping[cardType] || cardType;
        const mapping = this[mappingKey] || this.jokers;
        return mapping[cardId] || null;
    },

    // Helper function to get frame asset for a card type
    getFrameAsset(cardType) {
        return this.frames[cardType] || null;
    },

    // Helper function to get dice face asset
    getDiceFaceAsset(face) {
        return this.diceFaces[face] || this.diceFaces['question'];
    },

    // Helper function to get enhancement asset
    getEnhancementAsset(enhancement) {
        return this.enhancements[enhancement] || null;
    },

    // Helper function to get UI asset
    getUIAsset(assetName) {
        return this.ui[assetName] || null;
    },

    // Helper function to get god asset
    getGodAsset(godName) {
        return this.gods[godName] || null;
    },

    // Helper function to get full asset path
    getAssetPath(assetName) {
        if (!assetName) return null;
        return `ART/${assetName}`;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AssetMapping;
}
