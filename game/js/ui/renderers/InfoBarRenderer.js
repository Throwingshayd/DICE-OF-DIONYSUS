/**
 * InfoBarRenderer - Ante, turn, rolls, gold, score displays
 * @module ui/renderers/InfoBarRenderer
 */

const InfoBarRenderer = {
    updateInfoUI(dom, gameState) {
        if (!dom.anteDisplay) return;
        const fmt = (n) => (window.NumberFormat ? window.NumberFormat.display(n) : String(n));
        dom.anteDisplay.textContent = gameState.ante;
        dom.turnDisplay.textContent = gameState.turn;
        dom.turnDisplay.style.color = '';
        dom.turnDisplay.style.fontWeight = '';
        dom.rollsLeft.textContent = `Rolls: ${gameState.rollsLeft}`;
        dom.goldDisplay.textContent = fmt(gameState.gold);
        dom.totalScore.textContent = fmt(gameState.totalScore);
        if (dom.scoreThresholdDisplay) dom.scoreThresholdDisplay.textContent = fmt(gameState.scoreThreshold);

        // In shop mode the single action button becomes "Reroll" — ShopUI.applyShopActionButton
        // owns its enabled/disabled state, so don't overwrite it here.
        const mainGame = document.querySelector('.main-game');
        const shopActive = mainGame?.classList.contains('shop-active');
        if (!shopActive) {
            const transitioningToShop = !!gameState.transitioningToShop;
            dom.rollButton.disabled = gameState.rollsLeft <= 0 || gameState.gameOver || transitioningToShop;
        }
    },

    updateBlindUI(_dom, _gameState, _gameEngine) {
        // Reserved hook: blind UI is currently rendered via scorecard and overlays.
    }
};

if (typeof window !== 'undefined') window.InfoBarRenderer = InfoBarRenderer;
