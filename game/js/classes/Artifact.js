// Artifact class - Represents Divine Artifacts (like Balatro's Vouchers)
// Artifacts are permanent passive effects that cost 10 gold each

class Artifact extends Card {
    constructor(data) {
        super(data);
        this.type = 'artifact';
        this.cost = data.cost ?? 10; // Merchant Arrival discount applied when data.cost passed
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
            labelHtml = `<div class="buy-sell-label buy artifact-buy" data-action="buy" data-cost="${this.cost}">${this.cost}g</div>`;
        }
        
        // Artifact type indicator
        const typeIndicatorHtml = '<div class="card-type-indicator card-type-artifact">Divine Artifact</div>';
        
        // Card content - same white frame structure as boons; effect shown on hover via tooltip
        const cardContent = `
            <div class="card-frame" style="background: linear-gradient(135deg, #FFD700, #DAA520); border-radius: 8px;"></div>
            <div class="card-content">
                ${typeIndicatorHtml}
                <div class="artifact-name">${this.name}</div>
                ${labelHtml}
            </div>
        `;
        
        el.innerHTML = cardContent;
        
        // Effect as hover tooltip (Balatro-style)
        if (this.effect) {
            el.setAttribute('data-tooltip', JSON.stringify({ title: this.name, effect: this.effect }));
        }
        
        return el;
    }

    // Apply artifact effect (passive, permanent)
    applyEffect(gameState) {
        // Artifact effects are applied via dedicated engine paths
        // Could be refactored to have dedicated artifact system
        Logger.info(`Artifact purchased: ${this.name}`);
    }
}

// Make Artifact available globally
if (typeof window !== 'undefined') {
    window.Artifact = Artifact;
}

