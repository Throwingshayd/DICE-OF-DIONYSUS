/**
 * Mirrors ScoringEngine.buildContext — pure shape contract for scoring pipeline.
 */
import { describe, it, expect } from 'vitest';

function buildContext(state) {
  return {
    pipsBonuses: state.pipsBonuses || {},
    boons: state.boons || [],
    activeBlind: state.activeBlind || null,
    unlockedCategories: state.unlockedCategories || {}
  };
}

describe('ScoringEngine.buildContext shape', () => {
  it('fills defaults for empty state', () => {
    const c = buildContext({});
    expect(c.pipsBonuses).toEqual({});
    expect(c.boons).toEqual([]);
    expect(c.activeBlind).toBe(null);
    expect(c.unlockedCategories).toEqual({});
  });

  it('preserves provided fields', () => {
    const state = {
      pipsBonuses: { x: 1 },
      boons: [{ id: 'a' }],
      activeBlind: 'boss',
      unlockedCategories: { Sevens: true }
    };
    expect(buildContext(state)).toEqual(state);
  });
});
