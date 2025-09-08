// Die class - Represents a single die with 6 independent faces

class Die {
    constructor(dieId = null) {
        this.currentFace = 0; // Which face is currently showing (1-6)
        this.isLocked = false;
        this.tempModifier = 0;
        this.dieId = dieId; // Unique identifier for this die
        
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

    // Roll the die
    roll(prng) {
        if (!this.isLocked) {
            this.currentFace = Math.floor(prng.random() * 6) + 1;
            
            // Add Balatro-style rolling effect if effects system is available
            if (window.balatroEffects && this.dieElement) {
                window.balatroEffects.addDiceRollEffect(this.dieElement);
            }
        }
    }

    // Reset the die for a new turn
    reset() {
        this.currentFace = 0;
        this.isLocked = false;
        this.tempModifier = 0;
        // Face enhancements persist across turns
    }

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

    // Add enhancement to a specific face (1-6)
    addFaceEnhancement(faceValue, enhancement) {
        const faceKey = Math.max(1, Math.min(6, parseInt(faceValue, 10) || 0));
        if (this.faces[faceKey]) {
            this.faces[faceKey].enhancements.add(enhancement);
    
            return true;
        } else {
            console.error(`Invalid face value: ${faceValue}`);
            return false;
        }
    }

    // Remove enhancement from a specific face
    removeFaceEnhancement(faceValue, enhancement) {
        const faceKey = Math.max(1, Math.min(6, parseInt(faceValue, 10) || 0));
        if (this.faces[faceKey]) {
            this.faces[faceKey].enhancements.delete(enhancement);
        }
    }

    // Clear all enhancements from all faces
    clearAllEnhancements() {
        Object.values(this.faces).forEach(face => {
            face.enhancements.clear();
            face.modifiedValue = face.value;
        });
    }

    // Get the effective face value (including enhancements)
    getEffectiveFace() {
        if (this.currentFace === 0) return 0;
        
        const currentFaceData = this.faces[this.currentFace];
        if (!currentFaceData) return this.currentFace;
        
        // Start with the face's modified value, ensuring it's never below 1
        let effectiveFace = Math.max(1, currentFaceData.modifiedValue || currentFaceData.value);
        
        // Apply temporary modifiers
        effectiveFace += this.tempModifier;
        
        // Clamp between 1 and 9
        return Math.max(1, Math.min(9, effectiveFace));
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

    // Legacy methods - no longer used with new face-specific system
    addPermanentModifier(modifier) {
        console.warn('addPermanentModifier is deprecated - use face-specific modifications instead');
    }

    getPermanentModifier() {
        return 0; // No longer used
    }

    setBaseFace(value) {
        console.warn('setBaseFace is deprecated - use setFace instead');
        this.setFace(value);
    }

    // Get display value (might be different from effective face)
    getDisplayFace() {
        if (this.currentFace === 0) return '?';
        
        const effectiveFace = this.getEffectiveFace();
        // Ensure we never display 0 or negative values
        return Math.max(1, effectiveFace);
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

    // Check if current rolled face has a specific enhancement
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
            'steel': 'Always adds +1 to its value',
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
        this.currentFace = Math.max(1, Math.min(6, value));
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