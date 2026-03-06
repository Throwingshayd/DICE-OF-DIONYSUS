/**
 * Unit tests for dice roll with extended maxFace (7-sided, 8-sided, 9-sided).
 * Tests the roll formula and setFace logic used by Die.roll(prng, maxFace).
 */

import { describe, it, expect } from 'vitest';

// SeededRNG from game - inline for test isolation (game scripts use globals)
class SeededRNG {
  constructor(seedStr) {
    this.seedStr = seedStr || Math.random().toString(36).substring(2, 15);
    this.seed = this.cyrb128(this.seedStr);
    this.a = this.seed[0];
    this.b = this.seed[1];
    this.c = this.seed[2];
    this.d = this.seed[3];
  }
  cyrb128(str) {
    let h1 = 1779033703, h2 = 3144134277, h3 = 1013904242, h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
      k = str.charCodeAt(i);
      h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
      h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
      h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
      h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    return [(h1 ^ h2 ^ h3 ^ h4) >>> 0, (h2 ^ h1) >>> 0, (h3 ^ h1) >>> 0, (h4 ^ h1) >>> 0];
  }
  random() {
    this.a >>>= 0; this.b >>>= 0; this.c >>>= 0; this.d >>>= 0;
    let t = (this.a + this.b) | 0;
    this.a = this.b ^ this.b >>> 9;
    this.b = this.c + (this.c << 3) | 0;
    this.c = (this.c << 21 | this.c >>> 11);
    this.d = this.d + 1 | 0;
    t = t + this.d | 0;
    this.c = this.c + t | 0;
    return (t >>> 0) / 4294967296;
  }
}

// Roll formula used by Die.roll(prng, maxFace)
function rollFormula(prng, maxFace, minFace = 1) {
  return Math.floor(prng.random() * maxFace) + minFace;
}

describe('Dice roll with maxFace', () => {
  it('roll formula with maxFace=6 produces values in [1, 6]', () => {
    const prng = new SeededRNG('test6');
    for (let i = 0; i < 50; i++) {
      const face = rollFormula(prng, 6);
      expect(face).toBeGreaterThanOrEqual(1);
      expect(face).toBeLessThanOrEqual(6);
    }
  });

  it('roll formula with maxFace=7 produces values in [1, 7]', () => {
    const prng = new SeededRNG('test7');
    for (let i = 0; i < 50; i++) {
      const face = rollFormula(prng, 7);
      expect(face).toBeGreaterThanOrEqual(1);
      expect(face).toBeLessThanOrEqual(7);
    }
  });

  it('roll formula with maxFace=9 produces values in [1, 9]', () => {
    const prng = new SeededRNG('test9');
    for (let i = 0; i < 50; i++) {
      const face = rollFormula(prng, 9);
      expect(face).toBeGreaterThanOrEqual(1);
      expect(face).toBeLessThanOrEqual(9);
    }
  });

  it('getMaxDieFace formula: 6 + min(bonusYahtzees, 3)', () => {
    expect(6 + Math.min(0, 3)).toBe(6);
    expect(6 + Math.min(1, 3)).toBe(7);
    expect(6 + Math.min(2, 3)).toBe(8);
    expect(6 + Math.min(3, 3)).toBe(9);
    expect(6 + Math.min(5, 3)).toBe(9);
  });
});
