-- Cleanup: Blargn has a duplicate Magtheridon's Head award created via
-- the admin UI before week-13.sql succeeded. That manual row was
-- stamped with today's NOW(), so the overview shows Blargn as
-- "looted today" instead of May 12. Drop any Blargn Mag Head award
-- that is NOT attached to the May 12 RaidNight.

BEGIN;

DELETE FROM "LootAward" la
 USING "Character" c, "Player" p, "Item" i
 WHERE la."characterId" = c.id
   AND c."playerId" = p.id
   AND la."itemId" = i.id
   AND p."displayName" = 'Blargn'
   AND i.name = 'Magtheridon''s Head'
   AND (
     la."raidNightId" IS NULL
     OR la."raidNightId" <> (
       SELECT id FROM "RaidNight"
        WHERE date = '2026-05-12'
          AND "rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster')
        LIMIT 1
     )
   );

COMMIT;

-- Verification (run separately):
-- SELECT la.id, la."awardedAt", la."raidNightId", rn.date
--   FROM "LootAward" la
--   JOIN "Character" c ON la."characterId" = c.id
--   JOIN "Player" p    ON c."playerId" = p.id
--   JOIN "Item" i      ON la."itemId" = i.id
--   LEFT JOIN "RaidNight" rn ON la."raidNightId" = rn.id
--  WHERE p."displayName" = 'Blargn' AND i.name = 'Magtheridon''s Head';
-- -- Expect exactly 1 row at 2026-05-12.
