// Balatro-style Visual Effects Manager
// Inspired by Balatro's polished UI and animation system

class BalatroEffects {
    constructor() {
        this.tooltips = new Map();
        this.particles = [];
        this.notifications = [];
        this.animationQueue = [];
        this.isInitialized = false;
    }

    initialize() {
        if (this.isInitialized) return;
        
        this.setupTooltipSystem();
        this.setupParticleSystem();
        this.setupNotificationSystem();
        this.setupAnimationQueue();
        
        this.isInitialized = true;
        console.log('Balatro Effects initialized');
    }

    // Tooltip System
    setupTooltipSystem() {
        document.addEventListener('mouseover', (e) => {
            const element = e.target.closest('[data-tooltip]');
            if (element) {
                this.showTooltip(element, e);
            }
        });

        document.addEventListener('mouseout', (e) => {
            const element = e.target.closest('[data-tooltip]');
            if (element) {
                // Check if we're actually leaving the element (not just moving to a child)
                const relatedTarget = e.relatedTarget;
                if (!element.contains(relatedTarget)) {
                    this.hideTooltip(element);
                }
            }
        });

        // Also hide tooltips when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('[data-tooltip]')) {
                this.hideAllTooltips();
            }
        });

        // Hide tooltips when pressing Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideAllTooltips();
            }
        });
    }

    showTooltip(element, event) {
        const tooltipData = element.dataset.tooltip;
        if (!tooltipData) return;

        // Clear any existing timeout for this element
        if (this.tooltipTimeouts && this.tooltipTimeouts.has(element)) {
            clearTimeout(this.tooltipTimeouts.get(element));
        }

        // Add a small delay before showing tooltip
        const timeoutId = setTimeout(() => {
            // Remove existing tooltip
            this.hideTooltip(element);

            // Create tooltip element
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.innerHTML = this.parseTooltipData(tooltipData);
            
            document.body.appendChild(tooltip);
            
            // Position tooltip relative to the element
            this.positionTooltipStatic(tooltip, element);
            
            // Show with animation
            requestAnimationFrame(() => {
                tooltip.classList.add('show');
            });

            // Store reference
            this.tooltips.set(element, tooltip);
        }, 300); // 300ms delay

        // Store timeout reference
        if (!this.tooltipTimeouts) this.tooltipTimeouts = new Map();
        this.tooltipTimeouts.set(element, timeoutId);
    }

    hideTooltip(element) {
        // Clear any pending timeout for this element
        if (this.tooltipTimeouts && this.tooltipTimeouts.has(element)) {
            clearTimeout(this.tooltipTimeouts.get(element));
            this.tooltipTimeouts.delete(element);
        }

        const tooltip = this.tooltips.get(element);
        if (tooltip) {
            tooltip.classList.remove('show');
            setTimeout(() => {
                if (tooltip.parentNode) {
                    tooltip.parentNode.removeChild(tooltip);
                }
            }, 200);
            this.tooltips.delete(element);
        }
    }

    hideAllTooltips() {
        // Clear all pending timeouts
        if (this.tooltipTimeouts) {
            this.tooltipTimeouts.forEach((timeoutId) => {
                clearTimeout(timeoutId);
            });
            this.tooltipTimeouts.clear();
        }

        this.tooltips.forEach((tooltip, element) => {
            this.hideTooltip(element);
        });
    }

    updateTooltipPosition(event) {
        this.tooltips.forEach((tooltip, element) => {
            this.positionTooltip(tooltip, event);
        });
    }

    positionTooltipStatic(tooltip, element) {
        const elementRect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Position tooltip relative to the card element
        let x = elementRect.left + elementRect.width / 2 - tooltipRect.width / 2;
        let y = elementRect.top - tooltipRect.height - 10; // Above the card
        
        // Adjust if tooltip would go off screen
        if (x < 10) {
            x = 10; // Keep some margin from left edge
        } else if (x + tooltipRect.width > viewportWidth - 10) {
            x = viewportWidth - tooltipRect.width - 10; // Keep some margin from right edge
        }
        
        // If tooltip would go above viewport, position it below the card instead
        if (y < 10) {
            y = elementRect.bottom + 10;
            tooltip.classList.add('below');
        }
        
        // Ensure tooltip doesn't go below viewport
        if (y + tooltipRect.height > viewportHeight - 10) {
            y = viewportHeight - tooltipRect.height - 10;
        }
        
        tooltip.style.left = x + 'px';
        tooltip.style.top = y + 'px';
    }

    positionTooltip(tooltip, event) {
        const element = event.target.closest('[data-tooltip]');
        if (!element) return;
        
        const elementRect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Position tooltip relative to the card element
        let x = elementRect.left + elementRect.width / 2 - tooltipRect.width / 2;
        let y = elementRect.top - tooltipRect.height - 10; // Above the card
        
        // Adjust if tooltip would go off screen
        if (x < 10) {
            x = 10; // Keep some margin from left edge
        } else if (x + tooltipRect.width > viewportWidth - 10) {
            x = viewportWidth - tooltipRect.width - 10; // Keep some margin from right edge
        }
        
        // If tooltip would go above viewport, position it below the card instead
        if (y < 10) {
            y = elementRect.bottom + 10;
        }
        
        // Ensure tooltip doesn't go below viewport
        if (y + tooltipRect.height > viewportHeight - 10) {
            y = viewportHeight - tooltipRect.height - 10;
        }
        
        tooltip.style.left = x + 'px';
        tooltip.style.top = y + 'px';
    }

    parseTooltipData(data) {
        try {
            const parsed = JSON.parse(data);
            let html = '';
            
            if (parsed.title) {
                html += `<div class="tooltip-title">${parsed.title}</div>`;
            }
            
            if (parsed.effect) {
                html += `<div class="tooltip-effect">${parsed.effect}</div>`;
            }
            
            if (parsed.cost) {
                html += `<div class="tooltip-cost">Cost: ${parsed.cost}g</div>`;
            }
            
            return html;
        } catch (e) {
            // Fallback to simple text
            return `<div class="tooltip-effect">${data}</div>`;
        }
    }

    // Particle System
    setupParticleSystem() {
        // Particle system will be updated in animation loop
    }

    createParticle(x, y, type = 'default', options = {}) {
        const particle = {
            x: x,
            y: y,
            vx: (options.vx || 0) + (Math.random() - 0.5) * 2,
            vy: (options.vy || -2) + (Math.random() - 0.5) * 2,
            life: options.life || 60,
            maxLife: options.life || 60,
            type: type,
            element: null,
            ...options
        };

        // Create visual element
        const element = document.createElement('div');
        element.className = 'particle';
        
        switch (type) {
            case 'gold':
                element.innerHTML = '💰';
                element.style.color = '#ffd700';
                break;
            case 'score':
                element.innerHTML = '+' + (options.value || '1');
                element.style.color = '#4CAF50';
                element.style.fontWeight = 'bold';
                break;
            case 'damage':
                element.innerHTML = '-' + (options.value || '1');
                element.style.color = '#f44336';
                element.style.fontWeight = 'bold';
                break;
            case 'sparkle':
                element.innerHTML = '✨';
                element.style.color = '#ffd700';
                break;
            default:
                element.innerHTML = '•';
                element.style.color = '#ffffff';
        }

        element.style.position = 'absolute';
        element.style.left = x + 'px';
        element.style.top = y + 'px';
        element.style.fontSize = (options.size || 16) + 'px';
        element.style.pointerEvents = 'none';
        element.style.zIndex = '1000';

        document.body.appendChild(element);
        particle.element = element;

        this.particles.push(particle);
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Update life
            particle.life--;
            
            // Update visual
            if (particle.element) {
                particle.element.style.left = particle.x + 'px';
                particle.element.style.top = particle.y + 'px';
                particle.element.style.opacity = particle.life / particle.maxLife;
            }
            
            // Remove dead particles
            if (particle.life <= 0) {
                if (particle.element && particle.element.parentNode) {
                    particle.element.parentNode.removeChild(particle.element);
                }
                this.particles.splice(i, 1);
            }
        }
    }

    // Notification System
    setupNotificationSystem() {
        // Create notification container
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }

    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        const container = document.getElementById('notification-container');
        if (container) {
            container.appendChild(notification);
            
            // Show animation
            requestAnimationFrame(() => {
                notification.classList.add('show');
            });
            
            // Auto remove
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, duration);
        }
    }

    // Animation Queue System
    setupAnimationQueue() {
        this.animationId = null;
        this.startAnimationLoop();
    }

    startAnimationLoop() {
        const animate = () => {
            this.updateParticles();
            this.updateAnimationQueue();
            this.animationId = requestAnimationFrame(animate);
        };
        animate();
    }

    updateAnimationQueue() {
        for (let i = this.animationQueue.length - 1; i >= 0; i--) {
            const animation = this.animationQueue[i];
            
            if (animation.update()) {
                this.animationQueue.splice(i, 1);
            }
        }
    }

    // Dice Rolling Effects
    addDiceRollEffect(dieElement) {
        if (!dieElement) return;
        
        // Add rolling class
        dieElement.classList.add('rolling');
        
        // Remove after animation
        setTimeout(() => {
            dieElement.classList.remove('rolling');
        }, 600);
    }

    addDiceJiggleEffect(dieElement) {
        if (!dieElement) return;
        
        dieElement.classList.add('jiggle');
        
        setTimeout(() => {
            dieElement.classList.remove('jiggle');
        }, 400);
    }

    addDiceBounceEffect(dieElement) {
        if (!dieElement) return;
        
        dieElement.classList.add('bounce');
        
        setTimeout(() => {
            dieElement.classList.remove('bounce');
        }, 500);
    }

    // Card Effects
    addCardHoverEffect(cardElement) {
        if (!cardElement) return;
        
        // Card hover effects are handled by CSS
        // This method can be used for additional JavaScript effects
    }

    addCardPurchaseEffect(cardElement) {
        if (!cardElement) return;
        
        cardElement.classList.add('purchased');
        
        // Create purchase particles
        const rect = cardElement.getBoundingClientRect();
        for (let i = 0; i < 5; i++) {
            this.createParticle(
                rect.left + rect.width / 2,
                rect.top + rect.height / 2,
                'sparkle',
                { life: 90, size: 20 }
            );
        }
        
        setTimeout(() => {
            cardElement.classList.remove('purchased');
        }, 600);
    }

    // Score Update Effects
    addScoreUpdateEffect(scoreElement, newValue) {
        if (!scoreElement) return;
        
        scoreElement.classList.add('updated');
        
        // Create score particle
        const rect = scoreElement.getBoundingClientRect();
        this.createParticle(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2,
            'score',
            { value: newValue, life: 120, size: 18 }
        );
        
        setTimeout(() => {
            scoreElement.classList.remove('updated');
        }, 400);
    }

    // Enhanced Button Effects
    addButtonPressEffect(buttonElement) {
        if (!buttonElement) return;
        
        // Button press effects are handled by CSS
        // This method can be used for additional effects
    }

    // Utility Methods
    createShimmerEffect(element) {
        if (!element) return;
        
        const shimmer = document.createElement('div');
        shimmer.style.cssText = `
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            animation: shimmer 1.5s ease-in-out infinite;
            pointer-events: none;
            z-index: 1;
        `;
        
        element.style.position = 'relative';
        element.appendChild(shimmer);
        
        setTimeout(() => {
            if (shimmer.parentNode) {
                shimmer.parentNode.removeChild(shimmer);
            }
        }, 1500);
    }

    // Cleanup
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // Remove all tooltips
        this.tooltips.forEach((tooltip) => {
            if (tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
            }
        });
        this.tooltips.clear();
        
        // Remove all particles
        this.particles.forEach((particle) => {
            if (particle.element && particle.element.parentNode) {
                particle.element.parentNode.removeChild(particle.element);
            }
        });
        this.particles = [];
        
        this.isInitialized = false;
    }
}

// Global instance
window.balatroEffects = new BalatroEffects();
