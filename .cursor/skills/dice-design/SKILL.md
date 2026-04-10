---
name: dice-design
description: >-
  AI-assisted game design workflow for Dice of Dionysus: vision → spec →
  implement → playtest. Use for planning, backlog steering, prompts, and design
  reviews before or alongside code changes.
---

# Dice of Dionysus — AI-assisted design workflow

## When to use

- Shaping **milestones** toward a shippable game (scope, pillars, cut list).
- Turning a fuzzy idea into a **small spec** before touching `game/js/`.
- **Playtest synthesis** → concrete tasks (ties to `8-translator-playtest.mdc`).
- **Consistency / theme** passes on cards, copy, and economy (read-only critique).
- Session planning: what to build **this week** vs defer.

**Implementation and verification** still follow **`.cursor/skills/dice-ship/SKILL.md`** after the spec is clear.

---

## How teams use AI effectively (short list)

| Practice | Why it works | In this repo |
|----------|----------------|--------------|
| **Living north star** | AI and humans align on the same constraints | `SOUL.md`, **`tracking/CURRENT_FOCUS.md`**, **`tracking/GAME_DESIGN_BACKLOG.md`** |
| **Spec before code** | Fewer dead ends and SOUL violations | One-paragraph mechanic + timing + state touchpoints → then dice-ship |
| **Constrained ideation** | Better ideas when boundaries are explicit | “Vanilla JS, `GameEngine.state`, `prng`, no new deps unless approved” |
| **Critic / red-team** | Finds edge cases and tone drift | “Assume hostile player; list soft-locks and boon order bugs” |
| **Playtest → diff** | AI triages notes into file-level tasks | `tracking/KNOWN_ISSUES.md`, `tests/e2e/`, `BOON_PLAYTEST_PROTOCOL.md` |
| **Batch content with schema** | Repeatable card/boon adds | `gameData.js` shape + `CONSOLIDATED_BOON_REFERENCE.md` (when content un-freezes) |

Avoid: open-ended “make the game fun” without pointers to files; ignoring RNG/save rules; skipping verification after changes.

---

## Session flow (recommended)

1. **Read** `tracking/CURRENT_FOCUS.md` + `SOUL.md` § For Cursor / RNG / Routing.
2. **Update or cite** `tracking/GAME_DESIGN_BACKLOG.md` (milestone, acceptance criteria).
3. **Produce a mini-spec** (template below) for anything that touches code.
4. **Hand off to implementation** with explicit file hints via **`.cursor/PATHWAYS.md`**.
5. **Verify** per dice-ship (`lint:fix`, `test`, `build`; `playtest:boons` / dev smoke when relevant).

---

## Mini-spec template (paste into chat or backlog)

```text
## Intent
One sentence player-facing outcome.

## Non-goals
What we are not doing in this slice.

## Rules
Bullet mechanics (timing: roll / turn_start / before_score / …).

## State & data
Which fields in GameEngine.state / gameData IDs change.

## Risks
Soft-locks, save shape, mult order, boon ordering — call each out.

## Done when
Testable checks (manual or automated).
```

---

## Copy-paste prompts (tune numbers/names)

### A — Align on scope

```text
Read tracking/CURRENT_FOCUS.md and tracking/GAME_DESIGN_BACKLOG.md.
Propose the smallest next milestone that moves “finished game” forward.
List tasks as: (1) design decision needed from me, (2) implementation, (3) verification.
Respect SOUL.md: state, prng, save compatibility.
```

### B — Mechanic → implementation map

```text
Here is my design idea: [paste].
Map it to Dice of Dionysus: timing hooks, files (.cursor/PATHWAYS.md), and state fields.
Flag SOUL/RNG/save risks. Do not write code until I confirm the spec.
```

### C — Playtest notes → action list

```text
Here are playtest notes: [paste].
Convert to a numbered list: bug / balance / UX / unclear. For each, name the likely file or subsystem and whether it needs a test.
```

### D — Boon or card consistency review

```text
Review [card name or paste gameData snippet] for: theme fit (Greek myth + dice), clarity of tooltip, interaction with mult order and boon timing, and edge cases. Suggest copy tweaks only unless I ask for code.
```

### E — Cut / ship pass

```text
Assume we ship in [N] weeks. Read GAME_DESIGN_BACKLOG.md and CURRENT_FOCUS.md.
Recommend a cut list (defer / descope / must-ship) with rationale. No new features unless they unblock ship criteria.
```

---

## Related project docs

| Doc | Use |
|-----|-----|
| `.cursor/context/development_workflow.md` | Prompt examples, command templates |
| `.cursor/context/BALATRO_DESIGN_PRINCIPLES.md` | Economy, UX pillars |
| `tracking/BOON_PLAYTEST_PROTOCOL.md` | Human seeded runs |
| `.cursor/tester/TESTING.md` | Automation layout |

---

## Output expectations

When following this skill, the agent should:

- Tie recommendations to **repo paths** and **SOUL constraints**.
- Separate **your decisions** from **implementation** work.
- End with **verification** steps (dice-ship) when any code changed.
