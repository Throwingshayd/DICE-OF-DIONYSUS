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
            console.log(`Unlocked ${itemType}: ${itemId}`);
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
        console.log('Game completed:', gameData);
    }

    // Settings management
    getSettings() {
        const settings = localStorage.getItem(this.prefix + 'settings');
        return settings ? JSON.parse(settings) : {
            soundEnabled: true,
            animationsEnabled: true,
            autoSave: true,
            showTutorial: true,
            theme: 'default',
            version: this.version
        };
    }

    saveSettings(settings) {
        settings.version = this.version;
        localStorage.setItem(this.prefix + 'settings', JSON.stringify(settings));
    }

    // Save game state
    saveGame(gameState, slot = 'auto') {
        const saveData = {
            gameState: gameState,
            timestamp: Date.now(),
            version: this.version
        };
        localStorage.setItem(this.prefix + 'save_' + slot, JSON.stringify(saveData));
    }

    loadGame(slot = 'auto') {
        const saveData = localStorage.getItem(this.prefix + 'save_' + slot);
        if (saveData) {
            const parsed = JSON.parse(saveData);
            if (parsed.version === this.version) {
                return parsed.gameState;
            } else {
                console.warn('Save file version mismatch, cannot load');
                return null;
            }
        }
        return null;
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
            console.log('Running data migration...');
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
        console.log(`Migrated data from ${fromVersion} to ${this.version}`);
    }
}