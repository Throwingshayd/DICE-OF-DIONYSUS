/**
 * Die class - Represents a single six-sided die with face-specific enhancements
 * Each die has 6 independent faces that can be enhanced individually
 * @class
 * @example
 * const die = new Die(1);
 * die.roll(prng);
 * die.addFaceEnhancement(6, 'gold'); // Enhance the 6-face with gold
 */
class Die {
    /**
     * Creates a new die instance
     * @param {number|null} [dieId=null] - Unique identifier for this die
     */
    constructor(dieId = null) {
        /** @type {number} Which face is currently showing (0 = not rolled, 1-6 = face value) */
        this.currentFace = 0;
        /** @type {boolean} Whether this die is held/locked from rolling */
        this.isLocked = false;
        /** @type {number} Temporary modifier for current roll */
        this.tempModifier = 0;
        /** @type {number|null} Unique identifier for this die */
        this.dieId = dieId;
        
        // Each face is an independent entity with its own properties
        this.faces = {
            1: { value: 1, enhancements: new Set(), modifiedValue: 1 },
            2: { value: 2, enhancements: new Set(), modifiedValue: 2 },
            3: { value: 3, enhancements: new Set(), modifiedValue: 3 },
            4: { value: 4, enhancements: new Set(), modifiedValue: 4 },
            5: { value: 5, enhancements: new Set(), modifiedValue: 5 },
            6: { value: 6, enhancements: new Set(), modifiedValue: 6 }
        };
    }

    /**
     * Roll the die to generate a random face value
     * @param {Object} prng - Seeded random number generator
     * @param {Function} prng.random - Returns random number 0-1
     */
    roll(prng) {
        if (!this.isLocked) {
            this.currentFace = Math.floor(prng.random() * GAME_BALANCE.MAX_DIE_FACE) + GAME_BALANCE.MIN_DIE_FACE;
            
            // Add Balatro-style rolling effect if effects system is available
            if (window.balatroEffects && this.dieElement) {
                window.balatroEffects.addDiceRollEffect(this.dieElement);
            }
        }
    }

    /**
     * Reset the die for a new turn
     * Note: Face enhancements persist across turns
     */
    reset() {
        this.currentFace = 0;
        this.isLocked = false;
        this.tempModifier = 0;
        // Face enhancements persist across turns
    }

    /**
     * Completely reset the die, including all enhancements
     */
    fullReset() {
        this.currentFace = 0;
        this.isLocked = false;
        this.tempModifier = 0;
        // Reset all face enhancements
        Object.values(this.faces).forEach(face => {
            face.enhancements.clear();
            face.modifiedValue = face.value;
        });
    }

    /**
     * Validate if a face value is in valid range (1-6)
     * @param {number|string} faceValue - Face value to validate
     * @returns {boolean} True if valid, false otherwise
     */
    isValidFace(faceValue) {
        const parsedFace = parseInt(faceValue, 10);
        return !isNaN(parsedFace) && 
               parsedFace >= GAME_BALANCE.MIN_DIE_FACE && 
               parsedFace <= GAME_BALANCE.MAX_DIE_FACE;
    }

    /**
     * Get validated face key (1-6) or null if invalid
     * @param {number|string} faceValue - Face value to validate
     * @returns {number|null} Validated face number or null
     */
    getValidatedFaceKey(faceValue) {
        if (!this.isValidFace(faceValue)) {
            console.warn(`Invalid face value: ${faceValue}. Must be between 1 and 6.`);
            return null;
        }
        return parseInt(faceValue, 10);
    }

    /**
     * Add an enhancement to a specific die face
     * @param {number|string} faceValue - Face to enhance (1-6)
     * @param {string} enhancement - Enhancement type (parchment/iron/gold/mirror/wild)
     * @returns {boolean} True if enhancement was added successfully
     * @example
     * die.addFaceEnhancement(6, 'gold'); // 6-face now gives +1 gold when scored
     */
    addFaceEnhancement(faceValue, enhancement) {
        const faceKey = this.getValidatedFaceKey(faceValue);
        if (faceKey === null) {
            console.error(`Cannot add enhancement to invalid face: ${faceValue}`);
            return false;
        }
        
        if (!this.faces[faceKey]) {
            console.error(`Face ${faceKey} does not exist in die structure`);
            return false;
        }
        
        this.faces[faceKey].enhancements.add(enhancement);
        return true;
    }

    /**
     * Remove an enhancement from a specific die face
     * @param {number|string} faceValue - Face to modify (1-6)
     * @param {string} enhancement - Enhancement type to remove
     * @returns {boolean} True if removed successfully
     */
    removeFaceEnhancement(faceValue, enhancement) {
        const faceKey = this.getValidatedFaceKey(faceValue);
        if (faceKey && this.faces[faceKey]) {
            this.faces[faceKey].enhancements.delete(enhancement);
            return true;
        }
        return false;
    }

    /**
     * Permanently modify a face's value (e.g., Elixir of Lethe, Chalice of Helios)
     * @param {number|string} faceValue - Face to modify (1-6)
     * @param {number} delta - Amount to change (+1 or -1)
     * @returns {boolean} True if modification was successful
     */
    modifyFaceValue(faceValue, delta) {
        const faceKey = this.getValidatedFaceKey(faceValue);
        if (faceKey === null) {
            console.error(`Cannot modify invalid face: ${faceValue}`);
            return false;
        }
        
        if (!this.faces[faceKey]) {
            console.error(`Face ${faceKey} does not exist in die structure`);
            return false;
        }
        
        const currentValue = this.faces[faceKey].modifiedValue || this.faces[faceKey].value;
        const newValue = Math.max(GAME_BALANCE.MIN_DIE_FACE, 
                                   Math.min(GAME_BALANCE.MAX_DIE_FACE_WITH_ENHANCEMENTS, currentValue + delta));
        this.faces[faceKey].modifiedValue = newValue;
        
        return true;
    }

    // Clear all enhancements from all faces
    clearAllEnhancements() {
        Object.values(this.faces).forEach(face => {
            face.enhancements.clear();
            face.modifiedValue = face.value;
        });
    }

    /**
     * Get the effective face value (including all modifications and enhancements)
     * @returns {number} Effective face value (1-9, clamped)
     */
    getEffectiveFace() {
        if (this.currentFace === 0) return 0;
        
        const currentFaceData = this.faces[this.currentFace];
        if (!currentFaceData) return this.currentFace;
        
        // Start with the face's modified value, ensuring it's never below 1
        let effectiveFace = Math.max(1, currentFaceData.modifiedValue || currentFaceData.value);
        
        // Apply temporary modifiers
        effectiveFace += this.tempModifier;
        
        // Clamp between min and max (with enhancements)
        return Math.max(GAME_BALANCE.MIN_DIE_FACE, Math.min(GAME_BALANCE.MAX_DIE_FACE_WITH_ENHANCEMENTS, effectiveFace));
    }

    // Apply a specific enhancement to a face value (legacy method - enhancements are now handled in scoring)
    applyEnhancement(face, enhancement) {
        // This method is kept for compatibility but enhancements are now handled in scoring
        return face;
    }

    // Add a temporary modifier (for libations like increase/decrease)
    addTempModifier(modifier) {
        this.tempModifier += modifier;
    }

    // Reset temporary modifiers
    resetTempModifier() {
        this.tempModifier = 0;
    }


    /**
     * Get the value to display on screen
     * @returns {string|number} '?' if not rolled, otherwise the effective face value
     */
    getDisplayFace() {
        if (this.currentFace === 0) return '?';
        
        const effectiveFace = this.getEffectiveFace();
        // Ensure we never display 0 or negative values
        return Math.max(GAME_BALANCE.MIN_DIE_FACE, effectiveFace);
    }

    // Get a list of active enhancements for the current face
    getActiveEnhancements() {
        if (this.currentFace === 0) return [];
        const currentFaceData = this.faces[this.currentFace];
        return currentFaceData ? Array.from(currentFaceData.enhancements) : [];
    }

    // Check if this die has a specific enhancement on any face
    hasEnhancement(enhancement) {
        return Object.values(this.faces).some(face => face.enhancements.has(enhancement));
    }

    /**
     * Check if the currently rolled face has a specific enhancement
     * @param {string} enhancement - Enhancement type to check for
     * @returns {boolean} True if current face has this enhancement
     */
    hasEnhancementForCurrentFace(enhancement) {
        if (this.currentFace === 0) return false;
        
        const currentFaceData = this.faces[this.currentFace];
        if (!currentFaceData) return false;
        
        const hasEnhancement = currentFaceData.enhancements.has(enhancement);
        if (hasEnhancement) {
    
        }
        return hasEnhancement;
    }

    // Summary string for tooltips: face-specific enhancements
    getFaceEnhancementSummary() {
        const enhancedFaces = [];
        Object.entries(this.faces).forEach(([faceNum, faceData]) => {
            if (faceData.enhancements.size > 0) {
                enhancedFaces.push(`${faceNum}: ${Array.from(faceData.enhancements).join(', ')}`);
            }
        });
        
        if (enhancedFaces.length === 0) return '';
        return `Face Enhancements → ${enhancedFaces.join(' | ')}`;
    }

    // Get enhancements for the current face only
    getCurrentFaceEnhancements() {
        if (this.currentFace === 0) return [];
        const currentFaceData = this.faces[this.currentFace];
        return currentFaceData ? Array.from(currentFaceData.enhancements) : [];
    }

    // Check if current face has any enhancements
    hasCurrentFaceEnhancements() {
        return this.getCurrentFaceEnhancements().length > 0;
    }

    // Get enhancement description
    getEnhancementDescription(enhancement) {
        const descriptions = {
            'parchment': '1/6 chance for +1 Favour, 1/15 chance for +15 Gold when scored',
            'iron': '+5 Pips when scored',
            'gold': '+1 Gold when scored',
            'mother_of_pearl': 'Adds adjacent dice pips when scored',
            'wild': 'Can be treated as +1 or -1 when scored (face-specific)',
            'mirror': 'Copies the value of adjacent dice',
            'lucky': 'Has a 20% chance to count as 6',
            'cursed': 'Subtracts 1 from its value (minimum 1)',
            'divine': 'Always counts as 6',
            'chaos': 'Random effect each roll (-1 to +2)'
        };
        return descriptions[enhancement] || 'Unknown enhancement';
    }

    // Lock/unlock the die
    lock() {
        this.isLocked = true;
    }

    unlock() {
        this.isLocked = false;
    }

    // Set the current face value
    setFace(value) {
        this.currentFace = Math.max(GAME_BALANCE.MIN_DIE_FACE, Math.min(GAME_BALANCE.MAX_DIE_FACE, value));
    }

    // Get a copy of this die
    clone() {
        const newDie = new Die(this.dieId);
        newDie.currentFace = this.currentFace;
        newDie.isLocked = this.isLocked;
        newDie.tempModifier = this.tempModifier;
        
        // Clone all face data
        Object.entries(this.faces).forEach(([faceNum, faceData]) => {
            newDie.faces[faceNum].enhancements = new Set(faceData.enhancements);
            newDie.faces[faceNum].modifiedValue = faceData.modifiedValue;
        });
        
        return newDie;
    }

    // Serialize for saving
    toJSON() {
        const facesData = {};
        Object.entries(this.faces).forEach(([faceNum, faceData]) => {
            facesData[faceNum] = {
                value: faceData.value,
                enhancements: Array.from(faceData.enhancements),
                modifiedValue: faceData.modifiedValue
            };
        });
        
        return {
            currentFace: this.currentFace,
            faces: facesData,
            isLocked: this.isLocked,
            tempModifier: this.tempModifier,
            dieId: this.dieId
        };
    }

    // Load from saved data
    fromJSON(data) {
        this.currentFace = data.currentFace || 0;
        this.isLocked = data.isLocked || false;
        this.tempModifier = data.tempModifier || 0;
        this.dieId = data.dieId || null;
        
        if (data.faces) {
            Object.entries(data.faces).forEach(([faceNum, faceData]) => {
                if (this.faces[faceNum]) {
                    this.faces[faceNum].enhancements = new Set(faceData.enhancements || []);
                    this.faces[faceNum].modifiedValue = faceData.modifiedValue || faceData.value;
                }
            });
        }
    }
}