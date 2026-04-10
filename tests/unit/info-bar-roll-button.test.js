/**
 * Roll button disable rules (mirrors InfoBarRenderer.updateInfoUI).
 */
import { describe, it, expect } from 'vitest';

function isRollButtonDisabled(gameState) {
  const transitioningToShop = !!gameState.transitioningToShop;
  return gameState.rollsLeft <= 0 || gameState.gameOver || transitioningToShop;
}

describe('InfoBar roll button', () => {
  const base = { rollsLeft: 3, gameOver: false, transitioningToShop: false };

  it('disabled when no rolls left', () => {
    expect(isRollButtonDisabled({ ...base, rollsLeft: 0 })).toBe(true);
  });

  it('disabled when game over', () => {
    expect(isRollButtonDisabled({ ...base, gameOver: true })).toBe(true);
  });

  it('disabled when transitioning to shop', () => {
    expect(isRollButtonDisabled({ ...base, transitioningToShop: true })).toBe(true);
  });

  it('enabled during normal play with rolls', () => {
    expect(isRollButtonDisabled(base)).toBe(false);
  });
});
