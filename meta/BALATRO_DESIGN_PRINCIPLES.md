# 🃏 Balatro Design Principles for Dice of Dionysus
**AI Learning Reference - Balatro-Inspired Design System**

> **Purpose:** Consolidated Balatro design analysis for AI assistants  
> **Consolidates:** 6 Balatro analysis documents from docs/  
> **Location:** meta/ (for AI metadata learning)  
> **Last Updated:** October 16, 2025

---

## 🎯 Core Design Pillars (From Balatro)

### 1. Tight Economy Loop
- Gold is scarce, every decision matters
- Rerolls cost money (creates tension)
- Can't buy everything (forces prioritization)

### 2. Escalating Difficulty
- Exponential but fair growth
- Score thresholds increase predictably
- Players feel challenged but not cheated

### 3. Visual Feedback (Juice)
- Every action has visual/audio feedback
- Animations make scoring feel rewarding
- Particles, screen shake, count-up effects

### 4. Synergy Discovery
- Cards work together in interesting ways
- Combos feel powerful and satisfying
- Discovery is part of the fun

### 5. Risk vs Reward
- Constant meaningful decisions
- Trade-offs create tension
- No obviously correct choice

### 6. Polish & Juice
- Smooth animations (60fps)
- Sound effects for everything
- Particles and screen shake for big scores
- Button feedback (hover, press, ripple)

---

## 🎲 Applied to Dice of Dionysus

### Economy System (Current - Balanced)
```javascript
Starting Gold: 15
Base Reroll Cost: 2g (first free per shop)
Shop Opens: After turns 4, 8, and end of ante

Costs:
- Boons (Jokers): 3-6g (rarity-based)
- Worship Cards: 3g (planet equivalent)
- Libations: 2-3g (tarot equivalent)
- Packs: 4-6g
- Artifacts: 7g (voucher equivalent)
```

### Scoring Formula (Balatro-Style Sequential)
```javascript
// Phase 1: Calculate Pips (additive)
basePips = sum of dice faces
+ enhancement bonuses (iron +5, etc.)
+ category bonuses (Full House +25, Yahtzee +50)
+ boon pip bonuses (Midas, Icarus, etc.)
= totalPips

// Phase 2: Calculate Favour (additive + multiplicative)
baseFavour = 1.5
+ worship levels (per god)
+ boon favour bonuses (Hestia +3, etc.)
= additiveFavour

multiplicativeFavour = 1.0
* boon multipliers (Pandora ×2, Carillon ×2.5, etc.)
= totalMultiplier

// Phase 3: Final Score
FINAL = totalPips × (additiveFavour × totalMultiplier)
```

### Sequential Scoring Animation (Balatro-Inspired)
1. Dice add pips one by one (150ms each, purple color)
2. Category bonus appears (Full House +25, etc.)
3. Enhancement bonuses (iron, pearl, etc.)
4. Boon bonuses (200ms each, purple for pips, red for favour)
5. Final multiplication display
6. Count-up to final score (1 second duration)
7. Screen shake + particles (if high score)
8. Place in scorecard with flash

**Display Format:** "9 + 10 = 19" with color coding (purple=pips, red=favour)

### Button Polish (Balatro-Style)
- **Always visible** - No hover-to-discover pattern
- **Consistent positioning** - Top-right for all action buttons
- **Visual feedback:**
  - Hover: Subtle lift (scale 1.08 + translateY)
  - Press: Satisfying click (scale 0.95)
  - Click: Ripple effect (Material Design)
  - Success: Scale + brightness pulse

---

## 🎨 Visual Design System

### Color Palette
- **Purple** - Pips, dice, primary actions
- **Wine Red** - Favour, multipliers
- **Gold** - Currency, rewards
- **Terracotta** - Background, frames
- **White** - Text, highlights

### Typography
- **Font:** DisneyHeroic (Greek mythology theme)
- **Sizes:** 16px-26px range
- **Spacing:** Tight but readable

### Animation Timing
- **Fast actions:** 150ms (dice roll, button press)
- **Medium actions:** 300ms (card flip, movement)
- **Slow actions:** 1000ms (score count-up)
- **Juice effects:** 60fps smooth animations

### Particle System
- **Big scores:** Confetti burst
- **Gold gain:** Coin particles
- **Card purchase:** Sparkle effect
- **Achievements:** Screen shake + particles

---

## 🔧 Balatro-Style Mechanics Applied

### 1. Live Score Display
**Balatro Pattern:** Shows current hand value before playing  
**Our Implementation:**
- Shows `{pips} x {favour}` during die selection
- Updates in real-time as dice are held
- Color-coded (purple pips, red favour)
- Shows "N/A" for invalid hands

### 2. Bonus Categories (Like Balatro's Planets)
**Balatro Pattern:** Unlock new scoring opportunities  
**Our Implementation:**
- Sevens, Eights, Nines unlock via bonus Yahtzees
- Preview unlocks within ante (tease the player)
- Persistent unlocks on first score
- Worship cards available after unlock

### 3. Category Filtering (Progressive Unlocking)
**Balatro Pattern:** Cards appear as you unlock mechanics  
**Our Implementation:**
```javascript
// Cards associated with 7/8/9 filtered until unlocked
filterCardsByUnlockedCategories(cardPool, gameState) {
    return cardPool.filter(card => {
        if (card.category === 'Sevens' && !gameState.unlockedCategories?.Sevens) {
            return false; // Hide until Sevens unlocked
        }
        // Same for Eights, Nines
        return true;
    });
}
```

### 4. Pack Selection System
**Balatro Pattern:** Choose 1 from multiple options  
**Our Implementation:**
- All packs reveal 3 cards
- Player chooses only 1 to claim
- Creates decision tension
- More strategic depth

### 5. Double-Click Confirmation
**Balatro Pattern:** Quick confirmations without modal dialogs  
**Our Implementation:**
- Click to select (visual feedback)
- Double-click to confirm
- Fast, streamlined UX
- No interrupting dialogs

---

## 🎮 Gameplay Flow (Balatro-Inspired)

### Turn Structure
```
1. Turn Start
   ├─ Apply turn_start boons (Kronos, etc.)
   └─ Reset dice to '?' state

2. Rolling Phase
   ├─ Show '?' on all dice
   ├─ Roll dice (with animation)
   ├─ Apply after_roll boons
   └─ Player can hold/reroll (up to 3 times)

3. Scoring Phase
   ├─ Player selects category
   ├─ Sequential animation plays
   │  ├─ Dice add pips (150ms each)
   │  ├─ Category bonus (+25, +50, etc.)
   │  ├─ Boon bonuses (200ms each)
   │  └─ Final multiplication
   ├─ Count-up animation (1s)
   ├─ Juice effects (shake, particles)
   └─ Score placed in card

4. Turn End
   ├─ Apply turn_end boons
   ├─ Check for shop (turns 4, 8, end of ante)
   └─ Advance to next turn or ante
```

### Shop Flow (Balatro-Inspired)
```
1. Shop Opens
   ├─ Generate stock (weighted rarity)
   ├─ Individual items (Artifacts, Wares)
   ├─ Packs (Boon, Worship, Libation, Chaos)
   └─ Category buttons (scroll/focus sections)

2. Player Actions
   ├─ Buy items (direct purchase)
   ├─ Open packs (3-card selection)
   ├─ Reroll shop (2g, first free)
   └─ Sell inventory items

3. Shop Closes
   ├─ Player exits manually
   └─ Continue to next turn/ante
```

---

## 🎯 Key Differences from Balatro

### What We Keep
- ✅ Sequential scoring animation
- ✅ Multiplicative scaling (late game)
- ✅ Tight economy (gold scarcity)
- ✅ Visual juice (animations, particles)
- ✅ Synergy discovery (boons combo)

### What We Adapt
- 🎲 **Dice instead of cards** (RNG vs hand building)
- 🏛️ **Greek mythology theme** (not poker)
- 📊 **Scorecard progression** (like Yahtzee)
- ⚡ **Turn-based** (not hand selection)
- 🎭 **Worship system** (upgrade categories over time)

### What We Don't Copy
- ❌ Poker hands (use Yahtzee categories)
- ❌ Deck building (use dice + enhancements)
- ❌ Blind selection (use ante progression)
- ❌ Specific card effects (create Greek-themed boons)

---

## 🔥 Balatro's Most Important Lessons

### 1. Animation Budget Matters
Every UI action should have feedback:
- Button hover → lift
- Button press → squish
- Purchase → ripple + scale
- Score → count-up + shake

### 2. Sequential Reveals Create Tension
Don't show final score immediately:
- Build anticipation step by step
- Let player see how bonuses stack
- Make big scores feel EARNED

### 3. Always-Visible UI > Hover-Dependent
- Mobile-friendly (no hover state)
- Clearer affordances
- Better accessibility
- Faster interactions

### 4. Multiplicative Scaling for Endgame
- Additive: +2 favour (linear, boring late-game)
- Multiplicative: ×2 favour (exponential, exciting)
- Use multiplicative for powerful scaling

### 5. Synergies Create Depth
Best moments: discovering unexpected combos
- Midas Touch + gold generation boons
- Enhancement-counting boons + libations
- Multiple multiplicative boons stacking

---

## 📊 Balatro's Juice System (What We Learned)

### Screen Shake
```javascript
// Shake intensity based on score magnitude
if (score > 1000) {
    screenShake(intensity: 'high', duration: 500ms);
}
```

### Particles
```javascript
// Particle effects for key moments
onHighScore() {
    spawnParticles(type: 'confetti', count: 50, spread: 360);
}

onGoldGain(amount) {
    spawnParticles(type: 'coins', count: amount, direction: 'up');
}
```

### Sound Effects
- Dice roll: Satisfying click
- Score placed: Stamp sound
- Big score: Fanfare
- Purchase: Cash register cha-ching
- Error: Soft buzzer

### Visual Polish
- Smooth easing (elastic, bounce)
- GPU-accelerated transforms
- 60fps animations
- Proper z-index layering

---

## 🎨 Implementation Checklist

### Phase 1: Core Systems ✅
- [x] Sequential scoring animation
- [x] Live score display
- [x] Balatro-style buttons
- [x] Pack selection system
- [x] Category filtering

### Phase 2: Visual Polish ✅
- [x] Always-visible buttons
- [x] Ripple effects
- [x] Purchase animations
- [x] Screen shake
- [x] Particle system

### Phase 3: Economic Balance ✅
- [x] Tight gold economy
- [x] Reroll costs
- [x] Rarity-based pricing
- [x] Shop timing

### Phase 4: Gameplay Flow ✅
- [x] Turn structure
- [x] Shop flow
- [x] Ante progression
- [x] Bonus categories

---

## 🚀 Future Balatro-Inspired Features

### Not Yet Implemented:
1. **Boss Blinds** - Special challenges per ante
2. **Challenge Runs** - Modified rules (like Balatro's challenges)
3. **Seed System** - Already have this! ✅
4. **Collection Progress** - Track unlocked cards
5. **Achievements** - Milestone rewards

### Consider Adding:
1. **Stake System** - Difficulty levels
2. **Run History** - Track best scores
3. **Daily Challenge** - Shared seed
4. **Leaderboards** - Compare scores
5. **Unlockable Content** - Progression system

---

## 🎯 Design Principles for AI Assistants

When adding new features, ask:

1. **Does it feel juicy?** Add animation/sound
2. **Is feedback immediate?** Show response to actions
3. **Does it create decisions?** Avoid obvious choices
4. **Is it discoverable?** Make effects clear
5. **Does it synergize?** Connect to existing systems

When adding boons, ask:

1. **Is it Balatro-style?** Multiplicative > additive for scaling
2. **Does it combo?** Create synergy potential
3. **Is there a trade-off?** Risk/reward tension
4. **Is it thematic?** Fit Greek mythology
5. **Is it balanced?** Powerful but not broken

---

## 📚 Related Files

- **This file:** meta/BALATRO_DESIGN_PRINCIPLES.md
- **Boon reference:** meta/CONSOLIDATED_BOON_REFERENCE.md
- **Development workflow:** meta/development_workflow.md
- **Game engine:** js/game/GameEngine.js
- **UI manager:** js/ui/UIManager.js
- **Sequential animator:** js/utils/SequentialAnimator.js
- **Particle system:** js/utils/ParticleSystem.js

---

**AI Assistants:** Use this as reference for maintaining Balatro-inspired design quality. When in doubt, add more juice!

