/**
 * AssetPreloader — warm browser cache for hot-path sprites (dice faces, etc.)
 * Avoids visible delay when faces swap during rolls.
 */
const AssetPreloader = {
    _promises: new Map(),

    /** @returns {Promise<void>} */
    preloadDiceFaces() {
        if (typeof AssetMapping === 'undefined') return Promise.resolve();
        const urls = Object.keys(AssetMapping.diceFaces)
            .map((face) => AssetMapping.getAssetPath(AssetMapping.getDiceFaceAsset(face)))
            .filter(Boolean);
        return Promise.all(urls.map((url) => this._preloadUrl(url))).then(() => undefined);
    },

    /** Preload dice faces plus a few always-visible UI sprites. */
    preloadCritical() {
        const extra = ['rollButton', 'diceTable'].map((key) => {
            const name = AssetMapping.getUIAsset?.(key);
            return name ? AssetMapping.getAssetPath(name) : null;
        }).filter(Boolean);
        return Promise.all([
            this.preloadDiceFaces(),
            ...extra.map((url) => this._preloadUrl(url)),
        ]).then(() => undefined);
    },

    /** @param {string} url */
    _preloadUrl(url) {
        if (!url) return Promise.resolve();
        if (this._promises.has(url)) return this._promises.get(url);
        const promise = new Promise((resolve) => {
            const img = new Image();
            img.decoding = 'async';
            const done = () => resolve(url);
            img.onload = done;
            img.onerror = done;
            img.src = url;
        });
        this._promises.set(url, promise);
        return promise;
    },
};

if (typeof window !== 'undefined') window.AssetPreloader = AssetPreloader;
