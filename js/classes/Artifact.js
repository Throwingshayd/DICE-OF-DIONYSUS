// Artifact class - Represents Divine Artifacts (like Balatro's Vouchers)
// Artifacts are permanent passive effects that cost 10 gold each

class Artifact extends Card {
    constructor(data) {
        super(data);
        this.type = 'artifact';
        this.cost = 10; // All artifacts cost 10 gold (like Balatro vouchers)
        this.sellValue = 0; // Artifacts cannot be sold
        this.rarity = 'artifact';
        
        // Ensure description exists
        if (!this.description && this.effect) {
            this.description = this.effect;
        }
    }

    // Artifacts are always active once purchased
    canUse() {
        return true;
    }

    // Render artifact card with special styling
    render(isShopItem = false, isDirectSale = false) {
        const el = document.createElement('div');
        el.className = 'card artifact-card';
        
        // Add rarity styling
        if (this.rarity) {
            el.classList.add(`card-${this.rarity}`);
        }
        
        // Check for asset
        let hasAsset = false;
        let assetPath = null;
        
        if (window.AssetMapping) {
            assetPath = AssetMapping.getArtifactAsset(this.id);
            if (assetPath) {
                hasAsset = true;
                el.style.backgroundImage = `url('${assetPath}')`;
                el.style.backgroundSize = 'cover';
                el.style.backgroundPosition = 'center';
            }
        }
        
        // If no asset, use white fallback
        if (!hasAsset) {
            el.classList.add('no-asset');
            el.style.background = 'white';
        }
        
        // Add buy label for shop items
        let labelHtml = '';
        if (isShopItem && isDirectSale) {
            labelHtml = `<div class="buy-sell-label buy artifact-buy" data-action="buy" data-cost="${this.cost}">10g</div>`;
        }
        
        // Artifact type indicator
        const typeIndicatorHtml = '<div class="card-type-indicator card-type-artifact">Divine Artifact</div>';
        
        // Card content - always show text for artifacts (like Balatro vouchers)
        const cardContent = `
            ${typeIndicatorHtml}
            <div class="artifact-name">${this.name}</div>
            <div class="artifact-effect">${this.effect || ''}</div>
            ${this.description ? `<div class="artifact-description">${this.description}</div>` : ''}
        `;
        
        el.innerHTML = labelHtml + cardContent;
        
        return el;
    }

    // Apply artifact effect (passive, permanent)
    applyEffect(gameState) {
        // Artifact effects are applied via Joker.applyEffect() for now
        // Could be refactored to have dedicated artifact system
        Logger.info(`Artifact purchased: ${this.name}`);
    }
}

// Make Artifact available globally
if (typeof window !== 'undefined') {
    window.Artifact = Artifact;
}

