# Known Issues

**Single source of truth** for current bugs, incomplete features, and technical debt.  
Update this file when fixing or discovering issues. See also: `BUGS_FIXED_LOG.md` (historical).

---

## Mechanics Not Implemented

| Issue | Status | Notes |
|-------|--------|------|
| **Mirror enhancement** | Implemented | Scores twice (Balatro Red Seal), including iron/mother-of-pearl. |
| **Parmenides Die** | Implemented | Pantheon swap: scores go to corresponding upper↔lower slot (Ones↔3oK, etc.). |
| **The Heretic** | Implemented | +2 pips/turn (stacks); resets at ante_end or when worship used; pip tooltip on card. |

---

## Boons to Verify

| Boon | Status |
|------|--------|
| Tantalus' Curse | Implemented |
| Golden Touch | Verified | Interest 1 per 3g (GameEngine.calculateInterestOnAmount) |
| Message in a Bottle | Implemented |
| Apollo's Oracle | Implemented |

---

## Technical Debt

| Item | Status |
|------|--------|
| UIManager.js ~1900 lines | Deferred (split not planned) |
| console.log → Logger | Fixed — Main, GameEngine, Die, LibationCard now use Logger |
| Limited automated tests | 1 unit test (dice-roll), 1 E2E (boon-playtest); manual browser primary |
| PWA ServiceWorker | Fixed — registration in Main.js; manifest linked; works on HTTPS/localhost |

---

## Player-Facing

| Item | Status |
|------|--------|
| No in-game tutorial | Fixed — first-run overlay when showTutorial enabled |
| Mobile | Fixed — game scales to viewport; works in any window size |
| Settings options | Fixed — docs/SETTINGS.md documents all options |

---

## When Updating

- **Fix a bug** → Add to BUGS_FIXED_LOG.md, remove from here if listed
- **Implement Mirror** → Remove from "Mechanics Not Implemented"
- **Add tests** → Update "Limited automated tests" status
- **New known issue** → Add to appropriate section above
