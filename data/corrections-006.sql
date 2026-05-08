-- Roster correction patch #6 — fix T4 token boss attributions.
-- The seed catalog had T4 tokens listed under several wrong bosses
-- (a copy-paste leftover from a vanilla-style raid layout). Across
-- catalog revisions every duplicate also got materialised in the DB
-- by `prisma seed`, so loot showing e.g. "Leggings of the Fallen
-- Champion (KARA)" is referencing a Karazhan dupe rather than the
-- real Gruul drop.
--
-- Canonical TBC P1 token bosses:
--   Helm of the Fallen        → Prince Malchezaar (Karazhan)
--   Gloves of the Fallen      → The Curator (Karazhan)
--   Pauldrons of the Fallen   → High King Maulgar (Gruul's Lair)
--   Leggings of the Fallen    → Gruul the Dragonkiller (Gruul's Lair)
--   Chestguard of the Fallen  → Magtheridon (Magtheridon's Lair)
--
-- For each of the 9 mis-bossed token names this script:
--   1. Reassigns LootAwards from non-canonical rows to the canonical row.
--   2. Deletes the duplicates.
--   3. UPDATEs the survivor's bossId/slot/itemLevel/wowheadId.
--
-- Idempotent — safe to re-run.

BEGIN;

-- HELM tokens → Prince Malchezaar
UPDATE "LootAward" SET "itemId" = (
    SELECT id FROM "Item" WHERE name = 'Helm of the Fallen Champion'
     ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'Prince Malchezaar')) DESC, id ASC LIMIT 1)
  WHERE "itemId" IN (SELECT id FROM "Item" WHERE name = 'Helm of the Fallen Champion')
    AND "itemId" <> (SELECT id FROM "Item" WHERE name = 'Helm of the Fallen Champion'
                      ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'Prince Malchezaar')) DESC, id ASC LIMIT 1);
DELETE FROM "Item" WHERE name = 'Helm of the Fallen Champion' AND id <> (
    SELECT id FROM "Item" WHERE name = 'Helm of the Fallen Champion'
     ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'Prince Malchezaar')) DESC, id ASC LIMIT 1);

UPDATE "LootAward" SET "itemId" = (
    SELECT id FROM "Item" WHERE name = 'Helm of the Fallen Defender'
     ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'Prince Malchezaar')) DESC, id ASC LIMIT 1)
  WHERE "itemId" IN (SELECT id FROM "Item" WHERE name = 'Helm of the Fallen Defender')
    AND "itemId" <> (SELECT id FROM "Item" WHERE name = 'Helm of the Fallen Defender'
                      ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'Prince Malchezaar')) DESC, id ASC LIMIT 1);
DELETE FROM "Item" WHERE name = 'Helm of the Fallen Defender' AND id <> (
    SELECT id FROM "Item" WHERE name = 'Helm of the Fallen Defender'
     ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'Prince Malchezaar')) DESC, id ASC LIMIT 1);

UPDATE "LootAward" SET "itemId" = (
    SELECT id FROM "Item" WHERE name = 'Helm of the Fallen Hero'
     ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'Prince Malchezaar')) DESC, id ASC LIMIT 1)
  WHERE "itemId" IN (SELECT id FROM "Item" WHERE name = 'Helm of the Fallen Hero')
    AND "itemId" <> (SELECT id FROM "Item" WHERE name = 'Helm of the Fallen Hero'
                      ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'Prince Malchezaar')) DESC, id ASC LIMIT 1);
DELETE FROM "Item" WHERE name = 'Helm of the Fallen Hero' AND id <> (
    SELECT id FROM "Item" WHERE name = 'Helm of the Fallen Hero'
     ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'Prince Malchezaar')) DESC, id ASC LIMIT 1);

UPDATE "Item" SET "bossId" = (SELECT id FROM "Boss" WHERE name = 'Prince Malchezaar')
 WHERE name IN ('Helm of the Fallen Champion','Helm of the Fallen Defender','Helm of the Fallen Hero');

-- GLOVES tokens → The Curator
UPDATE "LootAward" SET "itemId" = (
    SELECT id FROM "Item" WHERE name = 'Gloves of the Fallen Champion'
     ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'The Curator')) DESC, id ASC LIMIT 1)
  WHERE "itemId" IN (SELECT id FROM "Item" WHERE name = 'Gloves of the Fallen Champion')
    AND "itemId" <> (SELECT id FROM "Item" WHERE name = 'Gloves of the Fallen Champion'
                      ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'The Curator')) DESC, id ASC LIMIT 1);
DELETE FROM "Item" WHERE name = 'Gloves of the Fallen Champion' AND id <> (
    SELECT id FROM "Item" WHERE name = 'Gloves of the Fallen Champion'
     ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'The Curator')) DESC, id ASC LIMIT 1);

UPDATE "LootAward" SET "itemId" = (
    SELECT id FROM "Item" WHERE name = 'Gloves of the Fallen Defender'
     ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'The Curator')) DESC, id ASC LIMIT 1)
  WHERE "itemId" IN (SELECT id FROM "Item" WHERE name = 'Gloves of the Fallen Defender')
    AND "itemId" <> (SELECT id FROM "Item" WHERE name = 'Gloves of the Fallen Defender'
                      ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'The Curator')) DESC, id ASC LIMIT 1);
DELETE FROM "Item" WHERE name = 'Gloves of the Fallen Defender' AND id <> (
    SELECT id FROM "Item" WHERE name = 'Gloves of the Fallen Defender'
     ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'The Curator')) DESC, id ASC LIMIT 1);

UPDATE "LootAward" SET "itemId" = (
    SELECT id FROM "Item" WHERE name = 'Gloves of the Fallen Hero'
     ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'The Curator')) DESC, id ASC LIMIT 1)
  WHERE "itemId" IN (SELECT id FROM "Item" WHERE name = 'Gloves of the Fallen Hero')
    AND "itemId" <> (SELECT id FROM "Item" WHERE name = 'Gloves of the Fallen Hero'
                      ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'The Curator')) DESC, id ASC LIMIT 1);
DELETE FROM "Item" WHERE name = 'Gloves of the Fallen Hero' AND id <> (
    SELECT id FROM "Item" WHERE name = 'Gloves of the Fallen Hero'
     ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'The Curator')) DESC, id ASC LIMIT 1);

UPDATE "Item" SET "bossId" = (SELECT id FROM "Boss" WHERE name = 'The Curator')
 WHERE name IN ('Gloves of the Fallen Champion','Gloves of the Fallen Defender','Gloves of the Fallen Hero');

-- LEGGINGS tokens → Gruul the Dragonkiller
UPDATE "LootAward" SET "itemId" = (
    SELECT id FROM "Item" WHERE name = 'Leggings of the Fallen Champion'
     ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'Gruul the Dragonkiller')) DESC, id ASC LIMIT 1)
  WHERE "itemId" IN (SELECT id FROM "Item" WHERE name = 'Leggings of the Fallen Champion')
    AND "itemId" <> (SELECT id FROM "Item" WHERE name = 'Leggings of the Fallen Champion'
                      ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'Gruul the Dragonkiller')) DESC, id ASC LIMIT 1);
DELETE FROM "Item" WHERE name = 'Leggings of the Fallen Champion' AND id <> (
    SELECT id FROM "Item" WHERE name = 'Leggings of the Fallen Champion'
     ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'Gruul the Dragonkiller')) DESC, id ASC LIMIT 1);

UPDATE "LootAward" SET "itemId" = (
    SELECT id FROM "Item" WHERE name = 'Leggings of the Fallen Defender'
     ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'Gruul the Dragonkiller')) DESC, id ASC LIMIT 1)
  WHERE "itemId" IN (SELECT id FROM "Item" WHERE name = 'Leggings of the Fallen Defender')
    AND "itemId" <> (SELECT id FROM "Item" WHERE name = 'Leggings of the Fallen Defender'
                      ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'Gruul the Dragonkiller')) DESC, id ASC LIMIT 1);
DELETE FROM "Item" WHERE name = 'Leggings of the Fallen Defender' AND id <> (
    SELECT id FROM "Item" WHERE name = 'Leggings of the Fallen Defender'
     ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'Gruul the Dragonkiller')) DESC, id ASC LIMIT 1);

UPDATE "LootAward" SET "itemId" = (
    SELECT id FROM "Item" WHERE name = 'Leggings of the Fallen Hero'
     ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'Gruul the Dragonkiller')) DESC, id ASC LIMIT 1)
  WHERE "itemId" IN (SELECT id FROM "Item" WHERE name = 'Leggings of the Fallen Hero')
    AND "itemId" <> (SELECT id FROM "Item" WHERE name = 'Leggings of the Fallen Hero'
                      ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'Gruul the Dragonkiller')) DESC, id ASC LIMIT 1);
DELETE FROM "Item" WHERE name = 'Leggings of the Fallen Hero' AND id <> (
    SELECT id FROM "Item" WHERE name = 'Leggings of the Fallen Hero'
     ORDER BY ("bossId" = (SELECT id FROM "Boss" WHERE name = 'Gruul the Dragonkiller')) DESC, id ASC LIMIT 1);

UPDATE "Item" SET "bossId" = (SELECT id FROM "Boss" WHERE name = 'Gruul the Dragonkiller')
 WHERE name IN ('Leggings of the Fallen Champion','Leggings of the Fallen Defender','Leggings of the Fallen Hero');

COMMIT;

-- Sanity checks (run separately):
-- SELECT name, COUNT(*) FROM "Item"
--   WHERE name LIKE '%of the Fallen %'
--   GROUP BY name ORDER BY name;
-- Each token name should appear exactly once.
--
-- SELECT i.name, b.name AS boss FROM "Item" i JOIN "Boss" b ON i."bossId" = b.id
--   WHERE i.name LIKE '%of the Fallen %' ORDER BY i.name;
