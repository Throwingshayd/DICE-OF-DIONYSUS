// JuiceManager - Provides Balatro-style juice effects for UI elements
// Inspired by Balatro's moveable.lua juice_up system

class JuiceManager {
    constructor() {
        this.activeJuice = new Map();
        this.isRunning = false;
        this.lastFrame = performance.now();
        
        // Timing constants (calibrated to match Balatro feel)
        this.TIMINGS = {
            DURATION: 400,      // 0.4 seconds (matches Balatro)
            SCALE_FREQ: 50.8,   // Frequency for scale oscillation
            ROT_FREQ: 40.8,     // Frequency for rotation oscillation
            SCALE_POWER: 3,     // Power for scale decay
            ROT_POWER: 2        // Power for rotation decay
        };
        
        Logger.info('JuiceManager initialized');
    }
    
    /**
     * Apply juice effect to an element (bounce + wobble)
     * @param {HTMLElement} element - The element to juice
     * @param {number} intensity - Juice intensity (0-1, default 0.4)
     * @param {number|null} rotationAmt - Rotation amount in degrees (null for random)
     * @param {Function} onComplete - Callback when juice completes
     */
    juiceUp(element, intensity = 0.4, rotationAmt = null, onComplete = null) {
        if (!element) {
            Logger.warn('JuiceManager: Cannot juice null element');
            return;
        }
        
        // Cancel existing juice on this element
        if (this.activeJuice.has(element)) {
            this.cancelJuice(element);
        }
        
        const startTime = performance.now();
        const rotation = rotationAmt !== null ? rotationAmt : 
                        (Math.random() > 0.5 ? 0.6 : -0.6) * intensity;
        
        // Store original transform if not already set
        if (!element.dataset.originalTransform) {
            element.dataset.originalTransform = element.style.transform || '';
        }
        
        const juiceState = {
            element,
            startTime,
            intensity,
            rotation,
            onComplete,
            baseTransform: element.dataset.originalTransform
        };
        
        this.activeJuice.set(element, juiceState);
        
        // Start animation loop if not running
        if (!this.isRunning) {
            this.startAnimationLoop();
        }
    }
    
    /**
     * Start the animation loop
     */
    startAnimationLoop() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastFrame = performance.now();
        this.animate();
    }
    
    /**
     * Main animation loop
     */
    animate() {
        if (this.activeJuice.size === 0) {
            this.isRunning = false;
            return;
        }
        
        const currentTime = performance.now();
        const _deltaTime = currentTime - this.lastFrame;
        this.lastFrame = currentTime;
        
        // Update all active juice effects
        for (const [element, state] of this.activeJuice.entries()) {
            this.updateJuice(element, state, currentTime);
        }
        
        requestAnimationFrame(() => this.animate());
    }
    
    /**
     * Update a single juice effect
     */
    updateJuice(element, state, currentTime) {
        const elapsed = currentTime - state.startTime;
        const progress = Math.min(elapsed / this.TIMINGS.DURATION, 1);
        
        if (progress >= 1) {
            // Animation complete
            element.style.transform = state.baseTransform;
            this.activeJuice.delete(element);
            
            if (state.onComplete) {
                state.onComplete();
            }
            return;
        }
        
        // Calculate scale offset (sinusoidal with decay)
        const elapsedSeconds = elapsed / 1000;
        const decayFactor = Math.pow(1 - progress, this.TIMINGS.SCALE_POWER);
        const scaleOffset = state.intensity * 
                           Math.sin(this.TIMINGS.SCALE_FREQ * elapsedSeconds) * 
                           decayFactor;
        
        // Calculate rotation offset (sinusoidal with decay)
        const rotDecayFactor = Math.pow(1 - progress, this.TIMINGS.ROT_POWER);
        const rotOffset = state.rotation * 
                         Math.sin(this.TIMINGS.ROT_FREQ * elapsedSeconds) * 
                         rotDecayFactor;
        
        // Apply transform
        const scale = 1 + scaleOffset;
        const newTransform = `${state.baseTransform} scale(${scale}) rotate(${rotOffset}deg)`;
        element.style.transform = newTransform;
    }
    
    /**
     * Cancel juice effect on an element
     */
    cancelJuice(element) {
        const state = this.activeJuice.get(element);
        if (state) {
            element.style.transform = state.baseTransform;
            this.activeJuice.delete(element);
        }
    }
    
    /**
     * Cancel all active juice effects
     */
    cancelAll() {
        for (const [element, state] of this.activeJuice.entries()) {
            element.style.transform = state.baseTransform;
        }
        this.activeJuice.clear();
        this.isRunning = false;
    }
    
    /**
     * Juice multiple elements sequentially with delay
     * @param {Array<HTMLElement>} elements - Elements to juice
     * @param {number} staggerDelay - Delay between each element (ms)
     * @param {number} intensity - Juice intensity
     */
    juiceSequential(elements, staggerDelay = 150, intensity = 0.4) {
        elements.forEach((element, index) => {
            setTimeout(() => {
                this.juiceUp(element, intensity);
            }, index * staggerDelay);
        });
    }
    
    /**
     * Pulse effect - gentle continuous bounce
     * @param {HTMLElement} element - Element to pulse
     * @param {number} intensity - Pulse intensity (0-1)
     * @param {number} frequency - Pulses per second
     */
    startPulse(element, intensity = 0.1, frequency = 2) {
        if (!element) return;
        
        element.dataset.pulseActive = 'true';
        const startTime = performance.now();
        
        const pulse = () => {
            if (element.dataset.pulseActive !== 'true') return;
            
            const elapsed = (performance.now() - startTime) / 1000;
            const scale = 1 + intensity * Math.sin(elapsed * frequency * Math.PI * 2);
            
            if (!this.activeJuice.has(element)) {
                element.style.transform = `scale(${scale})`;
            }
            
            requestAnimationFrame(pulse);
        };
        
        pulse();
    }
    
    /**
     * Stop pulse effect
     */
    stopPulse(element) {
        if (!element) return;
        element.dataset.pulseActive = 'false';
        element.style.transform = element.dataset.originalTransform || '';
    }
    
    /**
     * Screen shake effect
     * @param {number} intensity - Shake intensity (pixels)
     * @param {number} duration - Shake duration (ms)
     */
    screenShake(intensity = 10, duration = 400) {
        const body = document.body;
        const startTime = performance.now();
        
        const shake = () => {
            const elapsed = performance.now() - startTime;
            const progress = elapsed / duration;
            
            if (progress >= 1) {
                body.style.transform = '';
                return;
            }
            
            const decay = 1 - progress;
            const x = (Math.random() - 0.5) * intensity * decay;
            const y = (Math.random() - 0.5) * intensity * decay;
            
            body.style.transform = `translate(${x}px, ${y}px)`;
            requestAnimationFrame(shake);
        };
        
        shake();
    }
}

// Global instance
window.juiceManager = window.juiceManager || new JuiceManager();

