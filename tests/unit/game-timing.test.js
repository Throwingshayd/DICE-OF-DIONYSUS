/**
 * Must match game/js/utils/GameTiming.js — scaleDelay(ms, gameSpeed)
 */
import { describe, it, expect } from 'vitest';

function scaleDelay(ms, gameSpeed) {
  const speed = gameSpeed ?? 2;
  return Math.max(1, Math.round(ms / speed));
}

describe('GameTiming.scaleDelay', () => {
  it('normal speed (2) halves 1000ms', () => {
    expect(scaleDelay(1000, 2)).toBe(500);
  });

  it('4x speed quarters delay', () => {
    expect(scaleDelay(800, 4)).toBe(200);
  });

  it('defaults gameSpeed to 2 when undefined', () => {
    expect(scaleDelay(100, undefined)).toBe(50);
  });

  it('never returns below 1', () => {
    expect(scaleDelay(1, 100)).toBe(1);
  });
});
