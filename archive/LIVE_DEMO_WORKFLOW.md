# 🎬 Live Demo: AI Learning System in Action
**Watch How It Works - Step by Step**

---

## 🎯 Scenario: You Want to Add "Ares' War Drum"

**Boon Idea:** Gain +2 pips for each die showing an odd number.

Let's see how the meta/ system helps you (and AI) implement this correctly.

---

## 🔍 Step 1: Check Meta/ First (What AI Does)

**Before writing ANY code, AI reads:**

```yaml
# From meta/ai_context.yaml
cardEffects:
  reference: "meta/CONSOLIDATED_BOON_REFERENCE.md (Implementation Patterns)"
```

**AI opens `meta/CONSOLIDATED_BOON_REFERENCE.md` and finds:**

```markdown
### Pattern 7: Die Face Counting

case 'ocean_depths':
    // Count specific die faces
    const eightCount = gameState.dice.filter(d => d.face === 8).length;
    if (eightCount > 0) {
        result.favour += eightCount * 0.5;
    }
    break;
```

**AI thinks:** "Ah! Counting dice faces. I can adapt this pattern."

---

## 💻 Step 2: AI Suggests Implementation

**AI's Response:**

> "I see you want to count odd numbers. Based on the pattern in  
> `meta/CONSOLIDATED_BOON_REFERENCE.md` (Pattern 7: Die Face Counting),  
> here's the implementation:

```javascript
// In js/data/gameData.js
{
    id: "ares_war_drum",
    name: "Ares' War Drum",
    rarity: "vibrant",
    cost: 4,
    effect: "+2 Pips per odd die (1, 3, 5)",
    god: "Ares",
    timing: { before_score: true }
}

// In js/classes/Joker.js - applyBeforeScoreEffect()
case 'ares_war_drum':
    // Count odd dice (1, 3, 5)
    const oddDice = gameState.dice.filter(d => d.face % 2 === 1);
    
    if (oddDice.length > 0) {
        const drumBonus = oddDice.length * 2;
        result.pips += drumBonus;
        this.dynamicStats.pips = drumBonus; // Show in UI
        window.game?.showMessage?.(`Ares' War Drum: +${drumBonus} Pips from ${oddDice.length} odd dice!`);
    }
    break;
```

> **Don't forget to update `meta/CONSOLIDATED_BOON_REFERENCE.md`  
> with this odd/even counting variation!**

---

## ✍️ Step 3: You Update Meta/ (Teach AI)

**You open `meta/CONSOLIDATED_BOON_REFERENCE.md`:**

Find Pattern 7 and add your new variation:

```markdown
### Pattern 7: Die Face Counting

**Existing:** Count specific faces (2, 8, etc.)  
**New Variation:** Count by mathematical property

\```javascript
case 'ares_war_drum':
    // Count dice by mathematical property (odd/even)
    const oddDice = gameState.dice.filter(d => d.face % 2 === 1);
    
    if (oddDice.length > 0) {
        const drumBonus = oddDice.length * 2;
        result.pips += drumBonus;
        this.dynamicStats.pips = drumBonus;
        window.game?.showMessage?.(`Ares' War Drum: +${drumBonus} Pips!`);
    }
    break;
\```

**Use Case:** Counting by property (odd/even, prime, divisible by X)  
**Pattern:** `filter(d => d.face % 2 === 1)` for odd  
**Pattern:** `filter(d => d.face % 2 === 0)` for even  
**Timing:** before_score
```

**Save file. ✅ AI learned!**

---

## 🚀 Step 4: Test AI Learning (New Chat)

**Start NEW chat and ask:**

> "I want to add a boon that gives bonus for even numbers"

**AI Response (reads your updated meta/):**

> "Based on the pattern you just added in  
> `meta/CONSOLIDATED_BOON_REFERENCE.md` (Pattern 7, odd/even variation):

```javascript
case 'athena_strategy':
    // Count even dice (2, 4, 6)
    const evenDice = gameState.dice.filter(d => d.face % 2 === 0);
    
    if (evenDice.length > 0) {
        const strategyBonus = evenDice.length * 2;
        result.pips += strategyBonus;
        this.dynamicStats.pips = strategyBonus;
        window.game?.showMessage?.(`Athena's Strategy: +${strategyBonus} Pips!`);
    }
    break;
```

🎉 **AI applied YOUR pattern correctly!**

---

## 🔄 The Learning Loop

```
┌─────────────────────────────────────────────┐
│  YOU IMPLEMENT FEATURE                      │
│  ↓                                          │
│  Update meta/ with pattern                 │
│  ↓                                          │
│  AI reads meta/ automatically              │
│  ↓                                          │
│  AI suggests similar features using pattern │
│  ↓                                          │
│  Pattern becomes standard ────────┐        │
│                                     │        │
│  Future features follow pattern ←──┘        │
└─────────────────────────────────────────────┘
```

---

## 🎯 Real Conversation Example

### Chat 1: Initial Implementation

**You:**
> "Add boon that counts matching pairs"

**AI:** *(reads meta/, finds no matching pattern)*
> "Here's a basic implementation... (generates code)  
> This is a new pattern - please add it to meta/ so I can learn!"

**You:** *(implements and updates meta/)*

### Chat 2: One Week Later

**You:**
> "Add boon that counts sets of 3 matching dice"

**AI:** *(reads meta/, finds your pair-counting pattern)*
> "I see you added a pair-counting pattern last week.  
> Here's the same pattern adapted for triplets:
> ```javascript
> const triplets = [...]; // Following your pattern from meta/
> ```

✨ **AI remembered and applied YOUR style!**

---

## 📊 Side-by-Side Comparison

### WITHOUT Meta/ System:

```
You: "Add boon for matching pairs"
AI:  *generates generic code*
     *might not match your style*
     *you fix it*

Next week...

You: "Add boon for triplets"
AI:  *generates different style*
     *inconsistent with pairs boon*
     *you fix it again*
```

### WITH Meta/ System:

```
You: "Add boon for matching pairs"
AI:  *generates code*
You: *update meta/ with pattern*

Next week...

You: "Add boon for triplets"
AI:  *reads meta/*
     *applies YOUR pattern from pairs*
     *matches your style perfectly*
     ✅ No fixes needed!
```

---

## 🎬 Live Example: Shop Change

### You Change Shop Reroll Cost

**1. Code Change:**
```javascript
// js/config/GameConstants.js
SHOP_REROLL_COST: 3  // was 2
```

**2. Meta/ Update:**
```markdown
// meta/BALATRO_DESIGN_PRINCIPLES.md
Economy System:
- Shop reroll: 3g (increased from 2g - Oct 16, 2025)
- Reasoning: Prevent excessive rerolling, increase decision tension
```

**3. AI Learns:**

Next time you ask about shop costs, AI says:
> "Shop reroll is 3g (as documented in  
> meta/BALATRO_DESIGN_PRINCIPLES.md).  
> This was increased to prevent excessive rerolling."

---

## 🎯 Interactive Exercise

**Try this NOW:**

### Challenge 1: Add "Zeus' Thunder" Boon
- **Effect:** +10 pips if highest die is a 6
- **Steps:**
  1. Check `meta/CONSOLIDATED_BOON_REFERENCE.md` for similar patterns
  2. Implement the boon
  3. Update meta/ with the pattern
  4. Ask AI to create "Hades' Darkness" (bonus if lowest die is 1)
  5. **Watch AI use your pattern!**

### Challenge 2: Document a Bug Fix
- **Scenario:** Fixed timing issue in a boon
- **Steps:**
  1. Fix the bug in code
  2. Update `meta/development_workflow.md` (Critical Bug Fixes)
  3. Ask AI about timing best practices
  4. **Watch AI reference your documented fix!**

---

## 💡 Pro Tips From Experience

### 1. Start New Chat to Pick Up Changes
Meta/ files are read at conversation start. New changes? New chat!

### 2. Be Specific in Examples
```
❌ "Add bonus based on dice"
✅ "Count dice showing 6, give +2 pips per die"
```

### 3. Document "Why", Not Just "What"
```
❌ "Changed cost to 5"
✅ "Changed cost to 5 - too powerful at 3, causing balance issues"
```

### 4. Update Immediately
Don't think "I'll document later" - do it NOW while fresh.

### 5. Cross-Reference Files
```
"See also: meta/BALATRO_DESIGN_PRINCIPLES.md (Economy section)"
```

---

## 🔍 How to Verify AI Learning

### Test 1: Ask About Patterns
```
You: "What's the pattern for counting specific dice faces?"

AI Should Say:
"According to meta/CONSOLIDATED_BOON_REFERENCE.md, 
Pattern 7 shows dice counting using filter()..."
```

### Test 2: Request Similar Feature
```
You: "Add boon like Midas Touch but for favour"

AI Should:
- Reference Midas Touch pattern from meta/
- Apply same scaling logic
- Follow your documented style
```

### Test 3: Check Design Decisions
```
You: "Why is artifact cost 10g?"

AI Should:
"According to meta/BALATRO_DESIGN_PRINCIPLES.md,
artifact cost is 10g because [your documented reason]..."
```

---

## 🎉 Success Stories

### Real Results from This System:

**Before Meta/ System:**
- 5 boons added, 5 different coding styles
- AI suggestions needed heavy editing
- Pattern knowledge lost between sessions

**After Meta/ System:**
- 10 boons added, consistent style throughout
- AI suggestions work with minimal edits
- Patterns documented and reused automatically

---

## 📚 Quick Reference

### Most Common Workflows:

| Task | Read From | Write To | Time |
|------|-----------|----------|------|
| Add boon | `CONSOLIDATED_BOON_REFERENCE.md` | Same file | 2 min |
| Change shop | `BALATRO_DESIGN_PRINCIPLES.md` | Same file | 2 min |
| Fix timing bug | `development_workflow.md` | Same file | 3 min |
| Add UI pattern | `BALATRO_DESIGN_PRINCIPLES.md` | Same file | 2 min |

---

## 🚀 Next Steps

1. **Read:** `meta/SYSTEM_USAGE_EXAMPLE.md` (detailed examples)
2. **Review:** `meta/META_MAINTENANCE_GUIDE.md` (complete guide)
3. **Try:** Add a simple boon and update meta/
4. **Verify:** Ask AI about it in new chat
5. **Celebrate:** You've mastered the system! 🎉

---

**The System is Ready. Start Using It!**

Every time you update meta/, AI gets smarter about YOUR game.

---

**Questions?**  
Check `meta/META_MAINTENANCE_GUIDE.md` for detailed workflows.

