/* exported UIManager */
// UIManager - Handles all UI updates and interactions

class UIManager {
    constructor() {
        this.dom = {};
        this.isInitialized = false;
        /** @type {ShopUI|null} */
        this.shopUI = null;
    }

    initialize() {
        if (this.isInitialized) {
            Logger.debug('UIManager already initialized, skipping...');
            return;
        }
        
        this.bindDOMElements();
        this.setupShopManager();
        this.isInitialized = true;
        Logger.info('UIManager initialized successfully');
    }

    bindDOMElements() {
        this.dom = {
            // Game info displays
            anteDisplay: document.getElementById('anteDisplay'),
            turnDisplay: document.getElementById('turnDisplay'),
            rollsLeft: document.getElementById('rollsLeft'),
            goldDisplay: document.getElementById('goldDisplay'),
            totalScore: document.getElementById('totalScore'),
            scoreThresholdDisplay: document.getElementById('scoreThresholdDisplay'),
            
            // Dice and rolling
            diceContainer: document.getElementById('diceContainer'),
            rollButton: document.getElementById('rollButton'),
            liveScoreDisplay: document.getElementById('liveScoreDisplay'),
            
            // Scorecard
            scorecardRows: document.querySelectorAll('.score-row'),
            
            // Play-area: boon slots + consumable slots
            boonSlots: document.getElementById('boonSlots'),
            consumableSlots: document.getElementById('consumableSlots'),
            artifactSlots: document.getElementById('artifactSlots'),
            boonSlotCounter: document.getElementById('boonSlotCounter'),
            consumableSlotCounter: document.getElementById('consumableSlotCounter'),
            
            // Shop stage (replaces rolling area per 6-translator)
            playStage: document.getElementById('playStage'),
            shopStage: document.getElementById('shopStage'),
            shopDefaultView: document.getElementById('shopDefaultView'),
            packOpeningView: document.getElementById('packOpeningView'),
            shopInventory: document.getElementById('shopInventory'),
            shopAnte: document.getElementById('shopAnte'),
            interestDisplay: document.getElementById('interestDisplay'),
            
            // Overlays
            confirmOverlay: document.getElementById('confirmOverlay'),
            libationOverlay: document.getElementById('libationOverlay'),
            expulsionOverlay: document.getElementById('expulsionOverlay'),
            
            // Message popup
            messagePopup: document.getElementById('message-popup')
        };
        
        // Clear play-area cache so slots always re-render after DOM replace (e.g. Continue)
        this._playAreaSlotsKey = null;

        // Game elements (playStage, shopStage, etc.) live in #gameUITemplate - only in DOM after loadGameUI()
        // Only run restore logic when game UI is loaded (at least one game element exists)
        const criticalElements = ['playStage', 'shopStage', 'diceContainer', 'rollButton'];
        const missingElements = criticalElements.filter(elementName => !this.dom[elementName]);
        const gameUILoaded = this.dom.playStage || this.dom.shopStage;
        
        if (missingElements.length > 0 && gameUILoaded) {
            // Game UI exists but some elements missing - restore/rebind
            Logger.debug(`Restoring missing UI elements: ${missingElements.join(', ')}`);
            this.restoreMissingElements(missingElements);
            this.rebindRestoredElements(missingElements);
        }
        // Else: pre-game (template not cloned yet) - nothing to restore, bindDOMElements runs again after loadGameUI()
        
        Logger.info('UIManager DOM elements bound successfully');
    }

    rebindRestoredElements(restoredElements) {
        // Re-bind DOM references for restored elements
        if (restoredElements.includes('shopStage')) {
            this.dom.playStage = document.getElementById('playStage');
            this.dom.shopStage = document.getElementById('shopStage');
            this.dom.shopDefaultView = document.getElementById('shopDefaultView');
            this.dom.packOpeningView = document.getElementById('packOpeningView');
            this.dom.shopContinueBtn = document.getElementById('shopContinueBtn');
            this.dom.actionCostBadge = document.getElementById('actionCostBadge');
            Logger.debug('Shop stage DOM elements rebound');
        }
    }

    restoreMissingElements(missingElements) {
        // Shop is in template (shopStage) - no restore; rebind after game loads
        if (missingElements.includes('shopStage') && !this.dom.shopStage) {
            Logger.debug('Shop stage not found (template may not be loaded yet)');
        }
        
        // Try to restore dice container if missing
        if (missingElements.includes('diceContainer') && !this.dom.diceContainer) {
            this.restoreDiceContainer();
        }
        
        // Try to restore roll button if missing
        if (missingElements.includes('rollButton') && !this.dom.rollButton) {
            this.restoreRollButton();
        }
    }

    restoreDiceContainer() {
        const centerGameArea = document.querySelector('.centerGameArea') || document.querySelector('.center-game-area');
        if (!centerGameArea) return;
        
        const existingDiceContainer = document.getElementById('diceContainer');
        if (!existingDiceContainer) {
            Logger.debug('Restoring dice container...');
            
            const diceContainer = document.createElement('div');
            diceContainer.id = 'diceContainer';
            diceContainer.className = 'diceContainer';
            
            // Insert before rolling controls (dice center, button under)
            const playStage = document.getElementById('playStage') || centerGameArea.querySelector('#playStage');
            const rollingControls = centerGameArea.querySelector('.rollingControls') || centerGameArea.querySelector('.rolling-controls');
            if (playStage && rollingControls) {
                playStage.insertBefore(diceContainer, rollingControls);
            } else if (centerGameArea) {
                centerGameArea.appendChild(diceContainer);
            }
            
            this.dom.diceContainer = diceContainer;
            Logger.debug('Dice container restored successfully');
        }
    }

    restoreRollButton() {
        const rollingControls = document.querySelector('.rollingControls') || document.querySelector('.rolling-controls');
        if (!rollingControls) return;
        
        const existingRollButton = document.getElementById('rollButton');
        if (!existingRollButton) {
            Logger.debug('Restoring roll button...');
            
            const rollButton = document.createElement('button');
            rollButton.id = 'rollButton';
            rollButton.className = 'roll-button';
            rollButton.textContent = 'Cast the Bones';
            
            rollingControls.insertBefore(rollButton, rollingControls.firstChild);
            this.dom.rollButton = rollButton;
            Logger.debug('Roll button restored successfully');
        }
    }

    setupShopManager() {
        if (!this.shopUI) this.shopUI = new ShopUI(this);
        const shop = this.shopUI;
        window.shopManager = {
            openShop: (gameState, gameEngine) => shop.openShop(gameState, gameEngine),
            closeShop: () => shop.closeShop(),
            rerollShop: (gameState, gameEngine) => shop.rerollShop(gameState, gameEngine),
            buyPack: (packType, gameState, gameEngine) => shop.buyPack?.(packType, gameState, gameEngine),
            buyArtifact: (artifactData, gameState, gameEngine, el) => shop.buyArtifact(artifactData, gameState, gameEngine, el),
            buyCard: (card, gameState, gameEngine, el) => shop.buyCard(card, gameState, gameEngine, el),
            claimCard: (card, gameState, gameEngine, el) => shop.claimCard(card, gameState, gameEngine, el),
            sellCard: (card, gameState, gameEngine) => shop.sellCard(card, gameState, gameEngine)
        };
    }

    /** Delegate to ShopUI for play-area sell (7-call-upon-able) */
    sellCard(card, gameState, gameEngine) {
        if (this.shopUI) this.shopUI.sellCard(card, gameState, gameEngine);
    }

    /** Delegate to ShopUI/ShopStockGenerator for price display */
    getShopPrice(baseCost, gameState) {
        return this.shopUI ? this.shopUI.getShopPrice(baseCost, gameState) : ShopStockGenerator.getShopPrice(baseCost, gameState);
    }

    /** Delegate to ShopUI (used by GameEngine resume + window.shopManager) */
    openShop(gameState, gameEngine) {
        if (this.shopUI) this.shopUI.openShop(gameState, gameEngine);
    }

    updateAll(gameState, gameEngine) {
        if (!this.isInitialized) return;
        
        if (!this.dom.diceContainer || !this.dom.rollButton) return;
        
        this.updateInfoUI(gameState, gameEngine);
        this.updateDiceUI(gameState, gameEngine);
        this.updateScorecardUI(gameState, gameEngine);
        this.updatePlayAreaSlots(gameState, gameEngine);
        this.updateBlindUI(gameState, gameEngine);
        // Keep the single action button (#rollButton) synced with shop state: label + cost badge + affordability.
        if (this.shopUI && document.querySelector('.main-game')?.classList.contains('shop-active')) {
            this.shopUI.applyShopActionButton(gameState, true);
        }
    }

    updateInfoUI(gameState, _gameEngine) {
        InfoBarRenderer.updateInfoUI(this.dom, gameState);
    }

    updateBlindUI(gameState, gameEngine) {
        InfoBarRenderer.updateBlindUI(this.dom, gameState, gameEngine);
    }

    updateDiceUI(gameState, gameEngine = null) {
        DiceRenderer.updateDiceUI(this.dom, gameState, gameEngine);
    }

    updateScorecardUI(gameState, gameEngine = null) {
        ScorecardRenderer.updateScorecardUI(this.dom, gameState, gameEngine, this);
    }

    updatePlayAreaSlots(gameState, gameEngine) {
        PlayAreaRenderer.updatePlayAreaSlots(this.dom, gameState, gameEngine, this);
    }

    /**
     * Shared inventory card renderer — "call upon" this for boon / consumable slots.
     * Sell and use are pointer drag (gold stone, pantheon, dice) via bindBoonSlotDrag / bindConsumableHorizonDrag.
     * @param {Card} card
     * @param {HTMLElement} container
     * @param {Object} [_opts] - Reserved for legacy; unused when cards have no action labels.
     */
    appendInventoryCard(card, container, _opts = {}) {
        const cardEl = card.render();
        cardEl.classList.add('inventory-draggable');
        container.appendChild(cardEl);
        return cardEl;
    }

    /**
     * Boon bar: drag to gold to sell; drag onto another boon to reorder.
     * @param {HTMLElement} container - #boonSlots
     */
    bindBoonSlotDrag(container, gameState, gameEngine) {
        if (!container || container._boonSlotDragBound) return;
        container._boonSlotDragBound = true;
        const TH = 14;
        const pointIn = (px, py, el) => {
            if (!el) return false;
            const r = el.getBoundingClientRect();
            return px >= r.left && px <= r.right && py >= r.top && py <= r.bottom;
        };
        const findBoon = (id) => (gameState.boons || []).find((b) => b.id === id);

        container.addEventListener('pointerdown', (e) => {
            if (e.button !== 0) return;
            const cardEl = e.target.closest('.card');
            if (!cardEl || !container.contains(cardEl)) return;
            const id = cardEl.dataset.id;
            if (!id || !findBoon(id)) return;
            container._boonDrag = {
                pointerId: e.pointerId,
                cardEl,
                id,
                startX: e.clientX,
                startY: e.clientY,
                dragging: false,
            };
            try { cardEl.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
        });

        const finish = (e) => {
            const st = container._boonDrag;
            if (!st || e.pointerId !== st.pointerId) return;
            container._boonDrag = null;
            try { st.cardEl.releasePointerCapture(e.pointerId); } catch (_) { /* ignore */ }
            const gold = document.getElementById('goldStone');
            const px = e.clientX;
            const py = e.clientY;
            gold?.classList.remove('drop-target-sell');
            st.cardEl.classList.remove('boon-card-dragging');
            document.querySelector('.main-game')?.classList.remove('boon-drag-active');
            if (!st.dragging) return;
            st.cardEl.style.removeProperty('transform');
            const boon = findBoon(st.id);
            if (!boon || !gameEngine) return;
            if (pointIn(px, py, gold)) {
                this.shopUI?.sellCard(boon, gameState, gameEngine);
                return;
            }
            const stack = document.elementsFromPoint(px, py);
            let targetEl = null;
            for (const node of stack) {
                const c = node.closest?.('.card');
                if (c && container.contains(c) && c !== st.cardEl && c.dataset.id) {
                    targetEl = c;
                    break;
                }
            }
            if (targetEl) {
                const boons = gameState.boons;
                const fromIndex = boons.findIndex((b) => b.id === st.id);
                const toIndex = boons.findIndex((b) => b.id === targetEl.dataset.id);
                if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
                    const [moved] = boons.splice(fromIndex, 1);
                    boons.splice(fromIndex < toIndex ? toIndex - 1 : toIndex, 0, moved);
                    if (window.soundManager) window.soundManager.play('button', { volume: 0.4 });
                    gameEngine.updateAllUI();
                }
            }
        };

        container.addEventListener('pointermove', (e) => {
            const st = container._boonDrag;
            if (!st || e.pointerId !== st.pointerId) return;
            const dx = e.clientX - st.startX;
            const dy = e.clientY - st.startY;
            if (!st.dragging && (dx * dx + dy * dy) >= TH * TH) {
                st.dragging = true;
                st.cardEl.classList.add('boon-card-dragging');
                document.querySelector('.main-game')?.classList.add('boon-drag-active');
            }
            if (st.dragging) {
                st.pendingDx = dx;
                st.pendingDy = dy;
                if (!st.rafId) {
                    st.rafId = requestAnimationFrame(() => {
                        st.rafId = 0;
                        const live = container._consumableDrag;
                        if (!live || live !== st) return;
                        st.cardEl.style.transform = `translate3d(${st.pendingDx}px, ${st.pendingDy}px, 0)`;
                    });
                }
                const gold = document.getElementById('goldStone');
                gold?.classList.toggle('drop-target-sell', pointIn(e.clientX, e.clientY, gold));
            }
        });
        container.addEventListener('pointerup', finish);
        container.addEventListener('pointercancel', finish);
    }

    /**
     * One-time pointer delegation: sell → wide left band, worship → right (Pantheon),
     * libation → die (enhance) or table / roll zone (use).
     * @param {HTMLElement} container - #consumableSlots
     */
    bindConsumableHorizonDrag(container) {
        if (!container || container._consumableHorizonDragBound) return;
        container._consumableHorizonDragBound = true;
        const DRAG_THRESHOLD = 16;
        const getZones = () => ({
            worship: document.getElementById('consumableZoneWorship'),
            libation: document.getElementById('consumableZoneLibation'),
            sellStone: document.getElementById('goldStone'),
            main: container.closest('.main-game'),
        });
        const pointIn = (px, py, el) => {
            if (!el) return false;
            const r = el.getBoundingClientRect();
            return px >= r.left && px <= r.right && py >= r.top && py <= r.bottom;
        };
        const findCardModel = (id, gameState) => (gameState.consumables || []).find(c => c.id === id);
        const shopOpen = () => {
            const shopStage = document.getElementById('shopStage');
            return !!(shopStage && !shopStage.classList.contains('hidden'));
        };
        const findDieUnderPointer = (px, py, ignoreEl) => {
            const diceContainer = document.getElementById('diceContainer');
            if (!diceContainer || shopOpen()) return null;
            const stack = document.elementsFromPoint(px, py);
            for (const el of stack) {
                if (ignoreEl && (el === ignoreEl || ignoreEl.contains(el))) continue;
                if (!diceContainer.contains(el)) continue;
                const die = el.closest?.('.die');
                if (die && diceContainer.contains(die)) return die;
            }
            return null;
        };
        const pointInDicePlayArea = (px, py) => {
            if (shopOpen()) return false;
            const playStage = document.getElementById('playStage');
            const diceContainer = document.getElementById('diceContainer');
            const diceRollZone = document.getElementById('diceRollZone');
            return pointIn(px, py, playStage) || pointIn(px, py, diceContainer) || pointIn(px, py, diceRollZone);
        };
        const findScoreRowUnderPointer = (px, py, ignoreEl) => {
            const scorecard = document.getElementById('scorecard');
            if (!scorecard || shopOpen()) return null;
            const stack = document.elementsFromPoint(px, py);
            for (const el of stack) {
                if (ignoreEl && (el === ignoreEl || ignoreEl.contains(el))) continue;
                if (!scorecard.contains(el)) continue;
                const row = el.closest?.('.score-row');
                if (row && scorecard.contains(row)) return row;
            }
            return null;
        };

        const clearDragChrome = (main) => {
            if (main) {
                main.classList.remove(
                    'consumable-drag-active',
                    'drag-type-worship',
                    'drag-type-libation'
                );
            }
            const z = getZones();
            z.worship?.classList.remove('zone-hot');
            z.libation?.classList.remove('zone-hot');
        };

        const endDrag = (state, cancelled) => {
            if (!state) return;
            const { cardEl, main, pointerId } = state;
            if (cardEl) {
                cardEl.classList.remove('consumable-card-dragging');
                if (pointerId != null) {
                    try { cardEl.releasePointerCapture(pointerId); } catch (_) { /* already released */ }
                }
            }
            clearDragChrome(main);
            document.getElementById('goldStone')?.classList.remove('drop-target-sell');
            if (cancelled && cardEl) {
                cardEl.style.removeProperty('transform');
                cardEl.style.removeProperty('will-change');
            }
        };

        const runCloneFx = (cardEl, className, onDone) => {
            const clone = cardEl.cloneNode(true);
            clone.querySelectorAll('.buy-sell-label').forEach((n) => n.remove());
            clone.classList.remove('sell-label-visible', 'consumable-card-dragging');
            clone.classList.add(className);
            const r = cardEl.getBoundingClientRect();
            clone.style.position = 'fixed';
            clone.style.left = `${r.left}px`;
            clone.style.top = `${r.top}px`;
            clone.style.width = `${r.width}px`;
            clone.style.height = `${r.height}px`;
            clone.style.zIndex = '10050';
            clone.style.pointerEvents = 'none';
            document.body.appendChild(clone);
            let finished = false;
            const done = () => {
                if (finished) return;
                finished = true;
                clone.remove();
                if (onDone) onDone();
            };
            clone.addEventListener('animationend', done, { once: true });
            setTimeout(done, 700);
        };

        container.addEventListener('pointerdown', (e) => {
            if (e.button !== 0) return;
            const cardEl = e.target.closest('.card');
            if (!cardEl || !container.contains(cardEl)) return;
            const id = cardEl.dataset.id;
            if (!id) return;
            const game = window.game;
            const gameState = game?.state;
            if (!game || !gameState) return;
            const card = findCardModel(id, gameState);
            if (!card) return;
            container._consumableDrag = {
                pointerId: e.pointerId,
                cardEl,
                card,
                startX: e.clientX,
                startY: e.clientY,
                dragging: false,
                main: null,
            };
            cardEl.setPointerCapture(e.pointerId);
        });

        container.addEventListener('pointermove', (e) => {
            const st = container._consumableDrag;
            if (!st || e.pointerId !== st.pointerId) return;
            const dx = e.clientX - st.startX;
            const dy = e.clientY - st.startY;
            if (!st.dragging && (dx * dx + dy * dy) >= DRAG_THRESHOLD * DRAG_THRESHOLD) {
                st.dragging = true;
                st.main = getZones().main;
                st.main?.classList.add('consumable-drag-active');
                const card = st.card;
                const isWorship = typeof WorshipCard !== 'undefined' && card instanceof WorshipCard;
                const isLibation = typeof LibationCard !== 'undefined' && card instanceof LibationCard;
                if (isWorship) st.main?.classList.add('drag-type-worship');
                else if (isLibation) st.main?.classList.add('drag-type-libation');
                st.cardEl.classList.add('consumable-card-dragging');
                st.cardEl.style.willChange = 'transform';
            }
            if (st.dragging) {
                st.cardEl.style.transform = `translate(${dx}px, ${dy}px)`;
                const zones = getZones();
                if (zones.sellStone) {
                    zones.sellStone.classList.toggle('drop-target-sell', pointIn(e.clientX, e.clientY, zones.sellStone));
                }
                if (zones.worship) {
                    zones.worship.classList.toggle('zone-hot', pointIn(e.clientX, e.clientY, zones.worship));
                }
                if (zones.libation) {
                    zones.libation.classList.toggle('zone-hot', pointIn(e.clientX, e.clientY, zones.libation));
                }
            }
        });

        const finish = (e) => {
            const st = container._consumableDrag;
            if (!st || e.pointerId !== st.pointerId) return;
            container._consumableDrag = null;
            const game = window.game;
            const gameState = game?.state;
            const gameEngine = game;
            if (!st.dragging) {
                endDrag(st, false);
                return;
            }
            st.cardEl.addEventListener('click', (ev) => {
                ev.preventDefault();
                ev.stopImmediatePropagation();
            }, { capture: true, once: true });
            st.cardEl.style.removeProperty('transform');
            const px = e.clientX;
            const py = e.clientY;
            const z = getZones();
            const card = st.card;
            const isWorship = typeof WorshipCard !== 'undefined' && card instanceof WorshipCard;
            const isLibation = typeof LibationCard !== 'undefined' && card instanceof LibationCard;

            const doSell = () => {
                endDrag(st, false);
                runCloneFx(st.cardEl, 'consumable-fx-sell-gold', () => {
                    this.sellCard(card, gameState, gameEngine);
                });
            };
            const doUse = (fxClass) => {
                endDrag(st, false);
                runCloneFx(st.cardEl, fxClass, () => {
                    this.useConsumable(card, gameState, gameEngine);
                });
            };

            const isAwaitingPickSameCard = () => (
                pendingLib?.libation === card || pendingEuch?.libation === card
            );
            const applyLibationToDie = (dieEl, enhancementType) => {
                if (!dieEl || !gameState.hasRolled) return false;
                const dieIndex = parseInt(dieEl.dataset.dieIndex, 10);
                if (Number.isNaN(dieIndex)) return false;
                endDrag(st, false);
                runCloneFx(st.cardEl, 'consumable-fx-libation-dice', () => {
                    this.applyLibationEnhancementToDieFromDrag(card, dieIndex, gameState, gameEngine, enhancementType);
                });
                return true;
            };
            const handleWorshipZoneDrop = () => {
                if (isWorship) {
                    doUse('consumable-fx-worship-pantheon');
                } else if (isLibation) {
                    endDrag(st, false);
                    gameEngine?.showMessage?.('Libations flow onto the altar — drag onto the dice.');
                } else {
                    endDrag(st, false);
                }
            };
            const handleLibationZoneDrop = () => {
                if (isLibation) {
                    if (isAwaitingPickSameCard()) {
                        endDrag(st, true);
                        return;
                    }
                    doUse('consumable-fx-libation-artifacts');
                } else if (isWorship) {
                    endDrag(st, false);
                    gameEngine?.showMessage?.('Worship ascends to the Pantheon — drag up.');
                } else {
                    endDrag(st, false);
                }
            };

            if (pointIn(px, py, z.sellStone)) {
                doSell();
                return;
            }

            const pendingLib = gameEngine?.state?.libationTargetingMode;
            const pendingEuch = gameEngine?.state?.eucharistTargetingMode;
            const scoreRowUnder = findScoreRowUnderPointer(px, py, st.cardEl);
            const eucharistRowCategory = scoreRowUnder?.getAttribute?.('data-category') || null;

            const tryEucharistOnScoreRow = () => {
                if (!eucharistRowCategory || !gameEngine || card.id !== 'the_eucharist' || !isLibation) return false;
                const god = typeof GOD_TO_CATEGORY !== 'undefined' ? GOD_TO_CATEGORY[eucharistRowCategory] : null;
                if (!god) {
                    endDrag(st, false);
                    gameEngine.showMessage?.('The Eucharist: Choose a scoring row tied to a god.');
                    return true;
                }
                if (god === "Pandora's Box" && !gameState.unlockedCategories?.["Pandora's Box"]) {
                    endDrag(st, false);
                    gameEngine.showMessage?.("The Eucharist: Pandora's Box is not unlocked.");
                    return true;
                }
                const finishingPending = pendingEuch?.libation === card;
                if (!finishingPending && !card.canUse()) {
                    endDrag(st, false);
                    gameEngine.showMessage?.('Cannot use this consumable right now.');
                    return true;
                }
                if (!finishingPending) {
                    const godsAvail = Object.keys(gameState.worshipLevels || {}).filter((g) => g !== "Pandora's Box");
                    if (godsAvail.length === 0) {
                        endDrag(st, false);
                        gameEngine.showMessage?.('The Eucharist: No gods available to worship!');
                        return true;
                    }
                }
                endDrag(st, false);
                const cat = eucharistRowCategory;
                runCloneFx(st.cardEl, 'consumable-fx-worship-pantheon', () => {
                    if (!gameEngine.state.eucharistTargetingMode?.libation) {
                        gameEngine.state.eucharistTargetingMode = { libation: card };
                    }
                    gameEngine.handleEucharistSelect(cat);
                });
                return true;
            };

            if (pendingEuch?.libation === card && isLibation && tryEucharistOnScoreRow()) {
                return;
            }
            if (!pendingEuch && isLibation && card.id === 'the_eucharist' && tryEucharistOnScoreRow()) {
                return;
            }

            const dieElTargeting = findDieUnderPointer(px, py, st.cardEl);
            if (pendingLib?.libation === card && isLibation && applyLibationToDie(dieElTargeting, pendingLib.enhancementType)) {
                return;
            }

            if (pointIn(px, py, z.worship)) {
                handleWorshipZoneDrop();
                return;
            }

            if (pointIn(px, py, z.libation)) {
                handleLibationZoneDrop();
                return;
            }

            const enhType = isLibation && typeof LibationCard !== 'undefined'
                ? LibationCard.getDieFaceEnhancementType(card)
                : null;
            if (isLibation && enhType && applyLibationToDie(dieElTargeting, enhType)) {
                return;
            }

            if (isLibation && pointInDicePlayArea(px, py)) {
                if (isAwaitingPickSameCard()) {
                    endDrag(st, true);
                    return;
                }
                doUse('consumable-fx-libation-dice');
                return;
            }

            if (isWorship && pointInDicePlayArea(px, py)) {
                endDrag(st, false);
                gameEngine?.showMessage?.('Worship ascends to the Pantheon — drag up.');
                return;
            }

            endDrag(st, true);
        };

        container.addEventListener('pointerup', finish);
        container.addEventListener('pointercancel', finish);
    }

    /**
     * Apply a die-face enhancement libation from consumable drag (or finish targeting drag).
     * @param {LibationCard} libation
     * @param {number} dieIndex
     * @param {Object} gameState
     * @param {Object} gameEngine
     * @param {string} enhancementType
     */
    applyLibationEnhancementToDieFromDrag(libation, dieIndex, gameState, gameEngine, enhancementType) {
        window.balatroEffects?.hideAllTooltips();
        const die = gameState.dice?.[dieIndex];
        if (!die || !(libation instanceof LibationCard) || !libation.canUse()) {
            gameEngine?.showMessage?.('Cannot apply libation right now.');
            return;
        }
        if (!gameState.hasRolled) {
            gameEngine?.showMessage?.('Roll the dice first, then target a die.');
            return;
        }
        this.applyLibationEnhancementToDie(libation, dieIndex, gameState, gameEngine, enhancementType, 'consumable_drag');
    }

    /**
     * Shared libation die-application path used by drag and die-click targeting.
     * @param {LibationCard} libation
     * @param {number} dieIndex
     * @param {Object} gameState
     * @param {Object} gameEngine
     * @param {string} enhancementType
     * @param {string} [via='direct_targeting']
     * @returns {boolean}
     */
    applyLibationEnhancementToDie(libation, dieIndex, gameState, gameEngine, enhancementType, via = 'direct_targeting') {
        const die = gameState?.dice?.[dieIndex];
        if (!die || !(libation instanceof LibationCard) || !libation.canUse()) return false;
        if (!gameState.hasRolled) return false;
        const targetFace = typeof die.getEffectiveFace === 'function' ? die.getEffectiveFace() : (die.face ?? die.currentFace ?? 1);
        libation.applyEnhancementToDie(gameState, dieIndex, enhancementType, targetFace, gameEngine);
        libation.use();
        if (typeof PlaytestRecorder !== 'undefined' && PlaytestRecorder.active) {
            PlaytestRecorder.log('libation_die_applied', {
                libationId: libation.id,
                dieIndex,
                enhancementType,
                targetFace,
                turn: gameState.turn,
                via,
            });
        }
        if (window.soundManager) window.soundManager.play('foil1', { pitch: 0.95 + Math.random() * 0.1, volume: 0.55 });
        const idx = gameState.consumables.findIndex(c => c.id === libation.id);
        if (idx !== -1) gameState.consumables.splice(idx, 1);
        if (gameEngine?.state) gameEngine.state.libationTargetingMode = null;
        gameEngine?.updateAllUI?.();
        window.balatroEffects?.hideAllTooltips();
        return true;
    }

    /**
     * Use a consumable (libation/worship) from play area. Not shop-related.
     * @param {LibationCard|WorshipCard} card
     * @param {Object} gameState
     * @param {Object} gameEngine
     */
    useConsumable(card, gameState, gameEngine) {
        window.balatroEffects?.hideAllTooltips();
        if (card instanceof LibationCard) {
            const libTargeting = gameEngine?.state?.libationTargetingMode;
            const euchTargeting = gameEngine?.state?.eucharistTargetingMode;
            if ((libTargeting?.libation === card || euchTargeting?.libation === card)) {
                gameEngine.cancelTargetingMode();
                return;
            }
        }
        if (!card.canUse()) {
            gameEngine.showMessage("Cannot use this consumable right now.");
            return;
        }
        let success = false;
        let message = "";
        if (card instanceof LibationCard) {
            success = card.applyRule(gameState, gameEngine);
            const pendingTarget =
                gameEngine?.state?.libationTargetingMode?.libation === card
                || gameEngine?.state?.eucharistTargetingMode?.libation === card;
            if (!success && pendingTarget) {
                return;
            }
            message = success ? `Libation activated: ${card.name}!` : "Failed to activate libation.";
        } else if (card instanceof WorshipCard) {
            success = card.applyWorship(gameState);
            message = success ? `Worship applied: ${card.name}!` : "Failed to apply worship.";
        } else {
            success = card.use ? card.use() : false;
            message = success ? `Used: ${card.name}!` : "Failed to use card.";
        }
        if (success) {
            if (typeof PlaytestRecorder !== 'undefined' && PlaytestRecorder.active) {
                PlaytestRecorder.log('consumable_used', {
                    id: card.id,
                    kind: card instanceof LibationCard ? 'libation' : (card instanceof WorshipCard ? 'worship' : 'other'),
                    turn: gameState.turn,
                    gold: gameState.gold,
                });
            }
            if (window.soundManager) window.soundManager.play('magic_crumple', { pitch: 0.95 + Math.random() * 0.1, volume: 0.55 });
            gameEngine.showMessage(message);
            const cardIndex = gameState.consumables.findIndex(c => c.id === card.id);
            if (cardIndex !== -1) gameState.consumables.splice(cardIndex, 1);
            gameEngine.updateAllUI();
            window.balatroEffects?.hideAllTooltips();
        } else {
            if (window.soundManager) window.soundManager.play('cancel', { volume: 0.5 });
            gameEngine.showMessage(message || "Failed to use libation.");
        }
    }

    // Ensure shop DOM elements are properly bound
    ensureShopElementsBound() {
        // Re-bind shop elements if they're missing
        if (!this.dom.shopInventory) {
            this.dom.shopInventory = document.getElementById('shopInventory');
        }
        if (!this.dom.shopDefaultView) {
            this.dom.shopDefaultView = document.getElementById('shopDefaultView');
        }
        if (!this.dom.packOpeningView) {
            this.dom.packOpeningView = document.getElementById('packOpeningView');
        }
    }

    createRippleEffect(button, event) {
        // Create ripple element
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        
        // Position ripple at click coordinates
        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        
        // Add ripple to button
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        // Remove ripple after animation completes
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

}
