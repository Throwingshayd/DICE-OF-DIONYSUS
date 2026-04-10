// JuiceIntegration - Adds juice effects to wired game UI elements
// Integrates JuiceManager and ParticleSystem (visuals + architecture rules)
// Unwired methods removed to eliminate redundant alternative paths

class JuiceIntegration {
    constructor() {
        this.juice = window.juiceManager;
        this.particles = window.particleSystem;
        this.initialized = false;

        Logger.info('JuiceIntegration ready');
    }

    /**
     * Initialize juice effects for wired UI elements
     */
    initialize() {
        if (this.initialized) return;

        this.addButtonJuice();

        this.initialized = true;
        Logger.info('JuiceIntegration initialized');
    }

    /**
     * Add juice effects to all buttons (wired: Main.js ensureGameEffectsReady)
     */
    addButtonJuice() {
        const buttons = document.querySelectorAll('.divine-button, .roll-button, button');

        buttons.forEach((button) => {
            if (button.dataset.hasJuice === 'true') return;

            button.dataset.hasJuice = 'true';

            button.addEventListener('click', (_e) => {
                if (!button.disabled) {
                    this.juice.juiceUp(button, 0.3);

                    if (button.id === 'playButton' || button.id === 'rollButton') {
                        const rect = button.getBoundingClientRect();
                        const x = rect.left + rect.width / 2;
                        const y = rect.top + rect.height / 2;
                        this.particles.divineSparkle(x, y, 5);
                    }
                }
            });
        });
    }
}

// Global instance
window.juiceIntegration = window.juiceIntegration || new JuiceIntegration();
