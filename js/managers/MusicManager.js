/**
 * Music Manager - Handles audio playback and management
 * Based on Balatro's audio system
 */
class MusicManager {
    constructor() {
        this.currentMusic = null;
        this.currentSound = null;
        this.musicVolume = 0.5;
        this.soundVolume = 0.7;
        this.enabled = true;
        
        // Audio contexts
        this.musicContext = null;
        this.soundContext = null;
        
        // Audio buffers
        this.musicBuffers = {};
        this.soundBuffers = {};
        
        // Initialize audio system
        this.initialize();
    }

    /**
     * Initialize the audio system
     */
    async initialize() {
        try {
            // Create audio contexts
            this.musicContext = new (window.AudioContext || window.webkitAudioContext)();
            this.soundContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Load default audio assets
            await this.loadDefaultAudio();
            
            console.log('Music Manager initialized successfully');
        } catch (error) {
            console.warn('Audio system not available:', error);
            this.enabled = false;
        }
    }

    /**
     * Load default audio assets
     */
    async loadDefaultAudio() {
        // Load music tracks
        const musicTracks = [
            'main_theme',
            'game_play',
            'menu_theme',
            'victory',
            'defeat'
        ];

        // Load sound effects
        const soundEffects = [
            'roll',
            'click',
            'score',
            'enhance',
            'purchase',
            'error'
        ];

        // Load all audio assets
        for (const track of musicTracks) {
            await this.loadMusic(track);
        }

        for (const sound of soundEffects) {
            await this.loadSound(sound);
        }
    }

    /**
     * Load a music track
     * @param {string} trackName - Name of the track
     */
    async loadMusic(trackName) {
        try {
            const response = await fetch(`assets/audio/music/${trackName}.mp3`);
            if (response.ok) {
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await this.musicContext.decodeAudioData(arrayBuffer);
                this.musicBuffers[trackName] = audioBuffer;
            }
        } catch (error) {
            console.warn(`Failed to load music track: ${trackName}`, error);
        }
    }

    /**
     * Load a sound effect
     * @param {string} soundName - Name of the sound
     */
    async loadSound(soundName) {
        try {
            const response = await fetch(`assets/audio/sounds/${soundName}.mp3`);
            if (response.ok) {
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await this.soundContext.decodeAudioData(arrayBuffer);
                this.soundBuffers[soundName] = audioBuffer;
            }
        } catch (error) {
            console.warn(`Failed to load sound: ${soundName}`, error);
        }
    }

    /**
     * Play music track
     * @param {string} trackName - Name of the track to play
     * @param {boolean} loop - Whether to loop the track
     */
    playMusic(trackName, loop = true) {
        if (!this.enabled || !this.musicContext) return;

        try {
            // Stop current music
            this.stopMusic();

            const buffer = this.musicBuffers[trackName];
            if (!buffer) {
                console.warn(`Music track not found: ${trackName}`);
                return;
            }

            // Create source and play
            const source = this.musicContext.createBufferSource();
            const gainNode = this.musicContext.createGain();
            
            source.buffer = buffer;
            source.loop = loop;
            gainNode.gain.value = this.musicVolume;
            
            source.connect(gainNode);
            gainNode.connect(this.musicContext.destination);
            
            source.start(0);
            this.currentMusic = { source, gainNode };
            
            console.log(`Playing music: ${trackName}`);
        } catch (error) {
            console.warn(`Failed to play music: ${trackName}`, error);
        }
    }

    /**
     * Stop current music
     */
    stopMusic() {
        if (this.currentMusic) {
            try {
                this.currentMusic.source.stop();
                this.currentMusic = null;
            } catch (error) {
                console.warn('Failed to stop music:', error);
            }
        }
    }

    /**
     * Play sound effect
     * @param {string} soundName - Name of the sound to play
     */
    playSound(soundName) {
        if (!this.enabled || !this.soundContext) return;

        try {
            const buffer = this.soundBuffers[soundName];
            if (!buffer) {
                console.warn(`Sound not found: ${soundName}`);
                return;
            }

            // Create source and play
            const source = this.soundContext.createBufferSource();
            const gainNode = this.soundContext.createGain();
            
            source.buffer = buffer;
            gainNode.gain.value = this.soundVolume;
            
            source.connect(gainNode);
            gainNode.connect(this.soundContext.destination);
            
            source.start(0);
            this.currentSound = { source, gainNode };
            
            console.log(`Playing sound: ${soundName}`);
        } catch (error) {
            console.warn(`Failed to play sound: ${soundName}`, error);
        }
    }

    /**
     * Set music volume
     * @param {number} volume - Volume level (0-1)
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.currentMusic) {
            this.currentMusic.gainNode.gain.value = this.musicVolume;
        }
    }

    /**
     * Set sound volume
     * @param {number} volume - Volume level (0-1)
     */
    setSoundVolume(volume) {
        this.soundVolume = Math.max(0, Math.min(1, volume));
        if (this.currentSound) {
            this.currentSound.gainNode.gain.value = this.soundVolume;
        }
    }

    /**
     * Get music volume
     * @returns {number} Current music volume
     */
    getMusicVolume() {
        return this.musicVolume;
    }

    /**
     * Get sound volume
     * @returns {number} Current sound volume
     */
    getSoundVolume() {
        return this.soundVolume;
    }

    /**
     * Enable/disable audio
     * @param {boolean} enabled - Whether audio is enabled
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.stopMusic();
        }
    }

    /**
     * Check if audio is enabled
     * @returns {boolean} Whether audio is enabled
     */
    isEnabled() {
        return this.enabled;
    }

    /**
     * Update audio system
     * @param {number} dt - Delta time
     */
    update(dt) {
        // Audio system updates if needed
        // This could include fade effects, crossfading, etc.
    }

    /**
     * Resume audio contexts (for mobile)
     */
    resume() {
        if (this.musicContext && this.musicContext.state === 'suspended') {
            this.musicContext.resume();
        }
        if (this.soundContext && this.soundContext.state === 'suspended') {
            this.soundContext.resume();
        }
    }

    /**
     * Pause audio contexts
     */
    pause() {
        if (this.musicContext && this.musicContext.state === 'running') {
            this.musicContext.suspend();
        }
        if (this.soundContext && this.soundContext.state === 'running') {
            this.soundContext.suspend();
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MusicManager;
} else {
    window.MusicManager = MusicManager;
}

