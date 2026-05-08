-- Roster correction patch #4 — supersedes corrections-002 and 003.
-- Uses plain SQL only (no DO/PL-pgSQL blocks) in case Neon's editor
-- was choking on the procedural blocks in v3. Idempotent.
--
-- Strategy:
--   1. Free all target wowheadIds first (NULL them out wherever held).
--   2. Delete the misfiled Pillar of Ferocity duplicate.
--   3. For each problem item, run three statements:
--        a. UPDATE LootAward to repoint to the canonical row.
--        b. DELETE the duplicate rows.
--        c. UPDATE the survivor to the correct fields.

BEGIN;

-- 0. Release every wowheadId we're going to assign.
UPDATE "Item" SET "wowheadId" = NULL
 WHERE "wowheadId" IN (28774, 28777, 28795, 28799, 28804);

-- 1. Drop the misfiled Pillar of Ferocity from Karazhan/Netherspite.
DELETE FROM "Item"
 WHERE name = 'Pillar of Ferocity'
   AND "bossId" = (SELECT id FROM "Boss" WHERE name = 'Netherspite');

-- ─── BLADESPIRE WARBANDS → High King Maulgar ──────────────────────────────
-- 2a. Reassign awards from non-canonical rows to the canonical one
--     (canonical = the row at High King Maulgar if any, else lowest id).
UPDATE "LootAward"
   SET "itemId" = (
     SELECT id FROM "Item" WHERE name = 'Bladespire Warbands'
      ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'High King Maulgar')) DESC, id ASC
      LIMIT 1
   )
 WHERE "itemId" IN (
     SELECT id FROM "Item" WHERE name = 'Bladespire Warbands'
   )
   AND "itemId" <> (
     SELECT id FROM "Item" WHERE name = 'Bladespire Warbands'
      ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'High King Maulgar')) DESC, id ASC
      LIMIT 1
   );

-- 2b. Delete duplicates.
DELETE FROM "Item"
 WHERE name = 'Bladespire Warbands'
   AND id <> (
     SELECT id FROM "Item" WHERE name = 'Bladespire Warbands'
      ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'High King Maulgar')) DESC, id ASC
      LIMIT 1
   );

-- 2c. Update survivor's fields.
UPDATE "Item"
   SET "bossId" = (SELECT id FROM "Boss" WHERE name = 'High King Maulgar'),
       slot = 'Wrist',
       "itemLevel" = 128,
       "wowheadId" = 28795
 WHERE name = 'Bladespire Warbands';

-- ─── CLOAK OF THE PIT STALKER → Magtheridon ───────────────────────────────
UPDATE "LootAward"
   SET "itemId" = (
     SELECT id FROM "Item" WHERE name = 'Cloak of the Pit Stalker'
      ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'Magtheridon')) DESC, id ASC
      LIMIT 1
   )
 WHERE "itemId" IN (
     SELECT id FROM "Item" WHERE name = 'Cloak of the Pit Stalker'
   )
   AND "itemId" <> (
     SELECT id FROM "Item" WHERE name = 'Cloak of the Pit Stalker'
      ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'Magtheridon')) DESC, id ASC
      LIMIT 1
   );

DELETE FROM "Item"
 WHERE name = 'Cloak of the Pit Stalker'
   AND id <> (
     SELECT id FROM "Item" WHERE name = 'Cloak of the Pit Stalker'
      ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'Magtheridon')) DESC, id ASC
      LIMIT 1
   );

UPDATE "Item"
   SET "bossId" = (SELECT id FROM "Boss" WHERE name = 'Magtheridon'),
       slot = 'Back',
       "itemLevel" = 128,
       "wowheadId" = 28777
 WHERE name = 'Cloak of the Pit Stalker';

-- ─── COLLAR OF CHO'GALL → Gruul (Head, cloth) ─────────────────────────────
UPDATE "LootAward"
   SET "itemId" = (
     SELECT id FROM "Item" WHERE name = 'Collar of Cho''gall'
      ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'Gruul the Dragonkiller')) DESC, id ASC
      LIMIT 1
   )
 WHERE "itemId" IN (
     SELECT id FROM "Item" WHERE name = 'Collar of Cho''gall'
   )
   AND "itemId" <> (
     SELECT id FROM "Item" WHERE name = 'Collar of Cho''gall'
      ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'Gruul the Dragonkiller')) DESC, id ASC
      LIMIT 1
   );

DELETE FROM "Item"
 WHERE name = 'Collar of Cho''gall'
   AND id <> (
     SELECT id FROM "Item" WHERE name = 'Collar of Cho''gall'
      ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'Gruul the Dragonkiller')) DESC, id ASC
      LIMIT 1
   );

UPDATE "Item"
   SET "bossId" = (SELECT id FROM "Boss" WHERE name = 'Gruul the Dragonkiller'),
       slot = 'Head',
       "itemLevel" = 128,
       "wowheadId" = 28804
 WHERE name = 'Collar of Cho''gall';

-- ─── GLAIVE OF THE PIT (already at Magtheridon — just fix slot + id) ──────
UPDATE "Item"
   SET "wowheadId" = 28774, slot = 'Polearm'
 WHERE name = 'Glaive of the Pit';

-- ─── BELT OF DIVINE INSPIRATION (already at Maulgar — just claim 28799) ──
UPDATE "Item"
   SET "wowheadId" = 28799
 WHERE name = 'Belt of Divine Inspiration';

COMMIT;

-- Sanity checks (run separately):
-- SELECT i.name, b.name AS boss, i.slot, i."wowheadId"
--   FROM "Item" i JOIN "Boss" b ON i."bossId" = b.id
--   WHERE i.name IN ('Bladespire Warbands','Cloak of the Pit Stalker',
--                    'Collar of Cho''gall','Glaive of the Pit',
--                    'Belt of Divine Inspiration')
--   ORDER BY i.name;
--
-- Each name should appear exactly once.
