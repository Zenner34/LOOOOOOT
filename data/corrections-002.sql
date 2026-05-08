-- Roster correction patch #2 — apply once via Neon SQL editor.
-- Fixes a handful of TBC P1 items that the seed catalog had filed under
-- the wrong bosses or with the wrong slots/wowheadIds. Surgical UPDATEs
-- so existing LootAward FKs are preserved (no LootAwards affected).
--
-- After running, expect the following items to appear under their
-- correct bosses on /loot and /overview:
--   - Bladespire Warbands         → High King Maulgar
--   - Cloak of the Pit Stalker    → Magtheridon
--   - Collar of Cho'gall          → Gruul the Dragonkiller (Head, cloth)
--   - Glaive of the Pit           → Magtheridon (Polearm; ID corrected)
--   - Belt of Divine Inspiration  → High King Maulgar (ID 28799 set)
--   - Pillar of Ferocity (wrong)  → DELETED (the Karazhan duplicate)

BEGIN;

-- 1. Drop the misfiled Pillar of Ferocity from Karazhan/Netherspite.
--    The correct Pillar of Ferocity (id 30883) is an Anetheron drop
--    (Mount Hyjal P3) and lives elsewhere in the seed catalog.
--    No LootAwards reference this row.
DELETE FROM "Item" WHERE name = 'Pillar of Ferocity' AND "wowheadId" = 28824;

-- 2. Glaive of the Pit: was filed at wowheadId 28799 / Two-Hand Sword.
--    Real item is wowheadId 28774, Polearm. Frees up 28799 for the
--    next step.
UPDATE "Item"
   SET "wowheadId" = 28774, slot = 'Polearm'
 WHERE name = 'Glaive of the Pit';

-- 3. Belt of Divine Inspiration: now takes its real wowheadId 28799.
UPDATE "Item"
   SET "wowheadId" = 28799
 WHERE name = 'Belt of Divine Inspiration';

-- 4. Bladespire Warbands: was misfiled under Reliquary of Souls (BT P5)
--    with a fabricated id. Move to its real location — High King
--    Maulgar — and fix the metadata.
UPDATE "Item"
   SET "bossId" = (SELECT id FROM "Boss" WHERE name = 'High King Maulgar'),
       slot = 'Wrist',
       "itemLevel" = 128,
       "wowheadId" = 28795
 WHERE name = 'Bladespire Warbands';

-- 5. Cloak of the Pit Stalker: was filed under Kil'jaeden (Sunwell P6)
--    with a fabricated id. Move to Magtheridon and fix metadata.
UPDATE "Item"
   SET "bossId" = (SELECT id FROM "Boss" WHERE name = 'Magtheridon'),
       slot = 'Back',
       "itemLevel" = 128,
       "wowheadId" = 28777
 WHERE name = 'Cloak of the Pit Stalker';

-- 6. Collar of Cho'gall: was filed under Netherspite (Karazhan) as a
--    Neck slot. Real item is a Gruul drop, Head slot, cloth caster.
UPDATE "Item"
   SET "bossId" = (SELECT id FROM "Boss" WHERE name = 'Gruul the Dragonkiller'),
       slot = 'Head',
       "itemLevel" = 128,
       "wowheadId" = 28804
 WHERE name = 'Collar of Cho''gall';

COMMIT;

-- Sanity checks:
-- SELECT i.name, b.name AS boss, i.slot, i."wowheadId"
--   FROM "Item" i JOIN "Boss" b ON i."bossId" = b.id
--   WHERE i.name IN ('Bladespire Warbands','Cloak of the Pit Stalker',
--                    'Collar of Cho''gall','Glaive of the Pit',
--                    'Belt of Divine Inspiration')
--   ORDER BY i.name;
