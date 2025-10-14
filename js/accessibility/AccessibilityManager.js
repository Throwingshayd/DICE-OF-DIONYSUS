/**
 * Accessibility Manager
 * Provides comprehensive accessibility features for the game
 */

class AccessibilityManager {
    constructor() {
        this.isEnabled = true;
        this.announcer = null;
        this.focusManager = null;
        this.keyboardNavigation = null;
        this.screenReader = null;
        
        this.init();
    }

    init() {
        this.setupAnnouncer();
        this.setupFocusManager();
        this.setupKeyboardNavigation();
        this.setupScreenReaderSupport();
        this.setupHighContrastMode();
        this.setupReducedMotion();
        this.setupColorBlindSupport();
    }

    // Screen Reader Support
    setupAnnouncer() {
        this.announcer = document.createElement('div');
        this.announcer.setAttribute('aria-live', 'polite');
        this.announcer.setAttribute('aria-atomic', 'true');
        this.announcer.className = 'sr-only';
        this.announcer.id = 'accessibility-announcer';
        document.body.appendChild(this.announcer);
    }

    announce(message, priority = 'polite') {
        if (!this.isEnabled) return;
        
        this.announcer.setAttribute('aria-live', priority);
        this.announcer.textContent = message;
        
        // Clear after announcement
        setTimeout(() => {
            this.announcer.textContent = '';
        }, 1000);
    }

    // Focus Management
    setupFocusManager() {
        this.focusManager = {
            trapStack: [],
            previousFocus: null,
            focusableElements: 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        };
    }

    trapFocus(container) {
        if (!this.isEnabled) return;
        
        const focusableElements = container.querySelectorAll(this.focusManager.focusableElements);
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        this.focusManager.trapStack.push({ container, firstElement, lastElement });
        
        // Focus first element
        if (firstElement) {
            firstElement.focus();
        }
        
        // Add keyboard event listener
        container.addEventListener('keydown', this.handleTrapFocus.bind(this));
    }

    releaseFocus() {
        if (!this.isEnabled) return;
        
        const trap = this.focusManager.trapStack.pop();
        if (trap) {
            trap.container.removeEventListener('keydown', this.handleTrapFocus.bind(this));
            
            // Return focus to previous element
            if (this.focusManager.previousFocus) {
                this.focusManager.previousFocus.focus();
            }
        }
    }

    handleTrapFocus(event) {
        if (event.key !== 'Tab') return;
        
        const trap = this.focusManager.trapStack[this.focusManager.trapStack.length - 1];
        if (!trap) return;
        
        const focusableElements = trap.container.querySelectorAll(this.focusManager.focusableElements);
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (event.shiftKey) {
            if (document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        }
    }

    // Keyboard Navigation
    setupKeyboardNavigation() {
        this.keyboardNavigation = {
            shortcuts: new Map(),
            isEnabled: true
        };
        
        this.setupKeyboardShortcuts();
        document.addEventListener('keydown', this.handleKeyboardNavigation.bind(this));
    }

    setupKeyboardShortcuts() {
        // Game controls
        this.keyboardNavigation.shortcuts.set('KeyR', {
            action: 'roll-dice',
            description: 'Roll the dice',
            category: 'game'
        });
        
        this.keyboardNavigation.shortcuts.set('Digit1', {
            action: 'hold-die-1',
            description: 'Hold/release die 1',
            category: 'game'
        });
        
        this.keyboardNavigation.shortcuts.set('Digit2', {
            action: 'hold-die-2',
            description: 'Hold/release die 2',
            category: 'game'
        });
        
        this.keyboardNavigation.shortcuts.set('Digit3', {
            action: 'hold-die-3',
            description: 'Hold/release die 3',
            category: 'game'
        });
        
        this.keyboardNavigation.shortcuts.set('Digit4', {
            action: 'hold-die-4',
            description: 'Hold/release die 4',
            category: 'game'
        });
        
        this.keyboardNavigation.shortcuts.set('Digit5', {
            action: 'hold-die-5',
            description: 'Hold/release die 5',
            category: 'game'
        });
        
        // Navigation
        this.keyboardNavigation.shortcuts.set('Escape', {
            action: 'back',
            description: 'Go back or close modal',
            category: 'navigation'
        });
        
        this.keyboardNavigation.shortcuts.set('KeyC', {
            action: 'collection',
            description: 'Open collection',
            category: 'navigation'
        });
        
        this.keyboardNavigation.shortcuts.set('KeyS', {
            action: 'save',
            description: 'Save game',
            category: 'navigation'
        });
        
        // Accessibility
        this.keyboardNavigation.shortcuts.set('KeyA', {
            action: 'accessibility-menu',
            description: 'Open accessibility menu',
            category: 'accessibility'
        });
        
        this.keyboardNavigation.shortcuts.set('KeyH', {
            action: 'help',
            description: 'Show help',
            category: 'accessibility'
        });
    }

    handleKeyboardNavigation(event) {
        if (!this.keyboardNavigation.isEnabled) return;
        
        const shortcut = this.keyboardNavigation.shortcuts.get(event.code);
        if (!shortcut) return;
        
        // Skip if user is typing in an input
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }
        
        event.preventDefault();
        this.executeShortcut(shortcut.action, event);
    }

    executeShortcut(action, event) {
        switch (action) {
            case 'roll-dice':
                this.announce('Rolling dice');
                window.game?.rollDice?.();
                break;
                
            case 'hold-die-1':
            case 'hold-die-2':
            case 'hold-die-3':
            case 'hold-die-4':
            case 'hold-die-5':
                const dieIndex = parseInt(action.split('-')[2]) - 1;
                this.announce(`Toggling hold for die ${dieIndex + 1}`);
                window.game?.toggleHold?.(dieIndex);
                break;
                
            case 'back':
                this.announce('Going back');
                window.app?.showStartScreen?.();
                break;
                
            case 'collection':
                this.announce('Opening collection');
                window.app?.showCollection?.();
                break;
                
            case 'save':
                this.announce('Saving game');
                window.game?.saveGame?.();
                break;
                
            case 'accessibility-menu':
                this.showAccessibilityMenu();
                break;
                
            case 'help':
                this.showHelp();
                break;
        }
    }

    // Screen Reader Support
    setupScreenReaderSupport() {
        this.screenReader = {
            isSupported: 'speechSynthesis' in window,
            voices: [],
            currentVoice: null
        };
        
        if (this.screenReader.isSupported) {
            this.loadVoices();
        }
    }

    loadVoices() {
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = () => {
                this.screenReader.voices = speechSynthesis.getVoices();
                this.screenReader.currentVoice = this.screenReader.voices.find(voice => 
                    voice.lang.startsWith('en')
                ) || this.screenReader.voices[0];
            };
        }
    }

    speak(text, options = {}) {
        if (!this.isEnabled || !this.screenReader.isSupported) return;
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = this.screenReader.currentVoice;
        utterance.rate = options.rate || 1;
        utterance.pitch = options.pitch || 1;
        utterance.volume = options.volume || 1;
        
        speechSynthesis.speak(utterance);
    }

    // High Contrast Mode
    setupHighContrastMode() {
        const prefersHighContrast = window.matchMedia('(prefers-contrast: high)');
        
        if (prefersHighContrast.matches) {
            this.enableHighContrast();
        }
        
        prefersHighContrast.addEventListener('change', (e) => {
            if (e.matches) {
                this.enableHighContrast();
            } else {
                this.disableHighContrast();
            }
        });
    }

    enableHighContrast() {
        document.body.classList.add('high-contrast');
        this.announce('High contrast mode enabled');
    }

    disableHighContrast() {
        document.body.classList.remove('high-contrast');
        this.announce('High contrast mode disabled');
    }

    // Reduced Motion
    setupReducedMotion() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        if (prefersReducedMotion.matches) {
            this.enableReducedMotion();
        }
        
        prefersReducedMotion.addEventListener('change', (e) => {
            if (e.matches) {
                this.enableReducedMotion();
            } else {
                this.disableReducedMotion();
            }
        });
    }

    enableReducedMotion() {
        document.body.classList.add('reduced-motion');
        this.announce('Reduced motion enabled');
    }

    disableReducedMotion() {
        document.body.classList.remove('reduced-motion');
        this.announce('Reduced motion disabled');
    }

    // Color Blind Support
    setupColorBlindSupport() {
        this.colorBlindSupport = {
            types: ['protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia'],
            currentType: null
        };
    }

    enableColorBlindSupport(type) {
        if (!this.colorBlindSupport.types.includes(type)) {
            console.warn(`Unknown color blind type: ${type}`);
            return;
        }
        
        document.body.classList.remove(...this.colorBlindSupport.types);
        document.body.classList.add(type);
        this.colorBlindSupport.currentType = type;
        this.announce(`Color blind support enabled for ${type}`);
    }

    disableColorBlindSupport() {
        document.body.classList.remove(...this.colorBlindSupport.types);
        this.colorBlindSupport.currentType = null;
        this.announce('Color blind support disabled');
    }

    // Accessibility Menu
    showAccessibilityMenu() {
        const menu = document.createElement('div');
        menu.className = 'accessibility-menu';
        menu.innerHTML = `
            <div class="accessibility-menu-content">
                <h3>Accessibility Options</h3>
                <div class="accessibility-options">
                    <label>
                        <input type="checkbox" id="high-contrast-toggle">
                        High Contrast Mode
                    </label>
                    <label>
                        <input type="checkbox" id="reduced-motion-toggle">
                        Reduced Motion
                    </label>
                    <label>
                        <input type="checkbox" id="screen-reader-toggle">
                        Screen Reader Support
                    </label>
                    <label>
                        <select id="color-blind-select">
                            <option value="">No Color Blind Support</option>
                            <option value="protanopia">Protanopia</option>
                            <option value="deuteranopia">Deuteranopia</option>
                            <option value="tritanopia">Tritanopia</option>
                            <option value="achromatopsia">Achromatopsia</option>
                        </select>
                        Color Blind Support
                    </label>
                </div>
                <div class="accessibility-actions">
                    <button class="btn btn-primary" id="accessibility-close">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(menu);
        
        // Setup event listeners
        document.getElementById('high-contrast-toggle').addEventListener('change', (e) => {
            if (e.target.checked) {
                this.enableHighContrast();
            } else {
                this.disableHighContrast();
            }
        });
        
        document.getElementById('reduced-motion-toggle').addEventListener('change', (e) => {
            if (e.target.checked) {
                this.enableReducedMotion();
            } else {
                this.disableReducedMotion();
            }
        });
        
        document.getElementById('screen-reader-toggle').addEventListener('change', (e) => {
            this.screenReader.isSupported = e.target.checked;
        });
        
        document.getElementById('color-blind-select').addEventListener('change', (e) => {
            if (e.target.value) {
                this.enableColorBlindSupport(e.target.value);
            } else {
                this.disableColorBlindSupport();
            }
        });
        
        document.getElementById('accessibility-close').addEventListener('click', () => {
            menu.remove();
        });
        
        // Focus management
        this.trapFocus(menu);
    }

    // Help System
    showHelp() {
        const help = document.createElement('div');
        help.className = 'help-modal';
        help.innerHTML = `
            <div class="help-content">
                <h3>Keyboard Shortcuts</h3>
                <div class="help-sections">
                    <div class="help-section">
                        <h4>Game Controls</h4>
                        <ul>
                            <li><kbd>R</kbd> - Roll dice</li>
                            <li><kbd>1-5</kbd> - Hold/release dice</li>
                        </ul>
                    </div>
                    <div class="help-section">
                        <h4>Navigation</h4>
                        <ul>
                            <li><kbd>Esc</kbd> - Go back</li>
                            <li><kbd>C</kbd> - Collection</li>
                            <li><kbd>S</kbd> - Save game</li>
                        </ul>
                    </div>
                    <div class="help-section">
                        <h4>Accessibility</h4>
                        <ul>
                            <li><kbd>A</kbd> - Accessibility menu</li>
                            <li><kbd>H</kbd> - Show this help</li>
                        </ul>
                    </div>
                </div>
                <div class="help-actions">
                    <button class="btn btn-primary" id="help-close">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(help);
        
        document.getElementById('help-close').addEventListener('click', () => {
            help.remove();
        });
        
        this.trapFocus(help);
    }

    // ARIA Labels and Roles
    setupARIALabels() {
        // Add ARIA labels to game elements
        const diceContainer = document.getElementById('diceContainer');
        if (diceContainer) {
            diceContainer.setAttribute('role', 'group');
            diceContainer.setAttribute('aria-label', 'Dice area');
        }
        
        const scorecard = document.querySelector('.scorecard');
        if (scorecard) {
            scorecard.setAttribute('role', 'table');
            scorecard.setAttribute('aria-label', 'Scorecard');
        }
        
        const rollButton = document.getElementById('rollButton');
        if (rollButton) {
            rollButton.setAttribute('aria-label', 'Roll the dice');
        }
    }

    // Utility Methods
    enable() {
        this.isEnabled = true;
        this.announce('Accessibility features enabled');
    }

    disable() {
        this.isEnabled = false;
        this.announce('Accessibility features disabled');
    }

    getStatus() {
        return {
            isEnabled: this.isEnabled,
            screenReaderSupported: this.screenReader.isSupported,
            highContrast: document.body.classList.contains('high-contrast'),
            reducedMotion: document.body.classList.contains('reduced-motion'),
            colorBlindSupport: this.colorBlindSupport.currentType
        };
    }

    // Cleanup
    destroy() {
        document.removeEventListener('keydown', this.handleKeyboardNavigation.bind(this));
        this.announcer?.remove();
    }
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccessibilityManager;
}

