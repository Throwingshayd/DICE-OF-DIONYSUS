/**
 * DiceRenderer - Dice display and tooltips
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

    updateDiceUI(dom, gameState, gameEngine) {
        if (!dom.diceContainer) { Logger.warn('Dice container not found'); return; }
        const engine = gameEngine || window.game;
        const diceWithTooltips = dom.diceContainer.querySelectorAll('[data-tooltip]');
        diceWithTooltips.forEach(el => window.balatroEffects?.hideTooltip(el));
        dom.diceContainer.innerHTML = '';
        const targetingMode = engine?.state?.libationTargetingMode;
        dom.diceContainer.classList.toggle('libation-targeting', !!targetingMode);

        gameState.dice.forEach((die, index) => {
            const dieEl = document.createElement('div');
            dieEl.className = 'die';
            dieEl.dataset.dieIndex = String(index);
            dieEl.style.position = 'relative';
            if (gameState.held[index]) dieEl.classList.add('held');
            const currentFace = die.currentFace;
            const hasEnhancementsOnCurrentFace = currentFace > 0 && die.faces[currentFace] && die.faces[currentFace].enhancements.size > 0;
            const hasModifiedValue = currentFace > 0 && die.faces[currentFace] && die.faces[currentFace].modifiedValue && die.faces[currentFace].modifiedValue !== die.faces[currentFace].value;
            if (hasEnhancementsOnCurrentFace) {
                dieEl.style.boxShadow = '0 0 10px rgba(255, 215, 0, 0.6)';
                dieEl.style.border = '2px solid rgba(255, 215, 0, 0.8)';
                dieEl.setAttribute('data-enhanced', 'true');
            }
            if (hasModifiedValue) {
                dieEl.style.boxShadow = '0 0 15px rgba(138, 43, 226, 0.8)';
                dieEl.style.border = '3px solid rgba(138, 43, 226, 1)';
                dieEl.setAttribute('data-modified', 'true');
                const modBadge = document.createElement('div');
                modBadge.className = 'modification-badge';
                modBadge.textContent = `${die.faces[currentFace].value}→${die.faces[currentFace].modifiedValue}`;
                modBadge.style.cssText = 'position:absolute;bottom:-8px;left:50%;transform:translateX(-50%);background:rgba(138,43,226,0.9);color:white;padding:2px 6px;border-radius:8px;font-size:10px;font-weight:bold;white-space:nowrap;z-index:10;border:1px solid white;';
                dieEl.appendChild(modBadge);
            }
            if (currentFace > 0 && die.hasEnhancementForCurrentFace('wild') && die.wildValue !== undefined) {
                const wildModifier = die.wildValue - currentFace;
                if (wildModifier !== 0) {
                    const wildBadge = document.createElement('div');
                    wildBadge.className = 'wild-badge';
                    wildBadge.textContent = wildModifier > 0 ? `+${wildModifier}` : `${wildModifier}`;
                    wildBadge.style.cssText = 'position:absolute;top:-8px;right:-8px;background:rgba(147,51,234,0.95);color:white;padding:3px 7px;border-radius:50%;font-size:11px;font-weight:bold;z-index:10;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3);';
                    dieEl.appendChild(wildBadge);
                }
            }
            const dieIdBadge = document.createElement('div');
            dieIdBadge.className = 'die-id-badge';
            dieIdBadge.textContent = die.dieId || (index + 1);
            dieIdBadge.style.cssText = 'position:absolute;top:-5px;right:-5px;width:16px;height:16px;background:var(--stone-terracotta-dark);border-radius:50%;font-size:10px;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;border:1px solid var(--statue-cream);z-index:5;opacity:0.8;';
            dieEl.appendChild(dieIdBadge);
            const displayFace = gameState.hasRolled ? die.getDisplayFace() : '?';
            dieEl.setAttribute('data-face', displayFace);
            if (displayFace === '?') {
                const questionAsset = AssetMapping.getAssetPath(AssetMapping.getDiceFaceAsset('question'));
                dieEl.style.backgroundImage = `url('${questionAsset}')`;
                dieEl.style.backgroundSize = '100% 100%';
                dieEl.style.backgroundPosition = 'center';
                dieEl.style.backgroundRepeat = 'no-repeat';
                dieEl.textContent = '';
            } else if (displayFace >= 1 && displayFace <= 9) {
                const faceAsset = AssetMapping.getAssetPath(AssetMapping.getDiceFaceAsset(displayFace));
                dieEl.style.backgroundImage = `url('${faceAsset}')`;
                dieEl.style.backgroundSize = '100% 100%';
                dieEl.style.backgroundPosition = 'center';
                dieEl.style.backgroundRepeat = 'no-repeat';
                dieEl.textContent = '';
            } else dieEl.textContent = displayFace;
            const tooltipData = this.buildDieTooltipData(die, index, gameState, currentFace, hasModifiedValue);
            dieEl.setAttribute('data-tooltip', JSON.stringify(tooltipData));
            dieEl.addEventListener('click', () => {
                const game = window.game;
                if (!game) return;
                const targeting = game.state.libationTargetingMode;
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
            let allEnhancements = [];
            if (currentFace > 0 && die.faces[currentFace]) {
                die.faces[currentFace].enhancements.forEach(enh => allEnhancements.push({ type: 'face', enhancement: enh, face: currentFace }));
            }
            if (allEnhancements.length > 0) {
                const firstEnhancement = allEnhancements[0];
                const overlay = document.createElement('div');
                overlay.className = `die-enhancement-overlay enh-${firstEnhancement.enhancement}`;
                dieEl.appendChild(overlay);
            }
            if (currentFace > 0 && currentFace >= 7) {
                const faceOverlay = document.createElement('div');
                faceOverlay.className = `die-enhancement-overlay face-${currentFace}`;
                dieEl.appendChild(faceOverlay);
            }
            if (die.tempModifier !== 0 && gameState.hasRolled) {
                const modifierBadge = document.createElement('div');
                modifierBadge.className = 'die-modifier-badge';
                modifierBadge.textContent = die.tempModifier > 0 ? `+${die.tempModifier}` : `${die.tempModifier}`;
                modifierBadge.style.cssText = `position:absolute;bottom:-8px;left:-8px;padding:2px 6px;background:${die.tempModifier > 0 ? 'var(--accent-green)' : 'var(--accent-red)'};border-radius:4px;font-size:10px;color:white;font-weight:bold;border:1px solid var(--stone-terracotta-dark);z-index:10;`;
                dieEl.appendChild(modifierBadge);
            }
            dom.diceContainer.appendChild(dieEl);
        });
    }
};

if (typeof window !== 'undefined') window.DiceRenderer = DiceRenderer;
