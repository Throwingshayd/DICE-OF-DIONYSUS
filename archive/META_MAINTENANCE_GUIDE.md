# 📚 Meta/ Maintenance Guide
**Keeping AI Learning Files Current**

> **Purpose:** Ensure meta/ files stay synchronized with game changes  
> **Audience:** Developers and AI assistants working on Dice of Dionysus  
> **Last Updated:** October 16, 2025

---

## 🎯 Core Principle

**ALL game parameters, patterns, and design principles belong in `meta/` for AI learning.**

When you update the game, update `meta/`. When AI learns from `meta/`, it gives better assistance.

---

## 📁 Meta/ File Structure

```
meta/
├── ai_context.yaml                    # Project structure, rules, references
├── development_workflow.md            # MASTER GUIDE - mechanics, timing, formulas
├── CONSOLIDATED_BOON_REFERENCE.md     # All boon patterns and implementations
├── BALATRO_DESIGN_PRINCIPLES.md       # Design system, UI patterns, economy
├── definitive_methods_reference.md    # Method documentation
├── performance_notes.md               # Performance guidelines
├── BALATRO_BUTTON_ANALYSIS.md         # UI/UX patterns
└── META_MAINTENANCE_GUIDE.md          # This file
```

---

## 🔄 Update Triggers → Actions

### When Adding/Updating Boons

**Files to Update:**
1. `meta/CONSOLIDATED_BOON_REFERENCE.md`
   - Add implementation pattern if new category
   - Add example code
   - Update category list if needed

**Example:**
```markdown
### Pattern X: New Mechanic Type
\```javascript
case 'new_boon_id':
    // Implementation
    result.pips += bonus;
    window.game?.showMessage?.("Boon Name: Effect!");
    break;
\```
```

**Also Update:**
- `js/data/gameData.js` (boon definition)
- `js/classes/Joker.js` (implementation)
- `tracking/card_database.csv` (documentation)
- `tracking/BOON_SPREADSHEET.csv` (if new category)

---

### When Changing Shop/Economy

**Files to Update:**
1. `meta/BALATRO_DESIGN_PRINCIPLES.md`
   - Update "Economy System" section
   - Update costs/prices
   - Update shop flow if mechanics changed

2. `meta/development_workflow.md`
   - Update economy constants
   - Update shop timing if changed

**Example Change:**
```yaml
# Before: Reroll cost 2g
# After: Reroll cost 3g
# Update both files with new cost and reasoning
```

**Also Update:**
- `js/config/GameConstants.js` (constants)
- `js/ui/UIManager.js` (shop logic)
- `CHANGELOG.md` (version history)

---

### When Fixing Critical Bugs

**Files to Update:**
1. `meta/development_workflow.md`
   - Update "Critical Bug Fixes" section
   - Document fix pattern for future reference

2. `meta/CONSOLIDATED_BOON_REFERENCE.md`
   - If bug was timing-related, update timing rules
   - If bug was pattern-related, update pattern

**Example:**
```markdown
### Kronos' Hourglass (Oct 16, 2025)
**Problem:** Infinite rolls  
**Cause:** turn_start called in executeRoll()  
**Fix:** Moved to nextTurn() AFTER setting default rolls  
**Pattern:** turn_start MUST be in nextTurn() ONLY
```

**Also Update:**
- `tracking/BUGS_FIXED_LOG.md` (bug history)
- `CHANGELOG.md` (version notes)

---

### When Adding UI Patterns

**Files to Update:**
1. `meta/BALATRO_DESIGN_PRINCIPLES.md`
   - Add to appropriate section (Animation, Polish, etc.)
   - Include code example
   - Explain design reasoning

**Example:**
```markdown
### Ripple Effect Pattern
\```javascript
createRippleEffect(button) {
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
}
\```
```

**Also Update:**
- `css/styles.css` or `css/juice-effects.css` (styles)
- `js/ui/UIManager.js` (implementation)

---

### When Changing Game Mechanics

**Files to Update:**
1. `meta/development_workflow.md`
   - Update relevant section (Scoring, Timing, Enhancement, etc.)
   - Update formulas if changed
   - Update edge case protections if added

2. `meta/ai_context.yaml`
   - Update gameMechanics section if major change

**Example:**
```javascript
// Scoring formula changed
// Update both development_workflow.md and ai_context.yaml
FINAL = totalPips × (additiveFavour × totalMultiplier)
```

**Also Update:**
- `js/game/GameEngine.js` (logic)
- `js/config/ScoringConstants.js` (if constants changed)

---

### When Changing Performance Targets

**Files to Update:**
1. `meta/performance_notes.md`
   - Document optimization technique
   - Include before/after benchmarks
   - Note any tradeoffs

2. `meta/ai_context.yaml`
   - Update performance.targets if changed

**Also Update:**
- Relevant implementation file
- `CHANGELOG.md` if user-facing

---

## 🤖 AI Assistant Workflow

### Before Making Changes
1. Read relevant meta/ file(s)
2. Understand current patterns
3. Plan changes that fit existing system

### While Making Changes
1. Implement in code files (js/, css/, etc.)
2. Update meta/ files in SAME session
3. Keep meta/ docs synchronized

### After Making Changes
1. Verify meta/ files are current
2. Test that patterns still work
3. Document in CHANGELOG.md

---

## ✅ Meta/ Update Checklist

Use this checklist when making changes:

### New Boon Added?
- [ ] Updated `meta/CONSOLIDATED_BOON_REFERENCE.md`
- [ ] Added to `tracking/BOON_SPREADSHEET.csv`
- [ ] Updated `tracking/card_database.csv`

### Shop/Economy Changed?
- [ ] Updated `meta/BALATRO_DESIGN_PRINCIPLES.md`
- [ ] Updated `meta/development_workflow.md`
- [ ] Updated cost constants in relevant files

### Bug Fixed?
- [ ] Updated `meta/development_workflow.md` (if pattern-related)
- [ ] Updated `tracking/BUGS_FIXED_LOG.md`
- [ ] Updated `CHANGELOG.md`

### UI Pattern Added?
- [ ] Updated `meta/BALATRO_DESIGN_PRINCIPLES.md`
- [ ] Included code example
- [ ] Documented design reasoning

### Game Mechanic Changed?
- [ ] Updated `meta/development_workflow.md`
- [ ] Updated formulas/rules as needed
- [ ] Updated `meta/ai_context.yaml` if major

### Performance Optimization?
- [ ] Updated `meta/performance_notes.md`
- [ ] Included benchmarks
- [ ] Documented technique for reuse

---

## 📝 Documentation Standards

### Writing for AI Learning

**DO:**
- ✅ Use clear, specific examples
- ✅ Include code snippets
- ✅ Explain WHY, not just WHAT
- ✅ Document edge cases
- ✅ Use consistent formatting

**DON'T:**
- ❌ Be vague ("do it the right way")
- ❌ Assume knowledge
- ❌ Skip code examples
- ❌ Leave patterns undocumented

### Example - Good Documentation:
```markdown
### Pattern: Scaling with Gold
Use for boons that increase effect based on gold amount.

\```javascript
case 'midas_touch':
    // Calculate pips based on current gold
    const goldBonus = Math.floor(gameState.gold / 5);
    const pipBonus = goldBonus * 1;
    result.pips += pipBonus;
    
    // Show current bonus in UI
    this.dynamicStats.pips = pipBonus;
    break;
\```

**Edge Cases:**
- Clamp to prevent negative values
- Consider gold fluctuation during turn
- Test with extreme gold amounts (0, 1000+)
```

### Example - Bad Documentation:
```markdown
### Midas Touch
Adds pips based on gold. See implementation.
```

---

## 🔍 Meta/ File Quick Reference

### When to Use Each File:

| Need to... | Use File... |
|------------|-------------|
| Add boon pattern | `CONSOLIDATED_BOON_REFERENCE.md` |
| Change economy | `BALATRO_DESIGN_PRINCIPLES.md` |
| Fix timing bug | `development_workflow.md` + `CONSOLIDATED_BOON_REFERENCE.md` |
| Add UI pattern | `BALATRO_DESIGN_PRINCIPLES.md` |
| Document method | `definitive_methods_reference.md` |
| Optimize code | `performance_notes.md` |
| Update rules | `ai_context.yaml` |

---

## 🚨 Critical Rules

### 1. Always Update Meta/ in Same Session
Don't add a feature and "plan to document later" - do it NOW while context is fresh.

### 2. Keep Examples Current
If you change an implementation, update the example in meta/ too.

### 3. Document Edge Cases
If you fix a bug, document the edge case so AI assistants avoid it.

### 4. Explain Reasoning
Don't just show WHAT, explain WHY. Help AI understand design decisions.

### 5. Use Consistent Terminology
Follow terminology in `ai_context.yaml` - no exceptions.

---

## 🎯 Meta/ Quality Standards

### Good Meta/ Documentation:
- ✅ Complete code examples
- ✅ Edge cases documented
- ✅ Design reasoning explained
- ✅ Links to related files
- ✅ Current and accurate

### Poor Meta/ Documentation:
- ❌ Vague descriptions
- ❌ No code examples
- ❌ Outdated information
- ❌ Missing edge cases
- ❌ No context

---

## 🔄 Automated Maintenance (Future)

### Possible Automation:
1. **Git Hook** - Prompt for meta/ update when game files change
2. **Linter** - Check for undocumented patterns
3. **Tests** - Verify meta/ examples compile
4. **CI** - Detect outdated documentation

### For Now:
Manual updates with checklist above. Be disciplined!

---

## 📚 Related Files

- **This guide:** `meta/META_MAINTENANCE_GUIDE.md`
- **AI rules:** `meta/ai_context.yaml`
- **Master guide:** `meta/development_workflow.md`
- **Boon reference:** `meta/CONSOLIDATED_BOON_REFERENCE.md`
- **Design principles:** `meta/BALATRO_DESIGN_PRINCIPLES.md`

---

## 💡 Tips for AI Assistants

### When User Asks to Add Feature:
1. Read relevant meta/ file(s) first
2. Implement feature following patterns
3. **Update meta/ files in same response**
4. Tell user which meta/ files were updated

### When User Reports Bug:
1. Check if pattern is documented in meta/
2. Fix bug following documented patterns
3. **Update meta/ with fix pattern if critical**
4. Update `tracking/BUGS_FIXED_LOG.md`

### When Refactoring:
1. Check meta/ for current patterns
2. Preserve patterns unless improving them
3. **Update meta/ if patterns change**
4. Document reasoning for changes

---

**Remember:** Meta/ files are AI's memory. Keep them current, accurate, and comprehensive.

---

**Questions?** Check `meta/ai_context.yaml` for project structure and rules.

