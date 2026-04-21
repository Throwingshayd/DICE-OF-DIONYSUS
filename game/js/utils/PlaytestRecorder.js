/**
 * PlaytestRecorder — structured session log + in-game export (no console required).
 * Disabled: zero runtime cost (single mode check at call sites).
 * Enabled: O(1) ring buffer write, slimmed payloads, floating PLAYTEST panel.
 *
 * Enable: ?playtest=1 | ?playtest=verbose (verbose = extra timing logs where wired)
 *        localStorage playtest = '1' | 'verbose'
 *
 * @module utils/PlaytestRecorder
 */
const PlaytestRecorder = {
    /** @type {'off'|'standard'|'verbose'} */
    mode: 'off',
    MAX_EVENTS: 8000,
    MAX_KEYS: 56,
    MAX_ARR: 36,
    MAX_NEST: 4,

    /** @type {Array<Object|null>} */
    _buf: null,
    _head: 0,
    _count: 0,
    _seq: 0,
    _t0: 0,
    _engine: null,
    _userNotes: [],
    _dockMounted: false,
    _dockMountScheduled: false,
    _statusTimer: null,
    _countFlushTimer: null,

    get active() {
        return this.mode !== 'off';
    },

    get verbose() {
        return this.mode === 'verbose';
    },

    _readModeFromStorage() {
        try {
            const v = localStorage.getItem('playtest');
            if (v === '1' || v === 'true') return 'standard';
            if (v === 'verbose') return 'verbose';
        } catch (_) { /* ignore */ }
        return null;
    },

    _ensureBuf() {
        if (this._buf) return;
        this._buf = new Array(this.MAX_EVENTS);
    },

    _readModeFromHash() {
        const h = (typeof location !== 'undefined' ? location.hash : '').toLowerCase();
        if (!h || !h.includes('playtest')) return null;
        if (h.includes('playtest=verbose') || h.includes('playtest_verbose')) return 'verbose';
        return 'standard';
    },

    initFromUrl() {
        if (typeof window === 'undefined') return;
        const p = new URLSearchParams(window.location.search).get('playtest');
        let mode = 'off';
        if (p === '1' || p === 'true' || p === 'standard') mode = 'standard';
        else if (p === 'verbose') mode = 'verbose';
        else {
            const fromHash = this._readModeFromHash();
            if (fromHash) mode = fromHash;
        }
        if (mode === 'off') {
            const ls = this._readModeFromStorage();
            if (ls) mode = ls;
        }
        this.mode = mode;
        if (mode !== 'off') {
            this._t0 = typeof performance !== 'undefined' ? performance.now() : 0;
            this._ensureBuf();
            this._scheduleDockMount();
            document.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.shiftKey && (e.key === 'E' || e.key === 'e')) {
                    e.preventDefault();
                    this.copyJSON();
                }
            });
        }
        if (typeof window !== 'undefined') {
            window.addEventListener('hashchange', () => this._onHashChangePlaytest(), { passive: true });
        }
    },

    _onHashChangePlaytest() {
        const fromHash = this._readModeFromHash();
        if (!fromHash) return;
        if (this.mode === fromHash) return;
        this.mode = fromHash;
        this._t0 = typeof performance !== 'undefined' ? performance.now() : 0;
        this._ensureBuf();
        this.ensureDockVisible();
    },

    /** Run after Main/UI init — fixes rare cases where body or layout was not ready when this script first ran. */
    ensureDockVisible() {
        if (this.mode === 'off') return;
        if (document.getElementById('playtest-dock')) {
            this._dockMounted = true;
            return;
        }
        const run = () => {
            if (this.mode === 'off') return;
            if (document.getElementById('playtest-dock')) {
                this._dockMounted = true;
                return;
            }
            if (document.body) this._mountDock();
        };
        run();
        requestAnimationFrame(run);
        setTimeout(run, 0);
        setTimeout(run, 250);
    },

    _scheduleDockMount() {
        if (this._dockMountScheduled) return;
        this._dockMountScheduled = true;
        const run = () => {
            if (this.mode === 'off') return;
            if (document.getElementById('playtest-dock')) {
                this._dockMounted = true;
                return;
            }
            if (!document.body) return;
            this._mountDock();
        };
        run();
        requestAnimationFrame(run);
        setTimeout(run, 0);
        setTimeout(run, 100);
        window.addEventListener('load', run, { once: true });
    },

    _dockSetStatus(msg) {
        const el = document.getElementById('playtest-dock-status');
        if (el) el.textContent = msg;
        if (this._countFlushTimer) {
            clearTimeout(this._countFlushTimer);
            this._countFlushTimer = null;
        }
        if (this._statusTimer) clearTimeout(this._statusTimer);
        this._statusTimer = setTimeout(() => {
            this._statusTimer = null;
            const s = document.getElementById('playtest-dock-status');
            if (s) s.textContent = `${this._count} events · ${this.mode}`;
        }, 3200);
    },

    _mountDock() {
        if (this.mode === 'off') return;
        if (document.getElementById('playtest-dock')) {
            this._dockMounted = true;
            return;
        }
        if (!document.body) return;
        const root = document.createElement('div');
        root.id = 'playtest-dock';
        root.setAttribute('aria-label', 'Playtest export');
        root.innerHTML = `
<style>
#playtest-dock{position:fixed;bottom:10px;right:10px;z-index:2147483000;
  font:11px/1.35 ui-monospace,Menlo,Consolas,monospace;
  background:rgba(8,14,12,.94);color:#c8f5c4;border:1px solid #3d8c4a;border-radius:8px;
  box-shadow:0 4px 24px rgba(0,0,0,.55);min-width:200px;max-width:min(320px,92vw);
  backdrop-filter:blur(6px);user-select:none}
#playtest-dock .pt-head{display:flex;align-items:center;justify-content:space-between;gap:6px;
  padding:6px 8px;border-bottom:1px solid #2a5c38;background:rgba(0,40,20,.35);
  border-radius:7px 7px 0 0}
#playtest-dock .pt-title{font-weight:700;letter-spacing:.06em;color:#7fff9a;font-size:10px}
#playtest-dock .pt-min{cursor:pointer;color:#8a8;border:0;background:transparent;padding:0 4px;font-size:14px;line-height:1}
#playtest-dock .pt-body{padding:8px}
#playtest-dock.pt-collapsed .pt-body{display:none}
#playtest-dock .pt-row{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px}
#playtest-dock button{cursor:pointer;border-radius:5px;border:1px solid #4a9c5e;background:#143d28;
  color:#d4ffd4;padding:5px 8px;font:inherit;font-size:10px}
#playtest-dock button:hover{background:#1e5c3a;border-color:#7fff9a}
#playtest-dock button.pt-primary{background:#1a6b3c;border-color:#7fff9a}
#playtest-dock #playtest-dock-status{font-size:9px;color:#7a9;min-height:2.6em;margin-top:4px;word-break:break-word}
#playtest-dock textarea{width:100%;box-sizing:border-box;min-height:44px;resize:vertical;
  font:inherit;font-size:10px;background:#0a1810;color:#cfe;border:1px solid #2a5c38;border-radius:4px;padding:4px}
#playtest-dock label.pt-lab{font-size:9px;color:#8b8;display:block;margin:4px 0 2px}
#playtest-dock .pt-check{display:flex;align-items:center;gap:6px;font-size:9px;color:#9b9;margin-top:6px}
#playtest-dock .pt-check input{accent-color:#3d8c4a}
</style>
<div class="pt-head">
  <span class="pt-title">PLAYTEST</span>
  <button type="button" class="pt-min" id="playtest-dock-collapse" title="Collapse">−</button>
</div>
<div class="pt-body">
  <div class="pt-row">
    <button type="button" class="pt-primary" id="playtest-btn-copy" title="Ctrl+Shift+E">Copy JSON</button>
    <button type="button" id="playtest-btn-dl">Download</button>
    <button type="button" id="playtest-btn-clear">Clear</button>
  </div>
  <label class="pt-lab">Pin a note (optional)</label>
  <textarea id="playtest-note-input" placeholder="What felt wrong?"></textarea>
  <div class="pt-row" style="margin-bottom:0">
    <button type="button" id="playtest-btn-note">Add note</button>
  </div>
  <label class="pt-check"><input type="checkbox" id="playtest-auto-end"/> Auto-download JSON when run ends</label>
  <div id="playtest-dock-status"></div>
</div>`;
        document.body.appendChild(root);
        this._dockMounted = true;

        const status = root.querySelector('#playtest-dock-status');
        if (status) status.textContent = `${this._count} events · ${this.mode}`;

        try {
            const auto = localStorage.getItem('playtest_auto_end') === '1';
            const cb = root.querySelector('#playtest-auto-end');
            if (cb) cb.checked = auto;
        } catch (_) { /* ignore */ }

        root.querySelector('#playtest-dock-collapse')?.addEventListener('click', () => {
            root.classList.toggle('pt-collapsed');
        });
        root.querySelector('#playtest-btn-copy')?.addEventListener('click', () => this.copyJSON());
        root.querySelector('#playtest-btn-dl')?.addEventListener('click', () => this.downloadJSON());
        root.querySelector('#playtest-btn-clear')?.addEventListener('click', () => {
            this.clear();
            this._dockSetStatus('Buffer cleared');
        });
        root.querySelector('#playtest-btn-note')?.addEventListener('click', () => {
            const ta = root.querySelector('#playtest-note-input');
            const t = (ta && ta.value) ? ta.value.trim() : '';
            if (t) {
                this.note(t);
                ta.value = '';
                this._dockSetStatus('Note pinned to export');
            }
        });
        root.querySelector('#playtest-auto-end')?.addEventListener('change', (e) => {
            try {
                localStorage.setItem('playtest_auto_end', e.target.checked ? '1' : '0');
            } catch (_) { /* ignore */ }
        });
    },

    maybeAutoExportOnRunEnd() {
        if (this.mode === 'off') return;
        try {
            if (localStorage.getItem('playtest_auto_end') === '1') {
                this.downloadJSON();
                this._dockSetStatus('Auto-downloaded (run end)');
            }
        } catch (_) { /* ignore */ }
    },

    /**
     * @param {string} type
     * @param {Object} [data]
     */
    log(type, data) {
        if (this.mode === 'off') return;
        this._ensureBuf();
        const cap = this.MAX_EVENTS;
        let slim;
        if (data === undefined) {
            slim = undefined;
        } else {
            slim = this._slim(data, 0);
        }
        const ev = {
            n: ++this._seq,
            t: typeof performance !== 'undefined' ? Math.round((performance.now() - this._t0) * 10) / 10 : 0,
            wall: Date.now(),
            type,
            data: slim,
        };
        if (this._count < cap) {
            this._buf[(this._head + this._count) % cap] = ev;
            this._count++;
        } else {
            this._buf[this._head % cap] = ev;
            this._head = (this._head + 1) % cap;
        }
        if (this._dockMounted && !this._statusTimer) {
            if (this._countFlushTimer) clearTimeout(this._countFlushTimer);
            this._countFlushTimer = setTimeout(() => {
                this._countFlushTimer = null;
                const st = document.getElementById('playtest-dock-status');
                if (st && !this._statusTimer) st.textContent = `${this._count} events · ${this.mode}`;
            }, 400);
        }
    },

    note(text) {
        if (this.mode === 'off') return;
        const s = String(text).slice(0, 4000);
        this._userNotes.push({ wall: Date.now(), text: s });
        this.log('user_note', { text: s });
    },

    /**
     * @param {*} data
     * @param {number} depth
     */
    _slim(data, depth) {
        if (data == null) return data;
        const t = typeof data;
        if (t === 'number' || t === 'boolean' || t === 'string') return data;
        if (data instanceof Error) {
            return { message: data.message, stack: String(data.stack || '').slice(0, 1200) };
        }
        if (depth > this.MAX_NEST) return '[deep]';
        if (Array.isArray(data)) {
            const lim = Math.min(data.length, this.MAX_ARR);
            const out = new Array(lim);
            for (let i = 0; i < lim; i++) {
                out[i] = this._slimOne(data[i], depth + 1);
            }
            if (data.length > lim) out.push('…+' + (data.length - lim));
            return out;
        }
        if (t === 'object') {
            const keys = Object.keys(data);
            const out = {};
            const maxK = this.MAX_KEYS;
            let n = 0;
            for (let i = 0; i < keys.length && n < maxK; i++) {
                const k = keys[i];
                out[k] = this._slimOne(data[k], depth + 1);
                n++;
            }
            if (keys.length > maxK) out._truncated = keys.length - maxK;
            return out;
        }
        return String(data);
    },

    _slimOne(v, depth) {
        if (v == null) return v;
        const t = typeof v;
        if (t === 'number' || t === 'boolean' || t === 'string') return v;
        if (t === 'object' && typeof v.id === 'string') return { id: v.id };
        if (v instanceof Error) return this._slim(v, depth);
        if (Array.isArray(v)) return this._slim(v, depth);
        if (t === 'object') return this._slim(v, depth);
        return String(v);
    },

    captureState(engine) {
        const s = engine?.state;
        if (!s) return {};
        let diceFaces = [];
        try {
            const dice = s.dice || [];
            for (let i = 0; i < dice.length; i++) {
                const d = dice[i];
                if (typeof DieFaceUtils !== 'undefined') {
                    diceFaces.push(DieFaceUtils.resolveFace(d, null));
                } else {
                    diceFaces.push(typeof d.getEffectiveFace === 'function' ? d.getEffectiveFace() : (d.face ?? d.currentFace ?? null));
                }
            }
        } catch (_) {
            diceFaces = [];
        }
        const sc = s.scorecard || {};
        const scorecard = {};
        for (const k of Object.keys(sc)) {
            if (sc[k] !== undefined) scorecard[k] = sc[k];
        }
        return {
            seed: s.seed,
            turn: s.turn,
            ante: s.ante,
            maxTurns: s.maxTurns,
            gold: s.gold,
            rollsLeft: s.rollsLeft,
            hasRolled: s.hasRolled,
            totalScore: s.totalScore,
            scoreThreshold: s.scoreThreshold,
            gameOver: !!s.gameOver,
            transitioningToShop: !!s.transitioningToShop,
            winningTestMode: !!s.winningTestMode,
            activeBlind: s.activeBlind ?? null,
            baseFavour: s.baseFavour,
            boonIds: (s.boons || []).map((b) => b.id),
            consumableIds: (s.consumables || []).map((c) => c.id),
            artifactIds: (s.artifacts || []).map((a) => a && a.id).filter(Boolean),
            boonTriggersThisTurn: s.boonTriggersThisTurn,
            diceFaces,
            held: s.held ? [...s.held] : [],
            scorecard,
            scorecardFilled: Object.keys(scorecard).length,
            pendingCategory: s.pendingCategory || null,
            resumePhase: s.resumePhase || null,
            libationTargeting: !!s.libationTargetingMode,
            eucharistTargeting: !!s.eucharistTargetingMode,
        };
    },

    onEngineReady(engine) {
        if (this.mode === 'off') return;
        this._engine = engine;
        const url = typeof location !== 'undefined' ? location.href : '';
        this.log('session_start', {
            href: url,
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
            state: this.captureState(engine),
        });
    },

    eventsToArray() {
        if (!this._buf) return [];
        const cap = this.MAX_EVENTS;
        const out = new Array(this._count);
        for (let i = 0; i < this._count; i++) {
            out[i] = this._buf[(this._head + i) % cap];
        }
        return out;
    },

    getMeta() {
        const url = typeof location !== 'undefined' ? location.href : '';
        let state = null;
        try {
            state = this._engine ? this.captureState(this._engine) : null;
        } catch (_) {
            state = { error: 'captureState_failed' };
        }
        return {
            exportedAt: new Date().toISOString(),
            playtestMode: this.mode,
            href: url,
            eventCount: this._count,
            userNotes: this._userNotes.slice(),
            latestState: state,
            schemaVersion: 2,
        };
    },

    getPayload() {
        return {
            meta: this.getMeta(),
            events: this.eventsToArray(),
        };
    },

    getJSONText() {
        return JSON.stringify(this.getPayload());
    },

    downloadJSON() {
        if (this.mode === 'off') return;
        const text = this.getJSONText();
        const blob = new Blob([text], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dice-playtest-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this._dockSetStatus(`Downloaded ${this._count} events`);
    },

    async copyJSON() {
        if (this.mode === 'off') return false;
        const text = this.getJSONText();
        try {
            await navigator.clipboard.writeText(text);
            this._dockSetStatus(`Copied ${text.length} chars — paste into your assistant`);
            return true;
        } catch (_) {
            try {
                this.downloadJSON();
                this._dockSetStatus('Clipboard blocked — downloaded file instead');
                return false;
            } catch (e2) {
                this._dockSetStatus('Copy failed — try Download');
                return false;
            }
        }
    },

    clear() {
        if (this._statusTimer) {
            clearTimeout(this._statusTimer);
            this._statusTimer = null;
        }
        if (this._countFlushTimer) {
            clearTimeout(this._countFlushTimer);
            this._countFlushTimer = null;
        }
        if (!this._buf) {
            this._head = 0;
            this._count = 0;
            this._seq = 0;
            this._userNotes = [];
            const st = document.getElementById('playtest-dock-status');
            if (st) st.textContent = `0 events · ${this.mode}`;
            return;
        }
        const cap = this.MAX_EVENTS;
        for (let i = 0; i < this._count; i++) {
            this._buf[(this._head + i) % cap] = null;
        }
        this._head = 0;
        this._count = 0;
        this._seq = 0;
        this._userNotes = [];
        const st = document.getElementById('playtest-dock-status');
        if (st) st.textContent = `0 events · ${this.mode}`;
    },
};

PlaytestRecorder.initFromUrl();

if (typeof window !== 'undefined') {
    window.PlaytestRecorder = PlaytestRecorder;
}
