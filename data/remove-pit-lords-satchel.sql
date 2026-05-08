-- Drop Pit Lord's Satchel from the system entirely.
-- Removes the 3 May 5 awards that referenced it, then removes the
-- Item rows themselves (there may be more than one if the seed
-- catalog had stray duplicates). Cascade on LootAward isn't needed
-- because we delete the awards explicitly first.
--
-- Idempotent — safe to re-run.

BEGIN;

DELETE FROM "LootAward"
 WHERE "itemId" IN (SELECT id FROM "Item" WHERE name = 'Pit Lord''s Satchel');

DELETE FROM "Item"
 WHERE name = 'Pit Lord''s Satchel';

COMMIT;

-- Sanity checks (run separately):
-- SELECT COUNT(*) FROM "Item" WHERE name = 'Pit Lord''s Satchel';   -- expect 0
-- SELECT COUNT(*) FROM "LootAward" la
--   JOIN "RaidNight" rn ON la."raidNightId" = rn.id
--   WHERE rn.date = '2026-05-05';                                   -- expect 17
