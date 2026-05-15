-- Diagnostic for the week-12 supplemental import failure.
-- Run this on its own (no BEGIN). Any row where char_id OR item_id is
-- NULL is the culprit — the spec/class/name stored in the DB doesn't
-- match what week-12-supplemental.sql is selecting on.

SELECT v.player, v.class, v.spec, v.item,
       m.char_id, i.item_id, rn.raid_night_id
FROM (VALUES
  ('Barbatos',     'Shaman',  'Restoration Shaman',   'Pauldrons of the Fallen Champion'),
  ('Capriciousxo', 'Druid',   'Balance Druid',        'Chestguard of the Fallen Defender'),
  ('Frustrated',   'Warrior', 'Arms Warrior',         'Bladespire Warbands'),
  ('Capriciousxo', 'Druid',   'Balance Druid',        'Eye of Gruul'),
  ('Bored',        'Mage',    'Frost Mage',           'Magtheridon''s Head'),
  ('Rfx',          'Warrior', 'Fury Warrior',         'Girdle of the Endless Pit'),
  ('Kalihiwai',    'Paladin', 'Holy Paladin',         'Chestguard of the Fallen Champion'),
  ('Glzy',         'Hunter',  'Beast Mastery Hunter', 'Gauntlets of the Dragonslayer'),
  ('Kalihiwai',    'Paladin', 'Holy Paladin',         'Leggings of the Fallen Champion'),
  ('Bake',         'Shaman',  'Restoration Shaman',   'Leggings of the Fallen Champion'),
  ('Glzy',         'Hunter',  'Beast Mastery Hunter', 'Leggings of the Fallen Hero')
) AS v(player, class, spec, item)
LEFT JOIN LATERAL (
  SELECT c.id AS char_id
    FROM "Character" c
    JOIN "Player" p ON c."playerId" = p.id
   WHERE p."displayName" = v.player
     AND c.class         = v.class
     AND c.spec          = v.spec
   LIMIT 1
) AS m ON true
LEFT JOIN LATERAL (
  SELECT id AS item_id FROM "Item" WHERE name = v.item LIMIT 1
) AS i ON true
LEFT JOIN LATERAL (
  SELECT id AS raid_night_id FROM "RaidNight"
   WHERE date = '2026-05-05'
     AND "rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster')
   LIMIT 1
) AS rn ON true;

-- If any char_id is NULL, also dump the actual stored class/spec for
-- the suspect player(s) so we can see what's stored vs what we expect:
SELECT p."displayName" AS player, c.class, c.spec, c."isMain", c.active
  FROM "Character" c
  JOIN "Player" p ON c."playerId" = p.id
 WHERE p."displayName" IN ('Barbatos','Capriciousxo','Frustrated','Bored',
                           'Rfx','Kalihiwai','Glzy','Bake')
 ORDER BY p."displayName", c.class, c.spec;
