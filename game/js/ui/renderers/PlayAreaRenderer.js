/**
 * PlayAreaRenderer - Boon bar, left bar (libations + worship), artifacts, drag-and-drop
 * @module ui/renderers/PlayAreaRenderer
 * `consumables` in state = technical group for LibationCard + WorshipCard (see docs/GAME_TERMINOLOGY.md)
 */

const PlayAreaRenderer = {
    updatePlayAreaSlots(dom, gameState, gameEngine, uiManager) {
        const boonKey = (gameState.boons || []).map(j => j.id).join(',');
        const consumableKey = (gameState.consumables || []).map(c => c.id).join(',');
        const artifactKey = (gameState.artifacts || []).map(a => a.id).join(',');
        const hereticKey = gameState.hereticStacks ?? 0;
        const slotsKey = `${boonKey}|${consumableKey}|${artifactKey}|${gameState.boonSlots ?? 5}|${gameState.consumableSlots ?? 5}|${hereticKey}`;
        if (uiManager._playAreaSlotsKey === slotsKey) return;
        uiManager._playAreaSlotsKey = slotsKey;

        this.updateBoonUI(dom, gameState, gameEngine, uiManager);
        this.updateConsumableUI(dom, gameState, gameEngine, uiManager);
        this.updateArtifactUI(dom);

        const boonCount = (gameState.boons || []).length;
        const boonMax = gameState.boonSlots || (window.GAME_BALANCE?.STARTING_BOON_SLOTS ?? 5);
        const consumableCount = (gameState.consumables || []).length;
        const consumableMax = gameState.consumableSlots ?? (window.GAME_BALANCE?.STARTING_LIBATION_SLOTS ?? 5);
        if (dom.boonSlotCounter) dom.boonSlotCounter.textContent = `${boonCount}/${boonMax}`;
        if (dom.consumableSlotCounter) dom.consumableSlotCounter.textContent = `${consumableCount}/${consumableMax}`;
    },

    updateBoonUI(dom, gameState, gameEngine, uiManager) {
        const container = dom.boonSlots;
        const boonsPanel = container?.closest('.inventory-panel-boons');
        if (!container) { Logger.warn('boonSlots element not found'); return; }
        container.innerHTML = '';
        const boons = gameState.boons || [];
        if (boons.length === 0) {
            if (boonsPanel) boonsPanel.classList.remove('has-multiple-boons');
            uiManager.bindBoonSlotDrag(container, gameState, gameEngine);
            return;
        }
        if (boonsPanel) boonsPanel.classList.toggle('has-multiple-boons', boons.length >= 2);

        boons.forEach((boon) => {
            uiManager.appendInventoryCard(boon, container, {});
        });
        uiManager.bindBoonSlotDrag(container, gameState, gameEngine);
    },

    updateConsumableUI(dom, gameState, gameEngine, uiManager) {
        const container = dom.consumableSlots;
        if (!container) { Logger.warn('consumableSlots element not found'); return; }
        container.innerHTML = '';
        const consumables = gameState.consumables || [];
        consumables.forEach((card) => {
            uiManager.appendInventoryCard(card, container, {});
        });
        uiManager.bindConsumableHorizonDrag(container);
    },

    updateArtifactUI(dom) {
        const container = dom.artifactSlots;
        if (!container) return;
        container.innerHTML = '';
    }
};

if (typeof window !== 'undefined') window.PlayAreaRenderer = PlayAreaRenderer;
