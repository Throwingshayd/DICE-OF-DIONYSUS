# Soft-lock sweep — static review

**Date:** 2026-04-10  
**Last reviewed:** 2026-04-10 (documentation + `isAwaitingApi` removal)  
**Method:** Code paths for shop, expulsion, cashout→shop, save/resume, roll/score gates — no full playthrough matrix.

---

## Fixed during sweep

| Issue | Location | Risk | Fix |
|-------|-----------|------|-----|
| **Expulsion state stuck** | `ShopUI.enterExpulsionMode` | **High** — `expulsionPending` was set *before* checking `overlay` / `gridEl`. Missing DOM → flag stayed true → all later `enterExpulsionMode` calls no-op at line 511. | Set `expulsionPending` only after required DOM exists; validate `titleEl` / `subtitleEl` too. |
| **Cancel button throw** | Same | **Medium** — `cancelBtn.onclick = …` if `expulsionCancelBtn` missing → throw with `expulsionPending` already set. | `if (cancelBtn) cancelBtn.onclick = …` |

---

## Reviewed — no issue found

| Area | Notes |
|------|--------|
| **`transitioningToShop` / `_cashoutInProgress`** | Cleared in `doOpenShop()`; DOM-missing path calls `doOpenShop()` immediately. Timer chain in `showInterestThenOpenShop` should always finish in browser. |
| **`resumePhase === 'shop'`** | `loadGame()` reopens shop via `UIManager.openShop`; stock regenerates from restored PRNG — no obvious dead end. |
| **Roll / score guards** | Early returns when `gameOver`, no rolls, not rolled, category filled — UI should still offer other actions. |
| **Expulsion cancel** | `expulsionCancelBtn` present in `game/index.html`; refund path in `cancelExpulsion`. |

---

## Removed / clarified (2026-04-10)

| Item | Notes |
|------|--------|
| **`isAwaitingApi`** | **Removed from codebase.** It was never set `true`, so roll/score/disable and `canSave()` checks were dead. Regression guard: if async scoring is added later, use a **named phase flag** (or small state machine) and document it in `KNOWN_ISSUES.md`. |

---

## Residual risks (monitor / playtest)

| Risk | Why |
|------|-----|
| **Cashout timer edge cases** | Long `setTimeout` chains; throttled background tabs could delay shop — should still complete. |
| **Full category + threshold** | `endAnte` / game-over flows — if any branch skips `closeShop` or leaves overlay visible, worth a **seeded E2E** per ante. |
| **Pack claim + expulsion** | Complex; covered partially by shop tests — add repro if player reports stuck after pack. |

---

## Triage when a new report arrives

1. Record **seed**, **query string** (`?test=`), and steps in [`KNOWN_ISSUES.md`](KNOWN_ISSUES.md) § *Soft-lock triage*.
2. If shop/expulsion/pack involved, grep `expulsionPending`, `transitioningToShop`, `_cashoutInProgress` in `ShopUI.js` / `GameEngine.js`.
3. After fix, add entry to [`BUGS_FIXED_LOG.md`](BUGS_FIXED_LOG.md) and update this file if the static model changed.

## Suggested follow-up

- Add **unit or E2E** that opens expulsion with mocked missing overlay *after* fix — expect no `expulsionPending` leak (optional; partial coverage in `tests/unit/shop-expulsion-dom-guard.test.js`).
- When adding async scoring/API, introduce an **explicit** busy/processing flag with tests — do not revive an unused boolean.
