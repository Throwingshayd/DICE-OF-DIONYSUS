# 🧪 Test Mode: High Faces (7s, 8s, 9s)

## How to Enable Test Mode

To test dice with faces showing 7, 8, and 9, add `?test=highfaces` to your URL:

```
http://localhost:5173/?test=highfaces
```

Or if running directly:
```
file:///path/to/index.html?test=highfaces
```

## What Test Mode Does

When test mode is enabled, the game will automatically:

1. **Unlock all high categories:**
   - Sevens category unlocked
   - Eights category unlocked
   - Nines category unlocked

2. **Modify dice faces:**
   - **Die 1:** Face 6 becomes 7
   - **Die 2:** Face 6 becomes 8
   - **Die 3:** Face 6 becomes 9
   - **Die 4:** Face 5 becomes 7
   - **Die 5:** Face 4 becomes 8

3. **Give extra gold:**
   - Starting gold: 50 (instead of 4)

## How to Test

1. **Start the game** with the test URL parameter
2. **Roll the dice** until you see high values (7, 8, or 9)
3. **Score them** in the corresponding category (Sevens, Eights, or Nines)
4. **Check the console** (F12) for debug logs showing:
   - Die face values (currentFace, value, modifiedValue, effectiveFace)
   - Scoring calculations (faces array, counts object, pips calculation)

## Expected Debug Output

When you score a 7 in the Sevens category, you should see:

```
[DEBUG] Die 0: currentFace=6, value=6, modifiedValue=7, effectiveFace=7
[DEBUG] Scoring Sevens: faces=[7, 2, 3, 4, 5], counts= {7: 1, 2: 1, 3: 1, 4: 1, 5: 1}
[DEBUG] Scoring Sevens: num=7, counts[7]=1, pips will be 7
```

## Troubleshooting

If the test mode doesn't activate:
1. Check the browser console for the message: `🧪 TEST MODE: High Faces (7s, 8s, 9s) enabled`
2. Make sure the URL parameter is exactly `?test=highfaces`
3. Try refreshing the page with Ctrl+F5 (hard refresh)

## Normal Mode

To return to normal gameplay, simply remove the `?test=highfaces` parameter from the URL.


