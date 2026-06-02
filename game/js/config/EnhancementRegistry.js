/* exported EnhancementRegistry */
/**
 * EnhancementRegistry - single source of truth for enhancement display + UI metadata.
 *
 * Internal enhancement ids (e.g. 'iron') are stable for saves/logic.
 * Display language can change (e.g. iron/steel => Clockwork) via this registry.
 */
const EnhancementRegistry = {
    /**
     * @param {string} id
     * @returns {{id: string, displayName: string, oneLiner: string, triggerLine: string, details?: string, ui?: Object}|null}
     */
    get(id) {
        return this._defs[id] || null;
    },

    /**
     * @param {string} id
     * @returns {string}
     */
    displayName(id) {
        return this._defs[id]?.displayName || id;
    },

    /**
     * @param {string} id
     * @returns {string}
     */
    oneLiner(id) {
        return this._defs[id]?.oneLiner || '';
    },

    /**
     * @param {string} id
     * @returns {string}
     */
    triggerLine(id) {
        return this._defs[id]?.triggerLine || '';
    },

    /**
     * @param {string} id
     * @returns {{chipColor?: string, textureClass?: string}|{}}
     */
    ui(id) {
        return this._defs[id]?.ui || {};
    },

    // Definitions
    _defs: {
        parchment: {
            id: 'parchment',
            displayName: 'Parchment',
            oneLiner: '25% +1 Favour • 15% +5 Gold',
            triggerLine: 'Triggers when scored',
            ui: { chipColor: '#c9a36a', textureClass: 'cw-tex-parchment' }
        },
        // NOTE: internal id remains 'iron' for save/logic stability; display name becomes Clockwork.
        iron: {
            id: 'iron',
            displayName: 'Clockwork',
            oneLiner: '+5 Pips',
            triggerLine: 'Triggers when scored',
            ui: { chipColor: '#7aa6c2', textureClass: 'cw-tex-clockwork' }
        },
        gold: {
            id: 'gold',
            displayName: 'Gold',
            oneLiner: '+1 Gold',
            triggerLine: 'Triggers when scored',
            ui: { chipColor: '#f6c343', textureClass: 'cw-tex-gold' }
        },
        mother_of_pearl: {
            id: 'mother_of_pearl',
            displayName: 'Mother of Pearl',
            oneLiner: '+ adjacent die value (50/50)',
            triggerLine: 'Applies when scored',
            ui: { chipColor: '#d6d0ff', textureClass: 'cw-tex-pearl' }
        },
        wild: {
            id: 'wild',
            displayName: 'Wild',
            oneLiner: 'Rolls as -1 / 0 / +1',
            triggerLine: 'Applies on roll',
            ui: { chipColor: '#a78bfa', textureClass: 'cw-tex-wild' }
        },
        mirror: {
            id: 'mirror',
            displayName: 'Mirror',
            oneLiner: 'Scores twice',
            triggerLine: 'Triggers when scored',
            ui: { chipColor: '#e9e7ff', textureClass: 'cw-tex-mirror' }
        },
        lucky: {
            id: 'lucky',
            displayName: 'Lucky',
            oneLiner: '20% counts as 6',
            triggerLine: 'Applies when scored',
            ui: { chipColor: '#7dd3fc', textureClass: 'cw-tex-lucky' }
        },
        cursed: {
            id: 'cursed',
            displayName: 'Cursed',
            oneLiner: '-1 value (min 1)',
            triggerLine: 'Applies when scored',
            ui: { chipColor: '#f87171', textureClass: 'cw-tex-cursed' }
        },
        divine: {
            id: 'divine',
            displayName: 'Divine',
            oneLiner: 'Always counts as 6',
            triggerLine: 'Applies when scored',
            ui: { chipColor: '#fde68a', textureClass: 'cw-tex-divine' }
        },
        chaos: {
            id: 'chaos',
            displayName: 'Chaos',
            oneLiner: 'Random roll effect',
            triggerLine: 'Applies on roll',
            ui: { chipColor: '#fb7185', textureClass: 'cw-tex-chaos' }
        },
    }
};

if (typeof window !== 'undefined') window.EnhancementRegistry = EnhancementRegistry;
