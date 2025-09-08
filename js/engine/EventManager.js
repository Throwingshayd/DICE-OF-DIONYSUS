/**
 * Event Manager - Handles timing and sequencing of game events
 * Based on Balatro's event system
 */
class EventManager {
    constructor() {
        this.events = [];
        this.timers = {
            REAL: 0,
            TOTAL: 0,
            BACKGROUND: 0
        };
        this.speedFactor = 1;
        this.paused = false;
    }

    /**
     * Add an event to the queue
     * @param {Object} config - Event configuration
     * @param {string} config.trigger - 'immediate', 'after', 'before', 'ease', 'condition'
     * @param {boolean} config.blocking - Whether this event blocks others
     * @param {boolean} config.blockable - Whether this event can be blocked
     * @param {Function} config.func - Function to execute
     * @param {number} config.delay - Delay before execution
     * @param {string} config.timer - Which timer to use ('REAL', 'TOTAL')
     */
    addEvent(config) {
        const event = {
            trigger: config.trigger || 'immediate',
            blocking: config.blocking !== undefined ? config.blocking : true,
            blockable: config.blockable !== undefined ? config.blockable : true,
            complete: false,
            func: config.func || (() => true),
            delay: config.delay || 0,
            timer: config.timer || 'TOTAL',
            time: this.timers[config.timer || 'TOTAL'],
            noDelete: config.noDelete || false,
            createdOnPause: this.paused,
            
            // Ease-specific properties
            ease: config.trigger === 'ease' ? {
                type: config.ease || 'lerp',
                refTable: config.refTable,
                refValue: config.refValue,
                startVal: config.refTable[config.refValue],
                endVal: config.easeTo,
                startTime: null,
                endTime: null
            } : null,
            
            // Condition-specific properties
            condition: config.trigger === 'condition' ? {
                refTable: config.refTable,
                refValue: config.refValue,
                stopVal: config.stopVal
            } : null
        };

        this.events.push(event);
        return event;
    }

    /**
     * Update the event manager
     * @param {number} dt - Delta time
     */
    update(dt) {
        // Update timers
        this.timers.REAL += dt;
        this.timers.TOTAL += dt * this.speedFactor;
        this.timers.BACKGROUND += dt;

        // Process events
        const results = {
            blocking: false,
            completed: false,
            timeDone: false,
            pauseSkip: false
        };

        for (let i = this.events.length - 1; i >= 0; i--) {
            const event = this.events[i];
            
            // Skip if paused and event wasn't created during pause
            if (this.paused && !event.createdOnPause) {
                results.pauseSkip = true;
                continue;
            }

            // Handle different trigger types
            switch (event.trigger) {
                case 'immediate':
                    results.completed = event.func();
                    results.timeDone = true;
                    break;

                case 'after':
                    if (this.timers[event.timer] >= event.time + event.delay) {
                        results.timeDone = true;
                        results.completed = event.func();
                    }
                    break;

                case 'before':
                    if (!event.complete) {
                        results.completed = event.func();
                    }
                    if (this.timers[event.timer] >= event.time + event.delay) {
                        results.timeDone = true;
                    }
                    break;

                case 'ease':
                    this.handleEaseEvent(event, results);
                    break;

                case 'condition':
                    if (!event.complete) {
                        results.completed = event.func();
                    }
                    results.timeDone = true;
                    break;
            }

            // Mark event as complete if it finished
            if (results.completed) {
                event.complete = true;
            }

            // Remove completed events (unless noDelete is set)
            if (event.complete && !event.noDelete) {
                this.events.splice(i, 1);
            }

            // Handle blocking
            if (event.blocking && results.blocking) {
                break;
            }
        }
    }

    /**
     * Handle ease events (smooth transitions)
     * @param {Object} event - The ease event
     * @param {Object} results - Results object
     */
    handleEaseEvent(event, results) {
        const ease = event.ease;
        
        if (!ease.startTime) {
            ease.startTime = this.timers[event.timer];
            ease.endTime = this.timers[event.timer] + event.delay;
            ease.startVal = ease.refTable[ease.refValue];
        }

        if (!event.complete) {
            if (ease.endTime >= this.timers[event.timer]) {
                const percentDone = (ease.endTime - this.timers[event.timer]) / (ease.endTime - ease.startTime);
                const easedValue = this.easeValue(percentDone, ease.startVal, ease.endVal, ease.type);
                ease.refTable[ease.refValue] = event.func(easedValue);
            } else {
                ease.refTable[ease.refValue] = event.func(ease.endVal);
                event.complete = true;
                results.completed = true;
                results.timeDone = true;
            }
        }
    }

    /**
     * Apply easing function
     * @param {number} t - Time (0-1)
     * @param {number} start - Start value
     * @param {number} end - End value
     * @param {string} type - Easing type
     * @returns {number} Eased value
     */
    easeValue(t, start, end, type) {
        let easedT = t;
        
        switch (type) {
            case 'lerp':
                // Linear interpolation (default)
                break;
            case 'elastic':
                easedT = -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * 2 * Math.PI / 3);
                break;
            case 'quad':
                easedT = t * t;
                break;
            case 'bounce':
                if (t < 1 / 2.75) {
                    easedT = 7.5625 * t * t;
                } else if (t < 2 / 2.75) {
                    easedT = 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
                } else if (t < 2.5 / 2.75) {
                    easedT = 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
                } else {
                    easedT = 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
                }
                break;
        }

        return start + (end - start) * easedT;
    }

    /**
     * Clear all events
     */
    clearQueue() {
        this.events = [];
    }

    /**
     * Set speed factor for animations
     * @param {number} factor - Speed multiplier
     */
    setSpeedFactor(factor) {
        this.speedFactor = factor;
    }

    /**
     * Set pause state
     * @param {boolean} paused - Whether the game is paused
     */
    setPaused(paused) {
        this.paused = paused;
    }

    /**
     * Get current timer value
     * @param {string} timer - Timer name
     * @returns {number} Timer value
     */
    getTimer(timer = 'TOTAL') {
        return this.timers[timer] || 0;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventManager;
} else {
    window.EventManager = EventManager;
}

