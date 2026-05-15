-- Roster correction patch #7 — SSC + TK true loot tables.
--
-- The seed catalog had multiple systemic errors for Phase 2 (SSC + TK):
--   1. T5 tier-token bosses were almost all wrong. Canonical mapping:
--        Gloves    → Leotheras the Blind     (SSC)
--        Leggings  → Fathom-Lord Karathress  (SSC)
--        Helm      → Lady Vashj              (SSC)
--        Shoulders → Void Reaver             (TK)
--        Chest     → Kael'thas Sunstrider    (TK)
--      Every other boss had tokens incorrectly seeded under it.
--   2. Several signature items were tagged to the wrong boss
--      (Fang of Vashj on Leotheras, Belt of One-Hundred Deaths on
--      Leotheras, Cord of Screaming Terrors on Vashj, etc.).
--   3. wowheadIds were sequential placeholders for whole bosses
--      (Al'ar 30050-30055, Void Reaver 30057-30062, etc.) and several
--      collided across rows.
--   4. Items appeared in the seed that don't drop from SSC/TK at all
--      (vanilla Ashkandi @ 17182, Illidari Runeshield, etc.).
--   5. ~70 canonical drops were missing entirely.
--
-- This patch uses the same collapse-and-update pattern as #005/#006:
--   For every canonical (name, boss) pair:
--     a. Reassign LootAwards from non-canonical Item rows to the
--        canonical row (existing row at the target boss, else lowest id).
--     b. DELETE duplicate Item rows.
--     c. UPDATE the survivor's bossId/slot/itemLevel/wowheadId.
--     d. INSERT if no row exists yet.
--   LootAward history is preserved end-to-end — no awards are dropped.
--
-- Idempotent — safe to re-run.

BEGIN;

-- ════════════════════════════════════════════════════════════════════════
-- 0. Pre-free every wowheadId we're going to assign so UPDATEs never
--    collide with unrelated mis-seeded rows.
-- ════════════════════════════════════════════════════════════════════════
UPDATE "Item" SET "wowheadId" = NULL
 WHERE "wowheadId" IN (
   -- SSC: Hydross
   30049, 32516, 30664, 30629, 33055, 30047, 30050, 30048, 30053, 30054,
   30052, 30056, 30055, 30051,
   -- SSC: Lurker
   30058, 30060, 30062, 30061, 33054, 30064, 30065, 30059, 30057, 30067,
   30665, 30066, 30063,
   -- SSC: Leotheras
   30241, 30240, 30239, 30096, 30097, 30095, 30092, 30091, 30627,
   -- SSC: Karathress
   30247, 30245, 30246, 30101, 30663, 30099, 30626, 30090, 30100,
   -- SSC: Morogrim
   30085, 30084, 30098, 30081, 30083, 33058, 30079, 30082, 30008, 30720,
   30068, 30075, 30080,
   -- SSC: Vashj
   30244, 30243, 30242, 30106, 30110, 30103, 30112, 30102, 30108, 30621,
   30109, 30104, 30111, 30105, 30107, 29906, 32895,
   -- TK: Al'ar
   30448, 29921, 29947, 29918, 29920, 29923, 30447, 29949, 29922, 29925,
   29924, 29948, 32944,
   -- TK: Void Reaver
   30248, 30249, 30250, 32515, 29983, 29985, 30450, 29986, 30619, 29984,
   -- TK: Solarian
   29965, 29950, 29962, 29951, 29966, 29981, 30446, 30449, 29976, 29977,
   29972, 29982, 32267,
   -- TK: Kael'thas
   32405, 30236, 30238, 30237, 29990, 29987, 29997, 29995, 29996, 29992,
   29998, 29989, 29994, 29988, 29993, 29991, 29905, 32458, 32896, 30183,
   30311, 30312, 30313, 30314, 30316, 30317, 30318,
   -- SSC: Trash Loot
   30021, 30022, 30023, 30025, 30027, 30620,
   -- TK: Trash Loot
   30020, 30024, 30026, 30028, 30029, 30030
 );

-- Ensure synthetic "Trash Loot" bosses exist for SSC and TK before we
-- upsert items into them. Order = 99 so they always sort to the end
-- of the boss list in /loot.
INSERT INTO "Boss" (name, "order", "raidId")
SELECT 'Trash Loot', 99, r.id FROM "Raid" r WHERE r."shortName" = 'SSC'
ON CONFLICT ("raidId", name) DO NOTHING;
INSERT INTO "Boss" (name, "order", "raidId")
SELECT 'Trash Loot', 99, r.id FROM "Raid" r WHERE r."shortName" = 'TK'
ON CONFLICT ("raidId", name) DO NOTHING;

-- ════════════════════════════════════════════════════════════════════════
-- 1. Helper: upsert_canonical_item(name, boss, slot, itemLevel, wowheadId)
--    Collapses duplicates, preserves LootAwards, updates fields, inserts
--    if missing.
-- ════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION pg_temp.upsert_canonical_item(
  p_name           TEXT,
  p_boss_name      TEXT,
  p_slot           TEXT,
  p_ilvl           INT,
  p_wowhead        INT,
  p_raid_shortname TEXT DEFAULT NULL  -- disambiguate when boss name repeats (Trash Loot)
) RETURNS VOID AS $$
DECLARE
  v_boss_id   INT;
  v_keeper_id INT;
BEGIN
  IF p_raid_shortname IS NULL THEN
    v_boss_id := (SELECT id FROM "Boss" WHERE name = p_boss_name);
  ELSE
    v_boss_id := (SELECT b.id FROM "Boss" b
                   JOIN "Raid" r ON b."raidId" = r.id
                   WHERE b.name = p_boss_name AND r."shortName" = p_raid_shortname);
  END IF;
  IF v_boss_id IS NULL THEN
    RAISE EXCEPTION 'Boss not found: % (raid: %)', p_boss_name, p_raid_shortname;
  END IF;

  v_keeper_id := (
    SELECT id FROM "Item"
     WHERE name = p_name
     ORDER BY ("bossId" = v_boss_id) DESC, id ASC
     LIMIT 1
  );

  IF v_keeper_id IS NOT NULL THEN
    UPDATE "LootAward" SET "itemId" = v_keeper_id
     WHERE "itemId" IN (SELECT id FROM "Item" WHERE name = p_name)
       AND "itemId" <> v_keeper_id;
    DELETE FROM "Item" WHERE name = p_name AND id <> v_keeper_id;
    UPDATE "Item"
       SET "bossId"    = v_boss_id,
           slot        = p_slot,
           "itemLevel" = p_ilvl,
           "wowheadId" = p_wowhead
     WHERE id = v_keeper_id;
  ELSE
    INSERT INTO "Item" (name, slot, "itemLevel", "wowheadId", "bossId")
    VALUES (p_name, p_slot, p_ilvl, p_wowhead, v_boss_id);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ════════════════════════════════════════════════════════════════════════
-- 2. T5 tier tokens — collapse and reattribute.
--    Hydross/Lurker/Morogrim/Al'ar/Solarian had token rows that should
--    not exist; collapse those into the canonical (boss, name) pairs.
-- ════════════════════════════════════════════════════════════════════════
-- Gloves → Leotheras the Blind
SELECT pg_temp.upsert_canonical_item('Gloves of the Vanquished Hero',      'Leotheras the Blind', 'Token (Hands)', 133, 30241);
SELECT pg_temp.upsert_canonical_item('Gloves of the Vanquished Defender',  'Leotheras the Blind', 'Token (Hands)', 133, 30240);
SELECT pg_temp.upsert_canonical_item('Gloves of the Vanquished Champion', 'Leotheras the Blind', 'Token (Hands)', 133, 30239);
-- Leggings → Fathom-Lord Karathress
SELECT pg_temp.upsert_canonical_item('Leggings of the Vanquished Hero',      'Fathom-Lord Karathress', 'Token (Legs)', 133, 30247);
SELECT pg_temp.upsert_canonical_item('Leggings of the Vanquished Defender',  'Fathom-Lord Karathress', 'Token (Legs)', 133, 30246);
SELECT pg_temp.upsert_canonical_item('Leggings of the Vanquished Champion', 'Fathom-Lord Karathress', 'Token (Legs)', 133, 30245);
-- Helm → Lady Vashj
SELECT pg_temp.upsert_canonical_item('Helm of the Vanquished Hero',      'Lady Vashj', 'Token (Head)', 133, 30244);
SELECT pg_temp.upsert_canonical_item('Helm of the Vanquished Defender',  'Lady Vashj', 'Token (Head)', 133, 30243);
SELECT pg_temp.upsert_canonical_item('Helm of the Vanquished Champion', 'Lady Vashj', 'Token (Head)', 133, 30242);
-- Shoulders → Void Reaver
SELECT pg_temp.upsert_canonical_item('Pauldrons of the Vanquished Hero',      'Void Reaver', 'Token (Shoulders)', 133, 30250);
SELECT pg_temp.upsert_canonical_item('Pauldrons of the Vanquished Defender',  'Void Reaver', 'Token (Shoulders)', 133, 30249);
SELECT pg_temp.upsert_canonical_item('Pauldrons of the Vanquished Champion', 'Void Reaver', 'Token (Shoulders)', 133, 30248);
-- Chest → Kael'thas Sunstrider
SELECT pg_temp.upsert_canonical_item('Chestguard of the Vanquished Hero',      'Kael''thas Sunstrider', 'Token (Chest)', 141, 30238);
SELECT pg_temp.upsert_canonical_item('Chestguard of the Vanquished Defender',  'Kael''thas Sunstrider', 'Token (Chest)', 141, 30237);
SELECT pg_temp.upsert_canonical_item('Chestguard of the Vanquished Champion', 'Kael''thas Sunstrider', 'Token (Chest)', 141, 30236);

-- ════════════════════════════════════════════════════════════════════════
-- 3. SSC — Hydross the Unstable
-- ════════════════════════════════════════════════════════════════════════
SELECT pg_temp.upsert_canonical_item('Fathomstone',                    'Hydross the Unstable', 'Trinket',    133, 30049);
SELECT pg_temp.upsert_canonical_item('Wraps of Purification',          'Hydross the Unstable', 'Wrist',      133, 32516);
SELECT pg_temp.upsert_canonical_item('Living Root of the Wildheart',   'Hydross the Unstable', 'Trinket',    133, 30664);
SELECT pg_temp.upsert_canonical_item('Scarab of Displacement',         'Hydross the Unstable', 'Trinket',    133, 30629);
SELECT pg_temp.upsert_canonical_item('Band of Vile Aggression',        'Hydross the Unstable', 'Finger',     133, 33055);
SELECT pg_temp.upsert_canonical_item('Blackfathom Warbands',           'Hydross the Unstable', 'Wrist',      133, 30047);
SELECT pg_temp.upsert_canonical_item('Boots of the Shifting Nightmare','Hydross the Unstable', 'Feet',       133, 30050);
SELECT pg_temp.upsert_canonical_item('Brighthelm of Justice',          'Hydross the Unstable', 'Head',       133, 30048);
SELECT pg_temp.upsert_canonical_item('Pauldrons of the Wardancer',     'Hydross the Unstable', 'Shoulders',  133, 30053);
SELECT pg_temp.upsert_canonical_item('Ranger-General''s Chestguard',   'Hydross the Unstable', 'Chest',      133, 30054);
SELECT pg_temp.upsert_canonical_item('Ring of Lethality',              'Hydross the Unstable', 'Finger',     133, 30052);
SELECT pg_temp.upsert_canonical_item('Robe of Hateful Echoes',         'Hydross the Unstable', 'Chest',      133, 30056);
SELECT pg_temp.upsert_canonical_item('Shoulderpads of the Stranger',   'Hydross the Unstable', 'Shoulders',  133, 30055);
SELECT pg_temp.upsert_canonical_item('Idol of the Crescent Goddess',   'Hydross the Unstable', 'Relic',      133, 30051);

-- ════════════════════════════════════════════════════════════════════════
-- 4. SSC — The Lurker Below
-- ════════════════════════════════════════════════════════════════════════
SELECT pg_temp.upsert_canonical_item('Mallet of the Tides',            'The Lurker Below', 'One-Hand Mace', 133, 30058);
SELECT pg_temp.upsert_canonical_item('Boots of Effortless Striking',   'The Lurker Below', 'Feet',          133, 30060);
SELECT pg_temp.upsert_canonical_item('Grove-Bands of Remulos',         'The Lurker Below', 'Wrist',         133, 30062);
SELECT pg_temp.upsert_canonical_item('Ancestral Ring of Conquest',     'The Lurker Below', 'Finger',        133, 30061);
SELECT pg_temp.upsert_canonical_item('The Seal of Danzalar',           'The Lurker Below', 'Finger',        133, 33054);
SELECT pg_temp.upsert_canonical_item('Cord of Screaming Terrors',      'The Lurker Below', 'Waist',         133, 30064);
SELECT pg_temp.upsert_canonical_item('Glowing Breastplate of Truth',   'The Lurker Below', 'Chest',         133, 30065);
SELECT pg_temp.upsert_canonical_item('Choker of Animalistic Fury',     'The Lurker Below', 'Neck',          133, 30059);
SELECT pg_temp.upsert_canonical_item('Bracers of Eradication',         'The Lurker Below', 'Wrist',         133, 30057);
SELECT pg_temp.upsert_canonical_item('Velvet Boots of the Guardian',   'The Lurker Below', 'Feet',          133, 30067);
SELECT pg_temp.upsert_canonical_item('Earring of Soulful Meditation',  'The Lurker Below', 'Neck',          133, 30665);
SELECT pg_temp.upsert_canonical_item('Tempest-Strider Boots',          'The Lurker Below', 'Feet',          133, 30066);
SELECT pg_temp.upsert_canonical_item('Libram of Absolute Truth',       'The Lurker Below', 'Relic',         133, 30063);

-- ════════════════════════════════════════════════════════════════════════
-- 5. SSC — Leotheras the Blind
-- ════════════════════════════════════════════════════════════════════════
SELECT pg_temp.upsert_canonical_item('Girdle of the Invulnerable',     'Leotheras the Blind', 'Waist',           133, 30096);
SELECT pg_temp.upsert_canonical_item('Coral-Barbed Shoulderpads',      'Leotheras the Blind', 'Shoulders',       133, 30097);
SELECT pg_temp.upsert_canonical_item('Fang of the Leviathan',          'Leotheras the Blind', 'One-Hand Sword',  133, 30095);
SELECT pg_temp.upsert_canonical_item('Orca-Hide Boots',                'Leotheras the Blind', 'Feet',            133, 30092);
SELECT pg_temp.upsert_canonical_item('True-Aim Stalker Bands',         'Leotheras the Blind', 'Wrist',           133, 30091);
SELECT pg_temp.upsert_canonical_item('Tsunami Talisman',               'Leotheras the Blind', 'Trinket',         133, 30627);

-- ════════════════════════════════════════════════════════════════════════
-- 6. SSC — Fathom-Lord Karathress
-- ════════════════════════════════════════════════════════════════════════
SELECT pg_temp.upsert_canonical_item('Bloodsea Brigand''s Vest',       'Fathom-Lord Karathress', 'Chest',           133, 30101);
SELECT pg_temp.upsert_canonical_item('Fathom-Brooch of the Tidewalker','Fathom-Lord Karathress', 'Trinket',         133, 30663);
SELECT pg_temp.upsert_canonical_item('Frayed Tether of the Drowned',   'Fathom-Lord Karathress', 'Wrist',           133, 30099);
SELECT pg_temp.upsert_canonical_item('Sextant of Unstable Currents',   'Fathom-Lord Karathress', 'Trinket',         133, 30626);
SELECT pg_temp.upsert_canonical_item('World Breaker',                  'Fathom-Lord Karathress', 'Two-Hand Sword',  133, 30090);
SELECT pg_temp.upsert_canonical_item('Soul-Strider Boots',             'Fathom-Lord Karathress', 'Feet',            133, 30100);

-- ════════════════════════════════════════════════════════════════════════
-- 7. SSC — Morogrim Tidewalker
-- ════════════════════════════════════════════════════════════════════════
SELECT pg_temp.upsert_canonical_item('Mantle of the Tireless Tracker', 'Morogrim Tidewalker', 'Shoulders', 133, 30085);
SELECT pg_temp.upsert_canonical_item('Pauldrons of the Argent Sentinel','Morogrim Tidewalker','Shoulders', 133, 30084);
SELECT pg_temp.upsert_canonical_item('Razor-Scale Battlecloak',        'Morogrim Tidewalker', 'Back',      133, 30098);
SELECT pg_temp.upsert_canonical_item('Warboots of Obliteration',       'Morogrim Tidewalker', 'Feet',      133, 30081);
SELECT pg_temp.upsert_canonical_item('Ring of Sundered Souls',         'Morogrim Tidewalker', 'Finger',    133, 30083);
SELECT pg_temp.upsert_canonical_item('Band of the Vigilant',           'Morogrim Tidewalker', 'Finger',    133, 33058);
SELECT pg_temp.upsert_canonical_item('Illidari Shoulderpads',          'Morogrim Tidewalker', 'Shoulders', 133, 30079);
SELECT pg_temp.upsert_canonical_item('Talon of Azshara',               'Morogrim Tidewalker', 'Dagger',    133, 30082);
SELECT pg_temp.upsert_canonical_item('Pendant of the Lost Ages',       'Morogrim Tidewalker', 'Neck',      133, 30008);
SELECT pg_temp.upsert_canonical_item('Serpent-Coil Braid',             'Morogrim Tidewalker', 'Trinket',   133, 30720);
SELECT pg_temp.upsert_canonical_item('Girdle of the Tidal Call',       'Morogrim Tidewalker', 'Waist',     133, 30068);
SELECT pg_temp.upsert_canonical_item('Gnarled Chestpiece of the Ancients','Morogrim Tidewalker','Chest',  133, 30075);
SELECT pg_temp.upsert_canonical_item('Luminescent Rod of the Naaru',   'Morogrim Tidewalker', 'Wand',      133, 30080);

-- ════════════════════════════════════════════════════════════════════════
-- 8. SSC — Lady Vashj
-- ════════════════════════════════════════════════════════════════════════
SELECT pg_temp.upsert_canonical_item('Belt of One-Hundred Deaths',     'Lady Vashj', 'Waist',         141, 30106);
SELECT pg_temp.upsert_canonical_item('Coral Band of the Revived',      'Lady Vashj', 'Finger',        141, 30110);
SELECT pg_temp.upsert_canonical_item('Fang of Vashj',                  'Lady Vashj', 'Dagger',        141, 30103);
SELECT pg_temp.upsert_canonical_item('Glorious Gauntlets of Crestfall','Lady Vashj', 'Hands',         141, 30112);
SELECT pg_temp.upsert_canonical_item('Krakken-Heart Breastplate',      'Lady Vashj', 'Chest',         141, 30102);
SELECT pg_temp.upsert_canonical_item('Lightfathom Scepter',            'Lady Vashj', 'One-Hand Mace', 141, 30108);
SELECT pg_temp.upsert_canonical_item('Prism of Inner Calm',            'Lady Vashj', 'Trinket',       141, 30621);
SELECT pg_temp.upsert_canonical_item('Ring of Endless Coils',          'Lady Vashj', 'Finger',        141, 30109);
SELECT pg_temp.upsert_canonical_item('Cobra-Lash Boots',               'Lady Vashj', 'Feet',          141, 30104);
SELECT pg_temp.upsert_canonical_item('Runetotem''s Mantle',            'Lady Vashj', 'Shoulders',     141, 30111);
SELECT pg_temp.upsert_canonical_item('Serpent Spine Longbow',          'Lady Vashj', 'Bow',           141, 30105);
SELECT pg_temp.upsert_canonical_item('Vestments of the Sea-Witch',     'Lady Vashj', 'Chest',         141, 30107);
SELECT pg_temp.upsert_canonical_item('Vashj''s Vial Remnant',          'Lady Vashj', 'Quest',         141, 29906);
SELECT pg_temp.upsert_canonical_item('Scroll of the Maelstrom',        'Lady Vashj', 'Other',         141, 32895);

-- ════════════════════════════════════════════════════════════════════════
-- 9. TK — Al'ar
-- ════════════════════════════════════════════════════════════════════════
SELECT pg_temp.upsert_canonical_item('Talon of Al''ar',                'Al''ar', 'Trinket',         133, 30448);
SELECT pg_temp.upsert_canonical_item('Fire Crest Breastplate',         'Al''ar', 'Chest',           133, 29921);
SELECT pg_temp.upsert_canonical_item('Gloves of the Searing Grip',     'Al''ar', 'Hands',           133, 29947);
SELECT pg_temp.upsert_canonical_item('Mindstorm Wristbands',           'Al''ar', 'Wrist',           133, 29918);
SELECT pg_temp.upsert_canonical_item('Phoenix-Ring of Rebirth',        'Al''ar', 'Finger',          133, 29920);
SELECT pg_temp.upsert_canonical_item('Talisman of the Sun King',       'Al''ar', 'Trinket',         133, 29923);
SELECT pg_temp.upsert_canonical_item('Tome of Fiery Redemption',       'Al''ar', 'Off Hand',        133, 30447);
SELECT pg_temp.upsert_canonical_item('Arcanite Steam-Pistol',          'Al''ar', 'Gun',             133, 29949);
SELECT pg_temp.upsert_canonical_item('Band of Al''ar',                 'Al''ar', 'Finger',          133, 29922);
SELECT pg_temp.upsert_canonical_item('Phoenix-Wing Cloak',             'Al''ar', 'Back',            133, 29925);
SELECT pg_temp.upsert_canonical_item('Netherbane',                     'Al''ar', 'Two-Hand Sword',  133, 29924);
SELECT pg_temp.upsert_canonical_item('Claw of the Phoenix',            'Al''ar', 'Fist Weapon',     133, 29948);
SELECT pg_temp.upsert_canonical_item('Talon of the Phoenix',           'Al''ar', 'Dagger',          133, 32944);

-- ════════════════════════════════════════════════════════════════════════
-- 10. TK — Void Reaver
-- ════════════════════════════════════════════════════════════════════════
SELECT pg_temp.upsert_canonical_item('Wristguards of Determination',   'Void Reaver', 'Wrist',     133, 32515);
SELECT pg_temp.upsert_canonical_item('Fel-Steel Warhelm',              'Void Reaver', 'Head',      133, 29983);
SELECT pg_temp.upsert_canonical_item('Void Reaver Greaves',            'Void Reaver', 'Legs',      133, 29985);
SELECT pg_temp.upsert_canonical_item('Warp-Spring Coil',               'Void Reaver', 'Trinket',   133, 30450);
SELECT pg_temp.upsert_canonical_item('Cowl of the Grand Engineer',     'Void Reaver', 'Head',      133, 29986);
SELECT pg_temp.upsert_canonical_item('Fel Reaver''s Piston',           'Void Reaver', 'Trinket',   133, 30619);
SELECT pg_temp.upsert_canonical_item('Girdle of Zaetar',               'Void Reaver', 'Waist',     133, 29984);

-- ════════════════════════════════════════════════════════════════════════
-- 11. TK — High Astromancer Solarian
-- ════════════════════════════════════════════════════════════════════════
SELECT pg_temp.upsert_canonical_item('Girdle of the Righteous Path',   'High Astromancer Solarian', 'Waist',          133, 29965);
SELECT pg_temp.upsert_canonical_item('Greaves of the Bloodwarder',     'High Astromancer Solarian', 'Legs',           133, 29950);
SELECT pg_temp.upsert_canonical_item('Heartrazor',                     'High Astromancer Solarian', 'One-Hand Sword', 133, 29962);
SELECT pg_temp.upsert_canonical_item('Star-Strider Boots',             'High Astromancer Solarian', 'Feet',           133, 29951);
SELECT pg_temp.upsert_canonical_item('Vambraces of Ending',            'High Astromancer Solarian', 'Wrist',          133, 29966);
SELECT pg_temp.upsert_canonical_item('Ethereum Life-Staff',            'High Astromancer Solarian', 'Staff',          133, 29981);
SELECT pg_temp.upsert_canonical_item('Solarian''s Sapphire',           'High Astromancer Solarian', 'Trinket',        133, 30446);
SELECT pg_temp.upsert_canonical_item('Void Star Talisman',             'High Astromancer Solarian', 'Trinket',        133, 30449);
SELECT pg_temp.upsert_canonical_item('Worldstorm Gauntlets',           'High Astromancer Solarian', 'Hands',          133, 29976);
SELECT pg_temp.upsert_canonical_item('Star-Soul Breeches',             'High Astromancer Solarian', 'Legs',           133, 29977);
SELECT pg_temp.upsert_canonical_item('Trousers of the Astromancer',    'High Astromancer Solarian', 'Legs',           133, 29972);
SELECT pg_temp.upsert_canonical_item('Wand of the Forgotten Star',     'High Astromancer Solarian', 'Wand',           133, 29982);
SELECT pg_temp.upsert_canonical_item('Boots of the Resilient',         'High Astromancer Solarian', 'Feet',           133, 32267);

-- ════════════════════════════════════════════════════════════════════════
-- 12. TK — Kael'thas Sunstrider
-- ════════════════════════════════════════════════════════════════════════
SELECT pg_temp.upsert_canonical_item('Verdant Sphere',                 'Kael''thas Sunstrider', 'Trinket',          141, 32405);
SELECT pg_temp.upsert_canonical_item('Crown of the Sun',               'Kael''thas Sunstrider', 'Head',             141, 29990);
SELECT pg_temp.upsert_canonical_item('Gauntlets of the Sun King',      'Kael''thas Sunstrider', 'Hands',            141, 29987);
SELECT pg_temp.upsert_canonical_item('Band of the Ranger-General',     'Kael''thas Sunstrider', 'Finger',           141, 29997);
SELECT pg_temp.upsert_canonical_item('Leggings of Murderous Intent',   'Kael''thas Sunstrider', 'Legs',             141, 29995);
SELECT pg_temp.upsert_canonical_item('Rod of the Sun King',            'Kael''thas Sunstrider', 'Two-Hand Mace',    141, 29996);
SELECT pg_temp.upsert_canonical_item('Royal Cloak of the Sunstriders', 'Kael''thas Sunstrider', 'Back',             141, 29992);
SELECT pg_temp.upsert_canonical_item('Royal Gauntlets of Silvermoon',  'Kael''thas Sunstrider', 'Hands',            141, 29998);
SELECT pg_temp.upsert_canonical_item('Sunshower Light Cloak',          'Kael''thas Sunstrider', 'Back',             141, 29989);
SELECT pg_temp.upsert_canonical_item('Thalassian Wildercloak',         'Kael''thas Sunstrider', 'Back',             141, 29994);
SELECT pg_temp.upsert_canonical_item('The Nexus Key',                  'Kael''thas Sunstrider', 'Staff',            141, 29988);
SELECT pg_temp.upsert_canonical_item('Twinblade of the Phoenix',       'Kael''thas Sunstrider', 'Two-Hand Sword',   141, 29993);
SELECT pg_temp.upsert_canonical_item('Sunhawk Leggings',               'Kael''thas Sunstrider', 'Legs',             141, 29991);
SELECT pg_temp.upsert_canonical_item('Kael''s Vial Remnant',           'Kael''thas Sunstrider', 'Quest',            141, 29905);
SELECT pg_temp.upsert_canonical_item('Ashes of Al''ar',                'Kael''thas Sunstrider', 'Mount',              1, 32458);
SELECT pg_temp.upsert_canonical_item('Scroll of the Sun',              'Kael''thas Sunstrider', 'Other',            141, 32896);
SELECT pg_temp.upsert_canonical_item('Nether Vortex',                  'Kael''thas Sunstrider', 'Reagent',            0, 30183);
SELECT pg_temp.upsert_canonical_item('Warp Slicer',                    'Kael''thas Sunstrider', 'One-Hand Sword',   141, 30311);
SELECT pg_temp.upsert_canonical_item('Infinity Blade',                 'Kael''thas Sunstrider', 'One-Hand Sword',   141, 30312);
SELECT pg_temp.upsert_canonical_item('Staff of Disintegration',        'Kael''thas Sunstrider', 'Staff',            141, 30313);
SELECT pg_temp.upsert_canonical_item('Phaseshift Bulwark',             'Kael''thas Sunstrider', 'Shield',           141, 30314);
SELECT pg_temp.upsert_canonical_item('Devastation',                    'Kael''thas Sunstrider', 'Two-Hand Axe',     141, 30316);
SELECT pg_temp.upsert_canonical_item('Cosmic Infuser',                 'Kael''thas Sunstrider', 'One-Hand Mace',    141, 30317);
SELECT pg_temp.upsert_canonical_item('Netherstrand Longbow',           'Kael''thas Sunstrider', 'Bow',              141, 30318);

-- ════════════════════════════════════════════════════════════════════════
-- 13. SSC — Trash Loot (BoE drops from trash mobs in Coilfang/SSC)
-- ════════════════════════════════════════════════════════════════════════
-- Pendant of the Perilous was wrongly seeded under Hydross; the upsert
-- moves it (and preserves any award history) into Trash Loot.
SELECT pg_temp.upsert_canonical_item('Wildfury Greatstaff',          'Trash Loot', 'Staff',   128, 30021, 'SSC');
SELECT pg_temp.upsert_canonical_item('Pendant of the Perilous',      'Trash Loot', 'Neck',    128, 30022, 'SSC');
SELECT pg_temp.upsert_canonical_item('Totem of the Maelstrom',       'Trash Loot', 'Relic',   128, 30023, 'SSC');
SELECT pg_temp.upsert_canonical_item('Serpentshrine Shuriken',       'Trash Loot', 'Thrown',  128, 30025, 'SSC');
SELECT pg_temp.upsert_canonical_item('Boots of Courage Unending',    'Trash Loot', 'Feet',    128, 30027, 'SSC');
SELECT pg_temp.upsert_canonical_item('Spyglass of the Hidden Fleet', 'Trash Loot', 'Trinket', 128, 30620, 'SSC');

-- ════════════════════════════════════════════════════════════════════════
-- 14. TK — Trash Loot (BoE drops from trash mobs in Tempest Keep)
-- ════════════════════════════════════════════════════════════════════════
SELECT pg_temp.upsert_canonical_item('Fire-Cord of the Magus',         'Trash Loot', 'Waist',     128, 30020, 'TK');
SELECT pg_temp.upsert_canonical_item('Mantle of the Elven Kings',      'Trash Loot', 'Shoulders', 128, 30024, 'TK');
SELECT pg_temp.upsert_canonical_item('Bands of the Celestial Archer',  'Trash Loot', 'Wrist',     128, 30026, 'TK');
SELECT pg_temp.upsert_canonical_item('Seventh Ring of the Tirisfalen', 'Trash Loot', 'Finger',    128, 30028, 'TK');
SELECT pg_temp.upsert_canonical_item('Bark-Gloves of Ancient Wisdom',  'Trash Loot', 'Hands',     128, 30029, 'TK');
SELECT pg_temp.upsert_canonical_item('Girdle of Fallen Stars',         'Trash Loot', 'Waist',     128, 30030, 'TK');

-- ════════════════════════════════════════════════════════════════════════
-- 15. Clean up orphans from the old seed — items wrongly attached to
--     SSC/TK bosses that aren't part of the canonical drop pool and
--     have no LootAward history. Items WITH awards stay where they are
--     to preserve guild history.
-- ════════════════════════════════════════════════════════════════════════
DELETE FROM "Item" i
 WHERE "bossId" IN (
   SELECT b.id FROM "Boss" b
   JOIN "Raid" r ON b."raidId" = r.id
   WHERE r."shortName" IN ('SSC', 'TK')
 )
 AND name IN (
   -- SSC orphans
   'Hydross-Encrusted Greaves',
   'Hydrospawn Boots',
   'Leggings of the Seventh Circle',
   'Leggings of Divine Retribution',
   'Bands of Indwelling',
   'Scaled Greaves of the Marksman',
   'Might of the Ocean Serpent',
   'Might of the Ocean Serpent',
   'Fathom-Helm of the Deeps',
   'Mantle of the Corrupted',
   'Boots of the Colossus',
   'Earthsoul Britches',
   'Tide-Stomper''s Greaves',
   'Glimmering Naaru Sliver',
   'Grethok''s Control Staff',
   'Ring of Rampant Elements',
   'Grip of Mannoroth',
   'Illidari Runeshield',
   'Valanos'' Longbow',
   -- TK orphans
   'Elunite Forged Breastplate',
   'Archivist Cape',
   'Pauldrons of Blasting',
   'Void-Touched Leather Leggings',
   'Ring of Recurrence',
   'Ring of Captured Storms',
   'Shining Bauble of the Naaru',
   'Starfire Bindings',
   'Worldfire Chestguard',
   'Ashkandi, Greatsword of the Brotherhood'
 )
 AND NOT EXISTS (SELECT 1 FROM "LootAward" la WHERE la."itemId" = i.id);

-- ════════════════════════════════════════════════════════════════════════
-- 16. Drop the helper function.
-- ════════════════════════════════════════════════════════════════════════
DROP FUNCTION pg_temp.upsert_canonical_item(TEXT, TEXT, TEXT, INT, INT, TEXT);

COMMIT;

-- Sanity checks (run separately after the migration commits):
--
-- 1. Each token name appears exactly once at its canonical boss.
--    SELECT i.name, b.name AS boss
--      FROM "Item" i JOIN "Boss" b ON i."bossId" = b.id
--     WHERE i.name IN (
--       'Gloves of the Vanquished Hero','Gloves of the Vanquished Defender','Gloves of the Vanquished Champion',
--       'Leggings of the Vanquished Hero','Leggings of the Vanquished Defender','Leggings of the Vanquished Champion',
--       'Helm of the Vanquished Hero','Helm of the Vanquished Defender','Helm of the Vanquished Champion',
--       'Pauldrons of the Vanquished Hero','Pauldrons of the Vanquished Defender','Pauldrons of the Vanquished Champion',
--       'Chestguard of the Vanquished Hero','Chestguard of the Vanquished Defender','Chestguard of the Vanquished Champion'
--     ) ORDER BY i.name;
--
-- 2. SSC + TK item counts per boss roughly match expectations
--    (Hydross 14, Lurker 13, Leotheras 9, Karathress 9, Morogrim 13,
--    Vashj 17, Al'ar 13, Void Reaver 10, Solarian 13, Kael'thas 27).
--    SELECT b.name, COUNT(*)
--      FROM "Item" i JOIN "Boss" b ON i."bossId" = b.id
--      JOIN "Raid" r ON b."raidId" = r.id
--     WHERE r."shortName" IN ('SSC','TK')
--     GROUP BY b.name ORDER BY b.name;
--
-- 3. No wowheadId collisions on SSC/TK rows.
--    SELECT "wowheadId", COUNT(*) FROM "Item"
--     WHERE "wowheadId" IS NOT NULL
--     GROUP BY "wowheadId" HAVING COUNT(*) > 1;
--    (Should return zero rows.)
