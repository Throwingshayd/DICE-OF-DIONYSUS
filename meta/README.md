# 📚 Meta/ - AI Learning Zone

**Welcome to the AI's brain for Dice of Dionysus!**

> All game parameters, patterns, and design principles live here.  
> When you update the game → Update meta/ → AI learns automatically.

---

## 🎯 What is This?

This directory contains **everything AI needs to assist you effectively:**

- Game mechanics and formulas
- Boon implementation patterns  
- Design principles and UI patterns
- Bug fix patterns and edge cases
- Performance optimization techniques

**Think of it as:** AI's reference library for your game.

---

## 📁 File Guide (10 Files)

### 🚀 **Start Here:**

1. **`SYSTEM_USAGE_EXAMPLE.md`** - Practical examples (read this first!)
2. **`LIVE_DEMO_WORKFLOW.md`** - Live demonstrations with code
3. **`META_MAINTENANCE_GUIDE.md`** - How to keep files updated

### 🎮 **Game Reference:**

4. **`development_workflow.md`** - **MASTER GUIDE**
   - Complete game mechanics
   - Timing system
   - Scoring formulas
   - Bug fixes
   - Testing strategies

5. **`CONSOLIDATED_BOON_REFERENCE.md`** - Boon system
   - 33 mechanical categories
   - 8 implementation patterns
   - Code examples
   - Edge case protections

6. **`BALATRO_DESIGN_PRINCIPLES.md`** - Design system
   - Balatro-inspired patterns
   - UI/UX guidelines
   - Economy system
   - Visual polish techniques

### 🔧 **Technical Reference:**

7. **`ai_context.yaml`** - Project structure
   - Core modules
   - Critical patterns
   - AI instructions
   - Update triggers

8. **`definitive_methods_reference.md`** - Method docs
9. **`performance_notes.md`** - Optimization guide
10. **`BALATRO_BUTTON_ANALYSIS.md`** - UI patterns

---

## 🔄 How It Works

```
┌────────────────────────────────────────┐
│  1. You Implement Feature              │
│     ├─ Add to gameData.js              │
│     ├─ Implement in Joker.js           │
│     └─ Test in browser                 │
│                                        │
│  2. Update Meta/ File                  │
│     ├─ Add pattern to relevant file    │
│     ├─ Include code example            │
│     └─ Explain reasoning               │
│                                        │
│  3. AI Learns Automatically            │
│     ├─ Reads meta/ at conversation start │
│     ├─ Recognizes your patterns        │
│     └─ Applies them to future code     │
│                                        │
│  4. Future Features                    │
│     └─ AI suggests following YOUR style │
└────────────────────────────────────────┘
```

---

## ⚡ Quick Reference

### When Adding Boons:
**Update:** `CONSOLIDATED_BOON_REFERENCE.md`  
**Example:** Add pattern to relevant category, include code

### When Changing Shop/Economy:
**Update:** `BALATRO_DESIGN_PRINCIPLES.md` + `development_workflow.md`  
**Example:** Update economy section with new costs + reasoning

### When Fixing Bugs:
**Update:** `development_workflow.md` (Critical Bug Fixes)  
**Example:** Document problem, cause, fix, and pattern to avoid

### When Adding UI Patterns:
**Update:** `BALATRO_DESIGN_PRINCIPLES.md`  
**Example:** Add to visual design section with code

---

## 📋 3-Step Workflow

```
Step 1: IMPLEMENT
├─ Write code
├─ Test thoroughly
└─ Verify it works

Step 2: DOCUMENT (in meta/)
├─ Find relevant file
├─ Add your pattern
└─ Save file

Step 3: VERIFY
├─ Start new AI chat
├─ Ask about similar feature
└─ See AI use your pattern! ✨
```

---

## 🎯 Real Example

### You Add "Ocean's Depth" Boon

**1. Code:**
```javascript
case 'ocean_depths':
    const eightCount = gameState.dice.filter(d => d.face === 8).length;
    result.favour += eightCount * 0.5;
    break;
```

**2. Update Meta:**
Open `CONSOLIDATED_BOON_REFERENCE.md`, add to Pattern 7:
```markdown
### Pattern 7: Die Face Counting
case 'ocean_depths':
    const eightCount = gameState.dice.filter(d => d.face === 8).length;
    result.favour += eightCount * 0.5;
    break;
```

**3. AI Learns:**
Next time: "Add boon for 9s" → AI uses same pattern automatically!

---

## 💡 Key Principles

### 1. Document Immediately
Don't wait! Update meta/ while code is fresh in your mind.

### 2. Explain Why
Document reasoning, not just what the code does.

### 3. Include Examples
Show complete code, not just snippets.

### 4. Keep Current
Update examples when you change implementations.

### 5. Cross-Reference
Link related files: "See also: development_workflow.md"

---

## 🔍 File Selection Guide

**Need to know...**

| About... | Read File... |
|----------|-------------|
| How to use system | `SYSTEM_USAGE_EXAMPLE.md` |
| How system works | `LIVE_DEMO_WORKFLOW.md` |
| How to maintain | `META_MAINTENANCE_GUIDE.md` |
| Game mechanics | `development_workflow.md` |
| Boon patterns | `CONSOLIDATED_BOON_REFERENCE.md` |
| Design principles | `BALATRO_DESIGN_PRINCIPLES.md` |
| Project structure | `ai_context.yaml` |
| Performance tips | `performance_notes.md` |

---

## 🎓 Learning Path

**New to the system?**

1. Read `SYSTEM_USAGE_EXAMPLE.md` (5 min)
2. Read `LIVE_DEMO_WORKFLOW.md` (5 min)
3. Try adding simple boon + updating meta/ (10 min)
4. Ask AI about similar boon (1 min)
5. See AI use your pattern! (instant) ✨

**Total time:** 20 minutes to master the system

---

## ✅ Success Checklist

You're using the system correctly when:

- [ ] AI references specific meta/ files in responses
- [ ] AI suggests code matching your style
- [ ] New features follow documented patterns
- [ ] Meta/ files are current (< 1 week old)
- [ ] You update meta/ immediately after implementing

---

## 🚀 Benefits

### For You:
- ✅ AI gives better, more relevant suggestions
- ✅ Consistent code patterns across project
- ✅ Patterns documented, not lost
- ✅ Easier onboarding for new developers

### For AI:
- ✅ Understands your specific game
- ✅ Knows your coding style
- ✅ Aware of edge cases and bugs
- ✅ Suggests implementations following your patterns

### For Project:
- ✅ Knowledge retention (patterns survive sessions)
- ✅ Quality consistency (AI enforces patterns)
- ✅ Faster development (AI knows best practices)
- ✅ Better maintainability (clear documentation)

---

## 📊 Statistics

**Current Meta/ Status:**
- **10 comprehensive files** (107 KB total)
- **All game systems documented**
- **Auto-update triggers defined**
- **Cross-referenced and indexed**

**Coverage:**
- ✅ Boon system (33 categories documented)
- ✅ Design principles (Balatro-inspired)
- ✅ Game mechanics (complete formulas)
- ✅ Bug patterns (critical fixes documented)
- ✅ Performance (optimization techniques)
- ✅ UI/UX (polished patterns)

---

## 🎯 Next Steps

### Brand New?
👉 **Read `SYSTEM_USAGE_EXAMPLE.md` now!**

### Ready to Try?
👉 **Read `LIVE_DEMO_WORKFLOW.md` for hands-on example!**

### Need to Maintain?
👉 **Check `META_MAINTENANCE_GUIDE.md` for workflows!**

### Want Game Info?
👉 **Start with `development_workflow.md` (master guide)!**

---

## 💬 FAQ

**Q: Do I really need to update meta/ every time?**  
A: Yes! Takes 2 minutes, pays off forever. AI gets smarter with each update.

**Q: What if I forget to update?**  
A: No problem! Just update when you remember. Better late than never.

**Q: Which file should I update?**  
A: Check `META_MAINTENANCE_GUIDE.md` for complete mapping.

**Q: How does AI read these files?**  
A: Automatically at conversation start. New changes? Start new chat.

**Q: Can I see examples?**  
A: Yes! `SYSTEM_USAGE_EXAMPLE.md` has 3 complete examples.

---

## 🎉 You're Ready!

The system is set up and ready to use. Every time you update meta/, AI gets smarter about YOUR specific game.

**Start with:** `SYSTEM_USAGE_EXAMPLE.md`

---

## 📚 Related Documentation

- **Root:** `README.md` - Project overview
- **Architecture:** `ARCHITECTURE.md` - System design
- **Tracking:** `tracking/BUGS_FIXED_LOG.md` - Bug history
- **Design:** `design/APPROVED_BOON_DESIGNS.md` - Creative docs

---

**Meta/ Directory Version:** 2.0  
**Last Major Update:** October 16, 2025  
**Files:** 10 comprehensive references  
**Status:** ✅ Fully operational

---

**Questions? Check `META_MAINTENANCE_GUIDE.md` for detailed workflows.**

**Ready to learn? Read `SYSTEM_USAGE_EXAMPLE.md` next!**

