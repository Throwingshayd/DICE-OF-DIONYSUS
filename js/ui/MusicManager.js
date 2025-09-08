class MusicManager {
    constructor() {
        this.tracks = [
            'ART/Music/lute 1 effects.wav',
            'ART/Music/lute 2 w effects.wav',
            'ART/Music/lute 3 w effects.wav',
            'ART/Music/lute 4 w effects.wav',
            'ART/Music/lute 5 w effects.wav'
        ];
        
        this.currentTrack = null;
        this.nextTrack = null;
        this.isPlaying = false;
        this.volume = 0.7;
        this.crossfadeDuration = 4000; // 4 seconds in milliseconds
        this.audioContext = null;
        this.gainNode = null;
        this.nextGainNode = null;
        this.isAudioAvailable = true; // Flag to track if audio system is working
        
        this.initializeAudio();
    }
    
    initializeAudio() {
        try {
            console.log('Initializing audio system...');
            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('Audio context created:', this.audioContext.state);
            
            // Create gain nodes for crossfading
            this.gainNode = this.audioContext.createGain();
            this.nextGainNode = this.audioContext.createGain();
            
            // Connect gain nodes to destination
            this.gainNode.connect(this.audioContext.destination);
            this.nextGainNode.connect(this.audioContext.destination);
            
            // Set initial volumes
            this.gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
            this.nextGainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            
                                      console.log('Audio system initialized and ready');
             // Don't auto-start - wait for user interaction
                 } catch (error) {
            console.error('Failed to initialize audio:', error);
            // Don't break the game if audio fails - just disable music
            this.isAudioAvailable = false;
        }
    }
    
    async startMusic() {
        if (!this.isAudioAvailable || !this.audioContext || this.isPlaying) {
            console.log('Cannot start music - audio available:', this.isAudioAvailable, 'context:', !!this.audioContext, 'already playing:', this.isPlaying);
            return;
        }
        
        this.isPlaying = true;
        console.log('Starting music...');
        
        // Resume audio context if suspended
        if (this.audioContext.state === 'suspended') {
            console.log('Resuming suspended audio context...');
            await this.audioContext.resume();
        }
        
        console.log('Audio context state:', this.audioContext.state);
        // Start with a random track
        await this.playRandomTrack();
    }
    
    async playRandomTrack() {
        if (!this.isPlaying) return;
        
        try {
            // Get a random track (different from current if possible)
            let randomIndex;
            do {
                randomIndex = Math.floor(Math.random() * this.tracks.length);
            } while (this.tracks[randomIndex] === this.currentTrack && this.tracks.length > 1);
            
            const trackPath = this.tracks[randomIndex];
            
            // Load and play the track
            await this.loadAndPlayTrack(trackPath);
            
        } catch (error) {
            // Try again after a delay
            setTimeout(() => this.playRandomTrack(), 5000);
        }
    }
    
    async loadAndPlayTrack(trackPath) {
        try {
            console.log('Loading track:', trackPath);
            // Fetch the audio file
            const response = await fetch(trackPath);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            console.log('Audio file loaded, size:', arrayBuffer.byteLength);
            
            // Decode the audio data
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            console.log('Audio decoded, duration:', audioBuffer.duration);
            
            // Create audio source
            const source = this.audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.loop = false;
            
            // Connect to appropriate gain node
            if (this.currentTrack) {
                // Crossfade to new track
                source.connect(this.nextGainNode);
                this.crossfadeToNewTrack(source);
            } else {
                // First track, no crossfade needed
                source.connect(this.gainNode);
                source.start();
                this.currentTrack = trackPath;
                console.log('First track started:', trackPath);
            }
            
            // Set up next track when this one ends
            source.onended = () => {
                console.log('Track ended:', trackPath);
                if (this.isPlaying) {
                    this.currentTrack = null;
                    this.playRandomTrack();
                }
            };
            
        } catch (error) {
            console.error('Error loading track:', trackPath, error);
            // Try next track
            setTimeout(() => this.playRandomTrack(), 1000);
        }
    }
    
    crossfadeToNewTrack(newSource) {
        const currentTime = this.audioContext.currentTime;
        
        // Start the new track
        newSource.start();
        this.nextTrack = newSource;
        
        // Fade out current track
        this.gainNode.gain.linearRampToValueAtTime(0, currentTime + this.crossfadeDuration / 1000);
        
        // Fade in new track
        this.nextGainNode.gain.setValueAtTime(0, currentTime);
        this.nextGainNode.gain.linearRampToValueAtTime(this.volume, currentTime + this.crossfadeDuration / 1000);
        
        // Swap gain nodes after crossfade
        setTimeout(() => {
            if (this.isPlaying) {
                // Swap the gain nodes
                const tempGain = this.gainNode;
                this.gainNode = this.nextGainNode;
                this.nextGainNode = tempGain;
                
                // Reset next gain node volume
                this.nextGainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                
                // Update current track
                this.currentTrack = this.tracks.find(track => track !== this.currentTrack);
            }
        }, this.crossfadeDuration);
    }
    
    stopMusic() {
        this.isPlaying = false;
        
        if (this.audioContext) {
            // Fade out current music
            const currentTime = this.audioContext.currentTime;
            this.gainNode.gain.linearRampToValueAtTime(0, currentTime + 2);
            this.nextGainNode.gain.linearRampToValueAtTime(0, currentTime + 2);
        }
    }
    
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        
        if (this.audioContext) {
            const currentTime = this.audioContext.currentTime;
            this.gainNode.gain.setValueAtTime(this.volume, currentTime);
        }
    }
    
    getVolume() {
        return this.volume;
    }
    
    isMusicPlaying() {
        return this.isPlaying;
    }
    
    // Method to start music on first user interaction
    startMusicOnInteraction() {
        if (!this.isPlaying && this.audioContext) {
            console.log('Starting music on user interaction');
            this.startMusic();
        }
    }
    
    // Method to ensure music starts when called
    ensureMusicStarted() {
        if (!this.isPlaying && this.audioContext) {
            console.log('Ensuring music starts...');
            this.startMusic();
        }
    }
}
