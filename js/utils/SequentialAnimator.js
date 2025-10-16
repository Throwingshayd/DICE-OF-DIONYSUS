// SequentialAnimator - Manages sequential animations with delays
// Inspired by Balatro's event queue system

class SequentialAnimator {
    constructor() {
        this.queue = [];
        this.isRunning = false;
        this.isPaused = false;
        this.currentAction = null;
        
        Logger.info('SequentialAnimator initialized');
    }
    
    /**
     * Add an action to the animation queue
     * @param {Function} callback - Async or sync function to execute
     * @param {number} delay - Delay before executing (ms)
     * @returns {SequentialAnimator} - For chaining
     */
    add(callback, delay = 0) {
        this.queue.push({ callback, delay });
        
        if (!this.isRunning) {
            this.run();
        }
        
        return this;
    }
    
    /**
     * Add multiple actions at once
     * @param {Array<{callback: Function, delay: number}>} actions
     * @returns {SequentialAnimator} - For chaining
     */
    addMultiple(actions) {
        actions.forEach(action => {
            this.queue.push({
                callback: action.callback,
                delay: action.delay || 0
            });
        });
        
        if (!this.isRunning) {
            this.run();
        }
        
        return this;
    }
    
    /**
     * Run the animation queue
     */
    async run() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        
        while (this.queue.length > 0 && !this.isPaused) {
            const action = this.queue.shift();
            this.currentAction = action;
            
            // Wait for delay
            if (action.delay > 0) {
                await this.sleep(action.delay);
            }
            
            // Execute callback
            try {
                const result = action.callback();
                
                // If callback returns a promise, wait for it
                if (result && typeof result.then === 'function') {
                    await result;
                }
            } catch (error) {
                Logger.error('SequentialAnimator: Error executing action', error);
            }
            
            this.currentAction = null;
        }
        
        this.isRunning = false;
    }
    
    /**
     * Sleep for a duration
     * @param {number} ms - Duration in milliseconds
     * @returns {Promise}
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Pause the animation queue
     */
    pause() {
        this.isPaused = true;
    }
    
    /**
     * Resume the animation queue
     */
    resume() {
        this.isPaused = false;
        if (this.queue.length > 0 && !this.isRunning) {
            this.run();
        }
    }
    
    /**
     * Clear the animation queue
     * @param {boolean} clearCurrent - Also clear currently running action
     */
    clear(clearCurrent = false) {
        this.queue = [];
        
        if (clearCurrent) {
            this.currentAction = null;
            this.isPaused = false;
            this.isRunning = false;
        }
    }
    
    /**
     * Check if queue is empty
     */
    isEmpty() {
        return this.queue.length === 0 && !this.isRunning;
    }
    
    /**
     * Wait for all animations to complete
     * @returns {Promise}
     */
    async waitForCompletion() {
        while (!this.isEmpty()) {
            await this.sleep(50);
        }
    }
}

// Animation timing constants (matching Balatro's feel)
const ANIMATION_TIMINGS = {
    // Base durations
    INSTANT: 0,
    QUICK: 100,         // Button hover, instant feedback
    FAST: 200,          // Button clicks, card flips
    NORMAL: 400,        // Card movements, dice rolls
    SLOW: 600,          // Score calculations
    DRAMATIC: 1000,     // Boss reveals, special events
    
    // Stagger delays (for sequential reveals)
    STAGGER_SHORT: 50,   // Very rapid succession
    STAGGER_MEDIUM: 150, // Cards revealing one by one
    STAGGER_LONG: 300,   // Major events with pauses
    
    // Easing factors (for velocity-based movement)
    EASE_XY: 0.9,        // Position smoothing
    EASE_SCALE: 0.8,     // Scale smoothing
    EASE_ROTATION: 0.85  // Rotation smoothing
};

// Utility functions for common animation patterns
const AnimationPatterns = {
    /**
     * Reveal elements sequentially with juice
     * @param {Array<HTMLElement>} elements - Elements to reveal
     * @param {SequentialAnimator} animator - Animator instance
     * @param {Object} options - Configuration options
     */
    revealSequential(elements, animator, options = {}) {
        const {
            staggerDelay = ANIMATION_TIMINGS.STAGGER_MEDIUM,
            juiceIntensity = 0.5,
            soundName = null,
            onEachReveal = null
        } = options;
        
        elements.forEach((element, index) => {
            animator.add(async () => {
                // Show element
                element.classList.remove('hidden');
                element.style.opacity = '1';
                
                // Apply juice
                if (window.juiceManager) {
                    window.juiceManager.juiceUp(element, juiceIntensity);
                }
                
                // Play sound with pitch variation
                if (soundName && window.soundManager) {
                    window.soundManager.play(soundName, {
                        pitch: 1 + index * 0.05
                    });
                }
                
                // Custom callback
                if (onEachReveal) {
                    onEachReveal(element, index);
                }
            }, index > 0 ? staggerDelay : 0);
        });
    },
    
    /**
     * Count up a number with animation
     * @param {HTMLElement} element - Element to update
     * @param {number} from - Starting value
     * @param {number} to - Ending value
     * @param {number} duration - Animation duration
     * @returns {Promise}
     */
    async countUp(element, from, to, duration = 800) {
        const startTime = performance.now();
        
        return new Promise(resolve => {
            function animate(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Ease out cubic for smooth deceleration
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.floor(from + (to - from) * eased);
                
                element.textContent = current;
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    element.textContent = to;
                    resolve();
                }
            }
            
            requestAnimationFrame(animate);
        });
    },
    
    /**
     * Fade in an element
     * @param {HTMLElement} element - Element to fade
     * @param {number} duration - Fade duration
     * @returns {Promise}
     */
    async fadeIn(element, duration = ANIMATION_TIMINGS.NORMAL) {
        element.style.opacity = '0';
        element.classList.remove('hidden');
        
        return new Promise(resolve => {
            const startTime = performance.now();
            
            function animate(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                element.style.opacity = progress;
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            }
            
            requestAnimationFrame(animate);
        });
    },
    
    /**
     * Fade out an element
     * @param {HTMLElement} element - Element to fade
     * @param {number} duration - Fade duration
     * @returns {Promise}
     */
    async fadeOut(element, duration = ANIMATION_TIMINGS.NORMAL) {
        return new Promise(resolve => {
            const startTime = performance.now();
            const startOpacity = parseFloat(element.style.opacity || '1');
            
            function animate(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                element.style.opacity = startOpacity * (1 - progress);
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    element.classList.add('hidden');
                    element.style.opacity = '0';
                    resolve();
                }
            }
            
            requestAnimationFrame(animate);
        });
    },
    
    /**
     * Slide element in from direction
     * @param {HTMLElement} element - Element to slide
     * @param {string} direction - 'left', 'right', 'up', 'down'
     * @param {number} distance - Slide distance in pixels
     * @param {number} duration - Animation duration
     * @returns {Promise}
     */
    async slideIn(element, direction = 'up', distance = 50, duration = ANIMATION_TIMINGS.NORMAL) {
        const translations = {
            up: `translateY(${distance}px)`,
            down: `translateY(-${distance}px)`,
            left: `translateX(${distance}px)`,
            right: `translateX(-${distance}px)`
        };
        
        element.style.transform = translations[direction];
        element.style.opacity = '0';
        element.classList.remove('hidden');
        
        return new Promise(resolve => {
            const startTime = performance.now();
            
            function animate(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Ease out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                
                element.style.opacity = progress;
                
                const currentDistance = distance * (1 - eased);
                const targetTranslations = {
                    up: `translateY(${currentDistance}px)`,
                    down: `translateY(-${currentDistance}px)`,
                    left: `translateX(${currentDistance}px)`,
                    right: `translateX(-${currentDistance}px)`
                };
                element.style.transform = targetTranslations[direction];
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    element.style.transform = '';
                    resolve();
                }
            }
            
            requestAnimationFrame(animate);
        });
    }
};

// Export to window
window.SequentialAnimator = SequentialAnimator;
window.ANIMATION_TIMINGS = ANIMATION_TIMINGS;
window.AnimationPatterns = AnimationPatterns;

