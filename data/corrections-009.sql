-- Corrections 009 — flip the 8 boot patterns from "(BoE)" to "(BoP)"
-- in their notes field. The crafted boot itself is Bind on Pickup in
-- TBC; only the belts are tradeable BoE. corrections-008.sql wrote
-- "(BoE)" for everything, so this rewrites the eight boots.
--
-- Affected wowheadIds and the crafted item names that flip:
--   30282  Boots of Blasting
--   30283  Boots of the Long Road
--   30305  Boots of Natural Grace
--   30306  Boots of Utter Darkness
--   30307  Boots of the Crimson Hawk
--   30308  Hurricane Boots
--   30323  Boots of the Protector
--   30324  Red Havoc Boots
--
-- The Professions tab parses the "(BoE)" / "(BoP)" inside the
-- "crafts …" clause of `notes`, so this single column update flips
-- the chip + filter behaviour for those eight cards.
--
-- Belts (30280, 30281, 30301, 30302, 30303, 30304, 30321, 30322) stay
-- (BoE) — no rows touched for them. Badge of Justice (29434) doesn't
-- match the "crafts …" clause and stays unaffected.
--
-- Idempotent — REPLACE keeps the prefix and trailing context, only
-- swapping the inner BoE marker. Re-running is a no-op once the
-- update has landed.

BEGIN;

UPDATE "Item"
   SET notes = REPLACE(notes, '(BoE)', '(BoP)')
 WHERE "wowheadId" IN (30282, 30283, 30305, 30306, 30307, 30308, 30323, 30324);

COMMIT;

-- Sanity check (run separately):
-- Expect every row to show "(BoP). World drop, BoP." in the notes
-- column for boots, and "(BoE). World drop, BoP." for belts.
--
-- SELECT name, "wowheadId", notes
--   FROM "Item"
--  WHERE "wowheadId" IN (
--          30280, 30281, 30282, 30283,
--          30301, 30302, 30303, 30304, 30305, 30306, 30307, 30308,
--          30321, 30322, 30323, 30324
--        )
--  ORDER BY "wowheadId";
