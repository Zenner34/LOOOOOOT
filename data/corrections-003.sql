-- Roster correction patch #3 — supersedes corrections-002.sql.
-- The previous patch failed because (a) some target wowheadIds were
-- already claimed by *other* mis-seeded items (Cord of Nature's
-- Sustenance was holding 28777), and (b) if the seed ran with the
-- newer tbc-data.ts, both an old and a new copy of each problem item
-- can coexist — UPDATEing them both to the same wowheadId trips the
-- unique constraint.
--
-- This version is bulletproof:
--   1. Free up every target wowheadId by NULLing it out wherever it's
--      currently held (idempotent, even if it's the right item).
--   2. For each problem item, pick one canonical row, reassign any
--      LootAwards from duplicate rows to it, delete the duplicates,
--      then UPDATE the canonical row's fields to the correct values.

BEGIN;

-- 0. Release every wowheadId we're about to assign so step 4 can never
--    collide with an unrelated item that's currently holding one.
UPDATE "Item" SET "wowheadId" = NULL
 WHERE "wowheadId" IN (28774, 28777, 28795, 28799, 28804);

-- 1. Drop the misfiled "Pillar of Ferocity" from Karazhan/Netherspite.
--    The correct version is the Anetheron drop (id 30883), which lives
--    elsewhere in the seed catalog.
DELETE FROM "Item"
 WHERE name = 'Pillar of Ferocity'
   AND "bossId" = (SELECT id FROM "Boss" WHERE name = 'Netherspite');

-- 2. For each problem item, collapse any duplicate rows down to one
--    canonical row (preferring the one that's already at the right boss),
--    re-pointing any LootAwards as we go.

-- Bladespire Warbands → High King Maulgar
DO $$
DECLARE
  target_boss_id INT := (SELECT id FROM "Boss" WHERE name = 'High King Maulgar');
  canonical_id   INT;
BEGIN
  SELECT id INTO canonical_id FROM "Item"
    WHERE name = 'Bladespire Warbands'
    ORDER BY ("bossId" = target_boss_id) DESC, id ASC
    LIMIT 1;
  IF canonical_id IS NULL THEN RAISE NOTICE 'no Bladespire Warbands row'; RETURN; END IF;
  UPDATE "LootAward" SET "itemId" = canonical_id
    WHERE "itemId" IN (SELECT id FROM "Item" WHERE name = 'Bladespire Warbands' AND id <> canonical_id);
  DELETE FROM "Item" WHERE name = 'Bladespire Warbands' AND id <> canonical_id;
  UPDATE "Item" SET "bossId" = target_boss_id, slot = 'Wrist', "itemLevel" = 128, "wowheadId" = 28795
    WHERE id = canonical_id;
END $$;

-- Cloak of the Pit Stalker → Magtheridon
DO $$
DECLARE
  target_boss_id INT := (SELECT id FROM "Boss" WHERE name = 'Magtheridon');
  canonical_id   INT;
BEGIN
  SELECT id INTO canonical_id FROM "Item"
    WHERE name = 'Cloak of the Pit Stalker'
    ORDER BY ("bossId" = target_boss_id) DESC, id ASC
    LIMIT 1;
  IF canonical_id IS NULL THEN RAISE NOTICE 'no Cloak of the Pit Stalker row'; RETURN; END IF;
  UPDATE "LootAward" SET "itemId" = canonical_id
    WHERE "itemId" IN (SELECT id FROM "Item" WHERE name = 'Cloak of the Pit Stalker' AND id <> canonical_id);
  DELETE FROM "Item" WHERE name = 'Cloak of the Pit Stalker' AND id <> canonical_id;
  UPDATE "Item" SET "bossId" = target_boss_id, slot = 'Back', "itemLevel" = 128, "wowheadId" = 28777
    WHERE id = canonical_id;
END $$;

-- Collar of Cho'gall → Gruul the Dragonkiller (Head, cloth)
DO $$
DECLARE
  target_boss_id INT := (SELECT id FROM "Boss" WHERE name = 'Gruul the Dragonkiller');
  canonical_id   INT;
BEGIN
  SELECT id INTO canonical_id FROM "Item"
    WHERE name = 'Collar of Cho''gall'
    ORDER BY ("bossId" = target_boss_id) DESC, id ASC
    LIMIT 1;
  IF canonical_id IS NULL THEN RAISE NOTICE 'no Collar of Cho''gall row'; RETURN; END IF;
  UPDATE "LootAward" SET "itemId" = canonical_id
    WHERE "itemId" IN (SELECT id FROM "Item" WHERE name = 'Collar of Cho''gall' AND id <> canonical_id);
  DELETE FROM "Item" WHERE name = 'Collar of Cho''gall' AND id <> canonical_id;
  UPDATE "Item" SET "bossId" = target_boss_id, slot = 'Head', "itemLevel" = 128, "wowheadId" = 28804
    WHERE id = canonical_id;
END $$;

-- Glaive of the Pit (right boss already, just fix wowheadId + slot)
UPDATE "Item"
   SET "wowheadId" = 28774, slot = 'Polearm'
 WHERE name = 'Glaive of the Pit';

-- Belt of Divine Inspiration (right boss already, just claim its real wowheadId)
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
-- Each of those names should appear exactly once.
-- SELECT name, COUNT(*) FROM "Item"
--   WHERE name IN ('Bladespire Warbands','Cloak of the Pit Stalker','Collar of Cho''gall')
--   GROUP BY name;
