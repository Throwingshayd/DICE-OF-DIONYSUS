# Dice of Dionysus - Version 1.4 Changelog

## Release Date: August 12, 2025

### 🎵 **NEW: Background Music System**
- **MusicManager Class** - New JavaScript class for handling background music playback
- **5 Lute Tracks** - Medieval lute music with effects from ART/Music directory
- **Auto-Start on Play** - Music begins when clicking the "Play" button
- **4-Second Crossfades** - Smooth transitions between tracks
- **Random Playback** - Tracks play in random order for variety
- **Silent Operation** - No UI controls, pure background music
- **Error Recovery** - Automatic fallback if tracks fail to load

### 🔧 **Technical Improvements**
- **Web Audio API** - Uses modern browser audio capabilities
- **Gain Node Crossfading** - Professional-quality audio transitions
- **Async Audio Loading** - Non-blocking audio file loading
- **Browser Compliance** - Works with autoplay policies requiring user interaction

### 🎯 **User Experience**
- **Immediate Music** - Music starts as soon as you begin a game
- **Continuous Playback** - Music plays throughout entire game session
- **No Interruption** - Seamless background ambiance
- **Medieval Atmosphere** - Authentic lute tracks enhance game immersion

### 📁 **Files Added/Modified**
- **NEW**: `js/ui/MusicManager.js` - Complete music management system
- **MODIFIED**: `js/Main.js` - Integrated music system initialization
- **MODIFIED**: `index.html` - Added MusicManager script import
- **MODIFIED**: `js/game/GameEngine.js` - Removed music UI controls

### 🎵 **Music Tracks Included**
1. `lute 1 effects.wav`
2. `lute 2 w effects.wav`
3. `lute 3 w effects.wav`
4. `lute 4 w effects.wav`
5. `lute 5 w effects.wav`

### 🚀 **How to Use**
1. **Start Game** - Click "Play" button to begin
2. **Music Auto-Starts** - Background lute music begins immediately
3. **Continuous Play** - Music plays throughout your game session
4. **Smooth Transitions** - 4-second crossfades between tracks
5. **No Controls Needed** - Music runs silently in background

### 🔍 **Technical Notes**
- **CORS Resolution** - Requires local HTTP server (use `python -m http.server 8000`)
- **Audio Context** - Automatically resumes from suspended state
- **Memory Management** - Proper cleanup of audio resources
- **Error Handling** - Graceful fallback for failed audio loads

### 📋 **Previous Versions**
- **v1.3** - Balatro-style UI effects, tooltips, shop improvements
- **v1.2** - Core game mechanics and optimization
- **v1.1** - Initial game framework and basic functionality
- **v1.0** - Base game structure and mechanics

---

**Version 1.4** represents a significant enhancement to the game's atmosphere and immersion, adding professional-quality background music that enhances the medieval Greco theme without requiring any user interaction or UI changes.
