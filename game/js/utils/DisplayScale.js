/**
 * DisplayScale — sets --app-scale / --game-scale on #appViewport when settings need JS
 * (preset multiplier, max scale cap, integer-width snap). Otherwise CSS owns --app-scale.
 */
(function () {
    const DESIGN_W = 1920;
    const DESIGN_H = 1080;

    let listenersBound = false;

    function readMult(settings) {
        const p = settings.displayScalePreset;
        if (p === 'small') return 0.85;
        if (p === 'large') return 1.15;
        return 1;
    }

    function computeScale(vw, vh, settings) {
        let s = Math.min(vw / DESIGN_W, vh / DESIGN_H);
        s *= readMult(settings);

        const maxCap = settings.displayMaxScale;
        if (typeof maxCap === 'number' && maxCap > 0 && Number.isFinite(maxCap)) {
            s = Math.min(s, maxCap);
        }

        if (settings.displayIntegerScale) {
            let pxW = DESIGN_W * s;
            pxW = Math.max(1, Math.floor(pxW + 1e-6));
            s = pxW / DESIGN_W;
            const hNeed = DESIGN_H * s;
            if (hNeed > vh + 1e-6) {
                const pxH = Math.max(1, Math.floor(vh + 1e-6));
                s = Math.min(s, pxH / DESIGN_H);
            }
        }

        return Math.max(0.05, Math.min(s, 64));
    }

    function needsJsOverride(settings) {
        if (!settings) return false;
        if (readMult(settings) !== 1) return true;
        if (settings.displayIntegerScale) return true;
        if (typeof settings.displayMaxScale === 'number' && settings.displayMaxScale > 0) return true;
        return false;
    }

    function refresh() {
        const root = document.getElementById('appViewport');
        if (!root) return;

        const s = (typeof window.dataManager?.getSettings === 'function')
            ? window.dataManager.getSettings()
            : {};

        if (!needsJsOverride(s)) {
            root.style.removeProperty('--app-scale');
            root.style.removeProperty('--game-scale');
            return;
        }

        const vw = root.clientWidth;
        const vh = root.clientHeight;
        const scale = computeScale(vw, vh, s);
        root.style.setProperty('--app-scale', String(scale));
        root.style.setProperty('--game-scale', String(scale));
    }

    function init() {
        refresh();
        if (listenersBound) return;
        listenersBound = true;
        window.addEventListener('resize', refresh);
        const root = document.getElementById('appViewport');
        if (root && typeof ResizeObserver !== 'undefined') {
            const ro = new ResizeObserver(() => refresh());
            ro.observe(root);
        }
    }

    window.DisplayScale = { refresh, init, DESIGN_W, DESIGN_H };
})();
