/**
 * Regression: expulsionPending must only be set after required DOM exists
 * (mirrors ShopUI.enterExpulsionMode guard — see game/js/ui/ShopUI.js).
 */
import { describe, it, expect } from 'vitest';

function expulsionDomReady({ overlay, gridEl, titleEl, subtitleEl }) {
  return !!(overlay && gridEl && titleEl && subtitleEl);
}

describe('Shop expulsion DOM guard', () => {
  it('returns false if any required node is missing', () => {
    expect(expulsionDomReady({})).toBe(false);
    expect(expulsionDomReady({ overlay: {}, gridEl: {}, titleEl: {} })).toBe(false);
    expect(expulsionDomReady({ overlay: {}, gridEl: {}, subtitleEl: {} })).toBe(false);
  });

  it('returns true only when overlay, grid, title, and subtitle are all truthy', () => {
    const nodes = { overlay: {}, gridEl: {}, titleEl: {}, subtitleEl: {} };
    expect(expulsionDomReady(nodes)).toBe(true);
  });
});
