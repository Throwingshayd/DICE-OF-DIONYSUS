/**
 * PointerDragGhost — fixed-position drag clone updated on requestAnimationFrame.
 * @module utils/PointerDragGhost
 */
const PointerDragGhost = {
    /**
     * @param {HTMLElement} sourceEl
     * @param {string} [ghostClass='drag-ghost']
     * @returns {{ start: () => void, move: (dx: number, dy: number) => void, end: () => void }}
     */
    attach(sourceEl, ghostClass = 'drag-ghost') {
        /** @type {HTMLElement | null} */
        let ghost = null;
        /** @type {number | null} */
        let rafId = null;
        let pendingDx = 0;
        let pendingDy = 0;

        const paint = () => {
            rafId = null;
            if (!ghost) return;
            ghost.style.transform = `translate3d(${pendingDx}px, ${pendingDy}px, 0)`;
        };

        return {
            start() {
                if (!sourceEl || ghost) return;
                const rect = sourceEl.getBoundingClientRect();
                ghost = sourceEl.cloneNode(true);
                ghost.classList.add(ghostClass);
                ghost.style.position = 'fixed';
                ghost.style.left = `${rect.left}px`;
                ghost.style.top = `${rect.top}px`;
                ghost.style.width = `${rect.width}px`;
                ghost.style.height = `${rect.height}px`;
                ghost.style.margin = '0';
                ghost.style.transform = 'translate3d(0, 0, 0)';
                ghost.style.pointerEvents = 'none';
                ghost.style.transition = 'none';
                ghost.style.willChange = 'transform';
                ghost.style.zIndex = '12050';
                document.body.appendChild(ghost);
                sourceEl.style.visibility = 'hidden';
            },
            move(dx, dy) {
                pendingDx = dx;
                pendingDy = dy;
                if (rafId == null) {
                    rafId = requestAnimationFrame(paint);
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
                sourceEl.style.removeProperty('transform');
            },
        };
    },
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PointerDragGhost;
}
