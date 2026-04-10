# Boon interaction matrix

**Source of truth for card list:** `game/js/data/gameData.js` (`CardData.boons`) — **61 boons** as of this doc.  
**Implementation:** `game/js/classes/Boon.js`, **`game/js/classes/boonTimingHandlers.js`** (large `before_score` switch), scoring in `game/js/engine/ScoringEngine.js` + `HandEvaluator.js`, run loop / UI in `game/js/game/GameEngine.js`.  
**Sweep:** Pairwise testing is **not** exhaustive below — use **bucket** + **hotspots** to prioritize seeds.

### Legend — risk tags (⚠)

These flags appear in **bucket rows**, **hotspots**, and the **Assess** column. They mean “pay extra attention here,” not “bug.”


| Tag         | What it flags                                                                                                                                                                                       | Clarification for this game                                                                                                                                                                                                                                  |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **⚠ scale** | Numbers grow **without a hard cap** from run-wide stats (total score, stacked permanent modifiers, or “×2 all boon effects”) so late-ante scores can spike **faster than linear** with other boons. | Typical sources: **Journey of Perseus** (pips from `totalScore`), **Trojan Horse** after turn 10 (doubles **other boons’** effects), **Symposium** / **Eruption** stacks, **Chaos** doubling favour **gains**. Ask: “Is this fun runaway or broken runaway?” |
| **⚠ order** | Outcome depends on **boon slot order**, **left-to-right application**, **copy/double-fire** semantics, or **which timing runs first**. Same build, different order → different power.               | **Proteus** copies the **immediate left** slot only. **Narcissus** doubles **how/when** other boons fire and stacks with **Eruption**’s “triggers this turn” logic. Test permutations, not single ordering.                                                  |
| **⚠ gold**  | **Spend is blocked**, **gold swings** hard, or **interest / refunds** interact with special rules. Shop and packs are the usual failure surface.                                                    | **Tantalus**: cannot spend gold while active — must not soft-lock purchases. **Gambler’s Charm**: variance can strand **Misery** (×2 favour at 0 gold) builds. Verify refunds after cancelled expulsion.                                                     |
| **⚠ rules** | Changes **what category counts as**, **which dice count**, or **how the pantheon maps** — logic lives in **HandEvaluator** / **ScoringEngine** / **GameEngine**, not only `Boon.js`.                | **Dionysus + Hydra**, **Bellows + Parmenides**, **Medusa** locks / lower sanctum — pairwise bugs show up as **wrong hand type** or **wrong slot scored**.                                                                                                    |


### Legend — timing shorthand


| Tag  | Engine hook    |
| ---- | -------------- |
| `b`  | `before_score` |
| `a`  | `after_score`  |
| `ar` | `after_roll`   |
| `ts` | `turn_start`   |
| `te` | `turn_end`     |
| `ae` | `ante_end`     |
| `sl` | `sell`         |


### Legend — **Assess** column (table only)


| Value            | Meaning                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------ |
| `ok`             | Static review only — no extra ⚠ tag; still playtest if you touch related engine code.      |
| `review`         | Worth a **seeded run** or unit test — interaction or edge case plausible.                  |
| **scale**        | Same idea as **⚠ scale** (shown bold in the index table) — tune or document power ceiling. |
| **order**        | Same idea as **⚠ order** — slot order / double-fire / copy semantics need explicit tests.  |
| ⚠ gold / ⚠ rules | Same definitions as in **Legend — risk tags** above; kept on the row for quick scanning.   |


---

## Mechanic buckets (for sorting / testing)


| Code   | Bucket                                                  | Test focus                                                                                                                                                  |
| ------ | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **R1** | Roll count / reroll economy                             | Kronos × Apollo × Chaos × Prometheus × Narcissus × Midnight Oil                                                                                             |
| **R2** | Pips from rerolls / rolls this turn                     | Gambler × Sisyphus × Marathon × Forge × Icarus                                                                                                              |
| **P1** | Flat / conditional pips (dice pattern)                  | Hestias, Lethe, Hydra, Compass, Prime, Locksmith, Doubling, Smog, Cerberus, Typhon, Early Bird, First Blood, Assembly, Heretic stack, Gold Standard, Nyxian |
| **P2** | Pips from **run totals** (total score, threshold, ante) | **Journey of Perseus ⚠ scale**, Trojan Horse, Message in a Bottle, Odyssey                                                                                  |
| **F1** | Favour additive / fractional                            | Tantalus, Symposium, Mt Olympus, Eruption, Ascetic, Zealot, Pegasus, Carillon                                                                               |
| **F2** | Favour multiplicative / "double gains"                  | Chaos Primordial, Misery, Trojan (late), Carillon secret                                                                                                    |
| **G1** | Gold generation / interest / spend lock                 | Charon, Midas Touch, Gambler's Charm, Golden Touch, Cornucopia, Betrayal, Merchant, Achilles                                                                |
| **D1** | Die values / holds / locks                              | Demeter, Medusa, Reckless, Lucky Dice Bag, Parmenides                                                                                                       |
| **C1** | Category / pantheon rule change                         | Dionysus Revelry, Bellows of War, Medusa (lower san)                                                                                                        |
| **S1** | Copy / double execution                                 | **Proteus ⚠ order**, **Narcissus ⚠ order**                                                                                                                  |
| **S2** | Destroy / random loss / transforms                      | Pandora's Jar, Betrayal, Mortal Vineyard                                                                                                                    |
| **A1** | Ante-end payouts only                                   | Cornucopia, Odyssey, Message, Betrayal                                                                                                                      |
| **X1** | Special hooks                                           | Cycle of Seasons (worship), Apollo Oracle (−20% input), Icarus break, Pandora timing                                                                        |


---

## Full index (all 61 boons)

Alphabetical by `id`. **Assess** values are defined under **Legend — Assess column** above (`ok`, `review`, **scale**, **order**, or inline ⚠ gold / ⚠ rules).


| id                      | name                     | Bucket | Timings      | Assess    | Interaction hotspots                                                   |
| ----------------------- | ------------------------ | ------ | ------------ | --------- | ---------------------------------------------------------------------- |
| achilles_heel           | Achilles' Heel           | P1+G1  | b, ts        | review    | Gold drain every roll × Tantalus spend lock                            |
| apollos_oracle          | Apollo's Oracle          | R1+X1  | ts, b        | review    | +rolls with Narcissus (−2); "score input" with UI — verify consistency |
| assembly_of_heroes      | Assembly of Heroes       | P1     | b            | ok        | Slot count × Ascetic (empty slots)                                     |
| ascetics_vow            | Ascetic's Vow            | F1     | b            | review    | Empty slots × full Assembly condition                                  |
| betrayal_by_paris       | Betrayal by Paris        | S2+A1  | ae           | review    | Random destroy × Proteus / Narcissus ordering                          |
| bellows_of_war          | Bellows of War           | C1     | —            | ⚠ rules   | 3/4 Kind virtual die × HandEvaluator; × Parmenides swap                |
| carillon_of_the_muses   | Carillon of the Muses    | F1+F2  | b            | review    | Secret ×2.5 mult × Chaos "double favour gains" — order                 |
| cerberus_watch          | Cerberus' Watch          | P1     | b            | ok        | Held tracking × Reckless (no hold) = conflict                          |
| chaos_primordial        | Chaos Primordial         | R1+F2  | b, ts        | review    | × Carillon, Symposium stacks; −1 roll stacks                           |
| charons_ferry_fare      | Charon's Ferry Fare      | G1     | a            | ok        | Scratch rules must not double-dip                                      |
| cornucopia_of_ploutos   | Cornucopia of Ploutos    | G1+A1  | ae           | ok        | × interest / Golden Touch                                              |
| cycle_of_seasons        | The Cycle of Seasons     | X1     | —            | review    | Worship hooks — × Zealot "last worship"                                |
| demeters_harvest        | Demeter's Harvest        | D1     | ts           | ok        | Permanent +1 face × enhancement libs                                   |
| dionysus_revelry        | Dionysus' Revelry        | C1     | —            | ⚠ rules   | 2-pair→FH × Hydra "exactly 2 pairs"                                    |
| divine_synergy          | Divine Synergy           | P1     | b            | ok        | Rarity counts × duplicate rarities                                     |
| doubling_season         | Doubling Season          | P1     | b            | ok        | Even/odd × Lethe (ignored lows)                                        |
| early_bird              | Early Bird Gets the Worm | P1+G1  | b, a         | ok        | Turn bands × Kronos random turn length                                 |
| eruption_of_etna        | Eruption of Etna         | F1     | b            | review    | `boonTriggersThisTurn` × Narcissus double-fire                         |
| first_blood             | First Blood              | P1     | b            | ok        | First score ante × Odyssey perfect run                                 |
| forge_of_hephaestus     | Forge of Hephaestus      | R2+F1  | b            | ok        | Unused rerolls × Gambler / Sisyphus                                    |
| gamblers_charm          | Gambler's Charm          | G1     | a            | ⚠ gold    | Variance × low gold Misery                                             |
| golden_touch            | Golden Touch             | G1     | ts           | ok        | Interest × Cornucopia ante                                             |
| gold_standard           | Gold Standard            | P1     | b            | review    | "Gold enhancements" definition × libs                                  |
| hestias_hearth          | Hestia's Hearth          | P1     | b            | ok        | All odd/even × Lethe, Smog                                             |
| hydras_heads            | Hydra's Heads            | P1+C1  | b            | ⚠ rules   | Exactly 2 pairs × Dionysus FH bending                                  |
| icarus_wings            | Icarus' Wings            | R2+P1  | b, te        | review    | Unused rerolls × Forge; break RNG                                      |
| journey_of_perseus      | Journey of Perseus       | P2     | b            | **scale** | `floor(totalScore/100)*10` pips — × Trojan × mult stack                |
| kronos_hourglass        | Kronos' Hourglass        | R1     | ts           | review    | Random rolls × all "per turn" boons                                    |
| lethe_waters            | Lethe Waters             | P1+D1  | b            | ok        | Ignores ≤2 × Doubling, Hestias                                         |
| lucky_dice_bag          | Lucky Dice Bag           | D1     | ar           | review    | Auto-reroll 1s × roll count / Sisyphus                                 |
| marathon_runner         | Marathon Runner          | R2+P1  | b, ar, a     | review    | Destroy at 42+ × scratch rules                                         |
| mathematicians_compass  | Mathematician's Compass  | P1     | b            | ok        | Sum mod 10 × Smog last-roll                                            |
| medusas_gaze            | Medusa's Gaze            | D1+C1  | ar, b        | ⚠ rules   | 6 lock × reroll boons; lower san × category                            |
| message_in_a_bottle     | Message in a Bottle      | P2+A1  | ae           | review    | Solo ante × other ae boons                                             |
| midas_touch             | Midas Touch              | P1+G1  | b            | ok        | Gold scaling × Tantalus                                                |
| midnight_oil            | Midnight Oil             | R1+P1  | b, ts        | review    | −rolls × Narcissus, Chaos, Prometheus                                  |
| misery                  | Misery                   | F2     | b            | ok        | 0 gold × Tantalus (can't spend) synergy?                               |
| mortal_vineyard         | Mortal Vineyard          | S2     | sl           | review    | Sell boon → libation × Merchant sell bonus                             |
| mt_olympus              | Mt. Olympus              | F1     | b            | ok        | Worship consumed count                                                 |
| nyxian_seduction        | Nyxian Seduction         | P1     | b            | review    | Chance category + god favour down                                      |
| pandoras_jar            | Pandora's Jar            | S2     | b, ts        | review    | Destroy every 3rd turn × Betrayal                                      |
| parmenides_die          | Parmenides Die           | D1     | ts           | ⚠ rules   | Pantheon swap × Bellows, category UI                                   |
| pegasus_flight          | Pegasus' Flight          | F1     | b            | ok        | 6+ faces × Demeter                                                     |
| prime_time              | Prime Time               | P1     | b            | ok        | Prime dice × mathematician                                             |
| prometheus_gift         | Prometheus' Gift         | R1+F1  | b, ts        | review    | −roll × Kronos roll count                                              |
| proteus_disguise        | Proteus' Disguise        | S1     | b, a, ts, te | **order** | Copies **left** boon — slot order matrix                               |
| reckless_abandon        | Reckless Abandon         | P1+D1  | b, ar        | ⚠ rules   | No hold × Cerberus, Locksmith                                          |
| reflection_of_narcissus | Reflection of Narcissus  | S1+R1  | ts           | **order** | Double triggers + −2 rolls — × Eruption count                          |
| sisyphus_boulder        | Sisyphus' Boulder        | R2     | b            | ok        | Reroll count this turn                                                 |
| smog_of_morpheus        | Smog of Morpheus         | D1     | ar           | ok        | Final roll 2/4→3 × Lethe                                               |
| symmetry                | Symmetry                 | F1     | ar, b        | review    | Palindrome stack × doubling run                                        |
| tantalus_curse          | Tantalus' Curse          | F1+G1  | b            | ⚠ gold    | Cannot spend gold — shop/packs                                         |
| the_gambler             | The Gambler              | R2     | b            | ok        | Rerolls remaining × inventory phase                                    |
| the_heretic             | The Heretic              | P1     | b, ts, ae    | review    | Stack reset worship/ante_end                                           |
| the_locksmith           | The Locksmith            | P1+D1  | b, ar, ts    | ok        | Hold turns × Reckless                                                  |
| the_merchant            | The Merchant             | G1     | sl           | ok        | Sell worship/lib +1g                                                   |
| the_odyssey             | The Odyssey              | P2+A1  | ae           | review    | Perfect grid pips × Parmenides fill                                    |
| the_symposium           | The Symposium            | F1     | b            | review    | Permanent +0.05 × Chaos double                                         |
| the_zealot              | The Zealot               | F1     | b            | review    | Last worship × Cycle of Seasons                                        |
| trojan_horse            | The Trojan Horse         | F2+P2  | b            | **scale** | Turn 10+ ×2 **all** boon effects — explosive with Perseus              |
| typhon                  | Typhon                   | P2     | ar, b        | review    | All 1s first roll × threshold                                          |


**Row count:** 61 data rows in the table above — one per `id` in `CardData.boons`.

---

## Spotlight — **Journey of Perseus** (P2, ⚠ scale) — formula, code, **design verdict**


| Field | Detail |
|-------|--------|
| **id** | `journey_of_perseus` |
| **Timing** | `before_score` |
| **Formula** | `Math.floor((totalScore \|\| 0) / 100) * 10` additive **pips** each `before_score` (0 until `totalScore` ≥ 100). |
| **Code** | [`boonTimingHandlers.js`](../game/js/classes/boonTimingHandlers.js) — `case 'journey_of_perseus':` mutates `result.pips`, `boon.dynamicStats.pips`, optional `showMessage`. |
| **Card copy** | See [`gameData.js`](../game/js/data/gameData.js) (`journey_of_perseus`) — should stay aligned with formula above. |

**Interaction note:** **`the_trojan_horse`** (turn ≥ 10) doubles **other boons’ effects** — Perseus pip injection is a prime **compounding** partner (see priority combo **#1** below). **⚠ scale** is intentional for “big run” fantasy; the risk is **unbounded growth** relative to other builds.

### Design verdict (2026-04-10)

| Verdict | **Keep** |
|---------|----------|
| **Rationale** | Mechanic is clear, code-local, and matches “scaling with odyssey / total progress” fantasy. No bug filed; risk is **balance**, not correctness. |
| **Tuning lever (optional)** | If speedruns or Trojan+Perseus become dominant: consider a **soft cap** on Perseus bonus per score, or exclude Perseus from Trojan’s ×2 (design choice — would need card text + player comms). |
| **Playtest** | Priority row **#1** (Perseus + Trojan, turn 9→11) remains the **mandatory** seeded check before shipping changes to either card or `before_score` ordering. |

---

## Spotlight — **Proteus** + **Narcissus** (⚠ order × ⚠ scale risk)


| Boon                        | Role                                                                                                          | Assessment                                                                                                                                                                                                                                                                                                                |
| --------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **proteus_disguise**        | Copies the **boon immediately to its left** (Blueprint-style) across multiple timings (`b`, `a`, `ts`, `te`). | **High order risk:** Moving Proteus or neighbors changes **which** effect runs twice or not at all. Leftmost slot = **nothing to copy** (verify defined behaviour). Chains (A–B–Proteus) need explicit tests.                                                                                                             |
| **reflection_of_narcissus** | **Doubles boon triggers** (−2 rolls per `turn_start`).                                                        | **High order + scale risk:** Anything that counts “how many boons fired this turn” (**Eruption of Etna**) or assumes a single pass may **double-count** or **double-apply**. Stacks with roll modifiers (**Apollo**, **Chaos**, **Prometheus**, **Midnight Oil**) — floor at **≥1 roll** if implemented; confirm in code. |
| **Together**                | Proteus copying a “double-fire” engine or Narcissus doubling a copied effect                                  | **Explosive and hard to reason about** — treat as **mandatory** seeded combo after either card changes. Prefer **documented slot order** in playtest notes when filing bugs.                                                                                                                                              |


---

## Priority combinations — assessed

Static assessment (code + design intent). **Severity:** impact if wrong. **Verify:** what to check in-game or in tests.


| #   | Combo                                                                                | Tags         | Severity        | Assessment                                                                                                                                                                                                                                                       | Verify                                                                                                                                                                                        |
| --- | ------------------------------------------------------------------------------------ | ------------ | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **journey_of_perseus + trojan_horse** (turn ≥ 10)                                    | scale        | **Critical**    | Perseus pips scale with **cumulative `totalScore`**; Trojan **×2’s other boons’ effects**. Together this is the strongest documented **compounding** pair — often **intentionally exciting**, easy to overshoot balance.                                         | Fixed seed from turn 9→11: log pips from Perseus before/after Trojan threshold; decide max acceptable pip contribution per score.                                                             |
| 2   | **reflection_of_narcissus + eruption_of_etna**                                       | order, scale | **High**        | Eruption keys off **boon trigger count**; Narcissus **doubles triggers**. Risk: **under-** or **over-stacking** ×Favour if counter doesn’t match designer intent.                                                                                                | Count triggers with/without Narcissus on same board state; compare to tooltip / player expectation.                                                                                           |
| 3   | **proteus_disguise** + **chaos_primordial** / **kronos_hourglass** / **the_heretic** | order        | **High**        | Proteus **mirrors** roll-changing and stacking rules; wrong slot = different **rolls per turn** and different **pip stacks**. Heretic’s reset timing vs copied timing must stay consistent.                                                                      | Three runs: Proteus **right of** each target vs **wrong** neighbor; rolls and stacks should match copy rules only when left neighbor is correct.                                              |
| 4   | **parmenides_die + bellows_of_war**                                                  | rules        | **High**        | Parmenides **remaps** which physical category receives the score; Bellows **changes effective die count** for 3/4 Kind. Interaction must not **double-apply** or **drop** virtual dice.                                                                          | Score 3K/4K with both equipped; UI category + final score vs HandEvaluator output.                                                                                                            |
| 5   | **dionysus_revelry + hydras_heads**                                                  | rules        | **Medium–High** | Dionysus allows **2-pair → Full House** scoring; Hydra rewards **exactly two pairs** as pattern. Designer question: does FH-from-2-pair **count** as “exactly 2 pairs” for Hydra? Code should match **card text**.                                               | One hand that is 2-pair only: try scoring as FH (if allowed) and check Hydra proc.                                                                                                            |
| 6   | **tantalus_curse** (solo + shop)                                                     | gold         | **High**        | Spend lock must **never** block **Cancel** / **sell** / run progression; only **gold spend** (per design).                                                                                                                                                       | Full shop: buy attempt → cancel; pack → expulsion cancel; ensure no stuck overlay (see `SOFT_LOCK_SWEEP.md`).                                                                                 |
| 7   | **reckless_abandon + cerberus_watch + the_locksmith**                                | rules        | **Medium**      | Reckless **disables holds**; Cerberus and Locksmith **depend on hold behaviour**. Expect **Cerberus/Locksmith contribute little or nothing** — confirm **no throws** and **no misleading tooltips**.                                                             | Score several turns: 0 holds; tooltips and pips should stay consistent (0 bonus OK).                                                                                                          |
| 8   | **proteus_disguise + reflection_of_narcissus**                                       | order, scale | **Critical**    | **Stack of #2–3 risks:** Narcissus changes **how often** neighbors run; Proteus **copies** one neighbor’s timings. Order bugs show up as **wrong pip/favour totals** or **double application** of the copied boon. Not a substitute for testing #2 and #3 alone. | Same seed, two layouts: (a) Proteus immediately **left** of a high-impact boon with Narcissus elsewhere; (b) Narcissus + Proteus adjacent — compare totals and trigger counts to expectation. |


### Other highlighted rows (quick assessment)


| Boon(s)                                               | Tags         | Note                                                                                                                                                        |
| ----------------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **chaos_primordial + carillon_of_the_muses** (secret) | scale, order | “Double favour **gains**” vs **×2.5 mult** secret — order of operations must match **+ then ×** (`SOUL.md`).                                                |
| **gamblers_charm + misery**                           | gold         | Charm can **strip** gold; Misery wants **0** — possible **anti-synergy** or **accidental synergy**; worth one seed.                                         |
| **apollos_oracle + reflection_of_narcissus**          | order        | +rolls and −rolls **stack**; confirm **minimum rolls** (floor) and UI **score input −20%** still correct when oracle logic runs under double-fire.          |
| **betrayal_by_paris + pandoras_jar**                  | order, rules | Two **destroy** sources — ante-end vs turn timing; ensure **deterministic order** and no duplicate destroy of the same instance.                            |
| **journey_of_perseus** (solo)                         | scale        | Even without Trojan, pips grow ~linearly in `**totalScore`**; late ante **multiplies** with any global ×Favour — document “intended ceiling” for speedruns. |
| **trojan_horse** (solo, turn ≥ 10)                    | scale        | ×2 on **all** other boons is a **meta-multiplier**; pairs with almost any pip/favour engine — use matrix **P2** / **F1** rows as checklist.                 |


---

## Maintenance

- When adding a boon: new row here + update `tracking/card_database.csv` and context boon docs per `SOUL.md`.
- Re-verify count: `CardData.boons.length` in `gameData.js` should match the table.

---

## Rounding off — **real** boon testing (next step)

This matrix is a **map**, not proof. To test boons **for real** (browser, player-visible outcomes — not code-vs-code):

1. Follow `**tracking/BOON_PLAYTEST_PROTOCOL.md`** — layers **human → checklist → Playwright**.
2. Use `**/?test=boon:id1,id2`** (+ optional `**&enhance=`**) and a **logged seed** for every priority row.
3. Use `**npm run playtest:boons`** only after happy paths are confirmed by hand, to lock regressions.

That protocol is the handoff from “what to test” (here) to “how we actually run it.”