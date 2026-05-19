-- Corrections 008 — backfill missing SSC + TK trash-drop patterns,
-- profession plans, and Badge of Justice currency.
--
-- The seed in lib/tbc-data.ts only had two of the seventeen world-drop
-- tradeskill patterns that fall in SSC + TK ("Boots of Blasting"
-- tailoring + "Boots of Natural Grace" leatherworking). The remaining
-- fifteen items are needed for the upcoming "Professions" tab that
-- pairs each pattern with the players who can craft the BoE that
-- comes off it.
--
-- All items are world-drop BoP recipes that drop from any boss in
-- either raid. Parked under TK Trash Loot for the catalog because
-- that's where the two existing patterns already live (see
-- data/week-14.sql). The professions tab queries by name + slot, so
-- the boss attribution is just a bookkeeping choice.
--
-- Idempotent — every insert is guarded by NOT EXISTS on the
-- wowheadId, so re-runs converge.

BEGIN;

INSERT INTO "Item" (name, slot, "itemLevel", "wowheadId", "bossId", notes)
SELECT v.name, v.slot, v.ilvl, v.wid,
       (SELECT b.id FROM "Boss" b JOIN "Raid" r ON b."raidId" = r.id
         WHERE b.name = 'Trash Loot' AND r."shortName" = 'TK'),
       v.notes
  FROM (VALUES
    -- Tailoring (3 new — Boots of Blasting / 30282 already seeded)
    ('Pattern: Belt of Blasting',          'Pattern',  128, 30280, 'Tailoring 375 — crafts Belt of Blasting (BoE). World drop, BoP.'),
    ('Pattern: Belt of the Long Road',     'Pattern',  128, 30281, 'Tailoring 375 — crafts Belt of the Long Road (BoE). World drop, BoP.'),
    ('Pattern: Boots of the Long Road',    'Pattern',  128, 30283, 'Tailoring 375 — crafts Boots of the Long Road (BoE). World drop, BoP.'),
    -- Leatherworking (7 new — Boots of Natural Grace / 30305 already seeded)
    ('Pattern: Belt of Natural Power',     'Pattern',  128, 30301, 'Leatherworking 375 — crafts Belt of Natural Power (BoE). World drop, BoP.'),
    ('Pattern: Belt of Deep Shadow',       'Pattern',  128, 30302, 'Leatherworking 375 — crafts Belt of Deep Shadow (BoE). World drop, BoP.'),
    ('Pattern: Belt of the Black Eagle',   'Pattern',  128, 30303, 'Leatherworking 375 — crafts Belt of the Black Eagle (BoE). World drop, BoP.'),
    ('Pattern: Monsoon Belt',              'Pattern',  128, 30304, 'Leatherworking 375 — crafts Monsoon Belt (BoE). World drop, BoP.'),
    ('Pattern: Boots of Utter Darkness',   'Pattern',  128, 30306, 'Leatherworking 375 — crafts Boots of Utter Darkness (BoE). World drop, BoP.'),
    ('Pattern: Boots of the Crimson Hawk', 'Pattern',  128, 30307, 'Leatherworking 375 — crafts Boots of the Crimson Hawk (BoE). World drop, BoP.'),
    ('Pattern: Hurricane Boots',           'Pattern',  128, 30308, 'Leatherworking 375 — crafts Hurricane Boots (BoE). World drop, BoP.'),
    -- Blacksmithing (4 new)
    ('Plans: Belt of the Guardian',        'Plans',    128, 30321, 'Blacksmithing 375 — crafts Belt of the Guardian (BoE). World drop, BoP.'),
    ('Plans: Red Belt of Battle',          'Plans',    128, 30322, 'Blacksmithing 375 — crafts Red Belt of Battle (BoE). World drop, BoP.'),
    ('Plans: Boots of the Protector',      'Plans',    128, 30323, 'Blacksmithing 375 — crafts Boots of the Protector (BoE). World drop, BoP.'),
    ('Plans: Red Havoc Boots',             'Plans',    128, 30324, 'Blacksmithing 375 — crafts Red Havoc Boots (BoE). World drop, BoP.'),
    -- Currency (badge token — all bosses, both raids)
    ('Badge of Justice',                   'Currency',   0, 29434, 'Heroic / raid badge currency. Drops from every boss in SSC and Tempest Keep.')
  ) AS v(name, slot, ilvl, wid, notes)
 WHERE NOT EXISTS (SELECT 1 FROM "Item" i WHERE i."wowheadId" = v.wid);

COMMIT;

-- Sanity checks (run separately):
--
-- 1. Confirm all 17 catalog rows exist (the 15 new + 2 already seeded):
--    SELECT i.name, i.slot, i."wowheadId", b.name AS boss, r."shortName"
--      FROM "Item" i
--      JOIN "Boss" b ON i."bossId" = b.id
--      JOIN "Raid" r ON b."raidId" = r.id
--     WHERE i."wowheadId" IN (
--             29434, 30280, 30281, 30282, 30283, 30301, 30302, 30303,
--             30304, 30305, 30306, 30307, 30308, 30321, 30322, 30323, 30324
--           )
--     ORDER BY i."wowheadId";
--
-- 2. Quick count by slot — expect: Pattern × 11, Plans × 4, Currency × 1
--    (plus the two pre-seeded patterns, totalling 13 Pattern rows).
--    SELECT slot, COUNT(*)
--      FROM "Item"
--     WHERE "wowheadId" IN (29434, 30280, 30281, 30282, 30283, 30301, 30302,
--                           30303, 30304, 30305, 30306, 30307, 30308, 30321,
--                           30322, 30323, 30324)
--     GROUP BY slot;
