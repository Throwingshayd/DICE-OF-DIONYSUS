/**
 * DiceRenderer - Dice display and tooltips
 * Incremental DOM updates (no innerHTML wipe) + data-face CSS for fast face swaps.
 * @module ui/renderers/DiceRenderer
 */

const DiceRenderer = {
    getEnhancementDisplayName(enh) {
        const names = { parchment: 'Parchment', iron: 'Iron', gold: 'Gold', mother_of_pearl: 'Mother of Pearl', mirror: 'Mirror', wild: 'Wild', lucky: 'Lucky', cursed: 'Cursed', divine: 'Divine', chaos: 'Chaos' };
        return names[enh] || enh;
    },

    buildDieTooltipData(die, index, gameState, currentFace, hasModifiedValue) {
        const dieNum = index + 1;
        const held = gameState.held && gameState.held[index];
        const title = held ? `Die ${dieNum} — HELD` : `Die ${dieNum}`;
        const rows = [];
        if (currentFace > 0) {
            const effectiveFace = die.getEffectiveFace();
            let valueText = `Face ${currentFace} → Value ${effectiveFace}`;
            if (hasModifiedValue) valueText += ` (Modified: ${die.faces[currentFace].value}→${die.faces[currentFace].modifiedValue})`;
            if (die.wildValue !== undefined && die.hasEnhancementForCurrentFace('wild')) {
                const wildMod = die.wildValue - currentFace;
                valueText += ` • Wild ${wildMod > 0 ? '+' : ''}${wildMod}`;
            }
            rows.push(valueText);
        } else rows.push('Not yet rolled');
        const currentEnhancements = currentFace > 0 && die.faces[currentFace] ? Array.from(die.faces[currentFace].enhancements) : [];
        if (currentEnhancements.length > 0) {
            const enhNames = currentEnhancements.map(e => this.getEnhancementDisplayName(e));
            const enhDescriptions = currentEnhancements.map(e => die.getEnhancementDescription(e));
            rows.push({ type: 'enhancements', list: enhNames, descriptions: enhDescriptions, keys: currentEnhancements });
        }
        const allFacesEnh = [];
        Object.entries(die.faces).forEach(([faceNum, faceData]) => {
            if (faceData.enhancements.size > 0 && parseInt(faceNum, 10) !== currentFace) {
                allFacesEnh.push({ face: parseInt(faceNum, 10), enhancements: Array.from(faceData.enhancements) });
            }
        });
        if (allFacesEnh.length > 0) rows.push({ type: 'otherFaces', faces: allFacesEnh });
        if (die.tempModifier !== 0 && gameState.hasRolled) rows.push({ type: 'tempMod', value: die.tempModifier });
        return { tooltipType: 'die', title, rows, dieId: die.dieId || dieNum };
    },

    /** Ensure die slot count matches state without rebuilding from scratch. */
    _ensureDieSlots(container, count) {
        while (container.children.length < count) {
            container.appendChild(this._createDieElement());
        }
        while (container.children.length > count) {
            container.lastElementChild?.remove();
        }
    },

    _createDieElement() {
        const dieEl = document.createElement('div');
        dieEl.className = 'die';
        dieEl.style.position = 'relative';
        dieEl.addEventListener('click', () => {
            const game = window.game;
            if (!game) return;
            const index = parseInt(dieEl.dataset.dieIndex, 10);
            if (Number.isNaN(index)) return;
            const gameState = game.state;
            const targeting = gameState.libationTargetingMode;
            if (targeting) {
                window.balatroEffects?.hideAllTooltips();
                const { libation } = targeting;
                const applied = window.uiManager?.applyLibationEnhancementToDie?.(
                    libation,
                    index,
                    gameState,
                    game,
                    targeting.enhancementType,
                    'die_click'
                );
                if (applied) return;
                game.showMessage?.('Cannot apply libation right now.');
                return;
            }
            game.toggleHold(index);
        });

        const dieIdBadge = document.createElement('div');
        dieIdBadge.className = 'die-id-badge die-static';
        dieIdBadge.style.cssText = 'position:absolute;top:-5px;right:-5px;width:16px;height:16px;background:var(--stone-terracotta-dark);border-radius:50%;font-size:10px;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;border:1px solid var(--statue-cream);z-index:5;opacity:0.8;';
        dieEl.appendChild(dieIdBadge);
        return dieEl;
    },

    _clearDynamicChildren(dieEl) {
        dieEl.querySelectorAll(':scope > :not(.die-id-badge)').forEach((node) => node.remove());
    },

    _syncDieElement(dieEl, die, index, gameState) {
        dieEl.dataset.dieIndex = String(index);
        dieEl.classList.toggle('held', !!gameState.held[index]);

        const currentFace = die.currentFace;
        const hasEnhancementsOnCurrentFace = currentFace > 0 && die.faces[currentFace] && die.faces[currentFace].enhancements.size > 0;
        const hasModifiedValue = currentFace > 0 && die.faces[currentFace] && die.faces[currentFace].modifiedValue && die.faces[currentFace].modifiedValue !== die.faces[currentFace].value;

        if (hasEnhancementsOnCurrentFace) {
            dieEl.style.boxShadow = '0 0 10px rgba(255, 215, 0, 0.6)';
            dieEl.style.border = '2px solid rgba(255, 215, 0, 0.8)';
            dieEl.setAttribute('data-enhanced', 'true');
        } else {
            dieEl.style.removeProperty('box-shadow');
            dieEl.style.removeProperty('border');
            dieEl.removeAttribute('data-enhanced');
        }

        if (hasModifiedValue) {
            dieEl.setAttribute('data-modified', 'true');
        } else {
            dieEl.removeAttribute('data-modified');
        }

        const displayFace = gameState.hasRolled ? die.getDisplayFace() : '?';
        dieEl.setAttribute('data-face', String(displayFace));
        dieEl.style.removeProperty('background-image');
        dieEl.style.removeProperty('background-size');
        dieEl.style.removeProperty('background-position');
        dieEl.style.removeProperty('background-repeat');
        dieEl.textContent = '';

        const tooltipData = this.buildDieTooltipData(die, index, gameState, currentFace, hasModifiedValue);
        dieEl.setAttribute('data-tooltip', JSON.stringify(tooltipData));

        const idBadge = dieEl.querySelector('.die-id-badge');
        if (idBadge) idBadge.textContent = die.dieId || (index + 1);

        this._clearDynamicChildren(dieEl);

        if (hasModifiedValue) {
            const modBadge = document.createElement('div');
            modBadge.className = 'modification-badge die-dynamic';
            modBadge.textContent = `${die.faces[currentFace].value}→${die.faces[currentFace].modifiedValue}`;
            modBadge.style.cssText = 'position:absolute;bottom:-8px;left:50%;transform:translateX(-50%);background:rgba(138,43,226,0.9);color:white;padding:2px 6px;border-radius:8px;font-size:10px;font-weight:bold;white-space:nowrap;z-index:10;border:1px solid white;';
            dieEl.appendChild(modBadge);
        }

        if (currentFace > 0 && die.hasEnhancementForCurrentFace('wild') && die.wildValue !== undefined) {
            const wildModifier = die.wildValue - currentFace;
            if (wildModifier !== 0) {
                const wildBadge = document.createElement('div');
                wildBadge.className = 'wild-badge die-dynamic';
                wildBadge.textContent = wildModifier > 0 ? `+${wildModifier}` : `${wildModifier}`;
                wildBadge.style.cssText = 'position:absolute;top:-8px;right:-8px;background:rgba(147,51,234,0.95);color:white;padding:3px 7px;border-radius:50%;font-size:11px;font-weight:bold;z-index:10;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3);';
                dieEl.appendChild(wildBadge);
            }
        }

        let allEnhancements = [];
        if (currentFace > 0 && die.faces[currentFace]) {
            die.faces[currentFace].enhancements.forEach(enh => allEnhancements.push({ type: 'face', enhancement: enh, face: currentFace }));
        }
        if (allEnhancements.length > 0) {
            const firstEnhancement = allEnhancements[0];
            const overlay = document.createElement('div');
            overlay.className = `die-enhancement-overlay enh-${firstEnhancement.enhancement} die-dynamic`;
            dieEl.appendChild(overlay);
        }
        if (currentFace > 0 && currentFace >= 7) {
            const faceOverlay = document.createElement('div');
            faceOverlay.className = `die-enhancement-overlay face-${currentFace} die-dynamic`;
            dieEl.appendChild(faceOverlay);
        }
        if (die.tempModifier !== 0 && gameState.hasRolled) {
            const modifierBadge = document.createElement('div');
            modifierBadge.className = 'die-modifier-badge die-dynamic';
            modifierBadge.textContent = die.tempModifier > 0 ? `+${die.tempModifier}` : `${die.tempModifier}`;
            modifierBadge.style.cssText = `position:absolute;bottom:-8px;left:-8px;padding:2px 6px;background:${die.tempModifier > 0 ? 'var(--accent-green)' : 'var(--accent-red)'};border-radius:4px;font-size:10px;color:white;font-weight:bold;border:1px solid var(--stone-terracotta-dark);z-index:10;`;
            dieEl.appendChild(modifierBadge);
        }
    },

    updateDiceUI(dom, gameState, gameEngine) {
        if (!dom.diceContainer) { Logger.warn('Dice container not found'); return; }
        const engine = gameEngine || window.game;
        const container = dom.diceContainer;

        container.querySelectorAll('[data-tooltip]').forEach(el => window.balatroEffects?.hideTooltip(el));

        const targetingMode = engine?.state?.libationTargetingMode;
        container.classList.toggle('libation-targeting', !!targetingMode);

        this._ensureDieSlots(container, gameState.dice.length);
        gameState.dice.forEach((die, index) => {
            const dieEl = container.children[index];
            if (!dieEl) return;
            this._syncDieElement(dieEl, die, index, gameState);
        });
    },
};

if (typeof window !== 'undefined') window.DiceRenderer = DiceRenderer;
