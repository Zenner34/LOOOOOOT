-- Week 16 (May 19, 2026) loot import — SSC + TK clear.
--
-- 53 awards total:
--   - 42 item awards from the 5/19 raid log (rows 2-43 of the source
--     sheet — Chainsawgirl and Dodyx each appear once per their row;
--     the "second screenshot" duplication was just the bottom of the
--     same log scrolled into view).
--   - 1 Pattern: Belt of Blasting award to Koco's mage.
--   - 10 Nether Vortex reagent awards: Cash 2, Koco 3, Rfx 5.
--
-- Every character resolves to an EXISTING (player, class, spec) — no
-- new players or characters this week. In-game names that differ from
-- our DB character names map by (player + class + spec):
--   Boredudu      → Bored,        Druid,   Feral Druid (Tank)
--   Dogelock      → Doge,         Warlock, Affliction Warlock
--   Thesleepyrat  → Sleepyrat,    Paladin, Holy Paladin
--   Lipstix       → Glzy,         Paladin, Retribution Paladin
--   Chainsawgirl  → Chainsaw,     Hunter,  Beast Mastery Hunter (main)
--   Defcash       → Cash,         Hunter,  Beast Mastery Hunter (alt)
--   Shmooches     → Shmoo,        Priest,  Holy Priest (main)
--   Zynandcoffee  → Skryt,        Shaman,  Restoration Shaman (alt)
--   Thatsmydog    → Whappintime,  Hunter,  Beast Mastery Hunter (main)
--   Smashonebutn  → Massesto,     Paladin, Protection Paladin (main)
--   Bakeshaman    → Bake,         Shaman,  Restoration Shaman (alt)
--   Dodyx         → Dody,         Shaman,  Enhancement Shaman (main)
--
-- Every Mage is "Arcane Mage" in the live DB (renamed via admin after
-- the original import); Blargn and Koco lookups use that spec even
-- though roster.sql still shows "Frost Mage".
--
-- Idempotent — re-running deletes and re-inserts the May 19 RaidNight
-- + its awards, so duplicate runs converge.

BEGIN;

-- ════════════════════════════════════════════════════════════════════════
-- 1. Reset the May 19 RaidNight + its awards so re-runs converge.
-- ════════════════════════════════════════════════════════════════════════
DELETE FROM "LootAward"
 WHERE "raidNightId" IN (
   SELECT id FROM "RaidNight"
    WHERE date = '2026-05-19'
      AND "rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster')
 );
DELETE FROM "RaidNight"
 WHERE date = '2026-05-19'
   AND "rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster');

INSERT INTO "RaidNight" ("rosterId", date, notes)
VALUES ((SELECT id FROM "Roster" WHERE name = 'Master Roster'), '2026-05-19', 'Week 16 - SSC + TK');

-- ════════════════════════════════════════════════════════════════════════
-- 2. LootAwards (53 rows).
-- ════════════════════════════════════════════════════════════════════════
INSERT INTO "LootAward" ("itemId", "characterId", "rosterId", "raidNightId", "awardedAt")
SELECT
  (SELECT id FROM "Item" WHERE name = v.item LIMIT 1),
  (SELECT c.id FROM "Character" c JOIN "Player" p ON c."playerId" = p.id
    WHERE p."displayName" = v.player AND c.class = v.class AND c.spec = v.spec
    LIMIT 1),
  (SELECT id FROM "Roster" WHERE name = 'Master Roster'),
  (SELECT id FROM "RaidNight"
    WHERE date = '2026-05-19'
      AND "rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster')
    LIMIT 1),
  '2026-05-19T00:00:00Z'::timestamp
  FROM (VALUES
    ('Bored',        'Druid',   'Feral Druid (Tank)',   'Pauldrons of the Vanquished Defender'),
    ('Doge',         'Warlock', 'Affliction Warlock',   'Verdant Sphere'),
    ('Pizookies',    'Warrior', 'Fury Warrior',         'Chestguard of the Vanquished Defender'),
    ('Pizookies',    'Warrior', 'Fury Warrior',         'Pauldrons of the Vanquished Defender'),
    ('Sleepyrat',    'Paladin', 'Holy Paladin',         'Royal Gauntlets of Silvermoon'),
    ('Sleepyrat',    'Paladin', 'Holy Paladin',         'Seventh Ring of the Tirisfalen'),
    ('Priestlynn',   'Priest',  'Shadow Priest',        'Wand of the Forgotten Star'),
    ('Priestlynn',   'Priest',  'Shadow Priest',        'Band of Al''ar'),
    ('Glzy',         'Paladin', 'Retribution Paladin',  'Greaves of the Bloodwarder'),
    ('Glzy',         'Paladin', 'Retribution Paladin',  'Tome of Fiery Redemption'),
    ('Chainsaw',     'Hunter',  'Beast Mastery Hunter', 'Chestguard of the Vanquished Hero'),
    ('Cash',         'Hunter',  'Beast Mastery Hunter', 'Bands of the Celestial Archer'),
    ('Blargn',       'Mage',    'Arcane Mage',          'Gauntlets of the Sun King'),
    ('Koco',         'Mage',    'Arcane Mage',          'Chestguard of the Vanquished Hero'),
    ('Koco',         'Mage',    'Arcane Mage',          'Pauldrons of the Vanquished Hero'),
    ('Glzy',         'Paladin', 'Retribution Paladin',  'Gloves of the Searing Grip'),
    ('Shawtydgaf',   'Rogue',   'Combat Rogue',         'Warp-Spring Coil'),
    ('Cash',         'Hunter',  'Beast Mastery Hunter', 'Gloves of the Vanquished Hero'),
    ('Shmoo',        'Priest',  'Holy Priest',          'Leggings of the Vanquished Defender'),
    ('Shawtydgaf',   'Rogue',   'Combat Rogue',         'Talon of Azshara'),
    ('Shawtydgaf',   'Rogue',   'Combat Rogue',         'Serpentshrine Shuriken'),
    ('Bored',        'Druid',   'Feral Druid (Tank)',   'Helm of the Vanquished Defender'),
    ('Bored',        'Druid',   'Feral Druid (Tank)',   'Wildfury Greatstaff'),
    ('Bored',        'Druid',   'Feral Druid (Tank)',   'Boots of Effortless Striking'),
    ('Bored',        'Druid',   'Feral Druid (Tank)',   'Runetotem''s Mantle'),
    ('Sleepyrat',    'Paladin', 'Holy Paladin',         'Blackfathom Warbands'),
    ('Skryt',        'Shaman',  'Restoration Shaman',   'Wraps of Purification'),
    ('Skryt',        'Shaman',  'Restoration Shaman',   'Glowing Breastplate of Truth'),
    ('Skryt',        'Shaman',  'Restoration Shaman',   'Robe of Hateful Echoes'),
    ('Rfx',          'Warrior', 'Fury Warrior',         'Warboots of Obliteration'),
    ('Rfx',          'Warrior', 'Fury Warrior',         'Pendant of the Perilous'),
    ('Pizookies',    'Warrior', 'Fury Warrior',         'Gloves of the Vanquished Defender'),
    ('Whappintime',  'Hunter',  'Beast Mastery Hunter', 'Helm of the Vanquished Hero'),
    ('Whappintime',  'Hunter',  'Beast Mastery Hunter', 'Gloves of the Vanquished Hero'),
    ('Massesto',     'Paladin', 'Protection Paladin',   'Leggings of the Vanquished Champion'),
    ('Massesto',     'Paladin', 'Protection Paladin',   'The Seal of Danzalar'),
    ('Bake',         'Shaman',  'Restoration Shaman',   'Coral-Barbed Shoulderpads'),
    ('Glzy',         'Paladin', 'Retribution Paladin',  'Pendant of the Perilous'),
    ('Blargn',       'Mage',    'Arcane Mage',          'Leggings of the Vanquished Hero'),
    ('Blargn',       'Mage',    'Arcane Mage',          'Illidari Shoulderpads'),
    ('Dody',         'Shaman',  'Enhancement Shaman',   'World Breaker'),
    ('Chainsaw',     'Hunter',  'Beast Mastery Hunter', 'Helm of the Vanquished Hero'),
    -- Koco's tailoring pattern.
    ('Koco',         'Mage',    'Arcane Mage',          'Pattern: Belt of Blasting'),
    -- Nether Vortex reagent distribution: Cash 2, Koco 3, Rfx 5.
    ('Cash',         'Hunter',  'Beast Mastery Hunter', 'Nether Vortex'),
    ('Cash',         'Hunter',  'Beast Mastery Hunter', 'Nether Vortex'),
    ('Koco',         'Mage',    'Arcane Mage',          'Nether Vortex'),
    ('Koco',         'Mage',    'Arcane Mage',          'Nether Vortex'),
    ('Koco',         'Mage',    'Arcane Mage',          'Nether Vortex'),
    ('Rfx',          'Warrior', 'Fury Warrior',         'Nether Vortex'),
    ('Rfx',          'Warrior', 'Fury Warrior',         'Nether Vortex'),
    ('Rfx',          'Warrior', 'Fury Warrior',         'Nether Vortex'),
    ('Rfx',          'Warrior', 'Fury Warrior',         'Nether Vortex'),
    ('Rfx',          'Warrior', 'Fury Warrior',         'Nether Vortex')
  ) AS v(player, class, spec, item);

COMMIT;

-- Sanity checks (run separately):
--
-- 1. Total awards for May 19 — expect 53. Fewer means a (player,
--    class, spec) or item lookup returned NULL and that row silently
--    failed.
--    SELECT COUNT(*) FROM "LootAward" la
--      JOIN "RaidNight" rn ON la."raidNightId" = rn.id
--     WHERE rn.date = '2026-05-19';
--
-- 2. Per-player breakdown:
--    SELECT p."displayName", c.class, c.spec, i.name
--      FROM "LootAward" la
--      JOIN "RaidNight" rn ON la."raidNightId" = rn.id
--      JOIN "Character" c  ON la."characterId" = c.id
--      JOIN "Player" p     ON c."playerId" = p.id
--      JOIN "Item" i       ON la."itemId" = i.id
--     WHERE rn.date = '2026-05-19'
--     ORDER BY p."displayName", i.name;
--
-- 3. Koco should now show as a crafter of Belt of Blasting on the
--    Professions tab:
--    SELECT c.name FROM "LootAward" la
--      JOIN "Item" i ON la."itemId" = i.id
--      JOIN "Character" c ON la."characterId" = c.id
--     WHERE i.name = 'Pattern: Belt of Blasting';
