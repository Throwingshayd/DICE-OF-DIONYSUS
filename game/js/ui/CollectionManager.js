/**
 * CollectionManager — Anthology (collection) screen tabs and paging.
 */

class CollectionManager {
    constructor() {
        this.currentTab = 'boons';
        this.pageSize = 9;
        this.pageByTab = { boons: 0, artifacts: 0, worship: 0, libations: 0 };
        this.tabCards = { boons: [], artifacts: [], worship: [], libations: [] };
        /** Anthology = full catalog (all entries unlocked + tooltips). Set false to use save progress. */
        this.unlockAllInAnthology = true;
        this.bindPaginationControls();
    }

    _buildFullAnthologyCollection() {
        const full = { boons: [], artifacts: [], worship: [], libations: [] };
        if (typeof CardData === 'undefined') return full;
        CardData.boons.forEach((b) => full.boons.push(b.id));
        CardData.worship.forEach((w) => full.worship.push(w.id));
        CardData.libations.forEach((l) => full.libations.push(l.id));
        Object.values(CardData.artifacts || {}).forEach((pair) => {
            if (pair?.base?.id) full.artifacts.push(pair.base.id);
            if (pair?.upgraded?.id) full.artifacts.push(pair.upgraded.id);
        });
        return full;
    }

    _getAnthologyCollection() {
        if (this.unlockAllInAnthology) return this._buildFullAnthologyCollection();
        return window.dataManager.getCollection();
    }

    _isAnthologyUnlocked(collection, itemType, itemId) {
        if (this.unlockAllInAnthology) return true;
        const list = collection[itemType];
        return Array.isArray(list) && list.includes(itemId);
    }

    /** Anthology uses rack surface (same face as shop/pack). */
    _renderRackCard(cardInstance) {
        return cardInstance.render(true, false);
    }

    _applyLockedCollectionCard(cardEl) {
        cardEl.classList.add('locked', 'no-asset');
        cardEl.querySelectorAll(
            '.card-type-indicator, .card-name, .card-effect, .card-rarity, .card-god, .card-uses, .artifact-name'
        ).forEach((node) => { node.textContent = ''; });
        cardEl.querySelectorAll('.card-shop-cost, .card-background').forEach((node) => node.remove());
        cardEl.style.removeProperty('background-image');
        cardEl.removeAttribute('data-tooltip');
    }

    _appendUnlockMeta(cardEl, text) {
        const meta = document.createElement('div');
        meta.className = 'collection-unlock-meta';
        meta.textContent = text;
        cardEl.appendChild(meta);
    }

    populateCollection() {
        const collection = this._getAnthologyCollection();

        this.populateBoons(collection);
        this.populateArtifacts(collection);
        this.populateWorship(collection);
        this.populateLibations(collection);
        this.renderCurrentTabPage();
    }

    populateBoons(collection) {
        const grid = document.getElementById('boonsCollectionGrid');
        const cards = [];

        CardData.boons.forEach((boonData) => {
            const isUnlocked = this._isAnthologyUnlocked(collection, 'boons', boonData.id);
            const boon = new Boon(boonData);
            const cardEl = this._renderRackCard(boon);

            if (!isUnlocked) {
                this._applyLockedCollectionCard(cardEl);
            } else {
                this._appendUnlockMeta(cardEl, `${boon.rarity} • ${boon.cost}g`);
            }

            cards.push(cardEl);
        });
        this.tabCards.boons = cards;
        if (!grid.classList.contains('hidden')) this.renderTabPage('boons');
    }

    populateArtifacts(collection) {
        const grid = document.getElementById('artifactsCollectionGrid');
        const cards = [];

        Object.values(CardData.artifacts).forEach((artifactPair) => {
            [artifactPair.base, artifactPair.upgraded].forEach((artifactData) => {
                if (!artifactData) return;

                const isUnlocked = this._isAnthologyUnlocked(collection, 'artifacts', artifactData.id);
                const cardEl = this._renderRackCard(new Artifact(artifactData));

                if (!isUnlocked) {
                    this._applyLockedCollectionCard(cardEl);
                }

                cards.push(cardEl);
            });
        });
        this.tabCards.artifacts = cards;
        if (!grid.classList.contains('hidden')) this.renderTabPage('artifacts');
    }

    populateWorship(collection) {
        const grid = document.getElementById('worshipCollectionGrid');
        const cards = [];

        CardData.worship.forEach((worshipData) => {
            const isUnlocked = this._isAnthologyUnlocked(collection, 'worship', worshipData.id);
            const cardEl = this._renderRackCard(new WorshipCard(worshipData));

            if (!isUnlocked) {
                this._applyLockedCollectionCard(cardEl);
            }

            cards.push(cardEl);
        });
        this.tabCards.worship = cards;
        if (!grid.classList.contains('hidden')) this.renderTabPage('worship');
    }

    populateLibations(collection) {
        const grid = document.getElementById('libationsCollectionGrid');
        const cards = [];

        CardData.libations.forEach((libationData) => {
            const isUnlocked = this._isAnthologyUnlocked(collection, 'libations', libationData.id);
            const cardEl = this._renderRackCard(new LibationCard(libationData));

            if (!isUnlocked) {
                this._applyLockedCollectionCard(cardEl);
            }

            cards.push(cardEl);
        });
        this.tabCards.libations = cards;
        if (!grid.classList.contains('hidden')) this.renderTabPage('libations');
    }

    bindPaginationControls() {
        const prev = document.getElementById('collectionPrevPageBtn');
        const next = document.getElementById('collectionNextPageBtn');
        if (prev) prev.addEventListener('click', () => this.turnPage(-1));
        if (next) next.addEventListener('click', () => this.turnPage(1));
    }

    setCurrentTab(tab) {
        this.currentTab = tab;
        if (this.pageByTab[tab] == null) this.pageByTab[tab] = 0;
        this.renderCurrentTabPage();
    }

    turnPage(delta) {
        const tab = this.currentTab;
        const cards = this.tabCards[tab] || [];
        const maxPage = Math.max(0, Math.ceil(cards.length / this.pageSize) - 1);
        const nextPage = Math.max(0, Math.min(maxPage, (this.pageByTab[tab] || 0) + delta));
        if (nextPage === this.pageByTab[tab]) return;
        this.pageByTab[tab] = nextPage;
        this.renderTabPage(tab);
    }

    renderCurrentTabPage() {
        this.renderTabPage(this.currentTab);
    }

    renderTabPage(tab) {
        const grid = document.getElementById(`${tab}CollectionGrid`);
        if (!grid) return;
        const cards = this.tabCards[tab] || [];
        const maxPage = Math.max(0, Math.ceil(cards.length / this.pageSize) - 1);
        const page = Math.max(0, Math.min(maxPage, this.pageByTab[tab] || 0));
        this.pageByTab[tab] = page;
        const start = page * this.pageSize;
        const end = start + this.pageSize;

        grid.innerHTML = '';
        cards.slice(start, end).forEach((card) => grid.appendChild(card));
        for (let i = cards.slice(start, end).length; i < this.pageSize; i++) {
            const emptySlot = document.createElement('div');
            emptySlot.className = 'collection-slot-placeholder';
            emptySlot.setAttribute('aria-hidden', 'true');
            grid.appendChild(emptySlot);
        }
        this.updatePager(tab, page, maxPage);
    }

    updatePager(tab, page, maxPage) {
        const indicator = document.getElementById('collectionPageIndicator');
        const prev = document.getElementById('collectionPrevPageBtn');
        const next = document.getElementById('collectionNextPageBtn');
        if (indicator) indicator.textContent = `Page ${page + 1} / ${maxPage + 1}`;
        if (prev) prev.disabled = page <= 0;
        if (next) next.disabled = page >= maxPage;
    }
}

if (typeof window !== 'undefined') window.CollectionManager = CollectionManager;
