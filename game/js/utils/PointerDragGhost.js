/**

 * PointerDragGhost — fixed-position drag clone updated on requestAnimationFrame.

 * @module utils/PointerDragGhost

 */

const PointerDragGhost = {

    /**

     * @param {HTMLElement} sourceEl

     * @param {string} [ghostClass='drag-ghost']

     * @param {{ appearance?: 'libation-drop' | 'worship-drop' | 'consumable-chip', artUrl?: string, chipClass?: string, grabOffsetY?: number }} [options]

     * @returns {{ start: (clientX?: number, clientY?: number) => void, move: (dx: number, dy: number) => void, moveAt: (clientX: number, clientY: number) => void, end: () => void }}

     */

    attach(sourceEl, ghostClass = 'drag-ghost', options = {}) {

        /** @type {HTMLElement | null} */

        let ghost = null;

        /** @type {number | null} */

        let rafId = null;

        let pendingDx = 0;

        let pendingDy = 0;

        let pendingClientX = 0;

        let pendingClientY = 0;

        let grabOffsetX = 0;

        let grabOffsetY = 0;

        /** @type {'delta' | 'cursor'} */

        let mode = 'delta';



        const paintDelta = () => {

            rafId = null;

            if (!ghost) return;

            ghost.style.transform = `translate3d(${pendingDx}px, ${pendingDy}px, 0)`;

        };



        const setGhostScreenPos = (left, top) => {

            if (!ghost) return;

            ghost.style.setProperty('left', `${left}px`, 'important');

            ghost.style.setProperty('top', `${top}px`, 'important');

            ghost.style.transform = 'translate3d(0, 0, 0)';

        };



        const paintAt = () => {

            rafId = null;

            setGhostScreenPos(pendingClientX - grabOffsetX, pendingClientY - grabOffsetY);

        };



        return {

            start(clientX, clientY) {

                if (!sourceEl || ghost) return;

                const rect = sourceEl.getBoundingClientRect();

                const useLibationDrop = options.appearance === 'libation-drop'
                    && typeof CardDragSurface !== 'undefined';
                const useWorshipDrop = options.appearance === 'worship-drop'
                    && typeof CardDragSurface !== 'undefined';
                const useConsumableChip = options.appearance === 'consumable-chip'
                    && options.artUrl
                    && typeof CardDragSurface !== 'undefined';

                if (useLibationDrop) {
                    ghost = CardDragSurface.createLibationDropElement();
                    ghost.classList.add(ghostClass);
                    const metrics = CardDragSurface.getLibationDropDragMetrics();
                    grabOffsetX = metrics.grabOffsetX;
                    grabOffsetY = metrics.grabOffsetY;
                    mode = 'cursor';
                } else if (useWorshipDrop) {
                    ghost = CardDragSurface.createWorshipDropElement();
                    ghost.classList.add(ghostClass);
                    const metrics = CardDragSurface.getWorshipDropDragMetrics();
                    grabOffsetX = metrics.grabOffsetX;
                    grabOffsetY = metrics.grabOffsetY;
                    mode = 'cursor';
                } else if (useConsumableChip) {
                    ghost = CardDragSurface.createConsumableChipElement(
                        options.artUrl,
                        options.chipClass || 'consumable-drag-chip'
                    );
                    ghost.classList.add(ghostClass);
                    const metrics = CardDragSurface.getConsumableChipDragMetrics({
                        grabOffsetY: options.grabOffsetY ?? 0.5,
                    });
                    grabOffsetX = metrics.grabOffsetX;
                    grabOffsetY = metrics.grabOffsetY;
                    mode = 'cursor';
                } else {
                    ghost = sourceEl.cloneNode(true);
                    ghost.classList.add(ghostClass);
                }



                const hasPointer = typeof clientX === 'number' && typeof clientY === 'number';

                const cx = hasPointer ? clientX : rect.left + rect.width / 2;

                const cy = hasPointer ? clientY : rect.top + rect.height / 2;

                if (!useLibationDrop && !useWorshipDrop && !useConsumableChip) {
                    grabOffsetX = cx - rect.left;
                    grabOffsetY = cy - rect.top;
                    mode = hasPointer ? 'cursor' : 'delta';
                }



                document.body.appendChild(ghost);

                if (useLibationDrop) {
                    CardDragSurface.pinLibationDropGhost(ghost, CardDragSurface.getLibationDropDragMetrics());
                } else if (useWorshipDrop) {
                    CardDragSurface.pinConsumableChipGhost(ghost, CardDragSurface.getWorshipDropDragMetrics());
                } else if (useConsumableChip) {
                    CardDragSurface.pinConsumableChipGhost(ghost, CardDragSurface.getConsumableChipDragMetrics({
                        grabOffsetY: options.grabOffsetY ?? 0.5,
                    }));
                } else if (typeof CardDragSurface !== 'undefined' && sourceEl.classList.contains('card')) {

                    CardDragSurface.pinToScreenRect(ghost, rect, sourceEl);

                } else {

                    ghost.style.position = 'fixed';

                    ghost.style.left = `${rect.left}px`;

                    ghost.style.top = `${rect.top}px`;

                    ghost.style.width = `${rect.width}px`;

                    ghost.style.height = `${rect.height}px`;

                    ghost.style.margin = '0';

                }



                if (mode === 'cursor') {

                    setGhostScreenPos(cx - grabOffsetX, cy - grabOffsetY);

                } else {

                    ghost.style.transform = 'translate3d(0, 0, 0)';

                }

                ghost.style.pointerEvents = 'none';

                ghost.style.transition = 'none';

                ghost.style.willChange = mode === 'cursor' ? 'left, top' : 'transform';

                ghost.style.zIndex = '12050';

                sourceEl.style.visibility = 'hidden';
                sourceEl.style.opacity = '0';

            },

            move(dx, dy) {

                if (mode === 'cursor') return;

                pendingDx = dx;

                pendingDy = dy;

                if (rafId == null) {

                    rafId = requestAnimationFrame(paintDelta);

                }

            },

            moveAt(clientX, clientY) {

                pendingClientX = clientX;

                pendingClientY = clientY;

                if (rafId == null) {

                    rafId = requestAnimationFrame(paintAt);

                }

            },

            end() {

                if (rafId != null) {

                    cancelAnimationFrame(rafId);

                    rafId = null;

                }

                ghost?.remove();

                ghost = null;

                sourceEl.style.visibility = '';

                sourceEl.style.removeProperty('opacity');

                sourceEl.style.removeProperty('transform');

            },

            /** Shrink / hue hint when drag chip hovers a valid drop target. */
            setDragTargetHot(isOver) {
                ghost?.classList.toggle('consumable-drag-over-target', !!isOver);
            },

            /** @deprecated use setDragTargetHot */
            setLibationOverDie(isOver) {
                ghost?.classList.toggle('consumable-drag-over-target', !!isOver);
            },

        };

    },

};



if (typeof module !== 'undefined' && module.exports) {

    module.exports = PointerDragGhost;

}


