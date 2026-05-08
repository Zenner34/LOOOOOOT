-- Roster correction patch #5 — supersedes #002, #003, #004.
-- v4 failed at the Belt of Divine Inspiration UPDATE (statement 14)
-- because the seed catalog moved BoDI from "The Curator" to "High King
-- Maulgar" across deploys, leaving two rows in the DB. UPDATE-by-name
-- then tried to assign both rows the same unique wowheadId.
--
-- The same pattern applies to several other items I added to the seed
-- catalog while their target boss kept shifting (Windshear Boots,
-- Gauntlets of the Dragonslayer, Aegis of the Vindicator, Liar's Tongue
-- Gloves). v5 dedupes all of them with the same 3-statement pattern:
--   a. Reassign LootAwards from non-canonical rows to the canonical one
--      (canonical = the row at the correct boss, else lowest id).
--   b. DELETE the duplicates.
--   c. UPDATE the survivor's fields.
--
-- Idempotent — safe to re-run.

BEGIN;

-- 0. Free every wowheadId we're going to assign so no UPDATE collides
--    with an unrelated mis-seeded item.
UPDATE "Item" SET "wowheadId" = NULL
 WHERE "wowheadId" IN (28774, 28776, 28777, 28795, 28799, 28804, 28810, 28827, 29458);

-- 1. Drop the Pillar of Ferocity duplicate at Karazhan/Netherspite.
DELETE FROM "Item"
 WHERE name = 'Pillar of Ferocity'
   AND "bossId" = (SELECT id FROM "Boss" WHERE name = 'Netherspite');

-- ─── BLADESPIRE WARBANDS → High King Maulgar ──────────────────────────────
UPDATE "LootAward" SET "itemId" = (
    SELECT id FROM "Item" WHERE name = 'Bladespire Warbands'
     ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'High King Maulgar')) DESC, id ASC LIMIT 1)
  WHERE "itemId" IN (SELECT id FROM "Item" WHERE name = 'Bladespire Warbands')
    AND "itemId" <> (SELECT id FROM "Item" WHERE name = 'Bladespire Warbands'
                      ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'High King Maulgar')) DESC, id ASC LIMIT 1);
DELETE FROM "Item" WHERE name = 'Bladespire Warbands' AND id <> (
    SELECT id FROM "Item" WHERE name = 'Bladespire Warbands'
     ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'High King Maulgar')) DESC, id ASC LIMIT 1);
UPDATE "Item" SET "bossId" = (SELECT id FROM "Boss" WHERE name = 'High King Maulgar'),
       slot = 'Wrist', "itemLevel" = 128, "wowheadId" = 28795
 WHERE name = 'Bladespire Warbands';

-- ─── BELT OF DIVINE INSPIRATION → High King Maulgar ───────────────────────
UPDATE "LootAward" SET "itemId" = (
    SELECT id FROM "Item" WHERE name = 'Belt of Divine Inspiration'
     ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'High King Maulgar')) DESC, id ASC LIMIT 1)
  WHERE "itemId" IN (SELECT id FROM "Item" WHERE name = 'Belt of Divine Inspiration')
    AND "itemId" <> (SELECT id FROM "Item" WHERE name = 'Belt of Divine Inspiration'
                      ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'High King Maulgar')) DESC, id ASC LIMIT 1);
DELETE FROM "Item" WHERE name = 'Belt of Divine Inspiration' AND id <> (
    SELECT id FROM "Item" WHERE name = 'Belt of Divine Inspiration'
     ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'High King Maulgar')) DESC, id ASC LIMIT 1);
UPDATE "Item" SET "bossId" = (SELECT id FROM "Boss" WHERE name = 'High King Maulgar'),
       slot = 'Waist', "itemLevel" = 128, "wowheadId" = 28799
 WHERE name = 'Belt of Divine Inspiration';

-- ─── CLOAK OF THE PIT STALKER → Magtheridon ───────────────────────────────
UPDATE "LootAward" SET "itemId" = (
    SELECT id FROM "Item" WHERE name = 'Cloak of the Pit Stalker'
     ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'Magtheridon')) DESC, id ASC LIMIT 1)
  WHERE "itemId" IN (SELECT id FROM "Item" WHERE name = 'Cloak of the Pit Stalker')
    AND "itemId" <> (SELECT id FROM "Item" WHERE name = 'Cloak of the Pit Stalker'
                      ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'Magtheridon')) DESC, id ASC LIMIT 1);
DELETE FROM "Item" WHERE name = 'Cloak of the Pit Stalker' AND id <> (
    SELECT id FROM "Item" WHERE name = 'Cloak of the Pit Stalker'
     ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'Magtheridon')) DESC, id ASC LIMIT 1);
UPDATE "Item" SET "bossId" = (SELECT id FROM "Boss" WHERE name = 'Magtheridon'),
       slot = 'Back', "itemLevel" = 128, "wowheadId" = 28777
 WHERE name = 'Cloak of the Pit Stalker';

-- ─── COLLAR OF CHO'GALL → Gruul (Head, cloth) ─────────────────────────────
UPDATE "LootAward" SET "itemId" = (
    SELECT id FROM "Item" WHERE name = 'Collar of Cho''gall'
     ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'Gruul the Dragonkiller')) DESC, id ASC LIMIT 1)
  WHERE "itemId" IN (SELECT id FROM "Item" WHERE name = 'Collar of Cho''gall')
    AND "itemId" <> (SELECT id FROM "Item" WHERE name = 'Collar of Cho''gall'
                      ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'Gruul the Dragonkiller')) DESC, id ASC LIMIT 1);
DELETE FROM "Item" WHERE name = 'Collar of Cho''gall' AND id <> (
    SELECT id FROM "Item" WHERE name = 'Collar of Cho''gall'
     ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'Gruul the Dragonkiller')) DESC, id ASC LIMIT 1);
UPDATE "Item" SET "bossId" = (SELECT id FROM "Boss" WHERE name = 'Gruul the Dragonkiller'),
       slot = 'Head', "itemLevel" = 128, "wowheadId" = 28804
 WHERE name = 'Collar of Cho''gall';

-- ─── WINDSHEAR BOOTS → Gruul ──────────────────────────────────────────────
UPDATE "LootAward" SET "itemId" = (
    SELECT id FROM "Item" WHERE name = 'Windshear Boots'
     ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'Gruul the Dragonkiller')) DESC, id ASC LIMIT 1)
  WHERE "itemId" IN (SELECT id FROM "Item" WHERE name = 'Windshear Boots')
    AND "itemId" <> (SELECT id FROM "Item" WHERE name = 'Windshear Boots'
                      ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'Gruul the Dragonkiller')) DESC, id ASC LIMIT 1);
DELETE FROM "Item" WHERE name = 'Windshear Boots' AND id <> (
    SELECT id FROM "Item" WHERE name = 'Windshear Boots'
     ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'Gruul the Dragonkiller')) DESC, id ASC LIMIT 1);
UPDATE "Item" SET "bossId" = (SELECT id FROM "Boss" WHERE name = 'Gruul the Dragonkiller'),
       slot = 'Feet', "itemLevel" = 128, "wowheadId" = 28810
 WHERE name = 'Windshear Boots';

-- ─── GAUNTLETS OF THE DRAGONSLAYER → Gruul ────────────────────────────────
UPDATE "LootAward" SET "itemId" = (
    SELECT id FROM "Item" WHERE name = 'Gauntlets of the Dragonslayer'
     ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'Gruul the Dragonkiller')) DESC, id ASC LIMIT 1)
  WHERE "itemId" IN (SELECT id FROM "Item" WHERE name = 'Gauntlets of the Dragonslayer')
    AND "itemId" <> (SELECT id FROM "Item" WHERE name = 'Gauntlets of the Dragonslayer'
                      ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'Gruul the Dragonkiller')) DESC, id ASC LIMIT 1);
DELETE FROM "Item" WHERE name = 'Gauntlets of the Dragonslayer' AND id <> (
    SELECT id FROM "Item" WHERE name = 'Gauntlets of the Dragonslayer'
     ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'Gruul the Dragonkiller')) DESC, id ASC LIMIT 1);
UPDATE "Item" SET "bossId" = (SELECT id FROM "Boss" WHERE name = 'Gruul the Dragonkiller'),
       slot = 'Hands', "itemLevel" = 128, "wowheadId" = 28827
 WHERE name = 'Gauntlets of the Dragonslayer';

-- ─── AEGIS OF THE VINDICATOR → Magtheridon ────────────────────────────────
UPDATE "LootAward" SET "itemId" = (
    SELECT id FROM "Item" WHERE name = 'Aegis of the Vindicator'
     ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'Magtheridon')) DESC, id ASC LIMIT 1)
  WHERE "itemId" IN (SELECT id FROM "Item" WHERE name = 'Aegis of the Vindicator')
    AND "itemId" <> (SELECT id FROM "Item" WHERE name = 'Aegis of the Vindicator'
                      ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'Magtheridon')) DESC, id ASC LIMIT 1);
DELETE FROM "Item" WHERE name = 'Aegis of the Vindicator' AND id <> (
    SELECT id FROM "Item" WHERE name = 'Aegis of the Vindicator'
     ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'Magtheridon')) DESC, id ASC LIMIT 1);
UPDATE "Item" SET "bossId" = (SELECT id FROM "Boss" WHERE name = 'Magtheridon'),
       slot = 'Shield', "itemLevel" = 128, "wowheadId" = 29458
 WHERE name = 'Aegis of the Vindicator';

-- ─── LIAR'S TONGUE GLOVES → Magtheridon ───────────────────────────────────
UPDATE "LootAward" SET "itemId" = (
    SELECT id FROM "Item" WHERE name = 'Liar''s Tongue Gloves'
     ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'Magtheridon')) DESC, id ASC LIMIT 1)
  WHERE "itemId" IN (SELECT id FROM "Item" WHERE name = 'Liar''s Tongue Gloves')
    AND "itemId" <> (SELECT id FROM "Item" WHERE name = 'Liar''s Tongue Gloves'
                      ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'Magtheridon')) DESC, id ASC LIMIT 1);
DELETE FROM "Item" WHERE name = 'Liar''s Tongue Gloves' AND id <> (
    SELECT id FROM "Item" WHERE name = 'Liar''s Tongue Gloves'
     ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'Magtheridon')) DESC, id ASC LIMIT 1);
UPDATE "Item" SET "bossId" = (SELECT id FROM "Boss" WHERE name = 'Magtheridon'),
       slot = 'Hands', "itemLevel" = 128, "wowheadId" = 28776
 WHERE name = 'Liar''s Tongue Gloves';

-- ─── GLAIVE OF THE PIT (already at Magtheridon — just fix slot + id) ──────
UPDATE "Item" SET "wowheadId" = 28774, slot = 'Polearm'
 WHERE name = 'Glaive of the Pit';

COMMIT;

-- Sanity checks (run separately):
-- SELECT name, COUNT(*) FROM "Item"
--   WHERE name IN ('Bladespire Warbands','Belt of Divine Inspiration',
--                  'Cloak of the Pit Stalker','Collar of Cho''gall',
--                  'Windshear Boots','Gauntlets of the Dragonslayer',
--                  'Aegis of the Vindicator','Liar''s Tongue Gloves',
--                  'Glaive of the Pit')
--   GROUP BY name;
-- Each should be 1.
--
-- SELECT i.name, b.name AS boss, i.slot, i."wowheadId"
--   FROM "Item" i JOIN "Boss" b ON i."bossId" = b.id
--   WHERE i.name IN ('Bladespire Warbands','Belt of Divine Inspiration',
--                    'Cloak of the Pit Stalker','Collar of Cho''gall',
--                    'Windshear Boots','Gauntlets of the Dragonslayer',
--                    'Aegis of the Vindicator','Liar''s Tongue Gloves',
--                    'Glaive of the Pit')
--   ORDER BY i.name;
