# Icon & image reference

Supplied by the guild for assignment/buff boxes. Wowhead icons are used
by **slug** with `https://wow.zamimg.com/images/wow/icons/<size>/<slug>.jpg`
(size = `medium` or `large`); wikia/static assets are full URLs.

## Spell / buff icons (zamimg slugs)

| Buff | Slug |
|---|---|
| Prayer of Fortitude | `spell_holy_prayeroffortitude` |
| Fear Ward | `spell_holy_excorcism` |
| Power Infusion | `spell_holy_powerinfusion` |
| Seal of Light | `spell_holy_healingaura` |
| Seal of Wisdom | `spell_holy_righteousnessaura` |
| Seal of Crusader | `spell_holy_holysmite` |
| Greater Blessing of Salvation | `spell_holy_greaterblessingofsalvation` |
| Greater Blessing of Kings | `spell_magic_greaterblessingofkings` |
| Greater Blessing of Might | `spell_holy_greaterblessingofkings` |
| Greater Blessing of Wisdom | `spell_holy_greaterblessingofwisdom` |
| Greater Blessing of Light | `spell_holy_greaterblessingoflight` |
| Greater Blessing of Sanctuary | `spell_holy_greaterblessingofsanctuary` |
| Blessing of Protection | `spell_holy_sealofprotection` |
| Gift of the Wild | `spell_nature_regeneration` |
| Faerie Fire | `spell_nature_faeriefire` |
| Arcane Brilliance | `spell_holy_arcaneintellect` |
| Sunder Armor | `ability_warrior_sunder` |
| Curse of Recklessness | `spell_shadow_unholystrength` |
| Curse of the Elements | `spell_shadow_chilltouch` |
| Curse of Shadow | `spell_shadow_curseofachimonde` |
| Soulstone | `inv_misc_orb_04` (buff sheet currently uses `spell_shadow_soulgem`) |
| Kick | `ability_kick` |
| Power Word: Shield | `spell_holy_powerwordshield` |
| Death Wish | `spell_shadow_deathpact` |
| Earth Shield | `spell_nature_skinofearth` |
| Misdirection (already in use on MD rows) | `ability_hunter_misdirection` |
| Disarm | *(link pending)* |

## Raid markers (wikia PNGs)

Currently rendered as Unicode glyphs in `lib/assignments.ts` TANK_MARKERS
(no CDN dependency); these are the image alternatives if we ever switch:

| Marker | URL |
|---|---|
| Skull | https://static.wikia.nocookie.net/wowwiki/images/7/73/IconSmall_RaidSkull.png/revision/latest?cb=20071030174221 |
| Cross | https://static.wikia.nocookie.net/wowwiki/images/e/e0/IconSmall_RaidCross.png/revision/latest?cb=20071030173844 |
| Circle | https://static.wikia.nocookie.net/wowwiki/images/2/23/IconSmall_RaidCircle.png/revision/latest?cb=20071030173533 |
| Star | https://static.wikia.nocookie.net/wowwiki/images/f/fd/IconSmall_RaidStar.png/revision/latest?cb=20071030173506 |
| Square | https://static.wikia.nocookie.net/wowwiki/images/d/df/IconSmall_RaidSquare.png/revision/latest?cb=20071030174116 |
| Triangle | https://static.wikia.nocookie.net/wowwiki/images/8/86/IconSmall_RaidTriangle.png/revision/latest?cb=20071030173731 |
| Diamond | https://static.wikia.nocookie.net/wowwiki/images/2/2f/IconSmall_RaidDiamond.png/revision/latest?cb=20071030173555 |
| Moon | https://static.wikia.nocookie.net/wowwiki/images/5/5e/IconSmall_RaidMoon.png/revision/latest?cb=20071030173751 |

## Misc

| Item | URL |
|---|---|
| Gnomish Cloaking Device | https://static.wikia.nocookie.net/wowwiki/images/0/02/Inv_gizmo_01.png/revision/latest?cb=20061008050507 |

## Still-pending links (missing items list)

- Disarm icon (blank in the source table)
- WeakAura URLs: Shahraz Prismatic Shield Checker, Shahraz Shadow
  Resistance Checker, Council Heal Kick, Kaz'rogal Low Mana Warning
- Strategy images for all 14 boss card rails (Illidan multi-phase)
