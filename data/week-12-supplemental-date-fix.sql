-- Date-fix follow-up for data/week-12-supplemental.sql.
--
-- Six of the nine new awards from the supplemental were misattributed
-- to May 5 (Week 12) — they were actually awarded on May 12 (Week 13).
-- This script re-points their raidNightId + awardedAt to the May 12
-- RaidNight while leaving (item, character) untouched, so award
-- ownership is preserved and only the date moves.
--
-- Awards being moved (May 5 → May 12):
--   1. Rfx       · Girdle of the Endless Pit
--   2. Kalihiwai · Chestguard of the Fallen Champion
--   3. Glzy      · Gauntlets of the Dragonslayer
--   4. Kalihiwai · Leggings of the Fallen Champion
--   5. Bake      · Leggings of the Fallen Champion
--   6. Glzy      · Leggings of the Fallen Hero
--
-- The three other supplemental awards stay on May 5:
--   - Barbatos     · Pauldrons of the Fallen Champion
--   - Frustrated   · Bladespire Warbands
--   - Capriciousxo · Eye of Gruul
--
-- Idempotent — the UPDATE only matches rows still attached to the
-- May 5 RaidNight, so re-runs find nothing on the second pass.

BEGIN;

UPDATE "LootAward"
   SET "raidNightId" = (
         SELECT id FROM "RaidNight"
          WHERE date = '2026-05-12'
            AND "rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster')
          LIMIT 1
       ),
       "awardedAt"   = '2026-05-12T00:00:00Z'::timestamp
 WHERE id IN (
   SELECT la.id
     FROM "LootAward" la
     JOIN "Character" c ON la."characterId" = c.id
     JOIN "Player" p    ON c."playerId" = p.id
     JOIN "Item" i      ON la."itemId" = i.id
    WHERE la."raidNightId" = (
            SELECT id FROM "RaidNight"
             WHERE date = '2026-05-05'
               AND "rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster')
             LIMIT 1
          )
      AND (p."displayName", c.class, c.spec, i.name) IN (
        ('Rfx',       'Warrior', 'Fury Warrior',         'Girdle of the Endless Pit'),
        ('Kalihiwai', 'Paladin', 'Holy Paladin',         'Chestguard of the Fallen Champion'),
        ('Glzy',      'Hunter',  'Beast Mastery Hunter', 'Gauntlets of the Dragonslayer'),
        ('Kalihiwai', 'Paladin', 'Holy Paladin',         'Leggings of the Fallen Champion'),
        ('Bake',      'Shaman',  'Restoration Shaman',   'Leggings of the Fallen Champion'),
        ('Glzy',      'Hunter',  'Beast Mastery Hunter', 'Leggings of the Fallen Hero')
      )
 );

COMMIT;

-- Sanity checks (run separately):
--
-- 1. Count May 5 awards after the fix — should drop by 6 (26 - 6 = 20).
--    SELECT COUNT(*) FROM "LootAward" la
--      JOIN "RaidNight" rn ON la."raidNightId" = rn.id
--     WHERE rn.date = '2026-05-05';
--
-- 2. Count May 12 awards — should grow by 6 (10 + 6 = 16).
--    SELECT COUNT(*) FROM "LootAward" la
--      JOIN "RaidNight" rn ON la."raidNightId" = rn.id
--     WHERE rn.date = '2026-05-12';
--
-- 3. Confirm the six moved awards now live on May 12:
--    SELECT p."displayName", c.class, c.spec, i.name, rn.date
--      FROM "LootAward" la
--      JOIN "RaidNight" rn ON la."raidNightId" = rn.id
--      JOIN "Character" c  ON la."characterId" = c.id
--      JOIN "Player" p     ON c."playerId" = p.id
--      JOIN "Item" i       ON la."itemId" = i.id
--     WHERE (p."displayName", i.name) IN (
--             ('Rfx',       'Girdle of the Endless Pit'),
--             ('Kalihiwai', 'Chestguard of the Fallen Champion'),
--             ('Glzy',      'Gauntlets of the Dragonslayer'),
--             ('Kalihiwai', 'Leggings of the Fallen Champion'),
--             ('Bake',      'Leggings of the Fallen Champion'),
--             ('Glzy',      'Leggings of the Fallen Hero')
--           )
--     ORDER BY p."displayName", i.name;
