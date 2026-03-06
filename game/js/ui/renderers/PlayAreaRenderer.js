/**
 * PlayAreaRenderer - Boon slots, consumables, artifacts, drag-and-drop
 * @module ui/renderers/PlayAreaRenderer
 * Uses uiManager.appendInventoryCard, uiManager.sellCard, uiManager.useConsumable (7-call-upon-able)
 */

const PlayAreaRenderer = {
    updatePlayAreaSlots(dom, gameState, gameEngine, uiManager) {
        const jokerKey = (gameState.jokers || []).map(j => j.id).join(',');
        const consumableKey = (gameState.consumables || []).map(c => c.id).join(',');
        const artifactKey = (gameState.artifacts || []).map(a => a.id).join(',');
        const hereticKey = gameState.hereticStacks ?? 0;
        const slotsKey = `${jokerKey}|${consumableKey}|${artifactKey}|${gameState.boonSlots ?? 5}|${gameState.consumableSlots ?? 2}|${hereticKey}`;
        if (uiManager._playAreaSlotsKey === slotsKey) return;
        uiManager._playAreaSlotsKey = slotsKey;

        this.updateJokerUI(dom, gameState, gameEngine, uiManager);
        this.updateConsumableUI(dom, gameState, gameEngine, uiManager);
        this.updateArtifactUI(dom);

        const boonCount = (gameState.jokers || []).length;
        const boonMax = gameState.boonSlots || (window.GAME_BALANCE?.STARTING_BOON_SLOTS ?? 5);
        const consumableCount = (gameState.consumables || []).length;
        const consumableMax = gameState.consumableSlots ?? (window.GAME_BALANCE?.STARTING_LIBATION_SLOTS ?? 2);
        if (dom.boonSlotCounter) dom.boonSlotCounter.textContent = `${boonCount}/${boonMax}`;
        if (dom.consumableSlotCounter) dom.consumableSlotCounter.textContent = `${consumableCount}/${consumableMax}`;
    },

    updateJokerUI(dom, gameState, gameEngine, uiManager) {
        const container = dom.jokerSlots;
        const boonsPanel = container?.closest('.inventory-panel-boons');
        if (!container) { Logger.warn('jokerSlots element not found'); return; }
        container.innerHTML = '';
        const jokers = gameState.jokers || [];
        if (jokers.length === 0) { if (boonsPanel) boonsPanel.classList.remove('has-multiple-boons'); return; }
        if (boonsPanel) boonsPanel.classList.toggle('has-multiple-boons', jokers.length >= 2);

        jokers.forEach(joker => {
            uiManager.appendInventoryCard(joker, container, {
                onSell: (c) => uiManager.sellCard(c, gameState, gameEngine),
                revealOn: 'click'
            });
        });
        this.setupBoonDragAndDrop(container, gameState, gameEngine);
    },

    setupBoonDragAndDrop(container, gameState, gameEngine) {
        const cards = container.querySelectorAll('.card[data-id]');
        if (cards.length < 2) return;
        let draggedId = null;

        cards.forEach((cardEl) => {
            cardEl.draggable = true;
            cardEl.classList.add('boon-draggable');
            cardEl.addEventListener('dragstart', (e) => {
                draggedId = cardEl.dataset.id;
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', draggedId);
                e.dataTransfer.setDragImage(cardEl, cardEl.offsetWidth / 2, cardEl.offsetHeight / 2);
                cardEl.classList.add('boon-dragging');
            });
            cardEl.addEventListener('dragend', () => {
                cardEl.classList.remove('boon-dragging');
                container.querySelectorAll('.card').forEach(c => c.classList.remove('boon-drag-over'));
                container._boonDidDrag = true;
                setTimeout(() => { container._boonDidDrag = false; }, 100);
            });
            cardEl.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (draggedId && cardEl.dataset.id !== draggedId) cardEl.classList.add('boon-drag-over');
            });
            cardEl.addEventListener('dragleave', () => cardEl.classList.remove('boon-drag-over'));
            cardEl.addEventListener('drop', (e) => {
                e.preventDefault();
                cardEl.classList.remove('boon-drag-over');
                const targetId = cardEl.dataset.id;
                if (!draggedId || !targetId || draggedId === targetId) return;
                const jokers = gameState.jokers || [];
                const fromIndex = jokers.findIndex(j => j.id === draggedId);
                const toIndex = jokers.findIndex(j => j.id === targetId);
                if (fromIndex === -1 || toIndex === -1) return;
                const card = jokers[fromIndex];
                jokers.splice(fromIndex, 1);
                jokers.splice(fromIndex < toIndex ? toIndex - 1 : toIndex, 0, card);
                if (gameEngine) { gameEngine.updateAllUI(); if (window.soundManager) window.soundManager.play('button', { volume: 0.4 }); }
            });
        });
        if (!container._boonDragClickHandler) {
            container._boonDragClickHandler = (e) => {
                if (container._boonDidDrag && e.target.closest('.card')) e.stopPropagation();
            };
            container.addEventListener('click', container._boonDragClickHandler, true);
        }
        container._boonDidDrag = false;
    },

    updateConsumableUI(dom, gameState, gameEngine, uiManager) {
        const container = dom.consumableSlots;
        if (!container) { Logger.warn('consumableSlots element not found'); return; }
        container.innerHTML = '';
        const consumables = gameState.consumables || [];
        consumables.forEach(card => {
            uiManager.appendInventoryCard(card, container, {
                onSell: (c) => uiManager.sellCard(c, gameState, gameEngine),
                onUse: (c) => {
                    const engine = gameEngine || window.game;
                    if ((c instanceof LibationCard || c instanceof WorshipCard) && engine) uiManager.useConsumable(c, gameState, engine);
                },
                revealOn: 'click'
            });
        });
    },

    updateArtifactUI(dom) {
        const container = dom.artifactSlots;
        if (!container) return;
        container.innerHTML = '';
    }
};

if (typeof window !== 'undefined') window.PlayAreaRenderer = PlayAreaRenderer;
