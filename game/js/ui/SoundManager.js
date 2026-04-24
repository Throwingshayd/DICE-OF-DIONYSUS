/**
 * SoundManager — SFX and context music (game/public/ART/Music/)
 * Context-based tracks with smooth crossfade. music1=play, music2=pack, music4=shop, music5=boss
 */
/** Track ID → project music file (game/public/ART/Music/) */
const MUSIC_TRACKS = {
    music1: 'ART/Music/lute 1 effects.wav',
    music2: 'ART/Music/lute 2 w effects.wav',
    music3: 'ART/Music/lute 3 w effects.wav',
    music4: 'ART/Music/lute 4 w effects.wav',
    music5: 'ART/Music/lute 5 w effects.wav'
};

/** Dry/wet mix for music convolver — lower wet = clearer, less smear (tracks already have “w effects”) */
const MUSIC_REVERB_DRY = 0.94;
const MUSIC_REVERB_WET = 0.06;

/** Pre-reverb tone: roll off highs before convolver (wet path adds air back) */
const MUSIC_PRE_LP_HZ = 3000;
const MUSIC_PRE_LP_Q = 0.28;

/** Master chain after dry+wet sum: darker ceiling so music sits back in the mix */
const MUSIC_MASTER_LP_HZ = 2200;
const MUSIC_MASTER_LP_Q = 0.32;
const MUSIC_MASTER_BODY_HZ = 400;
const MUSIC_MASTER_BODY_DB = 2.2;
const MUSIC_MASTER_BODY_Q = 1;

class SoundManager {
    constructor() {
        // Prefer Vite-served root paths; fallback supports Live Server from /game.
        this._sfxBaseCandidates = ['sounds/', 'public/sounds/'];
        this._musicPrefixCandidates = ['', 'public/'];
        this._resolvedSfxBase = null;
        this._resolvedMusicPrefix = null;
        this.musicVolume = 0.6;
        this.sfxVolume = 0.8;
        this.audioContext = null;
        this.musicGain = null;
        this.sfxGain = null;
        this._initialized = false;
        this._musicPlaying = false;
        this.musicSource = null;
        this._musicSourceGain = null; // Per-source gain for crossfade
        this._reverbIR = null;
        this._crossfadeDuration = 0.5;
        /** Context → track (Balatro mapping) */
        this.contextToTrack = {
            play: 'music1',
            shop: 'music4',
            pack: 'music2',
            boss: 'music5'
        };
        this._currentContext = 'play';
        this._musicLoadFailCount = 0;
        /** Per-source graph connects here → aquatic master → musicGain → destination */
        this._musicMasterIn = null;
    }

    /** Lazy init - create AudioContext on first use (requires user gesture) */
    ensureReady() {
        if (this._initialized) return;
        this._initialized = true;
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.musicGain = this.audioContext.createGain();
            this.sfxGain = this.audioContext.createGain();
            this.musicGain.gain.value = this.musicVolume;
            this.sfxGain.gain.value = this.sfxVolume;
            this._buildMusicMasterChain();
            this.sfxGain.connect(this.audioContext.destination);
            this._reverbIR = this._createOpenStoaIR();
            if (typeof Logger !== 'undefined') Logger.info('SoundManager initialized');
        } catch (e) {
            if (typeof Logger !== 'undefined') Logger.warn('SoundManager: Audio unavailable', e);
        }
    }

    /**
     * Shared bus: soft lowpass + low-mid body + gentle compression.
     * Tames reversed/time-stretched grain and reads closer to ambient / submerged distance.
     */
    _buildMusicMasterChain() {
        if (this._musicMasterIn || !this.audioContext) return;
        const ac = this.audioContext;
        this._musicMasterIn = ac.createGain();
        this._musicMasterIn.gain.value = 1;

        const aquaticLP = ac.createBiquadFilter();
        aquaticLP.type = 'lowpass';
        aquaticLP.frequency.value = MUSIC_MASTER_LP_HZ;
        aquaticLP.Q.value = MUSIC_MASTER_LP_Q;

        const bodyPeak = ac.createBiquadFilter();
        bodyPeak.type = 'peaking';
        bodyPeak.frequency.value = MUSIC_MASTER_BODY_HZ;
        bodyPeak.Q.value = MUSIC_MASTER_BODY_Q;
        bodyPeak.gain.value = MUSIC_MASTER_BODY_DB;

        /** Tame residual brightness above the master LP knee (12 dB/oct is gradual) */
        const airShelf = ac.createBiquadFilter();
        airShelf.type = 'highshelf';
        airShelf.frequency.value = 3800;
        airShelf.gain.value = -4.5;
        airShelf.Q.value = 0.7;

        const glue = ac.createDynamicsCompressor();
        glue.threshold.value = -26;
        glue.knee.value = 22;
        glue.ratio.value = 2.2;
        glue.attack.value = 0.045;
        glue.release.value = 0.38;

        this._musicMasterIn.connect(aquaticLP);
        aquaticLP.connect(bodyPeak);
        bodyPeak.connect(airShelf);
        airShelf.connect(glue);
        glue.connect(this.musicGain);
        this.musicGain.connect(ac.destination);
        /** After first user gesture / ensureReady: if missing, an old cached script or init failure */
        this.musicFxRevision = 3;
        if (typeof Logger !== 'undefined') {
            Logger.info('SoundManager: music bus v' + this.musicFxRevision + ' (pre-LP → reverb → master LP/peaking/highshelf/compressor)');
        }
    }

    /** Create reverb IR: open pillared space (stoa) — pillars, no walls, sound escapes upward */
    _createOpenStoaIR() {
        if (!this.audioContext) return null;
        const sr = this.audioContext.sampleRate;
        const duration = 2.6;
        const len = Math.floor(sr * duration);
        const ir = this.audioContext.createBuffer(2, len, sr);
        const L = ir.getChannelData(0);
        const R = ir.getChannelData(1);

        // Early reflections: discrete pillar "slaps" (first ~120ms)
        const earlyDelays = [0.012, 0.028, 0.047, 0.068, 0.091, 0.118];
        const earlyGain = 0.2;
        for (const delay of earlyDelays) {
            const idx = Math.floor(delay * sr);
            if (idx < len) {
                L[idx] = (Math.random() * 2 - 1) * earlyGain;
                R[idx] = (Math.random() * 2 - 1) * earlyGain * 0.8;
            }
        }

        // Diffuse tail: gentle decay — keep quiet vs source files that already have FX
        const decay = 2.0;
        const tailLevel = 0.17;
        for (let i = 0; i < len; i++) {
            const t = i / len;
            const d = Math.pow(1 - t, decay);
            const rolloff = 1 - t * 0.45;
            L[i] = (L[i] || 0) + (Math.random() * 2 - 1) * d * rolloff * tailLevel;
            R[i] = (R[i] || 0) + (Math.random() * 2 - 1) * d * rolloff * tailLevel;
        }
        return ir;
    }

    /** Pick random start offset in buffer (0–70% of duration) so we don't always hear the intro */
    _randomStartOffset(buffer) {
        const dur = buffer.duration;
        if (dur < 5) return 0;
        const maxOffset = dur * 0.7;
        return Math.random() * maxOffset;
    }

    /** Reverse buffer samples and return new buffer (works everywhere) */
    _reverseBuffer(buffer) {
        const ch = buffer.numberOfChannels;
        const len = buffer.length;
        const out = this.audioContext.createBuffer(ch, len, buffer.sampleRate);
        for (let c = 0; c < ch; c++) {
            const inData = buffer.getChannelData(c);
            const outData = out.getChannelData(c);
            for (let i = 0; i < len; i++) outData[i] = inData[len - 1 - i];
        }
        return out;
    }

    _getSfxPaths(soundCode) {
        if (this._resolvedSfxBase) {
            return [`${this._resolvedSfxBase}${soundCode}.ogg`];
        }
        return this._sfxBaseCandidates.map(base => `${base}${soundCode}.ogg`);
    }

    _getMusicPaths(trackPath) {
        if (this._resolvedMusicPrefix != null) {
            return [`${this._resolvedMusicPrefix}${trackPath}`];
        }
        return this._musicPrefixCandidates.map(prefix => `${prefix}${trackPath}`);
    }

    async _fetchFirstAudioBuffer(paths) {
        let lastError = null;
        for (const path of paths) {
            try {
                const res = await fetch(path);
                if (!res.ok) {
                    lastError = new Error(`HTTP ${res.status} for ${path}`);
                    continue;
                }

                if (path.endsWith('.ogg')) {
                    const slash = path.lastIndexOf('/') + 1;
                    this._resolvedSfxBase = path.slice(0, slash);
                } else if (path.includes('ART/Music/')) {
                    this._resolvedMusicPrefix = path.startsWith('public/') ? 'public/' : '';
                }

                return await res.arrayBuffer();
            } catch (err) {
                lastError = err;
            }
        }
        throw lastError || new Error('Audio fetch failed');
    }

    /** Play SFX (Balatro: play_sound) */
    play(soundCode, options = {}) {
        this.ensureReady();
        if (!this.audioContext) return;
        const pitch = options.pitch ?? 1;
        const volume = options.volume ?? 1;
        const paths = this._getSfxPaths(soundCode);
        this._fetchFirstAudioBuffer(paths)
            .then(buf => this.audioContext.decodeAudioData(buf))
            .then(buffer => {
                const src = this.audioContext.createBufferSource();
                src.buffer = buffer;
                src.playbackRate.value = pitch;
                const gain = this.audioContext.createGain();
                gain.gain.value = volume;  // Per-sound; master SFX = sfxGain (setSfxVolume)
                src.connect(gain);
                gain.connect(this.sfxGain);
                src.start(0);
            })
            .catch(() => { /* ignore load errors */ });
    }

    /** Start background music — uses current context */
    async startMusic() {
        this.ensureReady();
        if (!this.audioContext || this._musicPlaying) return;
        if (this.audioContext.state === 'suspended') await this.audioContext.resume();
        this._musicPlaying = true;
        this._playTrack(this.contextToTrack[this._currentContext] || 'music1');
    }

    /** Switch music by context with smooth crossfade (Balatro-style) */
    setMusicContext(context) {
        this._currentContext = context || 'play';
        const track = this.contextToTrack[this._currentContext] || 'music1';
        if (!this._musicPlaying || !this.audioContext) return;
        this._crossfadeToTrack(track);
    }

    /** Crossfade: fade out current, fade in new over _crossfadeDuration */
    async _crossfadeToTrack(trackId) {
        if (!this._musicPlaying || !this.audioContext) return;
        const now = this.audioContext.currentTime;
        const dur = this._crossfadeDuration;
        const endTime = now + dur;

        // Fade out current source
        if (this.musicSource && this._musicSourceGain) {
            this._musicSourceGain.gain.setValueAtTime(this._musicSourceGain.gain.value, now);
            this._musicSourceGain.gain.linearRampToValueAtTime(0, endTime);
            this.musicSource.onended = null;
            this.musicSource.stop(endTime);
        }

        try {
            const buf = await this._loadTrackBuffer(trackId);
            if (!buf) return;
            this._musicLoadFailCount = 0;
            const audioBuffer = this._reverseBuffer(buf);
            const src = this.audioContext.createBufferSource();
            src.buffer = audioBuffer;
            src.loop = false;
            src.playbackRate.value = 0.606;
            const smoothing = this.audioContext.createBiquadFilter();
            smoothing.type = 'lowpass';
            smoothing.frequency.value = MUSIC_PRE_LP_HZ;
            smoothing.Q.value = MUSIC_PRE_LP_Q;
            src.connect(smoothing);
            const srcGain = this.audioContext.createGain();
            srcGain.gain.setValueAtTime(0, now);
            srcGain.gain.linearRampToValueAtTime(1, endTime);
            if (this._musicMasterIn) srcGain.connect(this._musicMasterIn);
            else srcGain.connect(this.musicGain);
            const dryGain = this.audioContext.createGain();
            const wetGain = this.audioContext.createGain();
            dryGain.gain.value = MUSIC_REVERB_DRY;
            wetGain.gain.value = MUSIC_REVERB_WET;
            dryGain.connect(srcGain);
            wetGain.connect(srcGain);
            if (this._reverbIR) {
                const conv = this.audioContext.createConvolver();
                conv.buffer = this._reverbIR;
                smoothing.connect(conv);
                conv.connect(wetGain);
            } else {
                smoothing.connect(wetGain);
            }
            smoothing.connect(dryGain);
            const startOffset = this._randomStartOffset(audioBuffer);
            src.start(now, startOffset);
            src.onended = () => this._playTrack(this.contextToTrack[this._currentContext] || 'music1');
            this.musicSource = src;
            this._musicSourceGain = srcGain;
        } catch (e) {
            if (typeof Logger !== 'undefined') Logger.warn('Crossfade failed:', trackId, e);
        }
    }

    async _loadTrackBuffer(trackId) {
        const path = MUSIC_TRACKS[trackId] || MUSIC_TRACKS.music1;
        const candidatePaths = this._getMusicPaths(path);
        const buf = await this._fetchFirstAudioBuffer(candidatePaths);
        return this.audioContext.decodeAudioData(buf);
    }

    async _playTrack(trackId) {
        if (!this._musicPlaying || !this.audioContext) return;
        const path = MUSIC_TRACKS[trackId] || MUSIC_TRACKS.music1;
        try {
            const raw = await this._loadTrackBuffer(trackId);
            this._musicLoadFailCount = 0;
            const audioBuffer = this._reverseBuffer(raw);
            const src = this.audioContext.createBufferSource();
            src.buffer = audioBuffer;
            src.loop = false;
            src.playbackRate.value = 0.606;
            const smoothing = this.audioContext.createBiquadFilter();
            smoothing.type = 'lowpass';
            smoothing.frequency.value = MUSIC_PRE_LP_HZ;
            smoothing.Q.value = MUSIC_PRE_LP_Q;
            src.connect(smoothing);
            const srcGain = this.audioContext.createGain();
            srcGain.gain.value = 1;
            if (this._musicMasterIn) srcGain.connect(this._musicMasterIn);
            else srcGain.connect(this.musicGain);
            const dryGain = this.audioContext.createGain();
            const wetGain = this.audioContext.createGain();
            dryGain.gain.value = MUSIC_REVERB_DRY;
            wetGain.gain.value = MUSIC_REVERB_WET;
            dryGain.connect(srcGain);
            wetGain.connect(srcGain);
            if (this._reverbIR) {
                const conv = this.audioContext.createConvolver();
                conv.buffer = this._reverbIR;
                smoothing.connect(conv);
                conv.connect(wetGain);
            } else {
                smoothing.connect(wetGain);
            }
            smoothing.connect(dryGain);
            const startOffset = this._randomStartOffset(audioBuffer);
            src.onended = () => this._playTrack(this.contextToTrack[this._currentContext] || 'music1');
            src.start(0, startOffset);
            this.musicSource = src;
            this._musicSourceGain = srcGain;
        } catch (e) {
            this._musicLoadFailCount = (this._musicLoadFailCount || 0) + 1;
            if (typeof Logger !== 'undefined') Logger.warn('Music load failed:', trackId, path, e);
            if (this._musicLoadFailCount < 3) setTimeout(() => this._playTrack(trackId), 3000);
        }
    }

    stopMusic() {
        this._musicPlaying = false;
        if (this.musicSource) {
            try { this.musicSource.stop(); } catch (_) { /* ignore stop errors */ }
            this.musicSource = null;
        }
        this._musicSourceGain = null;
    }

    setMusicVolume(v) { this.musicVolume = Math.max(0, Math.min(1, v)); if (this.musicGain) this.musicGain.gain.value = this.musicVolume; }
    setSfxVolume(v) { this.sfxVolume = Math.max(0, Math.min(1, v)); if (this.sfxGain) this.sfxGain.gain.value = this.sfxVolume; }

    /** Convenience: trigger on user interaction (e.g. first click) */
    startOnInteraction() {
        this.ensureReady();
        if (!this._musicPlaying && this.audioContext) this.startMusic();
    }
}

// Global instance (replaces window.musicManager)
window.soundManager = new SoundManager();
