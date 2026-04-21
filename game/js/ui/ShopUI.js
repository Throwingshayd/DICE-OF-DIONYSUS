/**
 * ShopUI - Renders and handles shop interactions (DOM, events, pack opening, expulsion).
 * Uses ShopStockGenerator for pure stock logic. Separates UI from game mechanics.
 * @module ShopUI
 */

/* exported ShopUI */
/* global Boon, WorshipCard, LibationCard, Artifact, GAME_BALANCE, Logger */

class ShopUI {
    /**
     * @param {UIManager} uiManager - Parent UIManager for dom, updateAllUI, createRippleEffect
     */
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.shopState = {
            openedPacks: new Set(),
            rerolls: 1
        };
        this.shopItemIndex = 0;
        /** @type {{ card: Card, element?: HTMLElement, gameState: Object, gameEngine: Object, refundGold?: number, packContainer?: HTMLElement, packType?: string } | null} */
        this.expulsionPending = null;
    }

    get dom() {
        return this.uiManager.dom;
    }

    getShopPrice(baseCost, gameState) {
        return ShopStockGenerator.getShopPrice(baseCost, gameState);
    }

    getPackName(packType) {
        const names = { boon: 'Boon Pack', worship: 'Worship Pack', libation: 'Libation Pack', chaos: 'Chaos Pack' };
        return names[packType] || 'Unknown Pack';
    }

    getShopDisplayedCardIds() {
        const container = document.getElementById('shopDirectSales');
        if (!container) return new Set();
        return new Set(
            Array.from(container.querySelectorAll('[data-card-id]'))
                .map(el => el.dataset.cardId)
                .filter(Boolean)
        );
    }

    openShop(gameState, gameEngine) {
        gameState.usedFreeReroll = false;
        this.shopState.openedPacks = new Set();

        this.uiManager.ensureShopElementsBound?.();

        const playStage = this.dom.playStage || document.getElementById('playStage');
        const shopStage = this.dom.shopStage || document.getElementById('shopStage');
        if (playStage) playStage.classList.add('hidden');
        if (shopStage) {
            window.balatroEffects?.hideAllTooltips();
            shopStage.classList.remove('hidden');
        } else {
            Logger.error('Shop stage not found, cannot open shop');
            return;
        }

        this.applyShopActionButton(gameState, true);
        document.querySelector('.main-game')?.classList.add('shop-active');

        if (window.GameStateManager) window.GameStateManager.setState(window.GAME_STATES?.SHOP || 'SHOP');
        if (window.soundManager) window.soundManager.setMusicContext('shop');
        if (this.dom.shopAnte) this.dom.shopAnte.textContent = gameState.ante;
        if (this.dom.packOpeningView) this.dom.packOpeningView.classList.add('hidden');
        if (this.dom.shopDefaultView) this.dom.shopDefaultView.classList.remove('hidden');
        this.attachShopEventListeners();

        if (gameEngine?.canSave?.()) gameEngine.saveGame();

        requestAnimationFrame(() => this.renderStock(gameState, gameEngine));
    }

    closeShop() {
        const playStage = this.dom.playStage || document.getElementById('playStage');
        const shopStage = this.dom.shopStage || document.getElementById('shopStage');
        const packOpeningView = this.dom.packOpeningView || document.getElementById('packOpeningView');
        const shopDefaultView = this.dom.shopDefaultView || document.getElementById('shopDefaultView');

        playStage?.classList.remove('hidden');
        shopStage?.classList.add('hidden');
        packOpeningView?.classList.add('hidden');
        shopDefaultView?.classList.remove('hidden');
        document.querySelector('.main-game')?.classList.remove('shop-active');
        this.applyShopActionButton(null, false);
        if (window.soundManager) window.soundManager.setMusicContext('play');
        if (window.GameStateManager) window.GameStateManager.setState(window.GAME_STATES?.ROUND || 'ROUND');
        window.balatroEffects?.hideAllTooltips();
    }

    /**
     * Swap the single action button (#rollButton) between play ("Cast the Bones") and shop ("Reroll"),
     * and toggle the tiny cost badge sibling so the price is visible but not on the button art.
     * @param {Object|null} gameState - needed to compute free-reroll label; null on close
     * @param {boolean} shopOpen - true = shop mode, false = play mode
     */
    applyShopActionButton(gameState, shopOpen) {
        const rollBtn = document.getElementById('rollButton');
        const badge = document.getElementById('actionCostBadge');
        if (!rollBtn) return;
        if (shopOpen) {
            rollBtn.textContent = 'Reroll';
            const hasFreeReroll = !!(gameState?.artifacts?.some(a => a.id === 'sundial_plus') && !gameState?.usedFreeReroll);
            const cost = typeof GAME_BALANCE !== 'undefined' ? GAME_BALANCE.SHOP_REROLL_COST : 4;
            const canAfford = hasFreeReroll || (gameState?.gold ?? 0) >= cost;
            rollBtn.disabled = !canAfford;
            if (badge) {
                badge.textContent = hasFreeReroll ? 'Free' : `${cost}g`;
                badge.classList.remove('hidden');
            }
        } else {
            rollBtn.textContent = 'Cast the Bones';
            if (badge) badge.classList.add('hidden');
        }
    }

    renderStock(gameState, gameEngine) {
        window.balatroEffects?.hideAllTooltips();
        const directSalesContainer = document.getElementById('shopDirectSales');
        const packsContainer = document.getElementById('shopPacksArea');
        const artifactsContainer = document.getElementById('shopArtifactsArea');

        if (!directSalesContainer || !packsContainer || !artifactsContainer) {
            Logger.warn('Shop containers not found');
            return;
        }

        directSalesContainer.innerHTML = '<h4>Wares</h4>';
        packsContainer.innerHTML = '<h4>Packs</h4>';
        artifactsContainer.innerHTML = '<h4>Divine Artifacts</h4>';
        this.shopItemIndex = 0;

        const stock = ShopStockGenerator.generateStock(gameState, gameEngine.prng, {
            openedPacks: this.shopState.openedPacks
        });

        stock.artifacts.forEach(artifactData => {
            const el = this.createCardElement(artifactData, 'artifact', gameState, gameEngine);
            if (el) {
                el.classList.add('shop-item-slide-in');
                el.style.animationDelay = `${this.shopItemIndex++ * 0.08}s`;
                artifactsContainer.appendChild(el);
            }
        });

        stock.directSales.forEach(({ cardData }) => {
            const el = this.createCardElement(cardData, 'direct', gameState, gameEngine);
            if (el) {
                el.classList.add('shop-item-slide-in');
                el.style.animationDelay = `${this.shopItemIndex++ * 0.08}s`;
                if (cardData?.id) el.dataset.cardId = cardData.id;
                directSalesContainer.appendChild(el);
            }
        });

        stock.packs.forEach(packData => {
            const el = this.createPackElement(packData, gameState, gameEngine);
            el.classList.add('shop-item-slide-in');
            el.style.animationDelay = `${this.shopItemIndex++ * 0.08}s`;
            packsContainer.appendChild(el);
        });
    }

    attachShopEventListeners() {
        // Reroll is handled by #rollButton in shop mode (see GameEngine roll-button listener).
        // Only the corner Continue button needs its click wired here.
        const continueBtn = document.getElementById('shopContinueBtn');
        if (continueBtn) {
            const newBtn = continueBtn.cloneNode(true);
            continueBtn.parentNode.replaceChild(newBtn, continueBtn);
            newBtn.addEventListener('click', () => {
                if (window.game) window.game.closeShop();
                else this.closeShop();
            });
        }
    }

    hasTantalusSpendBlock(gameState, gameEngine, message, playCancel = true) {
        const hasTantalusCurse = gameState.boons?.some(j => j.id === 'tantalus_curse');
        if (!hasTantalusCurse) return false;
        if (playCancel && window.soundManager) window.soundManager.play('cancel', { volume: 0.55 });
        gameEngine.showMessage(message);
        return true;
    }

    ensureCanAfford(gameState, effectiveCost, gameEngine, message) {
        if (gameState.gold >= effectiveCost) return true;
        if (window.soundManager) window.soundManager.play('cancel', { volume: 0.55 });
        gameEngine.showMessage(message);
        return false;
    }

    refillDirectSales(gameState, gameEngine, directSalesContainer) {
        if (!directSalesContainer) return;
        directSalesContainer.innerHTML = '<h4>Wares</h4>';
        this.shopItemIndex = 0;
        const items = ShopStockGenerator.generateDirectSalesOnly(gameState, gameEngine.prng, new Set());
        items.forEach(({ cardData }) => {
            const el = this.createCardElement(cardData, 'direct', gameState, gameEngine);
            if (!el) return;
            el.dataset.cardId = cardData.id;
            el.classList.add('shop-item-slide-in');
            el.style.animationDelay = `${this.shopItemIndex++ * 0.08}s`;
            directSalesContainer.appendChild(el);
        });
    }

    logRerollStock(paid, directSalesContainer) {
        if (typeof PlaytestRecorder === 'undefined' || !PlaytestRecorder.active) return;
        const ids = Array.from(directSalesContainer?.querySelectorAll('[data-card-id]') || [])
            .map((el) => el.dataset.cardId)
            .filter(Boolean);
        PlaytestRecorder.log('shop_stock_after_reroll', { paid, directSaleIds: ids });
    }

    createCardElement(cardData, type, gameState, gameEngine) {
        let cardInstance;
        let cardEl;
        const displayData = (type === 'direct' || type === 'artifact') && gameState
            ? { ...cardData, baseCost: cardData.cost ?? 0, cost: this.getShopPrice(cardData.cost ?? 0, gameState) }
            : cardData;

        if (type === 'artifact') {
            cardInstance = new Artifact(displayData);
            cardEl = cardInstance.render(true, true);
        } else {
            if (displayData.rarity === 'worship') cardInstance = new WorshipCard(displayData);
            else if (displayData.rarity === 'libation') cardInstance = new LibationCard(displayData);
            else cardInstance = new Boon(displayData);
            cardEl = cardInstance.render(true, type === 'direct' || type === 'artifact');
        }

        if (type === 'direct' || type === 'artifact') {
            const buyLabel = cardEl.querySelector('.buy-sell-label.buy');
            if (buyLabel) {
                buyLabel.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (type === 'artifact') this.buyArtifact(displayData, gameState, gameEngine, cardEl);
                    else this.buyCard(cardInstance, gameState, gameEngine, cardEl);
                });
            }
            cardEl.addEventListener('click', (e) => {
                if (e.target.closest('.buy-sell-label')) return;
                e.stopPropagation();
                this.revealShopItemTag(cardEl);
            });
        }

        if (type === 'pack') {
            const claimPackCard = (e) => {
                e.stopPropagation();
                if (window.soundManager) window.soundManager.play(cardInstance instanceof Boon ? 'card1' : 'tarot1', { pitch: 0.92 + Math.random() * 0.1, volume: 0.55 });
                this.claimCard(cardInstance, gameState, gameEngine, cardEl);
            };
            const takeLabel = cardEl.querySelector('.buy-sell-label.take');
            if (takeLabel) takeLabel.addEventListener('click', claimPackCard);
            cardEl.addEventListener('click', (e) => {
                if (e.target.closest('.buy-sell-label')) return;
                this.revealShopItemTag(cardEl);
            });
        }

        return cardEl;
    }

    createPackElement(packData, gameState, gameEngine) {
        const pack = document.createElement('div');
        pack.className = `card pack-card pack-${packData.type}`;
        pack.dataset.packType = packData.type;
        pack.setAttribute('data-tooltip', JSON.stringify({
            title: packData.name,
            effect: packData.description,
            cost: packData.cost,
            type: 'pack'
        }));
        pack.innerHTML = `
            <div class="pack-title">${packData.name}</div>
            <div class="pack-description">${packData.description}</div>
            <div class="pack-cost">${packData.cost}g</div>
            <div class="buy-sell-label buy" data-pack-type="${packData.type}">Buy</div>
        `;
        const buyLabel = pack.querySelector('.buy-sell-label.buy');
        if (buyLabel) {
            buyLabel.addEventListener('click', (e) => {
                e.stopPropagation();
                this.purchasePack(packData, gameState, gameEngine, pack);
            });
        }
        pack.addEventListener('click', (e) => {
            if (e.target.closest('.buy-sell-label')) return;
            e.stopPropagation();
            this.revealShopItemTag(pack);
        });
        return pack;
    }

    revealShopItemTag(element) {
        const shop = element.closest('#shopStage, #packOpeningView');
        if (!shop) return;
        shop.querySelectorAll('.shop-item-selected').forEach(el => {
            if (el !== element) el.classList.remove('shop-item-selected');
        });
        element.classList.toggle('shop-item-selected');
        if (element.classList.contains('shop-item-selected')) {
            if (window.soundManager) window.soundManager.play('highlight1', { volume: 0.35 });
            const close = (e) => {
                if (!element.contains(e.target) && !e.target.closest('.buy-sell-label')) {
                    element.classList.remove('shop-item-selected');
                    document.removeEventListener('click', close);
                }
            };
            setTimeout(() => document.addEventListener('click', close), 0);
        }
    }

    purchasePack(packData, gameState, gameEngine, packElement) {
        const effectiveCost = this.getShopPrice(packData.baseCost ?? packData.cost, gameState);
        if (gameState.gold < effectiveCost) {
            if (window.soundManager) window.soundManager.play('cancel', { volume: 0.55 });
            gameEngine.showMessage("Not enough gold!");
            return;
        }
        if (window.soundManager) window.soundManager.play('crumple2', { pitch: 0.95, volume: 0.5 });
        gameEngine.updateGoldAnimated(-effectiveCost, "pack purchase");
        this.shopState.openedPacks.add(packData.type);
        if (packElement) packElement.remove();
        if (typeof PlaytestRecorder !== 'undefined' && PlaytestRecorder.active) {
            PlaytestRecorder.log('shop_pack_purchase', {
                packType: packData.type,
                cost: effectiveCost,
                goldAfter: gameState.gold,
                ante: gameState.ante,
            });
        }
        this.openPack(packData, gameState, gameEngine);
    }

    openPack(packData, gameState, gameEngine) {
        window.balatroEffects?.hideAllTooltips();
        if (this.dom.shopDefaultView) this.dom.shopDefaultView.classList.add('hidden');
        if (this.dom.packOpeningView) this.dom.packOpeningView.classList.remove('hidden');
        if (window.soundManager) {
            window.soundManager.setMusicContext('pack');
            window.soundManager.play('cardFan2', { pitch: 0.9, volume: 0.45 });
        }

        const shopDisplayedIds = this.getShopDisplayedCardIds();
        const packContents = ShopStockGenerator.generatePackContents(packData, gameState, gameEngine.prng, shopDisplayedIds);

        if (!packContents || packContents.length === 0) {
            Logger.error('Failed to generate pack contents');
            gameEngine.showMessage('Failed to open pack - no contents generated');
            return;
        }

        if (typeof PlaytestRecorder !== 'undefined' && PlaytestRecorder.active) {
            PlaytestRecorder.log('pack_open', {
                packType: packData.type,
                cardIds: packContents.map((c) => c.id).filter(Boolean),
            });
        }

        const packRevealedCards = document.getElementById('packRevealedCards');
        if (packRevealedCards) {
            packRevealedCards.innerHTML = '<h4>Pack Contents</h4>';
            packRevealedCards.dataset.packType = packData.type;
            packRevealedCards.dataset.packClaimed = 'false';
            packContents.forEach(cardData => {
                const cardEl = this.createCardElement(cardData, 'pack', gameState, gameEngine);
                if (cardEl) packRevealedCards.appendChild(cardEl);
            });
        }
    }

    closePackOpeningView() {
        window.balatroEffects?.hideAllTooltips();
        const packOpeningView = this.dom.packOpeningView || document.getElementById('packOpeningView');
        const shopDefaultView = this.dom.shopDefaultView || document.getElementById('shopDefaultView');
        if (!packOpeningView || !shopDefaultView) return;

        const revealedContainer = document.getElementById('packRevealedCards');
        const packType = revealedContainer?.dataset?.packType;
        if (packType) {
            this.shopState.openedPacks.add(packType);
            document.getElementById('shopPacksArea')?.querySelectorAll(`[data-pack-type="${packType}"]`).forEach(el => el.remove());
        }

        packOpeningView.classList.add('hidden');
        shopDefaultView.classList.remove('hidden');
        this.dom.shopStage?.classList.remove('pack-opening-stage');
        if (window.soundManager) window.soundManager.setMusicContext('shop');
        if (revealedContainer) {
            revealedContainer.innerHTML = '';
            revealedContainer.dataset.packClaimed = 'false';
        }
    }

    buyArtifact(artifactData, gameState, gameEngine, element) {
        window.balatroEffects?.hideAllTooltips();
        if (this.hasTantalusSpendBlock(gameState, gameEngine, "💰 Tantalus' Curse: Cannot spend gold!", false)) return;
        const effectiveCost = this.getShopPrice(artifactData.baseCost ?? artifactData.cost ?? 10, gameState);
        if (!this.ensureCanAfford(gameState, effectiveCost, gameEngine, "Not enough gold for this artifact!")) return;
        if (window.dataManager) window.dataManager.unlockItem('artifacts', artifactData.id);
        if (window.soundManager) window.soundManager.play('card1', { pitch: 0.9, volume: 0.6 });
        gameEngine.updateGoldAnimated(-effectiveCost, "artifact purchase");
        gameState.artifacts.push(artifactData);
        if (typeof PlaytestRecorder !== 'undefined' && PlaytestRecorder.active) {
            PlaytestRecorder.log('shop_buy_artifact', {
                id: artifactData.id,
                cost: effectiveCost,
                goldAfter: gameState.gold,
                ante: gameState.ante,
            });
        }
        gameEngine.showMessage(`Acquired: ${artifactData.name}!`);
        element.remove();
        gameEngine.applyArtifactEffects();
        gameEngine.updateAllUI();
        if (artifactData.id === 'artifact_temple_market') {
            this.addOneDirectSale(gameState, gameEngine);
        }
    }

    buyCard(card, gameState, gameEngine, element) {
        window.balatroEffects?.hideAllTooltips();
        if (this.hasTantalusSpendBlock(gameState, gameEngine, "💰 Tantalus' Curse: Cannot spend gold!")) return;
        const effectiveCost = this.getShopPrice(card.baseCost ?? card.cost, gameState);
        if (!this.ensureCanAfford(gameState, effectiveCost, gameEngine, "Not enough gold!")) return;
        if (window.soundManager) window.soundManager.play('coin3', { pitch: 0.95 + Math.random() * 0.1, volume: 0.6 });
        gameEngine.updateGoldAnimated(-effectiveCost, "card purchase");
        if (typeof PlaytestRecorder !== 'undefined' && PlaytestRecorder.active) {
            PlaytestRecorder.log('shop_buy_card', {
                id: card.id,
                cost: effectiveCost,
                goldAfter: gameState.gold,
                kind: card instanceof Boon ? 'boon' : (card instanceof WorshipCard ? 'worship' : 'libation'),
            });
        }
        if (window.balatroEffects && element) window.balatroEffects.addCardPurchaseEffect(element);
        this.claimCard(card, gameState, gameEngine, element);
    }

    claimCard(card, gameState, gameEngine, element) {
        window.balatroEffects?.hideAllTooltips();
        const packContainer = element?.closest('#packRevealedCards');
        if (packContainer && packContainer.dataset.packClaimed === 'true') return;

        const isDirectPurchase = element?.parentNode?.id === 'shopDirectSales';
        const boonSlotsFull = card instanceof Boon && gameState.boons.length >= gameState.boonSlots;
        const consumableSlotsFull = (card instanceof WorshipCard || card instanceof LibationCard) && gameState.consumables.length >= gameState.consumableSlots;

        if (boonSlotsFull || consumableSlotsFull) {
            const inventory = card instanceof Boon ? gameState.boons : gameState.consumables;
            if (inventory.length === 0) return;
            this.enterExpulsionMode(card, gameState, gameEngine, element, {
                refundGold: isDirectPurchase ? this.getShopPrice(card.baseCost ?? card.cost, gameState) : undefined,
                packContainer: packContainer || undefined,
                packType: packContainer?.dataset?.packType || undefined
            });
            return;
        }

        if (card instanceof Boon) {
            if (window.dataManager) window.dataManager.unlockItem('boons', card.id);
            gameState.boons.push(card);
        } else if (card instanceof WorshipCard || card instanceof LibationCard) {
            gameState.consumables.push(card);
        }

        if (typeof PlaytestRecorder !== 'undefined' && PlaytestRecorder.active) {
            PlaytestRecorder.log('inventory_gain', {
                id: card.id,
                source: packContainer ? 'pack' : 'direct',
                packType: packContainer?.dataset?.packType || null,
            });
        }

        if (element) element.remove();
        if (packContainer) {
            packContainer.dataset.packClaimed = 'true';
            const packType = packContainer.dataset.packType;
            if (packType && gameState.packs) {
                gameState.packs.push({ type: packType, name: this.getPackName(packType), openedAt: Date.now() });
            }
            setTimeout(() => this.closePackOpeningView(), 150);
        }
        gameEngine.updateAllUI();
    }

    addOneDirectSale(gameState, gameEngine) {
        const container = document.getElementById('shopDirectSales');
        if (!container) return;
        const existingIds = new Set(
            Array.from(container.querySelectorAll('[data-card-id]')).map(el => el.dataset.cardId).filter(Boolean)
        );
        const one = ShopStockGenerator.generateOneDirectSale(gameState, gameEngine.prng, existingIds);
        if (one) {
            const el = this.createCardElement(one.cardData, 'direct', gameState, gameEngine);
            if (el) {
                el.dataset.cardId = one.cardData.id;
                el.classList.add('shop-item-slide-in');
                el.style.animationDelay = `${this.shopItemIndex++ * 0.08}s`;
                container.appendChild(el);
            }
        }
    }

    rerollShop(gameState, gameEngine) {
        const directSalesContainer = document.getElementById('shopDirectSales');
        const hasChronosHourglass = gameState.artifacts?.some(a => a.id === 'sundial_plus');
        if (hasChronosHourglass && !gameState.usedFreeReroll) {
            gameState.usedFreeReroll = true;
            if (window.soundManager) window.soundManager.play('whoosh', { pitch: 0.95, volume: 0.5 });
            gameEngine.showMessage("Used your free reroll from Chronos' Hourglass!");
            if (typeof PlaytestRecorder !== 'undefined' && PlaytestRecorder.active) {
                PlaytestRecorder.log('shop_reroll', { paid: false, reason: 'chronos_hourglass', gold: gameState.gold });
            }
            this.refillDirectSales(gameState, gameEngine, directSalesContainer);
            this.logRerollStock(false, directSalesContainer);
            this.applyShopActionButton(gameState, true);
            return;
        }

        if (gameState.gold < GAME_BALANCE.SHOP_REROLL_COST) {
            if (window.soundManager) window.soundManager.play('cancel', { volume: 0.55 });
            gameEngine.showMessage("Not enough gold to reroll!");
            return;
        }

        if (window.soundManager) window.soundManager.play('whoosh', { pitch: 0.9 + Math.random() * 0.1, volume: 0.5 });
        const items = directSalesContainer?.querySelectorAll('.card') || [];
        items.forEach((item, i) => {
            item.classList.add('shop-item-flip-out');
            item.style.animationDelay = `${i * 0.05}s`;
        });

        setTimeout(() => {
            gameEngine.updateGoldAnimated(-GAME_BALANCE.SHOP_REROLL_COST, "reroll");
            if (typeof PlaytestRecorder !== 'undefined' && PlaytestRecorder.active) {
                PlaytestRecorder.log('shop_reroll', {
                    paid: true,
                    cost: GAME_BALANCE.SHOP_REROLL_COST,
                    goldAfter: gameState.gold,
                });
            }
            this.refillDirectSales(gameState, gameEngine, directSalesContainer);
            this.logRerollStock(true, directSalesContainer);
        }, 400);
    }

    sellCard(cardToSell, gameState, gameEngine) {
        const inventory = cardToSell.type === 'boon' ? gameState.boons : gameState.consumables;
        const cardIndex = inventory.findIndex(c => c.id === cardToSell.id);
        if (cardIndex > -1) {
            const soldCard = inventory.splice(cardIndex, 1)[0];
            let totalGold = soldCard.sellValue;
            gameState.boons.forEach(boon => {
                if (boon.timing && boon.timing.sell) {
                    boon.onTimingEvent('sell', gameState, { cardType: soldCard.type, card: soldCard });
                }
            });
            if (window.soundManager) window.soundManager.play('crumple1', { pitch: 0.9 + Math.random() * 0.1, volume: 0.5 });
            gameEngine.updateGoldAnimated(totalGold, "card sale");
            if (typeof PlaytestRecorder !== 'undefined' && PlaytestRecorder.active) {
                PlaytestRecorder.log('inventory_sell', {
                    id: soldCard.id,
                    gold: totalGold,
                    kind: soldCard.type === 'boon' ? 'boon' : 'consumable',
                });
            }
            gameEngine.showMessage(`Sold ${soldCard.name} for ${totalGold} Gold.`);
            gameEngine.updateAllUI();
        }
    }

    enterExpulsionMode(card, gameState, gameEngine, element, opts = {}) {
        if (this.expulsionPending) return;
        const inventoryType = card instanceof Boon ? 'boon' : 'consumable';
        const inventory = inventoryType === 'boon' ? gameState.boons : gameState.consumables;
        if (inventory.length === 0) return;

        const overlay = this.dom.expulsionOverlay || document.getElementById('expulsionOverlay');
        const titleEl = document.getElementById('expulsionTitle');
        const subtitleEl = document.getElementById('expulsionSubtitle');
        const gridEl = document.getElementById('expulsionCardGrid');
        const cancelBtn = document.getElementById('expulsionCancelBtn');
        // Require DOM before setting expulsionPending — otherwise no overlay and all future buys no-op (soft-lock).
        if (!overlay || !gridEl || !titleEl || !subtitleEl) return;

        this.expulsionPending = { card, element: element || null, gameState, gameEngine, refundGold: opts.refundGold, packContainer: opts.packContainer || null, packType: opts.packType || null };

        titleEl.textContent = 'No Space!';
        subtitleEl.textContent = `Choose one to sell and make room for ${card.name}:`;
        gridEl.innerHTML = '';

        inventory.forEach((c) => {
            const el = c.render();
            el.classList.add('sell-label-visible');
            const sellLabel = el.querySelector('.buy-sell-label.sell');
            if (sellLabel) {
                sellLabel.textContent = `Sell (+${c.sellValue || 1}g)`;
                sellLabel.addEventListener('click', (e) => { e.stopPropagation(); this.completeExpulsion(c); });
            }
            el.addEventListener('click', (e) => { if (!e.target.closest('.buy-sell-label')) this.completeExpulsion(c); });
            gridEl.appendChild(el);
        });

        if (cancelBtn) cancelBtn.onclick = () => this.cancelExpulsion();
        overlay.classList.remove('hidden');
        window.balatroEffects?.hideAllTooltips();
        if (typeof PlaytestRecorder !== 'undefined' && PlaytestRecorder.active) {
            PlaytestRecorder.log('expulsion_open', {
                incomingCard: card?.id || card?.name,
                refundGold: opts.refundGold || 0,
                boonIds: gameState.boons?.map((b) => b.id),
                consumableIds: gameState.consumables?.map((c) => c.id),
            });
        }
    }

    cancelExpulsion() {
        const p = this.expulsionPending;
        if (!p) return;
        if (window.soundManager) window.soundManager.play('cancel', { volume: 0.5 });
        if (p.refundGold && p.gameEngine) {
            p.gameEngine.updateGoldAnimated(p.refundGold, 'refund');
            p.gameEngine.showMessage('Cancelled.');
        }
        this.expulsionPending = null;
        const overlay = this.dom.expulsionOverlay || document.getElementById('expulsionOverlay');
        if (overlay) overlay.classList.add('hidden');
        p.gameEngine?.updateAllUI();
        if (typeof PlaytestRecorder !== 'undefined' && PlaytestRecorder.active) {
            PlaytestRecorder.log('expulsion_cancel', {});
        }
    }

    completeExpulsion(cardToSell) {
        const p = this.expulsionPending;
        if (!p || !p.gameState || !p.gameEngine) return;
        this.sellCard(cardToSell, p.gameState, p.gameEngine);
        const { card, gameState, gameEngine, element, packContainer, packType } = p;
        this.expulsionPending = null;
        const overlay = this.dom.expulsionOverlay || document.getElementById('expulsionOverlay');
        if (overlay) overlay.classList.add('hidden');

        if (card instanceof Boon) {
            if (window.dataManager) window.dataManager.unlockItem('boons', card.id);
            gameState.boons.push(card);
        } else if (card instanceof WorshipCard || card instanceof LibationCard) {
            gameState.consumables.push(card);
        }
        if (element) element.remove();
        gameEngine.updateAllUI();
        if (packContainer) {
            packContainer.dataset.packClaimed = 'true';
            if (packType && gameState.packs) gameState.packs.push({ type: packType, name: this.getPackName(packType), openedAt: Date.now() });
            setTimeout(() => this.closePackOpeningView(), 150);
        }
        if (typeof PlaytestRecorder !== 'undefined' && PlaytestRecorder.active) {
            PlaytestRecorder.log('expulsion_complete', {
                soldId: cardToSell?.id,
                gainedId: card?.id,
                gainedKind: card instanceof Boon ? 'boon' : 'consumable',
            });
        }
    }
}
