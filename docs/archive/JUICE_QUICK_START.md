# Juice System Quick Start Guide

## ✅ What's Already Working

When you load the game right now:
1. **All buttons automatically bounce** when you click them (JuiceIntegration.addButtonJuice)
2. **Smooth CSS transitions** on all UI elements
3. **Particle system ready** to create visual effects
4. **JuiceManager** provides bounce/wobble effects

## 🎮 Test It Right Now

### Test 1: Button Juice (Already Active!)
1. Open `index.html` in your browser
2. Click the "Play" button
3. **You should see it bounce/wobble!** ✨

### Test 2: Particle Burst
1. Open the browser console (F12)
2. Type: `window.particleSystem.burst(500, 500, 30)`
3. Press Enter
4. **You should see golden particles burst in the center!** ✨

### Test 3: Manual Juice
1. In console: `window.juiceManager.juiceUp(document.querySelector('.divine-button'), 0.8)`
2. **Watch the button bounce bigger!** ✨

### Test 4: Screen Shake
1. In console: `window.juiceManager.screenShake(15, 500)`
2. **Screen shakes!** ✨

## 🚀 Add Juice To Your Game Events

Use `window.juiceManager.juiceUp(element, intensity)` and `window.particleSystem` directly in game logic. Example: in `GameEngine.js` after scoring, call `window.juiceManager.juiceUp(liveScoreEl, 0.4)` (already wired for live score display).

### Example: Juice the Dice When They Roll
Add to `GameEngine.js` in `executeRoll()` after dice values are set:

```javascript
// Add after dice.forEach((die) => { die.roll() })
if (window.juiceManager) {
    const diceElements = this.dom.diceContainer?.querySelectorAll('.die');
    diceElements?.forEach((el, i) => {
        if (!this.state.held[i]) {
            window.juiceManager.juiceUp(el, 0.4);
        }
    });
}
```

### Example: Gold Change Particles
Add anywhere gold changes:

```javascript
if (window.particleSystem && goldChange > 0) {
    const el = document.getElementById('goldDisplay');
    if (el) {
        const rect = el.getBoundingClientRect();
        window.particleSystem.goldCoins(rect.left + rect.width/2, rect.top + rect.height/2, Math.min(goldChange, 15));
    }
}
```

## 📚 API Reference (Wired)

### JuiceManager
```javascript
window.juiceManager.juiceUp(element, intensity, rotation);
window.juiceManager.juiceSequential(elements, staggerDelay, intensity);
window.juiceManager.screenShake(intensity, duration);
```

### ParticleSystem
```javascript
window.particleSystem.spawn(x, y, options);
window.particleSystem.burst(x, y, count, options);
window.particleSystem.goldCoins(x, y, count);
window.particleSystem.scoreCelebration(x, y, count);
window.particleSystem.divineSparkle(x, y, count);
```

### JuiceIntegration (Wired)
```javascript
// Button juice is auto-applied via initialize() -> addButtonJuice()
// No other JuiceIntegration methods are wired; use JuiceManager + ParticleSystem directly.
```

## 🐛 Troubleshooting

### Juice not working?
1. Check console for errors
2. Verify `window.juiceManager` exists
3. Ensure `ensureGameEffectsReady()` ran (game start)

### Particles not showing?
1. Check `window.particleSystem` exists
2. Try: `window.particleSystem.burst(500, 500, 30)` in console
