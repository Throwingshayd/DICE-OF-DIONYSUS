# .cursor/context/ — Agent Reference

All agent learning and reference material lives here, unified with `.cursor/rules/` under `.cursor/`.

**Entry point:** `.cursor/skills/dice-ship/SKILL.md` (ship/verify) → `.cursor/skills/dice-design/SKILL.md` (plan/backlog/playtest synthesis) → `SOUL.md` (laws + routing) → `.cursor/PATHWAYS.md` (map) → `0-global.mdc` → `ai_context.yaml` → topic rules / context files. **Human steering:** `tracking/CURRENT_FOCUS.md`, `tracking/GAME_DESIGN_BACKLOG.md`.

## File Guide

| File | Purpose |
|------|---------|
| `ai_context.yaml` | Module map, hot paths, terminology, maintenance hooks |
| `ARCHITECTURE.md` | System structure, file hierarchy, data flow |
| `GOD_METADATA_REFERENCE.md` | God roster, gender/domain for boons |
| `system_map.md` | Architecture audit, God Objects, technical debt |
| `development_workflow.md` | Game mechanics, timing, scoring formulas |
| `CONSOLIDATED_BOON_REFERENCE.md` | Boon patterns, timing system, implementation |
| `CARD_METADATA_REFERENCE.md` | Card types, metadata patterns |
| `BALATRO_DESIGN_PRINCIPLES.md` | Design system, economy, UI/UX |
| `BALATRO_BUTTON_ANALYSIS.md` | UI patterns |
| `definitive_methods_reference.md` | Method docs |
| `performance_notes.md` | Optimization guide |

## When to Update

- Card/boon added → CONSOLIDATED_BOON_REFERENCE, CARD_METADATA_REFERENCE
- Economy/shop changed → BALATRO_DESIGN_PRINCIPLES, development_workflow
- UI pattern added → BALATRO_DESIGN_PRINCIPLES
- Bug fix reveals pattern → development_workflow
- Performance change → performance_notes
