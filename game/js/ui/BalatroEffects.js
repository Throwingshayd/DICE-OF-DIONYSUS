// Balatro-style Visual Effects Manager
// Inspired by Balatro's polished UI and animation system

class BalatroEffects {
    constructor() {
        this.tooltips = new Map();
        this.dicePopups = new Map(); // Boon-hover: popups over affected dice
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
        Logger.info('Balatro Effects initialized');
    }

    /**
     * Screen shake effect for impactful moments (Balatro-inspired)
     * @param {number} intensity - Shake intensity in pixels
     * @param {number} duration - Duration in milliseconds
     */
    screenShake(intensity = 10, duration = 500) {
        const body = document.body;
        const startTime = Date.now();
        
        const shake = () => {
            const elapsed = Date.now() - startTime;
            if (elapsed > duration) {
                body.style.transform = '';
                return;
            }
            
            const progress = elapsed / duration;
            const currentIntensity = intensity * (1 - progress);
            
            const x = (Math.random() - 0.5) * currentIntensity * 2;
            const y = (Math.random() - 0.5) * currentIntensity * 2;
            
            body.style.transform = `translate(${x}px, ${y}px)`;
            requestAnimationFrame(shake);
        };
        
        shake();
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
                const relatedTarget = e.relatedTarget;
                const tooltipEl = this.tooltips.get(element);
                // Don't hide when moving to our tooltip popup (Balatro-style: hover tooltip content)
                const movingToOurTooltip = tooltipEl && tooltipEl.contains(relatedTarget);
                if (!element.contains(relatedTarget) && !movingToOurTooltip) {
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

    showTooltip(element, _event) {
        const tooltipData = element.dataset.tooltip;
        if (!tooltipData) return;

        // Clear any existing timeout for this element
        if (this.tooltipTimeouts && this.tooltipTimeouts.has(element)) {
            clearTimeout(this.tooltipTimeouts.get(element));
        }

        // Shorter delay for shop items (snappier), 150ms for shop / 200ms elsewhere
        const isInShop = element.closest('#shopStage');
        const delayMs = isInShop ? 150 : 200;
        const timeoutId = setTimeout(() => {
            // Abort if element was removed from DOM (e.g. card consumed) — prevents top-left orphan
            if (!element.isConnected) return;

            // Remove existing tooltip
            this.hideTooltip(element);

            // Create tooltip element
            const tooltip = document.createElement('div');
            const parsedHtml = this.parseTooltipData(tooltipData);
            const isDieTooltip = parsedHtml.includes('tooltip-die');
            const isCard = element.closest('.card');
            tooltip.className = 'tooltip' + (isInShop ? ' tooltip-shop' : '') + (isDieTooltip ? ' tooltip-die-popup' : '') + (isCard ? ' tooltip-card' : '');
            tooltip.innerHTML = parsedHtml;
            
            document.body.appendChild(tooltip);
            
            // Card tooltips: same width as card (concise, aligned)
            if (isCard) {
                const cardEl = element.closest('.card') || element;
                const w = cardEl.getBoundingClientRect().width;
                tooltip.style.width = w + 'px';
                tooltip.style.minWidth = w + 'px';
                tooltip.style.maxWidth = w + 'px';
                tooltip.style.boxSizing = 'border-box';
            }
            
            // Position tooltip - shop items: below (Balatro-style); others: above/below
            this.positionTooltipStatic(tooltip, element, isInShop);
            
            // Show with animation
            requestAnimationFrame(() => {
                tooltip.classList.add('show');
            });

            // Store reference
            this.tooltips.set(element, tooltip);

            // Boon hover: show popups over affected dice (Pegasus Flight, Cerberus Watch, etc.)
            const boonId = element.dataset?.cardId;
            const isBoonCard = element.dataset?.cardType === 'boon';
            const isPlayArea = !element.closest('#shopStage');
            if (isBoonCard && boonId && isPlayArea && window.game?.getBoonDicePreview) {
                const preview = window.game.getBoonDicePreview(boonId);
                if (preview.length > 0) {
                    this.showBoonDicePopups(preview);
                    this.dicePopups.set(element, preview);
                }
            }
        }, delayMs);

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

        // Remove dice popups from boon hover
        if (this.dicePopups?.has(element)) {
            this.hideBoonDicePopups(element);
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

        // Hide all tooltips and remove orphans (elements no longer in DOM)
        const elementsToHide = [...this.tooltips.keys()];
        elementsToHide.forEach((element) => {
            this.hideTooltip(element);
        });
    }

    /**
     * Show popups over dice affected by the hovered boon (Pegasus Flight, Cerberus Watch, etc.)
     * @param {Array<{dieIndex: number, label: string}>} preview - From GameEngine.getBoonDicePreview
     */
    showBoonDicePopups(preview) {
        if (!preview || preview.length === 0) return;
        const dieElements = document.querySelectorAll('.die');
        const popups = [];
        preview.forEach(({ dieIndex, label }) => {
            const dieEl = dieElements[dieIndex];
            if (!dieEl) return;
            const rect = dieEl.getBoundingClientRect();
            const popup = document.createElement('div');
            popup.className = 'die-pip-popup boon-dice-preview';
            popup.textContent = label;
            popup.style.position = 'fixed';
            popup.style.left = `${rect.left + rect.width / 2}px`;
            popup.style.top = `${rect.top - 8}px`;
            popup.style.transform = 'translate(-50%, 0)';
            popup.style.zIndex = '10001';
            popup.style.pointerEvents = 'none';
            document.body.appendChild(popup);
            popups.push(popup);
        });
        this._boonDicePopupEls = this._boonDicePopupEls || [];
        this._boonDicePopupEls.push(...popups);
    }

    /**
     * Remove dice popups shown for boon hover
     */
    hideBoonDicePopups(element) {
        const preview = this.dicePopups.get(element);
        if (!preview) return;
        this.dicePopups.delete(element);
        if (this._boonDicePopupEls) {
            this._boonDicePopupEls.forEach(el => {
                if (el.parentNode) el.parentNode.removeChild(el);
            });
            this._boonDicePopupEls = [];
        }
    }

    updateTooltipPosition(event) {
        this.tooltips.forEach((tooltip, _element) => {
            this.positionTooltip(tooltip, event);
        });
    }

    positionTooltipStatic(tooltip, element, preferBelow = false) {
        if (!element.isConnected) return; // Detached element → avoid top-left positioning
        const elementRect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        let x = elementRect.left + elementRect.width / 2 - tooltipRect.width / 2;
        let y;
        // Shop items: always below (Balatro-style)
        if (preferBelow) {
            y = elementRect.bottom + 10;
            tooltip.classList.add('below');
        } else {
            y = elementRect.top - tooltipRect.height - 10; // Above
            if (y < 10) {
                y = elementRect.bottom + 10;
                tooltip.classList.add('below');
            }
        }
        
        if (x < 10) x = 10;
        else if (x + tooltipRect.width > viewportWidth - 10) x = viewportWidth - tooltipRect.width - 10;
        if (y + tooltipRect.height > viewportHeight - 10) y = viewportHeight - tooltipRect.height - 10;
        
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

            if (parsed.tooltipType === 'die') {
                return this.parseDieTooltip(parsed);
            }

            // Concise: title, effect, god. Cost/sell handled by Buy/Sell labels.
            let html = '';
            if (parsed.title) html += `<div class="tooltip-title">${parsed.title}</div>`;
            if (parsed.effect) html += `<div class="tooltip-effect">${parsed.effect}</div>`;
            if (parsed.god) html += `<div class="tooltip-god">${parsed.god}</div>`;
            return html;
        } catch (e) {
            return `<div class="tooltip-effect">${data}</div>`;
        }
    }

    /**
     * Balatro-style die tooltip (from UI_definitions.lua create_popup_UIBox_tooltip pattern)
     * Clean white box with face, value, enhancements
     */
    parseDieTooltip(parsed) {
        let html = `<div class="tooltip-die">`;
        if (parsed.title) {
            html += `<div class="tooltip-title tooltip-die-title">${parsed.title}</div>`;
        }
        if (parsed.rows && parsed.rows.length > 0) {
            html += `<div class="tooltip-die-rows">`;
            parsed.rows.forEach(row => {
                if (typeof row === 'string') {
                    html += `<div class="tooltip-die-row">${row}</div>`;
                } else if (row.type === 'enhancements' && row.list) {
                    html += `<div class="tooltip-die-label">Enhancements</div>`;
                    row.list.forEach((name, i) => {
                        const desc = row.descriptions && row.descriptions[i] ? row.descriptions[i] : '';
                        const subTooltip = desc ? JSON.stringify({ title: name, effect: desc }).replace(/'/g, '&#39;') : '';
                        const dataAttr = subTooltip ? ` data-tooltip='${subTooltip}'` : '';
                        html += `<div class="tooltip-die-enh tooltip-enhancement-hover"${dataAttr}>• ${name}</div>`;
                    });
                } else if (row.type === 'otherFaces' && row.faces) {
                    html += `<div class="tooltip-die-label">Other Faces</div>`;
                    row.faces.forEach(f => {
                        const enhStr = f.enhancements.map(e => this.getEnhDisplayName(e)).join(', ');
                        html += `<div class="tooltip-die-row">Face ${f.face}: ${enhStr}</div>`;
                    });
                } else if (row.type === 'tempMod') {
                    const v = row.value;
                    html += `<div class="tooltip-die-row tooltip-die-mod">Temp: ${v > 0 ? '+' : ''}${v}</div>`;
                }
            });
            html += `</div>`;
        }
        html += `</div>`;
        return html;
    }

    getEnhDisplayName(enh) {
        const names = { parchment: 'Parchment', iron: 'Iron', gold: 'Gold', mother_of_pearl: 'Pearl', mirror: 'Mirror', wild: 'Wild', lucky: 'Lucky', cursed: 'Cursed', divine: 'Divine', chaos: 'Chaos' };
        return names[enh] || enh;
    }

    escapeAttr(s) {
        return String(s).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    getRarityColor(rarity) {
        const colors = {
            'rustic': '#8B7355',
            'vibrant': '#4A90E2',
            'epic': '#9B59B6',
            'worship': '#F39C12',
            'libation': '#E74C3C',
            'artifact': '#2ECC71'
        };
        return colors[rarity] || '#95A5A6';
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

    // Physics dice archived to physics-dice-attempt-1/ — use original non-physics roll

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
