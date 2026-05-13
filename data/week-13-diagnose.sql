-- Diagnostic for the Week 13 import failure.
-- Run this on its own (no BEGIN). Any row where char_id is NULL is the
-- culprit — the spec/class/name stored in the DB doesn't match what
-- week-13.sql is selecting on.

SELECT * FROM (VALUES
  ('Corr',       'Warrior', 'Fury Warrior'),
  ('Barbatos',   'Warlock', 'Affliction Warlock'),
  ('Elektro',    'Shaman',  'Elemental Shaman'),
  ('Sleepyrat',  'Paladin', 'Holy Paladin'),
  ('Bored',      'Druid',   'Feral Druid (Tank)'),
  ('Skryt',      'Shaman',  'Restoration Shaman'),
  ('Frustrated', 'Warrior', 'Arms Warrior'),
  ('Blargn',     'Mage',    'Frost Mage')
) AS expected(player, class, spec)
LEFT JOIN LATERAL (
  SELECT c.id AS char_id
    FROM "Character" c
    JOIN "Player" p ON c."playerId" = p.id
   WHERE p."displayName" = expected.player
     AND c.class         = expected.class
     AND c.spec          = expected.spec
   LIMIT 1
) AS m ON true;

-- Also dump the actual stored class/spec for each player we touch, in
-- case the spec was renamed via the admin UI:
SELECT p."displayName" AS player, c.class, c.spec, c."isMain", c.active
  FROM "Character" c
  JOIN "Player" p ON c."playerId" = p.id
 WHERE p."displayName" IN ('Corr','Barbatos','Elektro','Sleepyrat','Bored','Skryt','Frustrated','Blargn','Pizookies')
 ORDER BY p."displayName", c.class, c.spec;
