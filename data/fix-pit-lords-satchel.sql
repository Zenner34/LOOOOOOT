-- Drop the wowheadId on Pit Lord's Satchel.
--
-- We had the row at id 34845 (the static Wowhead URL for Pit Lord's
-- Satchel), but the live tooltip JS resolves 34845 -> "Yarzill's Mutton"
-- in the TBC Classic database that powers tooltip names, and with
-- renameLinks=true the script overwrites the visible link text. Result:
-- every Pit Lord's Satchel award in the UI was being relabelled
-- "Yarzill's Mutton". Setting wowheadId to NULL makes WowheadLink fall
-- back to a plain span, so the original name renders unchanged.
--
-- Idempotent.

BEGIN;

UPDATE "Item"
   SET "wowheadId" = NULL
 WHERE name = 'Pit Lord''s Satchel';

COMMIT;

-- Sanity check (run separately):
-- SELECT name, "wowheadId" FROM "Item" WHERE name = 'Pit Lord''s Satchel';
-- Expect wowheadId = NULL.
