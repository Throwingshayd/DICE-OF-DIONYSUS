// Data Manager - Handles localStorage persistence and collection tracking

class DataManager {
    constructor() {
        this.prefix = 'diceOfDionysus_';
        this.version = '1.0';
        this.migrationCheck();
    }

    // Collection management
    getCollection() {
        const collection = localStorage.getItem(this.prefix + 'collection');
        return collection ? JSON.parse(collection) : {
            boons: [],
            artifacts: [],
            worship: [],
            libations: [],
            version: this.version
        };
    }

    saveCollection(collection) {
        collection.version = this.version;
        localStorage.setItem(this.prefix + 'collection', JSON.stringify(collection));
    }

    unlockItem(itemType, itemId) {
        const collection = this.getCollection();
        if (!collection[itemType]) {
            collection[itemType] = [];
        }
        if (!collection[itemType].includes(itemId)) {
            collection[itemType].push(itemId);
            this.saveCollection(collection);
            if (typeof Logger !== 'undefined') {
                Logger.info(`Unlocked ${itemType}: ${itemId}`);
            }
            return true;
        }
        return false;
    }

    isUnlocked(itemType, itemId) {
        const collection = this.getCollection();
        return collection[itemType] && collection[itemType].includes(itemId);
    }



    // Statistics tracking (simplified)
    updateStats(gameData) {
        // Simplified stats tracking - just log for now
        if (typeof Logger !== 'undefined') {
            Logger.info('Game completed:', gameData);
        }
    }

    // Settings management (Balatro: G.SETTINGS.GAMESPEED 0.5/1/2/4)
    getSettings() {
        const defaults = {
            soundEnabled: true,
            musicVolume: 0.6,
            sfxVolume: 0.8,
            animationsEnabled: true,
            autoSave: true,
            showTutorial: true,
            theme: 'default',
            gameSpeed: 2,
            version: this.version
        };
        const raw = localStorage.getItem(this.prefix + 'settings');
        if (!raw) return { ...defaults };
        try {
            const s = JSON.parse(raw);
            if (s.gameSpeed === undefined) s.gameSpeed = 2;
            if (![0.5, 1, 2, 4].includes(s.gameSpeed)) s.gameSpeed = 2;
            if (s.musicVolume === undefined) s.musicVolume = 0.6;
            if (s.sfxVolume === undefined) s.sfxVolume = 0.8;
            return { ...defaults, ...s };
        } catch {
            return { ...defaults };
        }
    }

    saveSettings(settings) {
        settings.version = this.version;
        localStorage.setItem(this.prefix + 'settings', JSON.stringify(settings));
    }

    /**
     * Save game state with optional PRNG and resume phase
     * @param {Object|Object} payload - Full payload { gameState, prngState?, resumePhase? } or legacy raw gameState
     * @param {string} [slot='auto']
     */
    saveGame(payload, slot = 'auto') {
        const gameState = payload?.gameState ?? payload;
        const saveData = {
            gameState,
            prngState: payload?.prngState ?? null,
            resumePhase: payload?.resumePhase ?? 'play',
            timestamp: Date.now(),
            version: this.version
        };
        localStorage.setItem(this.prefix + 'save_' + slot, JSON.stringify(saveData));
    }

    /**
     * Check if a valid save exists for Continue (Balatro: G.FUNCS.can_continue)
     * @param {string} [slot='auto']
     * @returns {boolean}
     */
    hasValidSave(slot = 'auto') {
        const raw = localStorage.getItem(this.prefix + 'save_' + slot);
        if (!raw) return false;
        try {
            const parsed = JSON.parse(raw);
            if (parsed.version !== this.version) return false;
            const g = parsed.gameState;
            return g && Array.isArray(g.dice) && g.dice.length >= 1 && g.gameOver !== true;
        } catch {
            return false;
        }
    }

    /**
     * Load saved game (gameState, prngState, resumePhase)
     * @param {string} [slot='auto']
     * @returns {Object|null} { gameState, prngState?, resumePhase? } or null
     */
    loadGame(slot = 'auto') {
        const raw = localStorage.getItem(this.prefix + 'save_' + slot);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (parsed.version !== this.version) {
            if (typeof Logger !== 'undefined') {
                Logger.warn('Save file version mismatch, cannot load');
            }
            return null;
        }
        return {
            gameState: parsed.gameState,
            prngState: parsed.prngState ?? null,
            resumePhase: parsed.resumePhase ?? 'play'
        };
    }

    deleteSave(slot = 'auto') {
        localStorage.removeItem(this.prefix + 'save_' + slot);
    }

    // Get all save slots
    getSaveSlots() {
        const saves = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.prefix + 'save_')) {
                const slot = key.replace(this.prefix + 'save_', '');
                const data = JSON.parse(localStorage.getItem(key));
                saves.push({
                    slot: slot,
                    timestamp: data.timestamp,
                    ante: data.gameState?.ante || 1,
                    score: data.gameState?.totalScore || 0
                });
            }
        }
        return saves.sort((a, b) => b.timestamp - a.timestamp);
    }



    // Version migration
    migrationCheck() {
        const collection = this.getCollection();
        if (!collection.version || collection.version !== this.version) {
            if (typeof Logger !== 'undefined') {
                Logger.info('Running data migration...');
            }
            this.migrateData(collection.version || '0.0');
        }
    }

    migrateData(fromVersion) {
        const collection = this.getCollection();
        const settings = this.getSettings();

        // Add migration logic here for future versions
        switch (fromVersion) {
            case '0.0':
                // Initial migration - ensure all arrays exist
                if (!collection.worship) collection.worship = [];
                if (!collection.libations) collection.libations = [];
                break;
            // Add more cases as needed for future versions
        }

        this.saveCollection(collection);
        this.saveSettings(settings);
        if (typeof Logger !== 'undefined') {
            Logger.info(`Migrated data from ${fromVersion} to ${this.version}`);
        }
    }
}