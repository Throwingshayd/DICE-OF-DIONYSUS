/**
 * InfoBarRenderer - Ante, turn, rolls, gold, score displays
 * @module ui/renderers/InfoBarRenderer
 */

const InfoBarRenderer = {
    updateInfoUI(dom, gameState) {
        if (!dom.anteDisplay) return;
        dom.anteDisplay.textContent = gameState.ante;
        dom.turnDisplay.textContent = gameState.turn;
        dom.turnDisplay.style.color = '';
        dom.turnDisplay.style.fontWeight = '';
        dom.rollsLeft.textContent = `Rolls Left: ${gameState.rollsLeft}`;
        dom.goldDisplay.textContent = gameState.gold;
        dom.totalScore.textContent = gameState.totalScore;
        if (dom.scoreThresholdDisplay) dom.scoreThresholdDisplay.textContent = gameState.scoreThreshold;

        const transitioningToShop = !!gameState.transitioningToShop;
        dom.rollButton.disabled = gameState.rollsLeft <= 0 || gameState.gameOver || gameState.isAwaitingApi || transitioningToShop;
    },

    updateBlindUI(dom, gameState, gameEngine) {
        // Blind display - currently minimal; extend as needed
    }
};

if (typeof window !== 'undefined') window.InfoBarRenderer = InfoBarRenderer;
