-- Roster correction patch — apply once via Neon SQL editor.
-- Surgical updates that preserve any existing loot/attendance data.
--
-- 1. Boredmage → Bored's mage alt (rename + reparent + flag).
-- 2. Drop Bored's Balance druid alt (he only plays Feral Bear).
-- 3a. Creek's "Resto Shaman" was wrong — they actually main an Arcane Mage.
-- 3b. Creeq's Resto Druid is Creek's alt — rename + reparent + flag.
-- 4. Fishynethers' Resto Druid is Kalihiwai's alt — rename + reparent + flag.
--
-- After running, expect:
--   "Player"     count = 65 (was 68)
--   "Character"  count = 91 (was 92)

BEGIN;

-- 1. Boredmage → Bored's mage alt.
UPDATE "Character"
   SET name = 'Bored',
       "playerId" = (SELECT id FROM "Player" WHERE "displayName" = 'Bored'),
       "isMain" = FALSE
 WHERE name = 'Boredmage';
DELETE FROM "Player" WHERE "displayName" = 'Boredmage';

-- 2. Drop Bored's Balance druid alt.
DELETE FROM "Character"
 WHERE name = 'Bored' AND class = 'Druid' AND spec = 'Balance Druid';

-- 3a. Creek's shaman row → Arcane Mage main.
UPDATE "Character"
   SET class = 'Mage',
       spec = 'Arcane Mage',
       role = 'dps'
 WHERE name = 'Creek' AND class = 'Shaman';

-- 3b. Creeq's resto druid → Creek's alt.
UPDATE "Character"
   SET name = 'Creek',
       "playerId" = (SELECT id FROM "Player" WHERE "displayName" = 'Creek'),
       "isMain" = FALSE
 WHERE name = 'Creeq';
DELETE FROM "Player" WHERE "displayName" = 'Creeq';

-- 4. Fishynethers' resto druid → Kalihiwai's alt.
UPDATE "Character"
   SET name = 'Kalihiwai',
       "playerId" = (SELECT id FROM "Player" WHERE "displayName" = 'Kalihiwai'),
       "isMain" = FALSE
 WHERE name = 'Fishynethers';
DELETE FROM "Player" WHERE "displayName" = 'Fishynethers';

COMMIT;

-- Sanity checks (run separately):
-- SELECT COUNT(*) FROM "Player";                                                           -- expect 65
-- SELECT COUNT(*) FROM "Character";                                                        -- expect 91
-- SELECT name, class, spec, "isMain" FROM "Character"
--  WHERE "playerId" IN (SELECT id FROM "Player" WHERE "displayName" IN ('Bored','Creek','Kalihiwai'))
--  ORDER BY name, "isMain" DESC;
