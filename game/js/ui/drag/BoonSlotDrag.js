/**
 * Boon bar drag: sell on gold stone, reorder by dropping on another boon.
 * @module BoonSlotDrag
 */

/* global PointerGeometry, PointerDragGhost */

const BoonSlotDrag = {
    /**
     * @param {HTMLElement} container - #boonSlots
     * @param {UIManager} ui
     * @param {Object} gameState
     * @param {Object} gameEngine
     */
    bind(container, ui, gameState, gameEngine) {
        if (!container || container._boonSlotDragBound) return;
        container._boonSlotDragBound = true;
        const TH = PointerGeometry?.DRAG_THRESHOLD_PX ?? 14;
        const pointIn = PointerGeometry?.pointIn ?? ((px, py, el) => false);
        const pointInRect = PointerGeometry?.pointInRect ?? (() => false);
        const findBoon = (id) => (gameState.boons || []).find((b) => b.id === id);
        const goldStone = () => document.getElementById('goldStone');

        container.addEventListener('pointerdown', (e) => {
            if (e.button !== 0) return;
            const cardEl = e.target.closest('.card');
            if (!cardEl || !container.contains(cardEl)) return;
            const id = cardEl.dataset.id;
            if (!id || !findBoon(id)) return;
            container._boonDrag = {
                pointerId: e.pointerId,
                cardEl,
                id,
                startX: e.clientX,
                startY: e.clientY,
                dragging: false,
                ghost: null,
            };
            try { cardEl.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
        });

        const finish = (e) => {
            const st = container._boonDrag;
            if (!st || e.pointerId !== st.pointerId) return;
            container._boonDrag = null;
            try { st.cardEl.releasePointerCapture(e.pointerId); } catch (_) { /* ignore */ }
            if (st.rafId) {
                cancelAnimationFrame(st.rafId);
                st.rafId = 0;
            }
            const gold = goldStone();
            const px = e.clientX;
            const py = e.clientY;
            gold?.classList.remove('drop-target-sell');
            st.cardEl.classList.remove('boon-card-dragging');
            document.querySelector('.main-game')?.classList.remove('boon-drag-active');
            if (st.ghost) {
                st.ghost.end();
                st.ghost = null;
            } else {
                st.cardEl.style.removeProperty('transform');
            }
            if (!st.dragging) return;
            const boon = findBoon(st.id);
            if (!boon || !gameEngine) return;
            if (pointIn(px, py, gold)) {
                ui.shopUI?.sellCard(boon, gameState, gameEngine);
                return;
            }
            const stack = document.elementsFromPoint(px, py);
            let targetEl = null;
            for (const node of stack) {
                const c = node.closest?.('.card');
                if (c && container.contains(c) && c !== st.cardEl && c.dataset.id) {
                    targetEl = c;
                    break;
                }
            }
            if (targetEl) {
                const boons = gameState.boons;
                const fromIndex = boons.findIndex((b) => b.id === st.id);
                const toIndex = boons.findIndex((b) => b.id === targetEl.dataset.id);
                if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
                    const [moved] = boons.splice(fromIndex, 1);
                    boons.splice(fromIndex < toIndex ? toIndex - 1 : toIndex, 0, moved);
                    if (window.soundManager) window.soundManager.play('button', { volume: 0.4 });
                    gameEngine.updateAllUI();
                }
            }
        };

        container.addEventListener('pointermove', (e) => {
            const st = container._boonDrag;
            if (!st || e.pointerId !== st.pointerId) return;
            const dx = e.clientX - st.startX;
            const dy = e.clientY - st.startY;
            if (!st.dragging && PointerGeometry.distSqOverThreshold(dx, dy, TH)) {
                st.dragging = true;
                st.cardEl.classList.add('boon-card-dragging');
                document.querySelector('.main-game')?.classList.add('boon-drag-active');
                if (typeof PointerDragGhost !== 'undefined') {
                    st.ghost = PointerDragGhost.attach(st.cardEl, 'drag-ghost');
                    st.ghost.start(e.clientX, e.clientY);
                }
                const gold = goldStone();
                st.sellRect = gold ? gold.getBoundingClientRect() : null;
            }
            if (st.dragging) {
                st.pendingX = e.clientX;
                st.pendingY = e.clientY;
                if (st.rafId) return;
                st.rafId = requestAnimationFrame(() => {
                    st.rafId = 0;
                    const live = container._boonDrag;
                    if (!live || !live.dragging) return;
                    const pdx = live.pendingX - live.startX;
                    const pdy = live.pendingY - live.startY;
                    if (live.ghost?.moveAt) live.ghost.moveAt(live.pendingX, live.pendingY);
                    else if (live.ghost) live.ghost.move(pdx, pdy);
                    else live.cardEl.style.transform = `translate3d(${pdx}px, ${pdy}px, 0)`;
                    goldStone()?.classList.toggle(
                        'drop-target-sell',
                        pointInRect(live.pendingX, live.pendingY, live.sellRect)
                    );
                });
            }
        });
        container.addEventListener('pointerup', finish);
        container.addEventListener('pointercancel', finish);
    },
};

if (typeof window !== 'undefined') window.BoonSlotDrag = BoonSlotDrag;
