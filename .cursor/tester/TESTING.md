# Testing & verification — Dice of Dionysus

Reference for **how to verify** changes: commands, folders, tracking data. Same assistant as `SOUL.md`; this file is scope-specific.

---

## Priorities

1. **Determinism** — Same seed → same outcome for gameplay. Use run `prng` for rolls, shop pool picks, and logic; cosmetic-only jitter may use `Math.random()` (see SOUL.md RNG table).
2. **Regressions** — Document non-obvious fixes; keep repro seeds when useful.
3. **Economy** — Gold, interest, shop affordability when those paths change.
4. **Core loop** — Roll → hold → score → `nextTurn()`; shops at expected turns; ante thresholds.
5. **Boons** — Timing matches design docs; tracking CSVs stay aligned when cards change.

**Real boon playtests (browser, not just unit/E2E code):** **`tracking/BOON_PLAYTEST_PROTOCOL.md`** — seeded `?test=boon:...` runs, matrix-driven sessions, when to use Playwright vs human judgment.

---

## Layout

| Path | Role |
|------|------|
| `tests/unit/` | Vitest — engine, scoring, economy, edge cases |
| `tests/e2e/` | Playwright — full browser flows (add specs as needed) |
| `tracking/` | Canonical spreadsheets — see `tracking/README.md` |
| `test-results/` | Playwright output (gitignored) |

---

## Commands

| Command | Use |
|---------|-----|
| `npm run test` | Unit tests (`vitest run` — exits; use `vitest` alone for watch) |
| `npm run playtest:boons` | E2E boon / flow checks |
| `npm run dev` | Manual smoke (port 3000) |

---

## When to update tracking

| Change | Update |
|--------|--------|
| Add/change a card or boon | `tracking/card_database.csv` |
| New boon category (if used) | `tracking/BOON_SPREADSHEET.csv` |

---

## Read with

- **`.cursor/skills/dice-ship/SKILL.md`** — default verify workflow  
- **`SOUL.md`** — laws and RNG  
- **`.cursor/rules/3-automation.mdc`** — verification protocol  

---

*Use seeds for repro. Do not commit `test-results/`.*
