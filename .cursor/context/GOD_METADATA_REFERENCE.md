# God Metadata Reference

## Overview
The `GOD_METADATA` constant in `js/config/GameConstants.js` contains comprehensive metadata for all gods in the Dice of Dionysus pantheon, including gender information for potential boon interactions.

## God Roster

**Source of truth:** `js/config/GameConstants.js` → `GOD_TO_CATEGORY`, `GOD_METADATA`, `GodUtils.getGodForCategory()` / `GodUtils.getCategory()`.

### Female Deities (8 total)
- **Artemis** - Goddess of the Hunt (Ones)
- **Persephone** - Goddess of Spring/Underworld (Twos)
- **Hera** - Queen of the Gods (Fours)
- **Athena** - Goddess of Wisdom (Fives)
- **Nyx** - Goddess of Night (Chance)
- **The Pleiades** - Seven Sisters (Sevens)
- **The Nine Muses** - Nine Goddesses of the Arts (Nines)

### Male Deities (9 total)
- **Morpheus** - God of Dreams (Threes)
- **Heracles** - Hero of Strength (Sixes)
- **Hephaestus** - God of the Forge (Three of a Kind)
- **Ares** - God of War (Four of a Kind)
- **Dionysus** - God of Wine (Full House)
- **Hermes** - God of Travel & Messages (Small Straight)
- **Apollo** - God of Sun & Music (Large Straight)
- **Zeus** - King of the Gods (Yahtzee)
- **Poseidon** - God of the Sea (Eights)

## Usage in Boons

### Example: Gender-Based Boon Effects

```javascript
// Example boon: "Amazonian Strength"
// Effect: "+2 Favour for each female god you've worshipped"
case 'amazonian_strength':
    const femaleGods = GodUtils.getFemaleGods();
    const worshippedFemaleGods = femaleGods.filter(god => 
        (gameState.worshipLevels[god] || 0) > 0
    );
    eventData.favour += worshippedFemaleGods.length * 2;
    break;

// Example boon: "Olympian Council"
// Effect: "+1 Favour if scoring a male god's category"
case 'olympian_council':
    const god = this.getGodForCategory(eventData.category);
    if (god && GodUtils.isMale(god)) {
        eventData.favour += 1;
    }
    break;

// Example boon: "Divine Harmony"
// Effect: "+5 Pips if equal male and female worship levels
case 'divine_harmony':
    const maleWorship = GodUtils.getMaleGods()
        .reduce((sum, god) => sum + (gameState.worshipLevels[god] || 0), 0);
    const femaleWorship = GodUtils.getFemaleGods()
        .reduce((sum, god) => sum + (gameState.worshipLevels[god] || 0), 0);
    if (maleWorship === femaleWorship && maleWorship > 0) {
        eventData.pips += 5;
    }
    break;
```

### Example: Domain-Based Effects

```javascript
// Example boon: "Warrior's Rage"
// Effect: "×2 Favour when scoring war god's category"
case 'warriors_rage':
    const god = this.getGodForCategory(eventData.category);
    if (GodUtils.getDomain(god) === 'war') {
        eventData.favourMult *= 2;
    }
    break;
```

## API Reference

### `GOD_METADATA` Object
Direct access to god data:
```javascript
GOD_METADATA['Athena']
// Returns: { gender: 'female', domain: 'wisdom', category: 'Fives' }
```

### `GodUtils` Helper Functions

| Function | Returns | Description |
|----------|---------|-------------|
| `getGender(godName)` | `'male'/'female'/null` | Get god's gender |
| `getGodsByGender(gender)` | `Array<string>` | Get all gods of specified gender |
| `getFemaleGods()` | `Array<string>` | Get all goddess names |
| `getMaleGods()` | `Array<string>` | Get all male god names |
| `getDomain(godName)` | `string/null` | Get god's domain (e.g., 'war', 'wisdom') |
| `getCategory(godName)` | `string/null` | Get associated score category |
| `isFemale(godName)` | `boolean` | Check if goddess |
| `isMale(godName)` | `boolean` | Check if male god |

## Console Testing

Test in browser console:
```javascript
// Get all female gods
GodUtils.getFemaleGods()
// ["Aphrodite", "Artemis", "Athena", "Hera", "Nyx", "Persephone", "The Pleiades", "The Nine Muses"]

// Get all male gods
GodUtils.getMaleGods()
// ["Apollo", "Ares", "Dionysus", "Hephaestus", "Heracles", "Hermes", "Morpheus", "Poseidon", "Zeus"]

// Check specific god
GodUtils.isFemale('Athena')  // true
GodUtils.isMale('Zeus')      // true
GodUtils.getDomain('Ares')   // "war"
```

## Future Boon Ideas

Potential boon concepts using gender metadata:

- **Sisters of Fate** - Bonus when worshipping 3+ female gods
- **Brotherhood of Heroes** - Bonus for each unique male god worshipped
- **Gender Balance** - Bonus when equal male/female worship
- **Matriarchal Rule** - Female gods give double worship
- **Patriarchal Dominance** - Male gods give extra pips
- **Divine Romance** - Aphrodite gives bonus based on male god worship
- **War & Wisdom** - Ares and Athena synergy bonus

## Notes

- The Pleiades and The Nine Muses are plural entities but classified as female (all sisters/muses were goddesses)
- Heracles is a male demigod/hero (son of Zeus)
- Some gods have alternate names in different versions (e.g., Hercules/Heracles)

