/**

 * CardDragSurface — drag styling without resizing.

 * Cards live under .app-stage scale; fixed drag clones must use getBoundingClientRect()

 * screen pixels, not design-space CARD_LAYOUT sizes (that would make them grow on pick-up).

 * @module utils/CardDragSurface

 */

/** Pack shelf art URLs (mirror styles.css — used when computed background is missing on ghost). */
const PACK_SHELF_ART = {
    'pack-boon': '/ART/boon pack.png',
    'pack-worship': '/ART/worship pack.png',
    'pack-libation': '/ART/Libation pack.png',
    'pack-chaos': '/ART/chaos pack.png',
};

const CARD_PAINT_PROPS = [
    'background-image',
    'background-size',
    'background-position',
    'background-repeat',
    'background-color',
    'border',
    'border-radius',
    'box-shadow',
    'color',
];

const CardDragSurface = {

    copyPaintFromComputed(src, dst, { includeBorder = true, includeShadow = true } = {}) {
        if (!src || !dst) return;
        const cs = getComputedStyle(src);
        for (const prop of CARD_PAINT_PROPS) {
            if (prop === 'border' && !includeBorder) continue;
            if (prop === 'box-shadow' && !includeShadow) continue;
            const val = cs.getPropertyValue(prop);
            if (!val) continue;
            if (prop === 'background-image' && val === 'none') continue;
            if (prop === 'background-color' && (val === 'transparent' || val === 'rgba(0, 0, 0, 0)')) continue;
            if (prop === 'border' && (val.includes('none') || val.startsWith('0px'))) continue;
            if (prop === 'box-shadow' && val === 'none') continue;
            dst.style.setProperty(prop, val, 'important');
        }
    },

    /** Drag shell: no outer frame — only inner card-face paint is copied. */
    applyDragShell(el) {
        if (!el) return;
        el.style.setProperty('border', 'none', 'important');
        el.style.setProperty('padding', '0', 'important');
        el.style.setProperty('margin', '0', 'important');
        el.style.setProperty('background', 'transparent', 'important');
        el.style.setProperty('background-color', 'transparent', 'important');
        el.style.setProperty('box-shadow', '0 10px 18px rgba(0, 0, 0, 0.45)', 'important');
        el.style.setProperty('overflow', 'hidden', 'important');
        el.style.setProperty('box-sizing', 'border-box', 'important');
    },

    /**

     * Strip shop-only chrome; inventory layout for type indicator (no size change).

     * @param {HTMLElement} el

     */

    prepareElement(el) {

        if (!el) return;

        if (el.classList.contains('pack-card')) {

            this.preparePackDrag(el);

            return;

        }

        el.querySelectorAll('.card-shop-cost, .action-labels-row, .buy-sell-label').forEach((n) => n.remove());

        el.classList.remove(

            'sell-label-visible',

            'shop-drag-lift',

            'consumable-card-dragging',

            'boon-card-dragging'

        );

        el.classList.add('card-drag-appearance');
        this.applyDragShell(el);

    },



    /**

     * Pin element to viewport using an existing screen rect (no resize on drag).

     * @param {HTMLElement} el

     * @param {DOMRect} rect — from getBoundingClientRect() before reparenting

     */

    /** Pack shelf drag: art-only ghost (inline background survives reparent to body). */

    preparePackDrag(el) {

        el.querySelectorAll('.card-shop-cost, .card-content, .action-labels-row, .buy-sell-label').forEach((n) => n.remove());

        el.removeAttribute('data-tooltip');

        el.classList.remove('sell-label-visible', 'shop-drag-lift', 'consumable-card-dragging', 'boon-card-dragging');

        el.classList.add('pack-drag-appearance');

    },



    /** @param {HTMLElement} el @param {HTMLElement} [styleSource] */

    freezePackArt(el, styleSource = el) {

        if (!el || !styleSource) return;

        const cs = getComputedStyle(styleSource);

        const img = cs.backgroundImage;

        if (img && img !== 'none') {

            el.style.setProperty('background-image', img, 'important');

            el.style.setProperty('background-size', cs.backgroundSize || 'contain', 'important');

            el.style.setProperty('background-position', cs.backgroundPosition || 'center center', 'important');

            el.style.setProperty('background-repeat', cs.backgroundRepeat || 'no-repeat', 'important');

        } else {

            for (const [cls, url] of Object.entries(PACK_SHELF_ART)) {

                if (styleSource.classList.contains(cls)) {

                    el.style.setProperty('background-image', `url('${url}')`, 'important');

                    el.style.setProperty('background-size', 'contain', 'important');

                    el.style.setProperty('background-position', 'center center', 'important');

                    el.style.setProperty('background-repeat', 'no-repeat', 'important');

                    break;

                }

            }

        }

        el.style.setProperty('background-color', 'transparent', 'important');

        el.style.border = 'none';

        el.style.boxShadow = 'none';

    },



    /** Match in-game text size: ghosts live on body, outside .app-stage scale(). */
    getAppScale() {
        const vp = document.getElementById('appViewport');
        if (!vp) return 1;
        const s = parseFloat(getComputedStyle(vp).getPropertyValue('--app-scale'));
        return Number.isFinite(s) && s > 0 ? s : 1;
    },

    applyDragFaceScale(el) {
        if (!el) return;
        el.style.setProperty('--drag-face-scale', String(this.getAppScale()));
    },

    /** Shop/inventory card ghost: copy rendered paint from source (scoped CSS does not apply on body). */
    freezeCardChrome(el, styleSource) {
        if (!el || !styleSource) return;
        this.applyDragShell(el);
        for (const sel of ['.card-background', '.card-frame', '.card-content', '.card-fallback-bg', '.card-type-indicator']) {
            this.copyPaintFromComputed(styleSource.querySelector(sel), el.querySelector(sel));
        }
        const content = el.querySelector('.card-content');
        if (content) {
            content.style.setProperty('width', '100%', 'important');
            content.style.setProperty('height', '100%', 'important');
            content.style.setProperty('box-sizing', 'border-box', 'important');
        }
    },



    pinToScreenRect(el, rect, styleSource = null) {

        if (!el || !rect) return;

        const isPack = el.classList.contains('pack-card');

        const artSource = styleSource || el;

        this.prepareElement(el);

        el.style.position = 'fixed';

        const w = Math.max(1, Math.round(rect.width));

        const h = Math.max(1, Math.round(rect.height));

        el.style.left = `${rect.left}px`;

        el.style.top = `${rect.top}px`;

        el.style.setProperty('width', `${w}px`, 'important');

        el.style.setProperty('height', `${h}px`, 'important');

        el.style.margin = '0';

        el.style.padding = '0';

        el.style.boxSizing = 'border-box';

        el.style.maxWidth = 'none';

        el.style.maxHeight = 'none';

        el.style.minWidth = '0';

        el.style.minHeight = '0';

        if (isPack) this.freezePackArt(el, artSource);
        else {
            this.freezeCardChrome(el, artSource);
            this.applyDragFaceScale(el);
        }

    },



    /** @param {HTMLElement} el */

    clear(el) {

        if (!el) return;

        el.classList.remove('card-drag-appearance', 'pack-drag-appearance');

    },

};



if (typeof module !== 'undefined' && module.exports) {

    module.exports = CardDragSurface;

}


