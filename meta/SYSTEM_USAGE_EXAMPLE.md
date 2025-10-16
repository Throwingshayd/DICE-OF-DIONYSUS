# 🎓 AI Learning System - Usage Example
**Practical Walkthrough: Adding a New Boon**

> **Purpose:** Hands-on example of using the meta/ learning system  
> **Time:** 5-10 minutes  
> **Result:** AI learns your new pattern automatically

---

## 📝 Scenario: Adding "Poseidon's Trident" Boon

Let's add a new boon that gives bonus pips when you score with water-themed numbers (2s and 8s).

---

## 🔄 Step-by-Step Workflow

### Step 1: Implement the Boon

**1.1 Add to `js/data/gameData.js`**

```javascript
{
    id: "poseidons_trident",
    name: "Poseidon's Trident",
    rarity: "vibrant",
    cost: 5,
    effect: "+10 Pips when scoring with 2s or 8s (water numbers)",
    god: "Poseidon",
    timing: { before_score: true }
}
```

**1.2 Implement in `js/classes/Joker.js`**

Find the `applyBeforeScoreEffect()` method and add:

```javascript
case 'poseidons_trident':
    // Count 2s and 8s (water numbers)
    const waterDice = gameState.dice.filter(d => d.face === 2 || d.face === 8);
    
    if (waterDice.length > 0) {
        const waterBonus = waterDice.length * 10;
        result.pips += waterBonus;
        this.dynamicStats.pips = waterBonus; // Show in UI
        window.game?.showMessage?.(`Poseidon's Trident: +${waterBonus} Pips from ${waterDice.length} water dice!`);
    }
    break;
```

**1.3 Test It**

```javascript
// In browser console:
window.app.startGame('TRIDENT');
// Navigate to shop, buy Poseidon's Trident
// Roll some 2s and 8s, verify bonus appears
```

✅ **Boon works!** But AI doesn't know about it yet...

---

### Step 2: Update AI Learning File

**Open `meta/CONSOLIDATED_BOON_REFERENCE.md`**

**2.1 Find the appropriate section** (Die Face Counting)

Scroll to **Pattern 7: Die Face Counting** section.

**2.2 Add your new pattern:**

```markdown
### Pattern 7: Die Face Counting

Existing example: Ocean's Depth...

**New Example: Multiple Face Values**
\```javascript
case 'poseidons_trident':
    // Count multiple specific face values (thematic grouping)
    const waterDice = gameState.dice.filter(d => d.face === 2 || d.face === 8);
    
    if (waterDice.length > 0) {
        const waterBonus = waterDice.length * 10;
        result.pips += waterBonus;
        this.dynamicStats.pips = waterBonus;
        window.game?.showMessage?.(`Poseidon's Trident: +${waterBonus} Pips!`);
    }
    break;
\```

**Use Case:** Thematic grouping of die faces (water = 2&8, fire = 1&6, etc.)  
**Timing:** before_score  
**Pattern:** Filter array for multiple face values
```

**2.3 Save the file**

✅ **AI now knows this pattern!**

---

### Step 3: Test AI Learning

**Open a new chat with AI and ask:**

> "I want to add a boon called 'Hephaestus' Forge' that gives bonus when scoring with fire numbers (1s and 6s). Can you help?"

**AI Response (reads meta/):**

```javascript
// AI will respond with something like:

"Based on the pattern in meta/CONSOLIDATED_BOON_REFERENCE.md 
(Pattern 7: Multiple Face Values), here's the implementation:

case 'hephaestus_forge':
    // Count 1s and 6s (fire numbers)
    const fireDice = gameState.dice.filter(d => d.face === 1 || d.face === 6);
    
    if (fireDice.length > 0) {
        const fireBonus = fireDice.length * 12; // Slightly higher bonus
        result.pips += fireBonus;
        this.dynamicStats.pips = fireBonus;
        window.game?.showMessage?.(`Hephaestus' Forge: +${fireBonus} Pips!`);
    }
    break;
```

🎉 **AI learned from your pattern and applied it correctly!**

---

## 🔄 Complete Workflow Diagram

```
1. IMPLEMENT BOON
   ├─ Add to gameData.js
   ├─ Implement in Joker.js
   └─ Test in browser
   
2. UPDATE META/
   ├─ Open CONSOLIDATED_BOON_REFERENCE.md
   ├─ Find relevant pattern section
   ├─ Add your implementation as example
   └─ Save file
   
3. AI LEARNS AUTOMATICALLY
   ├─ AI reads meta/ files
   ├─ Recognizes your pattern
   └─ Applies it to future boons
   
4. FUTURE BOONS
   └─ AI suggests implementations following your pattern
```

---

## 🎯 Real-World Example 2: Changing Shop Pricing

### Scenario: Increase Artifact Cost

**Step 1: Change the Code**

In `js/config/GameConstants.js`:
```javascript
// Before:
ARTIFACT_BASE_COST: 7

// After:
ARTIFACT_BASE_COST: 10
```

**Step 2: Update Meta/**

Open `meta/BALATRO_DESIGN_PRINCIPLES.md`:

Find the "Economy System" section:

```markdown
### Economy System (Current - Balanced)
\```javascript
Starting Gold: 15
Base Reroll Cost: 2g (first free per shop)
Shop Opens: After turns 4, 8, and end of ante

Costs:
- Boons (Jokers): 3-6g (rarity-based)
- Worship Cards: 3g (planet equivalent)
- Libations: 2-3g (tarot equivalent)
- Packs: 4-6g
- Artifacts: 10g (increased from 7g - Oct 16, 2025) ← ADD THIS
\```

**Reasoning:** Artifacts are powerful permanent effects, warranted cost increase.
```

**Step 3: Update Changelog**

In `CHANGELOG.md`:
```markdown
## Version 1.4.4 - Economy Balance

### Economy Changes
- **Artifact Cost:** Increased from 7g to 10g
- **Reason:** Artifacts provide permanent benefits, should be more expensive
- **Impact:** Players must save more gold for artifact purchases
```

✅ **Done! AI now knows about the pricing change.**

---

## 🎯 Real-World Example 3: Fixing a Bug

### Scenario: Fix Timing Bug

**Step 1: Fix the Code**

Found that a boon triggers at wrong time. Fix in `Joker.js`:

```javascript
// Before (wrong):
timing: { after_roll: true }  // Triggers too often

// After (correct):
timing: { before_score: true }  // Triggers at right time
```

**Step 2: Document in Meta/**

Open `meta/development_workflow.md`:

Find the "Critical Bug Fixes" section:

```markdown
### Themis' Balance (Oct 16, 2025)
**Problem:** Triggered after every roll instead of once per score  
**Cause:** Used after_roll timing instead of before_score  
**Fix:** Changed timing to before_score  
**Pattern:** Scoring bonuses should use before_score, not after_roll  
**Test:** Verified with seed 'THEMIS123'
```

**Step 3: Update Bug Log**

In `tracking/BUGS_FIXED_LOG.md`:
```markdown
### Themis' Balance Timing (Oct 16, 2025)
**File:** `js/classes/Joker.js:XXX`
**Issue:** Triggered 3 times per turn (after each roll)
**Fix:** Changed timing from after_roll to before_score
**Impact:** MEDIUM - Now triggers correctly once per scoring
```

✅ **AI learns to avoid this mistake in future!**

---

## 📋 Quick Reference Checklist

### When Adding Boons:
- [ ] Add to `js/data/gameData.js`
- [ ] Implement in `js/classes/Joker.js`
- [ ] Test with deterministic seed
- [ ] **Update `meta/CONSOLIDATED_BOON_REFERENCE.md`**
- [ ] Update `tracking/card_database.csv`
- [ ] Add to `CHANGELOG.md`

### When Changing Shop/Economy:
- [ ] Update constants in `js/config/GameConstants.js`
- [ ] Update shop logic in `js/ui/UIManager.js`
- [ ] **Update `meta/BALATRO_DESIGN_PRINCIPLES.md`**
- [ ] Update `CHANGELOG.md`
- [ ] Test economy balance

### When Fixing Bugs:
- [ ] Fix the code
- [ ] Test with deterministic seed
- [ ] **Update `meta/development_workflow.md` if pattern-related**
- [ ] Update `tracking/BUGS_FIXED_LOG.md`
- [ ] Update `CHANGELOG.md`

### When Adding UI Patterns:
- [ ] Implement in CSS/JS
- [ ] **Update `meta/BALATRO_DESIGN_PRINCIPLES.md`**
- [ ] Include code example
- [ ] Document design reasoning

---

## 🤖 How AI Uses Meta/

### Behind the Scenes:

**When you ask AI for help:**

1. **AI reads `meta/ai_context.yaml`** → Understands project structure
2. **AI checks relevant meta/ file** → Finds similar patterns
3. **AI applies pattern** → Generates code following your style
4. **AI suggests meta/ update** → Reminds you to document new pattern

**Example conversation:**

```
You: "Add a boon that scales with unused rolls"

AI: *Reads meta/CONSOLIDATED_BOON_REFERENCE.md*
    *Finds Pattern 5: Unused Roll Bonus (Icarus' Wings)*
    *Applies similar pattern*
    *Generates code*
    
AI: "Here's the implementation following the pattern in 
     meta/CONSOLIDATED_BOON_REFERENCE.md (Pattern 5)..."
     
AI: "Don't forget to update meta/CONSOLIDATED_BOON_REFERENCE.md 
     with this new variation!"
```

---

## 💡 Pro Tips

### 1. Update Meta/ Immediately
Don't wait! Update while the code is fresh in your mind.

### 2. Use Good Examples
Include edge cases, not just happy path.

### 3. Explain "Why"
Document reasoning, not just "what" the code does.

### 4. Keep Examples Current
If you change implementation, update the example in meta/.

### 5. Cross-Reference
Link related files: "See also: meta/BALATRO_DESIGN_PRINCIPLES.md"

---

## 🔍 Troubleshooting

### "AI isn't following my patterns"

**Check:**
1. Did you update the relevant meta/ file?
2. Is your example clear and complete?
3. Is the file in meta/ (not docs/ or elsewhere)?

**Fix:**
- Add more detailed example to meta/
- Include edge cases
- Explain the "why" behind the pattern

### "I updated meta/ but AI doesn't see it"

**Remember:**
- AI reads files at start of conversation
- Start a new chat to pick up changes
- Or explicitly tell AI: "Check meta/CONSOLIDATED_BOON_REFERENCE.md"

### "Where should I document this?"

**Quick guide:**
- Boon patterns → `CONSOLIDATED_BOON_REFERENCE.md`
- Shop/economy → `BALATRO_DESIGN_PRINCIPLES.md`
- Game mechanics → `development_workflow.md`
- Bug patterns → `development_workflow.md` (Critical Bug Fixes)
- UI patterns → `BALATRO_DESIGN_PRINCIPLES.md`

**See:** `meta/META_MAINTENANCE_GUIDE.md` for complete mapping

---

## 🎯 Success Indicators

You're using the system correctly when:

✅ AI suggests implementations matching your style  
✅ AI references specific meta/ files in responses  
✅ New team members find patterns quickly  
✅ Bug fixes are documented and not repeated  
✅ Meta/ files stay current (< 1 week old)

---

## 📚 Related Files

- **This example:** `meta/SYSTEM_USAGE_EXAMPLE.md`
- **Maintenance guide:** `meta/META_MAINTENANCE_GUIDE.md`
- **Boon reference:** `meta/CONSOLIDATED_BOON_REFERENCE.md`
- **Design principles:** `meta/BALATRO_DESIGN_PRINCIPLES.md`
- **Project rules:** `meta/ai_context.yaml`

---

## 🎉 Try It Now!

**Exercise:** Add a simple boon and update meta/

1. Add "Lucky Coin" boon (add +5 pips if you roll any 7)
2. Implement in code
3. Update `meta/CONSOLIDATED_BOON_REFERENCE.md`
4. Ask AI to create similar boon with 8s

**You'll see AI learned from your example!**

---

**Time to get familiar:** 5-10 minutes  
**Payoff:** AI gives better help forever  
**Maintenance:** < 2 minutes per change

---

**Remember:** Update meta/ immediately after implementing features. Future you (and AI) will thank you!

