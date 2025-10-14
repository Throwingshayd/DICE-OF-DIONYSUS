# 🚀 Live Server for Cursor - Quick Setup Guide

## Method 1: Install from Cursor (Recommended)

### Steps:
1. **Open Cursor**
2. **Press:** `Ctrl+Shift+X` (Opens Extensions panel)
3. **Search:** "Live Server"
4. **Look for:** "Live Server" by Ritwick Dey (most popular)
5. **Click:** "Install" button
6. **Wait:** ~10 seconds for installation
7. **Done!** ✅

### Using Live Server:
1. Right-click `index.html` in Cursor
2. Select **"Open with Live Server"**
3. Browser opens at `http://localhost:5500`
4. Game runs!

**Bonus:** Auto-reloads when you save changes to any file!

---

## Method 2: Alternative - Use Built-in Simple Server

If you have Python installed:

```bash
# In terminal (Ctrl+`)
python -m http.server 8000
```

Then open: `http://localhost:8000`

---

## Method 3: Just Double-Click (No Server Needed!)

For testing purposes, you don't actually need a server:

1. **Navigate to:** `C:\Users\Lorcan\Desktop\DICE-OF-DIONYSUS-WORKING\`
2. **Double-click:** `index.html`
3. **Game opens!** ✅

### Why this works:
- Your game is pure client-side JavaScript
- No server required
- All assets load from local files
- Save/load uses localStorage (works offline)

---

## 🎯 Best Option for Development

**Use Live Server because:**
- ✅ Auto-reloads on file changes
- ✅ Shows on `localhost` (better for testing)
- ✅ Proper CORS handling
- ✅ Professional development setup

**But for quick testing:**
- ✅ Just double-click `index.html`
- ✅ Works immediately
- ✅ No setup needed

---

## 🔧 Troubleshooting

### "Extension not found"
- Make sure you're searching "Live Server" (two words)
- Look for Ritwick Dey as author
- Try restarting Cursor

### "Can't install extension"
- Check internet connection
- Try: Ctrl+Shift+P → "Reload Window"
- Restart Cursor

### "Live Server won't start"
- Port 5500 might be in use
- Try right-clicking index.html again
- Check bottom status bar for "Go Live" button

---

## ⚡ Quick Test Right Now

**Don't want to wait? Use this:**

1. Press `Win+R`
2. Type: `C:\Users\Lorcan\Desktop\DICE-OF-DIONYSUS-WORKING\index.html`
3. Press Enter
4. **Game launches!** 🎮

---

*No server needed - your game works offline!*

