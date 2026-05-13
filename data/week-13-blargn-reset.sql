-- Diagnostic + hard reset for Blargn's Magtheridon's Head.
-- Run the SELECT first to confirm what's in the DB, then the
-- DELETE + INSERT in the BEGIN block to leave exactly one row dated
-- May 12, 2026.

-- 1. Diagnostic — show every Blargn × Mag Head award and its
--    awardedAt / raidNight pairing.
SELECT la.id          AS award_id,
       la."awardedAt" AS awarded_at,
       la."raidNightId" AS raid_night_id,
       rn.date        AS raid_night_date,
       c.class, c.spec
  FROM "LootAward" la
  JOIN "Character" c ON la."characterId" = c.id
  JOIN "Player" p    ON c."playerId" = p.id
  JOIN "Item" i      ON la."itemId" = i.id
  LEFT JOIN "RaidNight" rn ON la."raidNightId" = rn.id
 WHERE p."displayName" = 'Blargn'
   AND i.name = 'Magtheridon''s Head';

-- 2. Hard reset — delete every Blargn × Mag Head row, re-insert
--    one row on the May 12 RaidNight at 00:00 UTC. Safe to run even
--    if no rows exist.
BEGIN;

DELETE FROM "LootAward" la
 USING "Character" c, "Player" p, "Item" i
 WHERE la."characterId" = c.id
   AND c."playerId" = p.id
   AND la."itemId" = i.id
   AND p."displayName" = 'Blargn'
   AND i.name = 'Magtheridon''s Head';

INSERT INTO "LootAward" ("itemId", "characterId", "rosterId", "raidNightId", "awardedAt")
SELECT
  (SELECT id FROM "Item" WHERE name = 'Magtheridon''s Head' LIMIT 1),
  c.id,
  (SELECT id FROM "Roster" WHERE name = 'Master Roster'),
  (SELECT id FROM "RaidNight"
    WHERE date = '2026-05-12'
      AND "rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster')
    LIMIT 1),
  '2026-05-12T00:00:00Z'::timestamp
  FROM "Character" c
  JOIN "Player" p ON c."playerId" = p.id
 WHERE p."displayName" = 'Blargn'
   AND c.class = 'Mage'
   AND c.spec  = 'Arcane Mage';

COMMIT;

-- 3. Verify (run separately, expect 1 row dated 2026-05-12):
-- SELECT la."awardedAt", rn.date
--   FROM "LootAward" la
--   JOIN "Character" c ON la."characterId" = c.id
--   JOIN "Player" p    ON c."playerId" = p.id
--   JOIN "Item" i      ON la."itemId" = i.id
--   LEFT JOIN "RaidNight" rn ON la."raidNightId" = rn.id
--  WHERE p."displayName" = 'Blargn' AND i.name = 'Magtheridon''s Head';
