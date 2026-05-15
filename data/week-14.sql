-- Week 14 (May 14, 2026) loot import — first Phase 2 raid night.
--
-- Self-contained import for the May 14 raid (Tempest Keep + Serpentshrine
-- Cavern). Creates anything that isn't already in the DB:
--   - 3 new players: Slamchamber, Hoodfury, Fishynethers
--   - 3 new mains: Slamchamber's Destruction Warlock,
--                  Hoodfury's Beast Mastery Hunter,
--                  Fishynethers's Restoration Druid
--   - 2 new pattern items in TK Trash Loot:
--       Pattern: Boots of Blasting        (30282)
--       Pattern: Boots of Natural Grace   (30305)
--
-- 73 awards in the source spreadsheet collapse to 72 in this file:
--   Row 4 and Row 8 both list Massesto winning "Boots of the Resilient".
--   Solarian only drops one per kill, so the duplicate is treated as a
--   data-entry typo and only one award is recorded. Confirm with the
--   user and add the second LootAward manually via /admin if it was real.
--
-- Plus 7 late-add awards for Bugatti (Protection Warrior main: 4 T5
-- protector tokens minus helm; Feral Druid alt: 3 T5 vanquisher tokens
-- — chest/shoulders/gloves). Final total = 79 awards.
--
-- Every Mage spec is "Arcane Mage" — the guild renamed all mages via
-- the admin UI after the original roster import. Lookups for Skryt,
-- Koco, Hazi, Blargn all use "Arcane Mage".
--
-- Warlocks are a per-character mix in the DB:
--   Destruction Warlock: Doge, Xenodank, Yaske, Daladed, Dumpsterbob,
--                        Slamchamber, Koco's alt
--   Affliction Warlock:  Jalisco, Massesto's alt, Barbatos's alt
-- Source spreadsheet listed every warlock as Affliction; the
-- five Destruction mains have been corrected in this file.
--
-- Idempotent — re-running deletes and re-inserts the May 14 RaidNight
-- + its awards, so duplicate runs converge on the same final state.

BEGIN;

-- ════════════════════════════════════════════════════════════════════════
-- 1. Players: add Slamchamber, Hoodfury, Fishynethers if missing.
-- ════════════════════════════════════════════════════════════════════════
INSERT INTO "Player" ("displayName")
SELECT v.name
  FROM (VALUES ('Slamchamber'), ('Hoodfury'), ('Fishynethers')) AS v(name)
 WHERE NOT EXISTS (SELECT 1 FROM "Player" p WHERE p."displayName" = v.name);

-- ════════════════════════════════════════════════════════════════════════
-- 2. Characters: add the three new mains if missing.
-- ════════════════════════════════════════════════════════════════════════
-- Slamchamber · Destruction Warlock (main)
INSERT INTO "Character" (name, class, spec, role, "isMain", "playerId", active)
SELECT 'Slamchamber', 'Warlock', 'Destruction Warlock', 'dps', TRUE, p.id, TRUE
  FROM "Player" p
 WHERE p."displayName" = 'Slamchamber'
   AND NOT EXISTS (
     SELECT 1 FROM "Character" c
      WHERE c."playerId" = p.id AND c.class = 'Warlock' AND c.spec = 'Destruction Warlock'
   );

-- Hoodfury · Beast Mastery Hunter (main)
INSERT INTO "Character" (name, class, spec, role, "isMain", "playerId", active)
SELECT 'Hoodfury', 'Hunter', 'Beast Mastery Hunter', 'dps', TRUE, p.id, TRUE
  FROM "Player" p
 WHERE p."displayName" = 'Hoodfury'
   AND NOT EXISTS (
     SELECT 1 FROM "Character" c
      WHERE c."playerId" = p.id AND c.class = 'Hunter' AND c.spec = 'Beast Mastery Hunter'
   );

-- Fishynethers · Restoration Druid (main)
INSERT INTO "Character" (name, class, spec, role, "isMain", "playerId", active)
SELECT 'Fishynethers', 'Druid', 'Restoration Druid', 'heal', TRUE, p.id, TRUE
  FROM "Player" p
 WHERE p."displayName" = 'Fishynethers'
   AND NOT EXISTS (
     SELECT 1 FROM "Character" c
      WHERE c."playerId" = p.id AND c.class = 'Druid' AND c.spec = 'Restoration Druid'
   );

-- Roster memberships for all three new characters.
INSERT INTO "RosterMember" ("rosterId", "characterId", "memberRole")
SELECT (SELECT id FROM "Roster" WHERE name = 'Master Roster'), c.id, 'main'
  FROM "Character" c JOIN "Player" p ON c."playerId" = p.id
 WHERE (p."displayName", c.class, c.spec) IN (
         ('Slamchamber',  'Warlock', 'Destruction Warlock'),
         ('Hoodfury',     'Hunter',  'Beast Mastery Hunter'),
         ('Fishynethers', 'Druid',   'Restoration Druid')
       )
   AND NOT EXISTS (
     SELECT 1 FROM "RosterMember" rm
      WHERE rm."rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster')
        AND rm."characterId" = c.id
   );

-- ════════════════════════════════════════════════════════════════════════
-- 3. Items: insert the two patterns into TK Trash Loot if missing.
-- ════════════════════════════════════════════════════════════════════════
INSERT INTO "Item" (name, slot, "itemLevel", "wowheadId", "bossId", notes)
SELECT v.name, 'Pattern', 128, v.wid,
       (SELECT b.id FROM "Boss" b JOIN "Raid" r ON b."raidId" = r.id
         WHERE b.name = 'Trash Loot' AND r."shortName" = 'TK'),
       'Tradeskill pattern - world drop'
  FROM (VALUES
         ('Pattern: Boots of Blasting',      30282),
         ('Pattern: Boots of Natural Grace', 30305)
       ) AS v(name, wid)
 WHERE NOT EXISTS (SELECT 1 FROM "Item" i WHERE i.name = v.name);

-- ════════════════════════════════════════════════════════════════════════
-- 4. Reset the May 14 RaidNight + its awards so re-runs converge.
-- ════════════════════════════════════════════════════════════════════════
DELETE FROM "LootAward"
 WHERE "raidNightId" IN (
   SELECT id FROM "RaidNight"
    WHERE date = '2026-05-14'
      AND "rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster')
 );
DELETE FROM "RaidNight"
 WHERE date = '2026-05-14'
   AND "rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster');

INSERT INTO "RaidNight" ("rosterId", date, notes)
VALUES ((SELECT id FROM "Roster" WHERE name = 'Master Roster'), '2026-05-14', 'Week 14 - SSC + TK');

-- ════════════════════════════════════════════════════════════════════════
-- 5. LootAwards (79 rows — 72 from the source spreadsheet, deduped from
--    73, plus 7 late-add Bugatti tokens appended at the end of the list).
-- ════════════════════════════════════════════════════════════════════════
INSERT INTO "LootAward" ("itemId", "characterId", "rosterId", "raidNightId", "awardedAt")
SELECT
  (SELECT id FROM "Item" WHERE name = v.item LIMIT 1),
  (SELECT c.id FROM "Character" c JOIN "Player" p ON c."playerId" = p.id
    WHERE p."displayName" = v.player AND c.class = v.class AND c.spec = v.spec
    LIMIT 1),
  (SELECT id FROM "Roster" WHERE name = 'Master Roster'),
  (SELECT id FROM "RaidNight"
    WHERE date = '2026-05-14'
      AND "rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster')
    LIMIT 1),
  '2026-05-14T00:00:00Z'::timestamp
  FROM (VALUES
    ('Dody',          'Shaman',  'Enhancement Shaman',   'Chestguard of the Vanquished Champion'),
    ('Massesto',      'Paladin', 'Protection Paladin',   'Wristguards of Determination'),
    ('Massesto',      'Paladin', 'Protection Paladin',   'Boots of the Resilient'),
    ('Shawtydgaf',    'Rogue',   'Combat Rogue',         'Pauldrons of the Vanquished Champion'),
    ('Skryt',         'Mage',    'Arcane Mage',          'Pauldrons of the Vanquished Hero'),
    ('Massesto',      'Paladin', 'Protection Paladin',   'Royal Gauntlets of Silvermoon'),
    ('Cash',          'Hunter',  'Beast Mastery Hunter', 'Verdant Sphere'),
    ('Skryt',         'Mage',    'Arcane Mage',          'Gauntlets of the Sun King'),
    ('Veile',         'Hunter',  'Beast Mastery Hunter', 'Netherbane'),
    ('Tombradygoat',  'Shaman',  'Restoration Shaman',   'Girdle of Fallen Stars'),
    ('Slamchamber',   'Warlock', 'Destruction Warlock',  'Void Star Talisman'),
    ('Gono',          'Shaman',  'Enhancement Shaman',   'Chestguard of the Vanquished Champion'),
    ('Keefy',         'Paladin', 'Retribution Paladin',  'Gloves of the Searing Grip'),
    ('Koco',          'Mage',    'Arcane Mage',          'Pattern: Boots of Blasting'),
    ('Koco',          'Mage',    'Arcane Mage',          'Pattern: Boots of Natural Grace'),
    ('Keefy',         'Paladin', 'Retribution Paladin',  'Ancestral Ring of Conquest'),
    ('Skryt',         'Mage',    'Arcane Mage',          'Helm of the Vanquished Hero'),
    ('Hoodfury',      'Hunter',  'Beast Mastery Hunter', 'Gloves of the Vanquished Hero'),
    ('Barbatos',      'Shaman',  'Restoration Shaman',   'Tempest-Strider Boots'),
    ('Pizookies',     'Warrior', 'Fury Warrior',         'Pendant of the Perilous'),
    ('Pizookies',     'Warrior', 'Fury Warrior',         'Prism of Inner Calm'),
    ('Pizookies',     'Warrior', 'Fury Warrior',         'Warboots of Obliteration'),
    ('Veile',         'Hunter',  'Beast Mastery Hunter', 'Gloves of the Vanquished Hero'),
    ('Massesto',      'Paladin', 'Protection Paladin',   'Ring of Sundered Souls'),
    ('Doge',          'Warlock', 'Destruction Warlock',  'Fang of the Leviathan'),
    ('Shmoo',         'Priest',  'Holy Priest',          'Earring of Soulful Meditation'),
    ('Priestlynn',    'Priest',  'Shadow Priest',        'Robe of Hateful Echoes'),
    ('Fishynethers',  'Druid',   'Restoration Druid',    'Gnarled Chestpiece of the Ancients'),
    ('Fishynethers',  'Druid',   'Restoration Druid',    'Runetotem''s Mantle'),
    ('Fishynethers',  'Druid',   'Restoration Druid',    'Idol of the Crescent Goddess'),
    ('Rfx',           'Warrior', 'Fury Warrior',         'Gloves of the Vanquished Defender'),
    ('Xenodank',      'Warlock', 'Destruction Warlock',  'Leggings of the Vanquished Hero'),
    ('Koco',          'Mage',    'Arcane Mage',          'Helm of the Vanquished Hero'),
    ('Koco',          'Mage',    'Arcane Mage',          'Leggings of the Vanquished Hero'),
    ('Pizookies',     'Paladin', 'Protection Paladin',   'Pauldrons of the Vanquished Champion'),
    ('Jalisco',       'Warlock', 'Affliction Warlock',   'Verdant Sphere'),
    ('Whappintime',   'Hunter',  'Beast Mastery Hunter', 'Thalassian Wildercloak'),
    ('Gono',          'Rogue',   'Combat Rogue',         'Heartrazor'),
    ('Hazi',          'Mage',    'Arcane Mage',          'Gauntlets of the Sun King'),
    ('Kalihiwai',     'Paladin', 'Holy Paladin',         'Fel-Steel Warhelm'),
    ('Glzy',          'Paladin', 'Retribution Paladin',  'Seventh Ring of the Tirisfalen'),
    ('Gono',          'Rogue',   'Combat Rogue',         'Pauldrons of the Vanquished Champion'),
    ('Sleepyrat',     'Shaman',  'Enhancement Shaman',   'Chestguard of the Vanquished Champion'),
    ('Whappintime',   'Hunter',  'Beast Mastery Hunter', 'Chestguard of the Vanquished Hero'),
    ('Chainsaw',      'Hunter',  'Beast Mastery Hunter', 'Vambraces of Ending'),
    ('Kalihiwai',     'Paladin', 'Holy Paladin',         'Worldstorm Gauntlets'),
    ('Sergo',         'Priest',  'Shadow Priest',        'Mindstorm Wristbands'),
    ('Bake',          'Shaman',  'Restoration Shaman',   'Phoenix-Ring of Rebirth'),
    ('Gono',          'Rogue',   'Combat Rogue',         'Arcanite Steam-Pistol'),
    ('DIsrespect',    'Warrior', 'Fury Warrior',         'Serpentshrine Shuriken'),
    ('Gono',          'Rogue',   'Combat Rogue',         'Serpentshrine Shuriken'),
    ('Glzy',          'Paladin', 'Retribution Paladin',  'World Breaker'),
    ('Sleepyrat',     'Shaman',  'Enhancement Shaman',   'Gloves of the Vanquished Champion'),
    ('Whappintime',   'Hunter',  'Beast Mastery Hunter', 'Cobra-Lash Boots'),
    ('Bake',          'Shaman',  'Restoration Shaman',   'Blackfathom Warbands'),
    ('Bored',         'Druid',   'Feral Druid (Tank)',   'Leggings of the Vanquished Defender'),
    ('Dommymommy',    'Druid',   'Restoration Druid',    'Living Root of the Wildheart'),
    ('Skryt',         'Shaman',  'Restoration Shaman',   'Lightfathom Scepter'),
    ('Yaske',         'Warlock', 'Destruction Warlock',  'Fang of the Leviathan'),
    ('Byung',         'Hunter',  'Beast Mastery Hunter', 'Gloves of the Vanquished Hero'),
    ('Pizookies',     'Paladin', 'Protection Paladin',   'Ring of Sundered Souls'),
    ('Daladed',       'Warlock', 'Destruction Warlock',  'Mallet of the Tides'),
    ('Daladed',       'Warlock', 'Destruction Warlock',  'Warboots of Obliteration'),
    ('DIsrespect',    'Warrior', 'Fury Warrior',         'Girdle of the Tidal Call'),
    ('Blargn',        'Mage',    'Arcane Mage',          'Helm of the Vanquished Hero'),
    ('Blargn',        'Mage',    'Arcane Mage',          'Velvet Boots of the Guardian'),
    ('Hazi',          'Mage',    'Arcane Mage',          'Helm of the Vanquished Hero'),
    ('Dumpsterbob',   'Warlock', 'Destruction Warlock',  'Leggings of the Vanquished Hero'),
    ('Gono',          'Rogue',   'Combat Rogue',         'Boots of Effortless Striking'),
    ('Gono',          'Rogue',   'Combat Rogue',         'Gloves of the Vanquished Champion'),
    ('Gono',          'Rogue',   'Combat Rogue',         'Helm of the Vanquished Champion'),
    ('Rfx',           'Shaman',  'Enhancement Shaman',   'Shoulderpads of the Stranger'),
    -- Late-add: Bugatti's Protection Warrior main took 4 of the 5 T5
    -- protector tokens (everything except helm).
    ('Bugatti',       'Warrior', 'Protection Warrior',   'Pauldrons of the Vanquished Defender'),
    ('Bugatti',       'Warrior', 'Protection Warrior',   'Chestguard of the Vanquished Defender'),
    ('Bugatti',       'Warrior', 'Protection Warrior',   'Gloves of the Vanquished Defender'),
    ('Bugatti',       'Warrior', 'Protection Warrior',   'Leggings of the Vanquished Defender'),
    -- Bugatti's Feral Druid alt took chest, shoulders, and gloves
    -- vanquisher tokens.
    ('Bugatti',       'Druid',   'Feral Druid (Tank)',   'Pauldrons of the Vanquished Hero'),
    ('Bugatti',       'Druid',   'Feral Druid (Tank)',   'Chestguard of the Vanquished Hero'),
    ('Bugatti',       'Druid',   'Feral Druid (Tank)',   'Gloves of the Vanquished Hero')
  ) AS v(player, class, spec, item);

COMMIT;

-- Sanity checks (run separately):
--
-- 1. Total awards for May 14 — expect 79. If you see fewer, a (player,
--    class, spec) or item lookup returned NULL and that row silently
--    failed; run a diagnostic similar to week-12-supplemental-diagnose.sql
--    to identify the missing match.
--    SELECT COUNT(*) FROM "LootAward" la
--      JOIN "RaidNight" rn ON la."raidNightId" = rn.id
--     WHERE rn.date = '2026-05-14';
--
-- 2. Per-player breakdown:
--    SELECT p."displayName", c.class, c.spec, i.name
--      FROM "LootAward" la
--      JOIN "RaidNight" rn ON la."raidNightId" = rn.id
--      JOIN "Character" c  ON la."characterId" = c.id
--      JOIN "Player" p     ON c."playerId" = p.id
--      JOIN "Item" i       ON la."itemId" = i.id
--     WHERE rn.date = '2026-05-14'
--     ORDER BY p."displayName", i.name;
--
-- 3. Verify the two patterns landed in TK Trash Loot:
--    SELECT i.name, b.name AS boss, r."shortName"
--      FROM "Item" i
--      JOIN "Boss" b ON i."bossId" = b.id
--      JOIN "Raid" r ON b."raidId" = r.id
--     WHERE i.name LIKE 'Pattern: %';
