# Boon Image Prompts — Consistent Asset Generation

**Purpose:** Generalised specs + per-boon prompts for AI image generation. Use with DALL·E, Midjourney, Stable Diffusion, etc.

---

## 1. General Specifications (Use for Every Boon)

| Property | Value |
|----------|-------|
| **Format** | PNG |
| **Dimensions** | 284×380px (or 142×190px minimum) |
| **Aspect ratio** | 3:4 portrait |
| **Style** | 16-bit pixel art, Greek mythology, Balatro-style joker card |
| **Quality** | Crisp edges, no blur, dithering for gradients, 2px black outline |
| **Composition** | Centered icon/symbol, portrait orientation |
| **Palette** | Warm amber, olive, gold, purple — vary by rarity |

**Base prompt prefix (prepend to each boon prompt):**
```
16-bit pixel art, Greek mythology card, Balatro joker style, centered symbol, 
crisp pixel edges, dithering, no blur, 2px outline, vibrant retro palette, portrait 3:4 ratio.
No text, no writing, no letters — icon/symbol only. PORTRAIT orientation — image must be TALLER than wide (3:4 ratio, vertical playing card). No landscape or widescreen. Image fills the card frame exactly, no padding or margins outside the card boundaries.
```

---

## 2. Rarity Color Hints

| Rarity | Palette |
|--------|---------|
| Rustic | Earth tones, brown, green, muted |
| Vibrant | Gold, purple, blue, saturated |
| Epic | Deep purple, gold, celestial |
| Legendary | Dark + gold, cosmic |

---

## 3. Boon Prompts Table

| Boon Name | Prompt |
|-----------|--------|
| Hestia's Hearth | Warm hearth flame, home fire, hospitality, domestic warmth |
| Charon's Ferry Fare | Obol coin, river Styx, skeletal ferryman, underworld boat |
| The Gambler | Dice, luck, gambling chips, risk |
| Achilles' Heel | Shield with single vulnerable spot, warrior weakness |
| Midas Touch | Golden hand, coins, wealth, gilding |
| Icarus' Wings | Wax wings, sun, flight, tragic ascent |
| Lethe Waters | River of forgetfulness, flowing water, oblivion |
| Forge of Hephaestus | Anvil, hammer, fire, blacksmith tools |
| Prometheus' Gift | Flame, torch, chains, stolen fire |
| Chaos Primordial | Void, swirling darkness, primordial abyss |
| Mt Olympus | Mountain peak, clouds, divine summit, gods' home |
| Sisyphus' Boulder | Boulder, hill, eternal labour, pushing |
| Kronos' Hourglass | Hourglass, time, sand, chronology |
| Pandora's Jar | Pithos jar, lid, hope, evils escaping |
| Demeter's Harvest | Wheat, grain, harvest, fertility |
| Medusa's Gaze | Serpent hair, stone gaze, petrifying stare |
| Dionysus' Revelry | Grapes, wine, thyrsus, celebration |
| Apollo's Oracle | Lyre, laurel, prophecy, sun |
| Hydra's Heads | Multiple serpent heads, regeneration, Lerna |
| Tantalus' Curse | Fruit, water, unreachable, eternal hunger |
| Pegasus' Flight | Winged horse, flight, clouds |
| Cerberus' Watch | Three-headed dog, underworld guardian |
| The Trojan Horse | Wooden horse, hidden soldiers, deception |
| Lucky Dice Bag | Dice bag, luck, fortune |
| Gambler's Charm | Lucky charm, coin, risk |
| Marathon Runner | Runner, road, exhaustion, Pheidippides |
| Golden Touch | Gold coins, Midas, wealth |
| Mathematician's Compass | Compass, geometry, precision |
| Prime Time | Prime numbers, 2 3 5 7, mathematical |
| The Locksmith | Key, lock, mechanism |
| The Merchant | Scales, coins, trade |
| The Heretic | Defiant figure, flames, rebellion |
| Reckless Abandon | Chaos, dice flying, no holds |
| Typhon | Monster, storm, father of monsters |
| Early Bird Gets the Worm | Bird, worm, dawn, early advantage |
| The Symposium | Gathering, wine, philosophers |
| Assembly of Heroes | Group of heroes, unity |
| Divine Synergy | Interlocking symbols, harmony |
| First Blood | Sword, blood, first strike |
| Midnight Oil | Lamp, oil, late night work |
| Parmenides Die | Philosopher, change, paradox |
| Doubling Season | Growth, decay, balance |
| Symmetry | Mirror, palindrome, balance |
| Misery | Poverty, rags, divine favour from suffering |
| Smog of Morpheus | Dream mist, poppy, sleep |
| The Zealot | Devotee, worship, fervour |
| Mortal Vineyard | Vineyard, grapes, transformation |
| Proteus' Disguise | Shape-shifter, sea, changing form |
| Cornucopia of Ploutos | Horn of plenty, wealth, abundance |
| The Odyssey | Ship, journey, Ithaca |
| Message in a Bottle | Bottle, scroll, sea |
| Betrayal by Paris | Apple, Troy, betrayal |
| Eruption of Etna | Volcano, lava, Hephaestus |
| The Cycle of Seasons | Four seasons, cycle, Demeter |
| Ascetic's Vow | Empty space, monk, simplicity |
| Bellows of War | Bellows, forge, phantom power |
| Nyxian Seduction | Night, stars, temptation |
| Gold Standard | Gold enhancement, premium |
| Carillon of the Muses | Bells, harmony, nine muses |
| Reflection of Narcissus | Mirror, reflection, pool |
| Journey of Perseus | Hero, Medusa head, quest |

---

## 4. Full Prompt Example

```
16-bit pixel art, Greek mythology card, Balatro joker style, centered symbol, 
crisp pixel edges, dithering, no blur, 2px outline, vibrant retro palette, portrait 3:4 ratio.
No text, no writing, no letters — icon/symbol only. PORTRAIT orientation — image must be TALLER than wide (3:4 ratio, vertical playing card). No landscape or widescreen. Image fills the card frame exactly, no padding or margins outside the card boundaries.
Mt Olympus: mountain peak, clouds, divine summit, gods' home.
```

---

## 5. Filename Mapping

| Boon ID | Suggested filename |
|---------|--------------------|
| hestias_hearth | hestias hearth.png |
| charons_ferry_fare | charon ferry fare.png |
| the_gambler | the gambler.png |
| achilles_heel | achilles heel.png |
| midas_touch | midas touch.png |
| icarus_wings | icarus wings.png |
| lethe_waters | lethe waters.png |
| forge_of_hephaestus | forge of hephaestus.png |
| prometheus_gift | prometheus gift.png |
| chaos_primordial | chaos primordial.png |
| mt_olympus | mt olympus.png |
| sisyphus_boulder | sisyphus boulder.png |
| kronos_hourglass | kronos hourglass.png |
| pandoras_jar | pandoras jar.png |
| demeters_harvest | demeters harvest.png |
| medusas_gaze | medusas gaze.png |
| dionysus_revelry | dionysus revelry.png |
| apollos_oracle | apollos oracle.png |
| hydras_heads | hydras heads.png |
| tantalus_curse | tantalus curse.png |
| pegasus_flight | pegasus flight.png |
| cerberus_watch | cerberus watch.png |
| trojan_horse | trojan horse.png |
| lucky_dice_bag | lucky dice bag.png |
| gamblers_charm | gamblers charm.png |
| marathon_runner | marathon runner.png |
| golden_touch | golden touch.png |
| mathematicians_compass | mathematicians compass.png |
| prime_time | prime time.png |
| the_locksmith | the locksmith.png |
| the_merchant | the merchant.png |
| the_heretic | the heretic.png |
| reckless_abandon | reckless abandon.png |
| typhon | typhon.png |
| early_bird | early bird.png |
| the_symposium | the symposium.png |
| assembly_of_heroes | assembly of heroes.png |
| divine_synergy | divine synergy.png |
| first_blood | first blood.png |
| midnight_oil | midnight oil.png |
| parmenides_die | parmenides die.png |
| doubling_season | doubling season.png |
| symmetry | symmetry.png |
| misery | misery.png |
| smog_of_morpheus | smog of morpheus.png |
| the_zealot | the zealot.png |
| mortal_vineyard | mortal vineyard.png |
| proteus_disguise | proteus disguise.png |
| cornucopia_of_ploutos | cornucopia of ploutos.png |
| the_odyssey | the odyssey.png |
| message_in_a_bottle | message in a bottle.png |
| betrayal_by_paris | betrayal by paris.png |
| eruption_of_etna | eruption of etna.png |
| cycle_of_seasons | cycle of seasons.png |
| ascetics_vow | ascetics vow.png |
| bellows_of_war | bellows of war.png |
| nyxian_seduction | nyxian seduction.png |
| gold_standard | gold standard.png |
| carillon_of_the_muses | carillon of the muses.png |
| reflection_of_narcissus | reflection of narcissus.png |
| journey_of_perseus | journey of perseus.png |
