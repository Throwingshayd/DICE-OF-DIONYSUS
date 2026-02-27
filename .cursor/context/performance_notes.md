# 🚀 Performance Notes for Dice of Dionysus

## Current Performance Baseline

**Target**: 60fps gameplay, ~120KB bundle size
**Status**: ✅ Meeting targets (as of v1.4)

---

## 🔥 Hot Paths (Profile These First)

### 1. Game Loop (Critical Path)

```javascript
// GameEngine.rollDice() - Called 3× per turn
- Iterates through dice array (5 elements)
- Calls prng.randomInt() for each unheld die
- Applies joker before_roll effects
- Updates DOM via UIManager.renderDice()

⚡ Optimization opportunities:
  - Minimize DOM updates (batch if possible)
  - Cache joker effects that apply to rolls
  - Consider object pooling for dice objects (future)
```

### 2. Scoring Calculation (Critical Path)

```javascript
// GameEngine.calculateScore(category) - Called on every category hover/click
- Sorts dice faces
- Checks category validity
- Calculates pips (base score)
- Applies enhancement effects (Parchment, Iron, Gold, etc.)
- Calculates favour multiplier
- Applies joker before_score effects

⚡ Optimization opportunities:
  - Cache sorted dice faces (invalidate on roll)
  - Memoize enhancement calculations
  - Lazy evaluate favour multiplier
  - Profile enhancement iterations
```

### 3. Rendering Loop (High Frequency)

```javascript
// UIManager.renderDice() - Called after every roll
- Creates/updates 5 dice DOM elements
- Applies CSS classes based on state
- Renders face values and enhancements
- Updates hold/lock indicators

⚡ Optimization opportunities:
  - Use CSS transforms instead of re-rendering
  - Diff-based updates (only change what's different)
  - RequestAnimationFrame for smoother animations
  - Virtual DOM or template cloning
```

### 4. Shop Generation (Medium Priority)

```javascript
// UIManager.generateShopStock() - Called at end of turns/antes
- Generates artifacts (rarity-weighted)
- Generates random cards from pools
- Generates pack contents
- Renders 10+ card elements

⚡ Optimization opportunities:
  - Lazy render cards (only visible ones)
  - Reuse card DOM elements (object pool)
  - Defer image loading
  - Optimize rarity weight calculations
```

---

## 🧪 Profiling Strategy

### Chrome DevTools Workflow

1. **Performance Tab**
   ```
   - Record gameplay session (30-60s)
   - Focus on: Scripting time, Rendering time, Painting
   - Look for long tasks (>50ms)
   - Identify call stacks
   ```

2. **Memory Tab**
   ```
   - Take heap snapshot before/after actions
   - Look for memory leaks (growing heap)
   - Check detached DOM nodes
   - Profile allocations during rolls
   ```

3. **Lighthouse**
   ```
   - Run performance audit
   - Check bundle size impact
   - Identify render-blocking resources
   - Validate PWA optimizations
   ```

### Profiling Checklist

- [ ] Measure baseline FPS during gameplay
- [ ] Profile rollDice() execution time
- [ ] Profile calculateScore() execution time
- [ ] Profile shop rendering time
- [ ] Measure bundle size (dev vs prod)
- [ ] Check for memory leaks
- [ ] Validate determinism (same seed = same results)

---

## ⚡ Known Optimizations Applied

### ✅ Phase 3 Improvements

1. **Constants Extraction**
   - All magic numbers moved to config/
   - Easier balance tuning without code changes
   - Reduced cognitive load

2. **Logger System**
   - Production mode suppresses debug logs
   - No console.log overhead in prod
   - Buffered logs (last 100 messages)

3. **Seeded RNG**
   - Deterministic randomness
   - Testable, reproducible
   - No Math.random() overhead

4. **Lazy Evaluation**
   - Shop stock generated on-demand
   - Pack contents generated on open
   - Collection loaded only when viewed

---

## 🚫 Anti-Patterns to Avoid

### ❌ DOM Thrashing
```javascript
// BAD: Reading and writing DOM in loops
for (let i = 0; i < dice.length; i++) {
    element.style.width = element.offsetWidth + 10 + 'px'; // Forces reflow!
}

// GOOD: Batch reads, then batch writes
const widths = dice.map(d => d.element.offsetWidth);
widths.forEach((w, i) => dice[i].element.style.width = w + 10 + 'px');
```

### ❌ Unnecessary Re-renders
```javascript
// BAD: Re-rendering entire scorecard on every update
updateScorecard() {
    this.renderEntireScorecard(); // Wasteful!
}

// GOOD: Update only changed cells
updateScorecard(category) {
    this.updateScorecardCell(category); // Targeted!
}
```

### ❌ Memory Leaks
```javascript
// BAD: Creating new event listeners without cleanup
element.addEventListener('click', () => { /* ... */ });

// GOOD: Store reference and clean up
this.handlers.click = () => { /* ... */ };
element.addEventListener('click', this.handlers.click);
// Later: element.removeEventListener('click', this.handlers.click);
```

### ❌ Breaking Determinism
```javascript
// BAD: Using Math.random()
const randomValue = Math.random(); // Non-deterministic!

// GOOD: Using seeded RNG
const randomValue = this.prng.random(); // Deterministic!
```

---

## 🎯 Future Optimization Candidates

### Low-Hanging Fruit

1. **Card Rendering Optimization**
   - Currently creates full DOM for every card
   - Could use template cloning
   - Could implement virtual scrolling for shop

2. **Scorecard Caching**
   - Currently recalculates on every hover
   - Could cache scores and invalidate on roll
   - Would reduce calculateScore() calls by ~80%

3. **Enhancement Processing**
   - Currently iterates all enhancements every score
   - Could pre-compute enhancement totals
   - Would speed up scoring calculations

### Medium Effort

1. **Virtual DOM for Dice**
   - Diff-based updates instead of full re-render
   - Only update changed dice
   - Smoother animations

2. **Object Pooling**
   - Reuse card DOM elements
   - Reuse result objects
   - Reduce GC pressure

3. **Lazy Image Loading**
   - Defer non-visible card images
   - Use Intersection Observer
   - Faster initial load

### High Effort (Future Phases)

1. **Web Workers**
   - Move heavy calculations off main thread
   - AI generation for pack contents
   - Analytics processing

2. **Canvas Rendering**
   - Replace DOM dice with canvas
   - Hardware-accelerated
   - More control over animations

3. **State Management Optimization**
   - Immutable state with structural sharing
   - Time-travel debugging
   - Undo/redo support

---

## 📊 Performance Budget

| Metric | Budget | Current | Status |
|--------|--------|---------|--------|
| Bundle Size (JS) | <100KB | ~80KB | ✅ |
| Bundle Size (CSS) | <30KB | ~20KB | ✅ |
| First Paint | <1s | ~0.5s | ✅ |
| Time to Interactive | <2s | ~1.5s | ✅ |
| FPS (gameplay) | 60fps | 60fps | ✅ |
| rollDice() | <5ms | ~2ms | ✅ |
| calculateScore() | <10ms | ~5ms | ✅ |
| renderDice() | <16ms | ~10ms | ✅ |

---

## 🔬 Benchmarking Code Snippets

### Measure Function Execution Time
```javascript
function benchmark(fn, iterations = 1000) {
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
        fn();
    }
    const end = performance.now();
    const avg = (end - start) / iterations;
    Logger.debug(`Benchmark: ${avg.toFixed(3)}ms avg over ${iterations} iterations`);
}

// Usage
benchmark(() => game.rollDice(), 1000);
```

### Measure Render Performance
```javascript
function measureRender(fn) {
    const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            Logger.debug(`${entry.name}: ${entry.duration.toFixed(2)}ms`);
        }
    });
    observer.observe({ entryTypes: ['measure'] });
    
    performance.mark('render-start');
    fn();
    performance.mark('render-end');
    performance.measure('render-duration', 'render-start', 'render-end');
}

// Usage
measureRender(() => uiManager.renderDice());
```

### Memory Usage Snapshot
```javascript
function checkMemory() {
    if (performance.memory) {
        const { usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit } = performance.memory;
        Logger.debug('Memory', {
            used: `${(usedJSHeapSize / 1048576).toFixed(2)} MB`,
            total: `${(totalJSHeapSize / 1048576).toFixed(2)} MB`,
            limit: `${(jsHeapSizeLimit / 1048576).toFixed(2)} MB`
        });
    }
}

// Usage: Call periodically during gameplay
setInterval(checkMemory, 5000);
```

---

## 🎓 AI Optimization Instructions

When asked to optimize performance:

1. **Always profile first**
   - Don't guess where bottlenecks are
   - Use Chrome DevTools Performance tab
   - Measure before and after changes

2. **Preserve determinism**
   - Never break seeded RNG
   - Verify same seed = same results after changes
   - Test with multiple seeds

3. **Benchmark changes**
   - Use provided benchmark snippets
   - Document performance gains
   - Consider memory tradeoffs

4. **Respect architecture**
   - Don't restructure to optimize
   - Optimize within existing patterns
   - Suggest architectural changes separately

5. **Document reasoning**
   - Explain why optimization works
   - Note any tradeoffs
   - Update this file with findings

---

**Remember**: Premature optimization is the root of all evil. Profile, measure, then optimize.

