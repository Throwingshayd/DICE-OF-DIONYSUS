# 🎨 UI Enhancements - Phase 2 Plan

**Date:** October 15, 2025  
**Focus:** Core gameplay polish & button consistency  
**Goal:** Make every interaction feel premium

---

## 📋 **Phase 2 Priorities**

### 1. Button Consistency Audit 🔘
**Goal:** All buttons have proper hover/active/disabled states

**Buttons to Audit:**
- Roll button (main game action)
- Confirm score buttons (pantheon cells)
- Shop buttons (buy, sell, reroll, continue)
- Collection back button
- Start screen buttons (start, continue, collection)
- Pack selection buttons (take/claim)
- Enhancement selection buttons
- Libation use buttons
- Menu/settings buttons

**Required States:**
- Default (base appearance)
- Hover (lift + glow)
- Active (press down)
- Disabled (grayed out)
- Focus (keyboard navigation)

---

### 2. Pantheon Scorecard Polish 🏛️
**Goal:** Make scoring cells feel premium

**Enhancements:**
- 3D border effect on cells
- Hover glow on empty cells
- Filled cells have subtle pulse
- Better visual hierarchy
- God icons in row headers
- Category icons in column headers
- Score numbers get larger/bolder
- "Best score" indicator (star/crown)

---

### 3. Message System Styling 💬
**Goal:** Game messages feel impactful

**Current State:**
- Basic text messages
- Minimal styling
- No icons

**Improvements:**
- Styled message boxes
- Icon-based types:
  - ✅ Success (green)
  - ⚠️ Warning (yellow)
  - ❌ Error (red)
  - ℹ️ Info (blue)
  - ⭐ Achievement (gold)
- Slide-in animation from top
- Auto-dismiss with progress bar
- Sound effects per type

---

### 4. Screen Transitions 🎬
**Goal:** Smooth transitions between screens

**Transitions:**
- Start → Game (fade + slide)
- Game → Shop (zoom out)
- Shop → Game (zoom in)
- Game → Collection (fade)
- Collection → Start (fade)
- Pack opening (flip animation)

---

### 5. Keyboard Shortcut Indicators ⌨️
**Goal:** Show available shortcuts

**Shortcuts to Display:**
- R = Roll
- 1-5 = Hold dice
- Esc = Back/Cancel
- Enter = Confirm
- Tab = Cycle focus
- Space = Use libation

**Display Method:**
- Subtle badges on buttons
- Tooltip on hover
- Help overlay (H key?)

---

## 🎯 **Implementation Order**

### Step 1: Button Consistency (45 min)
1. Audit all buttons in codebase
2. Create unified button CSS classes
3. Apply to all buttons
4. Test all states

### Step 2: Pantheon Polish (30 min)
1. Add 3D cell borders
2. Implement hover effects
3. Add glow to filled cells
4. Test score entry flow

### Step 3: Message System (40 min)
1. Create message component
2. Style message types
3. Add slide-in animation
4. Integrate with GameEngine

### Step 4: Screen Transitions (25 min)
1. Add transition CSS
2. Update screen switching logic
3. Test all transitions

### Step 5: Keyboard Indicators (20 min)
1. Add shortcut badges
2. Style tooltips
3. Test keyboard nav

**Total Time: ~2.5-3 hours**

---

## 🚀 **Let's Start!**

Beginning with **Button Consistency Audit**...

