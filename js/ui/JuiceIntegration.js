// JuiceIntegration - Adds juice effects to all game UI elements
// Integrates JuiceManager, SequentialAnimator, and ParticleSystem

class JuiceIntegration {
    constructor() {
        this.juice = window.juiceManager;
        this.particles = window.particleSystem;
        this.initialized = false;
        
        Logger.info('JuiceIntegration ready');
    }
    
    /**
     * Initialize juice effects for all UI elements
     */
    initialize() {
        if (this.initialized) return;
        
        this.addButtonJuice();
        this.addCardJuice();
        this.addDiceJuice();
        this.addScoreJuice();
        
        this.initialized = true;
        Logger.info('JuiceIntegration initialized');
    }
    
    /**
     * Add juice effects to all buttons
     */
    addButtonJuice() {
        // Get all buttons
        const buttons = document.querySelectorAll('.divine-button, .roll-button, button');
        
        buttons.forEach(button => {
            // Skip if already has juice
            if (button.dataset.hasJuice === 'true') return;
            
            button.dataset.hasJuice = 'true';
            
            // Click juice
            button.addEventListener('click', (e) => {
                if (!button.disabled) {
                    this.juice.juiceUp(button, 0.3);
                    
                    // Add particle burst for important buttons
                    if (button.id === 'playButton' || 
                        button.id === 'rollButton' || 
                        button.id === 'confirmYes') {
                        const rect = button.getBoundingClientRect();
                        const x = rect.left + rect.width / 2;
                        const y = rect.top + rect.height / 2;
                        this.particles.divineSparkle(x, y, 5);
                    }
                }
            });
        });
    }
    
    /**
     * Add juice effects to cards
     */
    addCardJuice() {
        // This will be called when cards are rendered
        // We'll expose a method to juice individual cards
    }
    
    /**
     * Juice a specific card element
     * @param {HTMLElement} cardElement - Card to juice
     * @param {number} intensity - Juice intensity
     */
    juiceCard(cardElement, intensity = 0.4) {
        if (!cardElement) return;
        this.juice.juiceUp(cardElement, intensity);
    }
    
    /**
     * Add juice effects to dice
     */
    addDiceJuice() {
        // Dice juice will be handled in GameEngine during roll
    }
    
    /**
     * Juice all dice sequentially
     * @param {Array<HTMLElement>} diceElements - Array of dice elements
     */
    async juiceDiceSequential(diceElements) {
        const animator = new SequentialAnimator();
        
        diceElements.forEach((die, index) => {
            animator.add(() => {
                this.juice.juiceUp(die, 0.5);
                
                // Particle effect
                const rect = die.getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;
                this.particles.spawn(x, y, {
                    colors: ['#FFD700', '#FFA500'],
                    speed: 0.8,
                    lifespan: 0.6
                });
            }, index * ANIMATION_TIMINGS.STAGGER_MEDIUM);
        });
        
        await animator.waitForCompletion();
    }
    
    /**
     * Add juice effects to score displays
     */
    addScoreJuice() {
        // Score juice will be triggered manually when scores update
    }
    
    /**
     * Animate score increase with juice
     * @param {HTMLElement} scoreElement - Element showing score
     * @param {number} from - Starting value
     * @param {number} to - Ending value
     * @param {boolean} celebrateIfBig - Add celebration for big scores
     */
    async animateScore(scoreElement, from, to, celebrateIfBig = true) {
        if (!scoreElement) return;
        
        // Count up animation
        await AnimationPatterns.countUp(scoreElement, from, to, 800);
        
        // Juice the element
        this.juice.juiceUp(scoreElement, 0.6);
        
        // Particle burst for big scores
        if (celebrateIfBig && to - from > 100) {
            const rect = scoreElement.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            this.particles.scoreCelebration(x, y, 30);
        }
    }
    
    /**
     * Gold change animation with particles
     * @param {HTMLElement} goldElement - Gold display element
     * @param {number} change - Amount changed (positive or negative)
     */
    animateGoldChange(goldElement, change) {
        if (!goldElement || change === 0) return;
        
        // Juice the element
        this.juice.juiceUp(goldElement, 0.4);
        
        // Add class for CSS animation
        goldElement.classList.add('gold-change');
        setTimeout(() => {
            goldElement.classList.remove('gold-change');
        }, 600);
        
        // Particle effect (only for gains)
        if (change > 0) {
            const rect = goldElement.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            
            const particleCount = Math.min(Math.floor(change / 2), 20);
            this.particles.goldCoins(x, y, particleCount);
        }
    }
    
    /**
     * Animate shop opening with smooth transition
     * @param {HTMLElement} shopOverlay - Shop overlay element
     */
    async openShop(shopOverlay) {
        if (!shopOverlay) return;
        
        // Remove hidden class
        shopOverlay.classList.remove('hidden');
        
        // Juice all shop items
        const shopItems = shopOverlay.querySelectorAll('.card, .shop-section > div');
        setTimeout(() => {
            this.juice.juiceSequential(Array.from(shopItems), ANIMATION_TIMINGS.STAGGER_SHORT, 0.3);
        }, 200);
    }
    
    /**
     * Animate shop closing
     * @param {HTMLElement} shopOverlay - Shop overlay element
     */
    async closeShop(shopOverlay) {
        if (!shopOverlay) return;
        
        await new Promise(resolve => {
            setTimeout(() => {
                shopOverlay.classList.add('hidden');
                resolve();
            }, 300);
        });
    }
    
    /**
     * Celebrate a big moment (Yahtzee, big score, etc.)
     * @param {HTMLElement} element - Element to celebrate around
     * @param {string} type - Type of celebration
     */
    celebrate(element, type = 'divine') {
        if (!element) return;
        
        // Juice the element
        this.juice.juiceUp(element, 0.8, 0);
        
        // Add celebration class
        element.classList.add('celebration');
        setTimeout(() => {
            element.classList.remove('celebration');
        }, 1000);
        
        // Particle burst
        const rect = element.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        switch (type) {
            case 'divine':
                this.particles.divineSparkle(x, y, 40);
                break;
            case 'score':
                this.particles.scoreCelebration(x, y, 50);
                break;
            case 'magic':
                this.particles.darkMagic(x, y, 35);
                break;
            default:
                this.particles.burst(x, y, 30);
        }
        
        // Screen shake for really big moments
        if (type === 'divine') {
            this.juice.screenShake(8, 400);
        }
    }
    
    /**
     * Highlight a score row when selected
     * @param {HTMLElement} row - Score row element
     */
    highlightScoreRow(row) {
        if (!row) return;
        
        row.classList.add('highlighting');
        this.juice.juiceUp(row, 0.3);
        
        setTimeout(() => {
            row.classList.remove('highlighting');
        }, 600);
    }
    
    /**
     * Flash an element briefly (for warnings/notifications)
     * @param {HTMLElement} element - Element to flash
     * @param {number} times - Number of times to flash
     */
    async flash(element, times = 3) {
        if (!element) return;
        
        for (let i = 0; i < times; i++) {
            element.classList.add('flash');
            await new Promise(resolve => setTimeout(resolve, 300));
            element.classList.remove('flash');
            if (i < times - 1) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
    }
    
    /**
     * Shake an element (for errors/denials)
     * @param {HTMLElement} element - Element to shake
     */
    shake(element) {
        if (!element) return;
        
        element.classList.add('shake');
        setTimeout(() => {
            element.classList.remove('shake');
        }, 500);
    }
    
    /**
     * Pulse an element continuously
     * @param {HTMLElement} element - Element to pulse
     * @param {boolean} glow - Add glow effect
     */
    startPulse(element, glow = false) {
        if (!element) return;
        
        if (glow) {
            element.classList.add('pulse-glow');
        } else {
            element.classList.add('pulse');
        }
    }
    
    /**
     * Stop pulsing an element
     * @param {HTMLElement} element - Element to stop pulsing
     */
    stopPulse(element) {
        if (!element) return;
        
        element.classList.remove('pulse', 'pulse-glow', 'pulse-fast');
    }
    
    /**
     * Add hover juice to dynamically created elements
     * @param {HTMLElement} element - Element to add hover juice to
     */
    addHoverJuice(element) {
        if (!element || element.dataset.hasHoverJuice === 'true') return;
        
        element.dataset.hasHoverJuice = 'true';
        
        element.addEventListener('mouseenter', () => {
            this.juice.juiceUp(element, 0.2);
        });
    }
    
    /**
     * Clean up all juice effects
     */
    cleanup() {
        this.juice.cancelAll();
        this.particles.clear();
    }
}

// Global instance
window.juiceIntegration = window.juiceIntegration || new JuiceIntegration();

