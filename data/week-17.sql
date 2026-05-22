-- Week 17 (May 21, 2026) loot import — SSC + TK.
--
-- Recipients are logged by their in-game character names. Each resolves
-- to an EXISTING (player, class). Matching is by (player + class) — NOT
-- by spec (live-DB specs have drifted, e.g. Mages show as "Arcane Mage")
-- and NOT by Character.name (so this works whether or not the rename
-- script has been applied yet). No player in this log has two characters
-- of the same class, so (player + class) is unambiguous.
--
-- In-game name -> (player, class):
--   Skryt        -> Skryt,        Mage     (main)
--   Oguricap     -> Barbatos,     Shaman   (main)
--   Rfxx         -> Rfx,          Shaman   (alt)
--   Yuppers      -> Massesto,     Warlock  (alt)
--   Notcash      -> Cash,         Paladin  (main)
--   Zookiez      -> Pizookies,    Paladin  (alt)
--   Cowabungle   -> Bungle,       Druid    (main)
--   Sérgo        -> Sergo,        Priest   (main)
--   Kuleana      -> Kalihiwai,    Paladin  (main)
--   Thesleepyhit -> Sleepyrat,    Shaman   (alt)
--   Hotforsenpai -> HotforSenpai, Priest   (main)
--   (Veile, Glzy, Byung, Girthstorm, Gono, Vspades, Daladed, Xenodank,
--    Tombradygoat = their mains)
--
-- "Slamchamber" (3 items) is matched by Character.name directly — its
-- player/class isn't in our roster sheet, but the toon exists under that
-- exact name. Sérgo's obscured 2nd item (row 19) is intentionally
-- skipped per admin.
--
-- Idempotent — re-running deletes and re-inserts the May 21 RaidNight
-- + its awards, so duplicate runs converge.

-- ════════════════════════════════════════════════════════════════════
-- PRE-CHECK (read-only) — confirm every row resolves before importing.
-- Any row returned here is a problem (character or item not found).
-- ════════════════════════════════════════════════════════════════════
WITH awards(player, class, item) AS (VALUES
  ('Skryt','Mage','Chestguard of the Vanquished Hero'),
  ('Barbatos','Shaman','Phoenix-Ring of Rebirth'),
  ('Daladed','Warrior','Chestguard of the Vanquished Defender'),
  ('Rfx','Shaman','Rod of the Sun King'),
  ('Veile','Hunter','Pauldrons of the Vanquished Hero'),
  ('Veile','Hunter','Verdant Sphere'),
  ('Glzy','Hunter','Pauldrons of the Vanquished Hero'),
  ('Massesto','Warlock','Void Star Talisman'),
  ('Cash','Paladin','Greaves of the Bloodwarder'),
  ('Byung','Hunter','Pauldrons of the Vanquished Hero'),
  ('Barbatos','Shaman','Fire Crest Breastplate'),
  ('Barbatos','Shaman','Mantle of the Elven Kings'),
  ('Girthstorm','Druid','Gloves of the Searing Grip'),
  ('Girthstorm','Druid','Chestguard of the Vanquished Defender'),
  ('Gono','Rogue','Warp-Spring Coil'),
  ('Sergo','Priest','Gnarled Chestpiece of the Ancients'),
  ('Vspades','Warrior','Mallet of the Tides'),
  ('Massesto','Warlock','Leggings of the Vanquished Hero'),
  ('Girthstorm','Druid','Helm of the Vanquished Defender'),
  ('Pizookies','Paladin','Gloves of the Vanquished Champion'),
  ('HotforSenpai','Priest','Coral Band of the Revived'),
  ('HotforSenpai','Priest','Wraps of Purification'),
  ('Bungle','Druid','Spyglass of the Hidden Fleet'),
  ('Skryt','Mage','Leggings of the Vanquished Hero'),
  ('Cash','Paladin','Krakken-Heart Breastplate'),
  ('Tombradygoat','Shaman','Gloves of the Vanquished Champion'),
  ('Daladed','Warrior','Pauldrons of the Wardancer'),
  ('Xenodank','Warlock','Sextant of Unstable Currents'),
  ('Xenodank','Warlock','Fang of the Leviathan'),
  ('Gono','Rogue','Talon of Azshara'),
  ('Sleepyrat','Shaman','Helm of the Vanquished Champion'),
  ('Daladed','Warrior','Bracers of Eradication'),
  ('Daladed','Warrior','Serpentshrine Shuriken'),
  ('Rfx','Shaman','Gloves of the Vanquished Champion'),
  ('Kalihiwai','Paladin','Pauldrons of the Argent Sentinel'),
  ('Kalihiwai','Paladin','Scarab of Displacement')
)
SELECT a.player, a.class, a.item,
  (SELECT c.id FROM "Character" c JOIN "Player" p ON c."playerId" = p.id
    WHERE p."displayName" = a.player AND c.class = a.class LIMIT 1) AS character_id,
  (SELECT id FROM "Item" WHERE name = a.item LIMIT 1) AS item_id
FROM awards a
WHERE (SELECT c.id FROM "Character" c JOIN "Player" p ON c."playerId" = p.id
        WHERE p."displayName" = a.player AND c.class = a.class LIMIT 1) IS NULL
   OR (SELECT id FROM "Item" WHERE name = a.item LIMIT 1) IS NULL;

-- Slamchamber pre-check (matched by name). Any row here = a problem.
SELECT 'Slamchamber' AS character, v.item,
  (SELECT id FROM "Character" WHERE name = 'Slamchamber' LIMIT 1) AS character_id,
  (SELECT id FROM "Item" WHERE name = v.item LIMIT 1) AS item_id
FROM (VALUES
  ('Gauntlets of the Sun King'),
  ('Cord of Screaming Terrors'),
  ('Leggings of the Vanquished Hero')
) AS v(item)
WHERE (SELECT id FROM "Character" WHERE name = 'Slamchamber' LIMIT 1) IS NULL
   OR (SELECT id FROM "Item" WHERE name = v.item LIMIT 1) IS NULL;

-- ════════════════════════════════════════════════════════════════════
-- APPLY
-- ════════════════════════════════════════════════════════════════════
BEGIN;

-- Reset the May 21 RaidNight + its awards so re-runs converge.
DELETE FROM "LootAward"
 WHERE "raidNightId" IN (
   SELECT id FROM "RaidNight"
    WHERE date = '2026-05-21'
      AND "rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster')
 );
DELETE FROM "RaidNight"
 WHERE date = '2026-05-21'
   AND "rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster');

INSERT INTO "RaidNight" ("rosterId", date, notes)
VALUES ((SELECT id FROM "Roster" WHERE name = 'Master Roster'), '2026-05-21', 'Week 17 - SSC + TK');

INSERT INTO "LootAward" ("itemId", "characterId", "rosterId", "raidNightId", "awardedAt")
SELECT
  (SELECT id FROM "Item" WHERE name = v.item LIMIT 1),
  (SELECT c.id FROM "Character" c JOIN "Player" p ON c."playerId" = p.id
    WHERE p."displayName" = v.player AND c.class = v.class LIMIT 1),
  (SELECT id FROM "Roster" WHERE name = 'Master Roster'),
  (SELECT id FROM "RaidNight"
    WHERE date = '2026-05-21'
      AND "rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster')
    LIMIT 1),
  '2026-05-21T00:00:00Z'::timestamp
FROM (VALUES
  ('Skryt','Mage','Chestguard of the Vanquished Hero'),
  ('Barbatos','Shaman','Phoenix-Ring of Rebirth'),
  ('Daladed','Warrior','Chestguard of the Vanquished Defender'),
  ('Rfx','Shaman','Rod of the Sun King'),
  ('Veile','Hunter','Pauldrons of the Vanquished Hero'),
  ('Veile','Hunter','Verdant Sphere'),
  ('Glzy','Hunter','Pauldrons of the Vanquished Hero'),
  ('Massesto','Warlock','Void Star Talisman'),
  ('Cash','Paladin','Greaves of the Bloodwarder'),
  ('Byung','Hunter','Pauldrons of the Vanquished Hero'),
  ('Barbatos','Shaman','Fire Crest Breastplate'),
  ('Barbatos','Shaman','Mantle of the Elven Kings'),
  ('Girthstorm','Druid','Gloves of the Searing Grip'),
  ('Girthstorm','Druid','Chestguard of the Vanquished Defender'),
  ('Gono','Rogue','Warp-Spring Coil'),
  ('Sergo','Priest','Gnarled Chestpiece of the Ancients'),
  ('Vspades','Warrior','Mallet of the Tides'),
  ('Massesto','Warlock','Leggings of the Vanquished Hero'),
  ('Girthstorm','Druid','Helm of the Vanquished Defender'),
  ('Pizookies','Paladin','Gloves of the Vanquished Champion'),
  ('HotforSenpai','Priest','Coral Band of the Revived'),
  ('HotforSenpai','Priest','Wraps of Purification'),
  ('Bungle','Druid','Spyglass of the Hidden Fleet'),
  ('Skryt','Mage','Leggings of the Vanquished Hero'),
  ('Cash','Paladin','Krakken-Heart Breastplate'),
  ('Tombradygoat','Shaman','Gloves of the Vanquished Champion'),
  ('Daladed','Warrior','Pauldrons of the Wardancer'),
  ('Xenodank','Warlock','Sextant of Unstable Currents'),
  ('Xenodank','Warlock','Fang of the Leviathan'),
  ('Gono','Rogue','Talon of Azshara'),
  ('Sleepyrat','Shaman','Helm of the Vanquished Champion'),
  ('Daladed','Warrior','Bracers of Eradication'),
  ('Daladed','Warrior','Serpentshrine Shuriken'),
  ('Rfx','Shaman','Gloves of the Vanquished Champion'),
  ('Kalihiwai','Paladin','Pauldrons of the Argent Sentinel'),
  ('Kalihiwai','Paladin','Scarab of Displacement')
) AS v(player, class, item);

-- Slamchamber's 3 awards — matched by character name.
INSERT INTO "LootAward" ("itemId", "characterId", "rosterId", "raidNightId", "awardedAt")
SELECT
  (SELECT id FROM "Item" WHERE name = v.item LIMIT 1),
  (SELECT id FROM "Character" WHERE name = 'Slamchamber' LIMIT 1),
  (SELECT id FROM "Roster" WHERE name = 'Master Roster'),
  (SELECT id FROM "RaidNight"
    WHERE date = '2026-05-21'
      AND "rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster')
    LIMIT 1),
  '2026-05-21T00:00:00Z'::timestamp
FROM (VALUES
  ('Gauntlets of the Sun King'),
  ('Cord of Screaming Terrors'),
  ('Leggings of the Vanquished Hero')
) AS v(item);

-- Confirm 39 awards landed on the May 21 night.
SELECT i.name AS item, p."displayName" AS player, c.class, c.name AS character
FROM "LootAward" la
JOIN "Item" i ON i.id = la."itemId"
JOIN "Character" c ON c.id = la."characterId"
JOIN "Player" p ON p.id = c."playerId"
JOIN "RaidNight" rn ON rn.id = la."raidNightId"
WHERE rn.date = '2026-05-21'
  AND rn."rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster')
ORDER BY p."displayName", i.name;

COMMIT;
