/**
 * Base Card class - Foundation for all card types (Boons, Worship, Libations)
 * @class
 * @example
 * const card = new Card({ id: 'test', name: 'Test Card', cost: 5 });
 */
class Card {
    /**
     * Creates a new card instance
     * @param {Object} data - Card configuration object
     * @param {string} data.id - Unique identifier for the card
     * @param {string} data.name - Display name
     * @param {string} [data.rarity='common'] - Card rarity (rustic/vibrant/epic/worship/libation)
     * @param {number} [data.cost=0] - Purchase cost in gold
     * @param {number} [data.sellValue] - Sell value (defaults to 75% of cost)
     * @param {string} [data.effect=''] - Effect description
     * @param {string} [data.type='card'] - Card type (joker/worship/libation/artifact)
     * @param {string|null} [data.god=null] - Associated god name
     * @param {string} [data.description=''] - Detailed description
     * @param {number} [data.usesLeft=-1] - Remaining uses (-1 = unlimited)
     * @param {number} [data.maxUses=-1] - Maximum uses (-1 = unlimited)
     */
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

    /**
     * Renders the card as an HTML element
     * @param {boolean} [isShopItem=false] - Whether card is being displayed in shop
     * @param {boolean} [isDirectSale=false] - Whether card is a direct purchase (vs pack)
     * @returns {HTMLElement} The card's DOM element
     */
    render(isShopItem = false, isDirectSale = false) {
        const el = document.createElement('div');
        el.className = `card ${this.type}-card ${this.rarity}`;
        el.dataset.id = this.id; // Add data-id for animations and targeting
        
        // Get asset for this card
        const cardAsset = AssetMapping.getCardAsset(this.id, this.type);
        const frameAsset = AssetMapping.getFrameAsset(this.type);
        
        // Create background image style
        let backgroundStyle = '';
        let hasAsset = false;
        if (cardAsset) {
            const assetPath = AssetMapping.getAssetPath(cardAsset);
            if (assetPath) {
                backgroundStyle = `background-image: url('${assetPath}');`;
                hasAsset = true;
            } else {
                Logger.warn(`Asset not found for card ${this.id}: ${cardAsset}`);
            }
        }
        
        // Add has-asset class if card has an asset, otherwise use fallback
        if (hasAsset) {
            el.classList.add('has-asset');
        } else {
            el.classList.add('no-asset');
        }
        
        // Add disabled class if not active
        if (!this.isActive) {
            el.classList.add('disabled');
        }

        // Add Balatro-style buy/sell/take labels
        let labelHtml = '';
        if (isShopItem) {
            if (isDirectSale) {
                // Shop purchase - green "Buy" button
                labelHtml = `<div class="buy-sell-label buy" data-action="buy" data-cost="${this.cost}">${this.cost}g</div>`;
            } else {
                // Pack cards - blue "Take" button
                labelHtml = `<div class="buy-sell-label take" data-action="take">Take</div>`;
            }
        } else {
            // Inventory - red "Sell" button
            labelHtml = `<div class="buy-sell-label sell" data-action="sell" data-value="${this.sellValue}">${this.sellValue}g</div>`;
        }

        // Uses counter for limited use cards
        let usesHtml = '';
        if (this.maxUses > 0) {
            usesHtml = `<div class="card-uses">${this.usesLeft}/${this.maxUses}</div>`;
        }

        // Balatro-style dynamic stat display for boons (shows current values like +20 Pips, x3 Mult)
        let dynamicStatsHtml = '';
        if (this.type === 'joker' && window.game && window.game.state) {
            const stats = this.getDynamicDisplayStats ? this.getDynamicDisplayStats(window.game.state) : [];
            if (stats && stats.length > 0) {
                dynamicStatsHtml = '<div class="card-dynamic-stats">';
                stats.forEach(stat => {
                    const colorClass = stat.type || 'pips'; // pips, mult, favour, gold, other
                    dynamicStatsHtml += `<div class="dynamic-stat ${colorClass}">${stat.value}</div>`;
                });
                dynamicStatsHtml += '</div>';
            }
        }

        // Add type indicator based on card type
        let typeIndicatorHtml = '';
        if (this.type === 'joker') {
            typeIndicatorHtml = '<div class="card-type-indicator card-type-boon">Boon</div>';
        } else if (this.type === 'worship') {
            typeIndicatorHtml = '<div class="card-type-indicator card-type-worship">Worship</div>';
        } else if (this.type === 'libation') {
            typeIndicatorHtml = '<div class="card-type-indicator card-type-libation">Libation</div>';
        }

        // Determine if we should show text or use tooltip
        const isInShop = isShopItem;
        const showText = isInShop; // Show text in shop, use tooltip outside shop
        
        let cardContent = '';
        if (showText) {
            // Show text content for shop cards
            cardContent = `
                <div class="card-rarity">${this.rarity}</div>
                ${usesHtml}
                <div class="card-name">${this.name}</div>
                <div class="card-effect">${this.effect}</div>
                ${this.god ? `<div class="card-god">- ${this.god}</div>` : ''}
            `;
        } else {
            // Use tooltip for inventory cards - minimal text
            cardContent = `
                <div class="card-rarity">${this.rarity}</div>
                ${usesHtml}
                <div class="card-name">${this.name}</div>
            `;
        }

        // Create frame style
        let frameStyle = '';
        if (frameAsset) {
            const framePath = AssetMapping.getAssetPath(frameAsset);
            if (framePath) {
                frameStyle = `background-image: url('${framePath}');`;
            } else {
                Logger.warn(`Frame asset not found for card type ${this.type}: ${frameAsset}`);
            }
        }

        el.innerHTML = `
            ${hasAsset ? `<div class="card-background" style="${backgroundStyle}"></div>` : ''}
            ${frameStyle ? `<div class="card-frame" style="${frameStyle}"></div>` : ''}
            ${!hasAsset ? `<div class="card-fallback-bg"><div class="fallback-name">${this.name}</div></div>` : ''}
            <div class="card-content">
                ${cardContent}
                ${labelHtml}
                ${typeIndicatorHtml}
                ${dynamicStatsHtml}
            </div>
        `;

        // Add data attributes for easy access
        el.dataset.cardId = this.id;
        el.dataset.cardType = this.type;
        el.dataset.rarity = this.rarity;
        el.dataset.inShop = isShopItem.toString();

        // Add Balatro-style tooltip with full information
        const tooltipData = {
            title: this.name,
            effect: this.effect,
            cost: this.cost,
            sellValue: this.sellValue,
            rarity: this.rarity,
            god: this.god,
            type: this.type
        };
        el.setAttribute('data-tooltip', JSON.stringify(tooltipData));

        return el;
    }

    /**
     * Check if the card can be used
     * @returns {boolean} True if card can be activated
     */
    canUse() {
        return this.isActive && (this.usesLeft > 0 || this.usesLeft === -1);
    }

    /**
     * Use the card (decrements remaining uses if limited)
     * @returns {boolean} True if card was successfully used
     */
    use() {
        if (!this.canUse()) return false;
        
        if (this.usesLeft > 0) {
            this.usesLeft--;
        }
        
        this.timesTriggered++;
        return true;
    }

    /**
     * Disable the card (prevents usage)
     */
    disable() {
        this.isActive = false;
    }

    /**
     * Enable the card (allows usage)
     */
    enable() {
        this.isActive = true;
    }

    /**
     * Reset uses to maximum value
     */
    resetUses() {
        if (this.maxUses > 0) {
            this.usesLeft = this.maxUses;
        }
    }

    /**
     * Get card usage statistics
     * @returns {{timesTriggered: number, totalValue: number, efficiency: number, isActive: boolean, usesLeft: number}}
     */
    getStats() {
        return {
            timesTriggered: this.timesTriggered,
            totalValue: this.totalValue,
            efficiency: this.cost > 0 ? this.totalValue / this.cost : 0,
            isActive: this.isActive,
            usesLeft: this.usesLeft
        };
    }

    /**
     * Create a deep copy of this card
     * @returns {Card} Cloned card instance
     */
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

    /**
     * Serialize card to JSON for saving
     * @returns {Object} Card data as plain object
     */
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

    /**
     * Load card state from saved data
     * @param {Object} data - Saved card data
     */
    fromJSON(data) {
        Object.assign(this, data);
    }

    /**
     * Get detailed information about the card
     * @returns {Object} Comprehensive card information
     */
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

    /**
     * Compare two cards for sorting
     * @param {Card} a - First card
     * @param {Card} b - Second card
     * @returns {number} Negative if a < b, positive if a > b, 0 if equal
     */
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

    /**
     * Create a card from data object
     * @static
     * @param {Object} data - Card configuration
     * @returns {Card} New card instance
     */
    static fromData(data) {
        return new Card(data);
    }

    /**
     * Get the color associated with this card's rarity
     * @returns {string} Hex color code
     */
    getRarityColor() {
        const colors = {
            'common': '#8B4513',
            'uncommon': '#4682B4', 
            'rare': '#9932CC',
            'legendary': '#FFD700'
        };
        return colors[this.rarity] || colors.common;
    }

    /**
     * Get emoji icon for card type
     * @returns {string} Emoji icon
     */
    getTypeIcon() {
        const icons = {
            'joker': '⭐',
            'worship': '🛐',
            'libation': '🍷',
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