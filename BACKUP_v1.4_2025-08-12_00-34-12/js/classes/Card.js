// Base Card class - Foundation for all card types

class Card {
    constructor(data) {
        // Core properties
        this.id = data.id;
        this.name = data.name;
        this.rarity = data.rarity || 'common';
        this.cost = data.cost || 0;
        this.sellValue = data.sellValue || Math.floor(this.cost * 0.75);
        this.effect = data.effect || '';
        this.type = data.type || 'card';
        
        // Additional properties
        this.god = data.god || null;
        this.description = data.description || '';
        this.isActive = true;
        this.usesLeft = data.usesLeft || -1; // -1 means unlimited
        this.maxUses = data.maxUses || -1;
        
        // Metadata
        this.timesTriggered = 0;
        this.totalValue = 0;
        this.acquired = null; // timestamp when acquired
    }

    // Render the card's HTML element
    render(isShopItem = false, isDirectSale = false) {
        const el = document.createElement('div');
        el.className = `card ${this.type}-card ${this.rarity}`;
        
        // Add disabled class if not active
        if (!this.isActive) {
            el.classList.add('disabled');
        }

        // Add Balatro-style buy/sell labels
        let labelHtml = '';
        if (isShopItem) {
            if (isDirectSale) {
                labelHtml = `<div class="buy-sell-label buy" data-action="buy" data-cost="${this.cost}">Buy ${this.cost}g</div>`;
            } else {
                // For pack cards, create a button that can be converted to "Take"
                labelHtml = `<div class="buy-sell-label buy" data-action="take">Take</div>`;
            }
        } else {
            // For cards in inventory, show sell label
            labelHtml = `<div class="buy-sell-label sell" data-action="sell" data-value="${this.sellValue}">Sell ${this.sellValue}g</div>`;
        }

        // Uses counter for limited use cards
        let usesHtml = '';
        if (this.maxUses > 0) {
            usesHtml = `<div class="card-uses">${this.usesLeft}/${this.maxUses}</div>`;
        }

        // Add type indicator based on card type
        let typeIndicatorHtml = '';
        if (this.type === 'joker') {
            typeIndicatorHtml = '<div class="card-type-indicator card-type-boon">Boon</div>';
        } else if (this.type === 'worship') {
            typeIndicatorHtml = '<div class="card-type-indicator card-type-worship">Worship</div>';
        } else if (this.type === 'house_rule') {
            typeIndicatorHtml = '<div class="card-type-indicator card-type-libation">Libation</div>';
        }

        el.innerHTML = `
            <div class="card-rarity">${this.rarity}</div>
            ${usesHtml}
            <div class="card-name">${this.name}</div>
            <div class="card-effect">${this.effect}</div>
            ${this.god ? `<div class="card-god">- ${this.god}</div>` : ''}
            ${labelHtml}
            ${typeIndicatorHtml}
        `;

        // Add data attributes for easy access
        el.dataset.cardId = this.id;
        el.dataset.cardType = this.type;
        el.dataset.rarity = this.rarity;

        // Add Balatro-style tooltip
        const tooltipData = {
            title: this.name,
            effect: this.effect,
            cost: this.cost
        };
        el.setAttribute('data-tooltip', JSON.stringify(tooltipData));

        return el;
    }

    // Check if the card can be used
    canUse() {
        return this.isActive && (this.usesLeft > 0 || this.usesLeft === -1);
    }

    // Use the card (decrements uses if limited)
    use() {
        if (!this.canUse()) return false;
        
        if (this.usesLeft > 0) {
            this.usesLeft--;
        }
        
        this.timesTriggered++;
        return true;
    }

    // Disable/enable the card
    disable() {
        this.isActive = false;
    }

    enable() {
        this.isActive = true;
    }

    // Reset uses to maximum
    resetUses() {
        if (this.maxUses > 0) {
            this.usesLeft = this.maxUses;
        }
    }

    // Get card statistics
    getStats() {
        return {
            timesTriggered: this.timesTriggered,
            totalValue: this.totalValue,
            efficiency: this.cost > 0 ? this.totalValue / this.cost : 0,
            isActive: this.isActive,
            usesLeft: this.usesLeft
        };
    }

    // Clone the card
    clone() {
        const CardClass = this.constructor;
        const cloned = new CardClass({
            id: this.id,
            name: this.name,
            rarity: this.rarity,
            cost: this.cost,
            sellValue: this.sellValue,
            effect: this.effect,
            type: this.type,
            god: this.god,
            description: this.description,
            usesLeft: this.usesLeft,
            maxUses: this.maxUses
        });
        
        cloned.isActive = this.isActive;
        cloned.timesTriggered = this.timesTriggered;
        cloned.totalValue = this.totalValue;
        cloned.acquired = this.acquired;
        
        return cloned;
    }

    // Serialize for saving
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            rarity: this.rarity,
            cost: this.cost,
            sellValue: this.sellValue,
            effect: this.effect,
            type: this.type,
            god: this.god,
            description: this.description,
            isActive: this.isActive,
            usesLeft: this.usesLeft,
            maxUses: this.maxUses,
            timesTriggered: this.timesTriggered,
            totalValue: this.totalValue,
            acquired: this.acquired
        };
    }

    // Load from saved data
    fromJSON(data) {
        Object.assign(this, data);
    }

    // Get detailed information about the card
    getInfo() {
        return {
            id: this.id,
            name: this.name,
            rarity: this.rarity,
            type: this.type,
            cost: this.cost,
            sellValue: this.sellValue,
            effect: this.effect,
            god: this.god,
            description: this.description,
            canUse: this.canUse(),
            stats: this.getStats()
        };
    }

    // Compare cards for sorting
    static compare(a, b) {
        // Sort by rarity first
        const rarityOrder = { 'common': 1, 'uncommon': 2, 'rare': 3, 'legendary': 4 };
        const rarityDiff = rarityOrder[a.rarity] - rarityOrder[b.rarity];
        if (rarityDiff !== 0) return rarityDiff;
        
        // Then by cost
        const costDiff = a.cost - b.cost;
        if (costDiff !== 0) return costDiff;
        
        // Finally by name
        return a.name.localeCompare(b.name);
    }

    // Static method to create card from data
    static fromData(data) {
        return new Card(data);
    }

    // Get rarity color
    getRarityColor() {
        const colors = {
            'common': '#8B4513',
            'uncommon': '#4682B4', 
            'rare': '#9932CC',
            'legendary': '#FFD700'
        };
        return colors[this.rarity] || colors.common;
    }

    // Get type-specific icon
    getTypeIcon() {
        const icons = {
            'joker': '⭐',
            'worship': '🛐',
            'house_rule': '🍷',
            'artifact': '🏺'
        };
        return icons[this.type] || '🎲';
    }

    // Check if this card is an upgrade of another
    isUpgradeOf(otherCard) {
        // Default implementation - override in subclasses
        return false;
    }

    // Get the base version of this card (if it's an upgrade)
    getBaseVersion() {
        // Default implementation - override in subclasses
        return null;
    }

    // Check if this card synergizes with another
    synergizesWith(otherCard) {
        // Default implementation - can be overridden
        if (this.god && otherCard.god && this.god === otherCard.god) {
            return true;
        }
        return false;
    }
}