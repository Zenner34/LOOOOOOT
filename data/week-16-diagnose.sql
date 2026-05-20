-- Week 16 diagnostic — find which (player, class, spec) tuples in
-- week-16.sql don't resolve to a Character row. Any row returning
-- match_id = NULL is the cause of the "null value in column
-- characterId" failure. Run this (it's read-only) then fix week-16.sql
-- for the offending tuples.

SELECT v.player, v.class, v.spec,
       (SELECT c.id FROM "Character" c JOIN "Player" p ON c."playerId" = p.id
         WHERE p."displayName" = v.player AND c.class = v.class AND c.spec = v.spec
         LIMIT 1) AS match_id
  FROM (VALUES
    ('Bored',        'Druid',   'Feral Druid (Tank)'),
    ('Doge',         'Warlock', 'Affliction Warlock'),
    ('Pizookies',    'Warrior', 'Fury Warrior'),
    ('Sleepyrat',    'Paladin', 'Holy Paladin'),
    ('Priestlynn',   'Priest',  'Shadow Priest'),
    ('Glzy',         'Paladin', 'Retribution Paladin'),
    ('Chainsaw',     'Hunter',  'Beast Mastery Hunter'),
    ('Cash',         'Hunter',  'Beast Mastery Hunter'),
    ('Blargn',       'Mage',    'Arcane Mage'),
    ('Koco',         'Mage',    'Arcane Mage'),
    ('Shawtydgaf',   'Rogue',   'Combat Rogue'),
    ('Shmoo',        'Priest',  'Holy Priest'),
    ('Skryt',        'Shaman',  'Restoration Shaman'),
    ('Rfx',          'Warrior', 'Fury Warrior'),
    ('Whappintime',  'Hunter',  'Beast Mastery Hunter'),
    ('Massesto',     'Paladin', 'Protection Paladin'),
    ('Bake',         'Shaman',  'Restoration Shaman'),
    ('Dody',         'Shaman',  'Enhancement Shaman')
  ) AS v(player, class, spec)
 ORDER BY match_id NULLS FIRST;

-- Bonus: dump the actual characters for the players most likely to be
-- the culprits (mages renamed Frost→Arcane, alts that may not exist).
SELECT p."displayName", c.name, c.class, c.spec, c."isMain"
  FROM "Character" c JOIN "Player" p ON c."playerId" = p.id
 WHERE p."displayName" IN ('Blargn','Koco','Skryt','Whappintime','Dody','Bake','Shmoo','Massesto','Glzy')
 ORDER BY p."displayName", c."isMain" DESC, c.spec;
