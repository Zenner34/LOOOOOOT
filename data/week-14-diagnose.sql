-- Diagnostic for the week-14 import failure.
-- Run on its own (no BEGIN). Any row where char_id OR item_id is NULL
-- is the culprit — the (player, class, spec) or item name doesn't
-- match what's stored in the DB.

SELECT v.player, v.class, v.spec, v.item,
       m.char_id, i.item_id
  FROM (VALUES
    ('Dody',          'Shaman',  'Enhancement Shaman',   'Chestguard of the Vanquished Champion'),
    ('Massesto',      'Paladin', 'Protection Paladin',   'Wristguards of Determination'),
    ('Massesto',      'Paladin', 'Protection Paladin',   'Boots of the Resilient'),
    ('Shawtydgaf',    'Rogue',   'Combat Rogue',         'Pauldrons of the Vanquished Champion'),
    ('Skryt',         'Mage',    'Arcane Mage',          'Pauldrons of the Vanquished Hero'),
    ('Massesto',      'Paladin', 'Protection Paladin',   'Royal Gauntlets of Silvermoon'),
    ('Cash',          'Hunter',  'Beast Mastery Hunter', 'Verdant Sphere'),
    ('Skryt',         'Mage',    'Arcane Mage',          'Gauntlets of the Sun King'),
    ('Veile',         'Hunter',  'Beast Mastery Hunter', 'Netherbane'),
    ('Tombradygoat',  'Shaman',  'Restoration Shaman',   'Girdle of Fallen Stars'),
    ('Slamchamber',   'Warlock', 'Destruction Warlock',  'Void Star Talisman'),
    ('Gono',          'Shaman',  'Enhancement Shaman',   'Chestguard of the Vanquished Champion'),
    ('Keefy',         'Paladin', 'Retribution Paladin',  'Gloves of the Searing Grip'),
    ('Koco',          'Mage',    'Arcane Mage',          'Pattern: Boots of Blasting'),
    ('Koco',          'Mage',    'Arcane Mage',          'Pattern: Boots of Natural Grace'),
    ('Keefy',         'Paladin', 'Retribution Paladin',  'Ancestral Ring of Conquest'),
    ('Skryt',         'Mage',    'Arcane Mage',          'Helm of the Vanquished Hero'),
    ('Hoodfury',      'Hunter',  'Beast Mastery Hunter', 'Gloves of the Vanquished Hero'),
    ('Barbatos',      'Shaman',  'Restoration Shaman',   'Tempest-Strider Boots'),
    ('Pizookies',     'Warrior', 'Fury Warrior',         'Pendant of the Perilous'),
    ('Pizookies',     'Warrior', 'Fury Warrior',         'Prism of Inner Calm'),
    ('Pizookies',     'Warrior', 'Fury Warrior',         'Warboots of Obliteration'),
    ('Veile',         'Hunter',  'Beast Mastery Hunter', 'Gloves of the Vanquished Hero'),
    ('Massesto',      'Paladin', 'Protection Paladin',   'Ring of Sundered Souls'),
    ('Doge',          'Warlock', 'Affliction Warlock',   'Fang of the Leviathan'),
    ('Shmoo',         'Priest',  'Holy Priest',          'Earring of Soulful Meditation'),
    ('Priestlynn',    'Priest',  'Shadow Priest',        'Robe of Hateful Echoes'),
    ('Fishynethers',  'Druid',   'Restoration Druid',    'Gnarled Chestpiece of the Ancients'),
    ('Fishynethers',  'Druid',   'Restoration Druid',    'Runetotem''s Mantle'),
    ('Fishynethers',  'Druid',   'Restoration Druid',    'Idol of the Crescent Goddess'),
    ('Rfx',           'Warrior', 'Fury Warrior',         'Gloves of the Vanquished Defender'),
    ('Xenodank',      'Warlock', 'Affliction Warlock',   'Leggings of the Vanquished Hero'),
    ('Koco',          'Mage',    'Arcane Mage',          'Helm of the Vanquished Hero'),
    ('Koco',          'Mage',    'Arcane Mage',          'Leggings of the Vanquished Hero'),
    ('Pizookies',     'Paladin', 'Protection Paladin',   'Pauldrons of the Vanquished Champion'),
    ('Jalisco',       'Warlock', 'Affliction Warlock',   'Verdant Sphere'),
    ('Whappintime',   'Hunter',  'Beast Mastery Hunter', 'Thalassian Wildercloak'),
    ('Gono',          'Rogue',   'Combat Rogue',         'Heartrazor'),
    ('Hazi',          'Mage',    'Arcane Mage',          'Gauntlets of the Sun King'),
    ('Kalihiwai',     'Paladin', 'Holy Paladin',         'Fel-Steel Warhelm'),
    ('Glzy',          'Paladin', 'Retribution Paladin',  'Seventh Ring of the Tirisfalen'),
    ('Gono',          'Rogue',   'Combat Rogue',         'Pauldrons of the Vanquished Champion'),
    ('Sleepyrat',     'Shaman',  'Enhancement Shaman',   'Chestguard of the Vanquished Champion'),
    ('Whappintime',   'Hunter',  'Beast Mastery Hunter', 'Chestguard of the Vanquished Hero'),
    ('Chainsaw',      'Hunter',  'Beast Mastery Hunter', 'Vambraces of Ending'),
    ('Kalihiwai',     'Paladin', 'Holy Paladin',         'Worldstorm Gauntlets'),
    ('Sergo',         'Priest',  'Shadow Priest',        'Mindstorm Wristbands'),
    ('Bake',          'Shaman',  'Restoration Shaman',   'Phoenix-Ring of Rebirth'),
    ('Gono',          'Rogue',   'Combat Rogue',         'Arcanite Steam-Pistol'),
    ('DIsrespect',    'Warrior', 'Fury Warrior',         'Serpentshrine Shuriken'),
    ('Gono',          'Rogue',   'Combat Rogue',         'Serpentshrine Shuriken'),
    ('Glzy',          'Paladin', 'Retribution Paladin',  'World Breaker'),
    ('Sleepyrat',     'Shaman',  'Enhancement Shaman',   'Gloves of the Vanquished Champion'),
    ('Whappintime',   'Hunter',  'Beast Mastery Hunter', 'Cobra-Lash Boots'),
    ('Bake',          'Shaman',  'Restoration Shaman',   'Blackfathom Warbands'),
    ('Bored',         'Druid',   'Feral Druid (Tank)',   'Leggings of the Vanquished Defender'),
    ('Dommymommy',    'Druid',   'Restoration Druid',    'Living Root of the Wildheart'),
    ('Skryt',         'Shaman',  'Restoration Shaman',   'Lightfathom Scepter'),
    ('Yaske',         'Warlock', 'Affliction Warlock',   'Fang of the Leviathan'),
    ('Byung',         'Hunter',  'Beast Mastery Hunter', 'Gloves of the Vanquished Hero'),
    ('Pizookies',     'Paladin', 'Protection Paladin',   'Ring of Sundered Souls'),
    ('Daladed',       'Warlock', 'Affliction Warlock',   'Mallet of the Tides'),
    ('Daladed',       'Warlock', 'Affliction Warlock',   'Warboots of Obliteration'),
    ('DIsrespect',    'Warrior', 'Fury Warrior',         'Girdle of the Tidal Call'),
    ('Blargn',        'Mage',    'Arcane Mage',          'Helm of the Vanquished Hero'),
    ('Blargn',        'Mage',    'Arcane Mage',          'Velvet Boots of the Guardian'),
    ('Hazi',          'Mage',    'Arcane Mage',          'Helm of the Vanquished Hero'),
    ('Dumpsterbob',   'Warlock', 'Affliction Warlock',   'Leggings of the Vanquished Hero'),
    ('Gono',          'Rogue',   'Combat Rogue',         'Boots of Effortless Striking'),
    ('Gono',          'Rogue',   'Combat Rogue',         'Gloves of the Vanquished Champion'),
    ('Gono',          'Rogue',   'Combat Rogue',         'Helm of the Vanquished Champion'),
    ('Rfx',           'Shaman',  'Enhancement Shaman',   'Shoulderpads of the Stranger')
  ) AS v(player, class, spec, item)
  LEFT JOIN LATERAL (
    SELECT c.id AS char_id FROM "Character" c
      JOIN "Player" p ON c."playerId" = p.id
     WHERE p."displayName" = v.player
       AND c.class = v.class
       AND c.spec = v.spec
     LIMIT 1
  ) AS m ON true
  LEFT JOIN LATERAL (
    SELECT id AS item_id FROM "Item" WHERE name = v.item LIMIT 1
  ) AS i ON true
 WHERE m.char_id IS NULL OR i.item_id IS NULL;

-- If the result is empty, every lookup succeeded — something else
-- caused the import failure (paste the full error). Otherwise the
-- listed row(s) tell us which (player, class, spec) or item name
-- doesn't match the DB.

-- Bonus: dump the actual stored class/spec for every player in the
-- import so we can compare against expectations.
SELECT p."displayName" AS player, c.class, c.spec, c."isMain", c.active
  FROM "Character" c
  JOIN "Player" p ON c."playerId" = p.id
 WHERE p."displayName" IN (
   'Dody','Massesto','Shawtydgaf','Skryt','Cash','Veile','Tombradygoat',
   'Slamchamber','Gono','Keefy','Koco','Hoodfury','Barbatos','Pizookies',
   'Doge','Shmoo','Priestlynn','Fishynethers','Rfx','Xenodank','Jalisco',
   'Whappintime','Hazi','Kalihiwai','Glzy','Sleepyrat','Chainsaw','Sergo',
   'Bake','DIsrespect','Bored','Dommymommy','Yaske','Byung','Daladed',
   'Blargn','Dumpsterbob'
 )
 ORDER BY p."displayName", c.class, c.spec;
