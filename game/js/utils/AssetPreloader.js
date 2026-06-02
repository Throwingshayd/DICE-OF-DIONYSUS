/**
 * AssetPreloader — warm browser cache for hot-path art (dice faces, etc.)
 */
const AssetPreloader = {
    _promises: new Map(),

    preload(url) {
        if (!url) return Promise.resolve();
        if (this._promises.has(url)) return this._promises.get(url);
        const p = new Promise((resolve) => {
            const img = new Image();
            img.decoding = 'async';
            img.onload = () => resolve(url);
            img.onerror = () => resolve(url);
            img.src = url;
        });
        this._promises.set(url, p);
        return p;
    },

    preloadMany(urls) {
        const unique = [...new Set(urls.filter(Boolean))];
        return Promise.all(unique.map((url) => this.preload(url)));
    },

    preloadDiceFaces() {
        if (typeof AssetMapping === 'undefined') return Promise.resolve();
        const urls = [];
        for (let face = 1; face <= 9; face += 1) {
            const asset = AssetMapping.getDiceFaceAsset(String(face));
            const path = AssetMapping.getAssetPath(asset);
            if (path) urls.push(path);
        }
        const question = AssetMapping.getAssetPath(AssetMapping.getDiceFaceAsset('question'));
        if (question) urls.push(question);
        return this.preloadMany(urls);
    },
};

if (typeof window !== 'undefined') {
    window.AssetPreloader = AssetPreloader;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AssetPreloader;
}
