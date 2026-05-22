-- Rename Character.name to real in-game names (mains + alts).
--
-- SAFE / NON-DESTRUCTIVE: this only UPDATEs Character.name in place.
--   * Character ids never change, so every LootAward, Attendance,
--     RosterMember, and assignment-sheet reference stays intact.
--   * Players are NOT touched — Player.displayName is left exactly as-is.
--   * Loot imports resolve characters by (player + class + spec), never
--     by Character.name, so imports are unaffected.
--   * Character.name has no unique index (dropped in migration 0002),
--     so renames can't collide.
--
-- Matching:
--   * MAINS  — matched by (player, isMain = TRUE). One main per player,
--              so class/spec aren't needed.
--   * ALTS   — matched by (player, class, isMain = FALSE). Unambiguous
--              for every player (Glzy's two Paladin alts intentionally
--              BOTH become 'Lipstix').
--   * Spec is deliberately NOT used for matching — live-DB specs have
--     drifted from roster.tsv (e.g. Mages show as "Arcane Mage"), so
--     class is the stable key.
--
-- Skipped (no real name yet — rename later):
--   Shawtydgaf (Druid alt), Whappintime (Hunter alt), Keefy (Shaman alt).
--
-- HOW TO RUN (Neon SQL editor):
--   1. Run the PREVIEW block first. Confirm every row shows the expected
--      current_name → proposed, and that no rule is missing its match
--      (id IS NULL means "no character matched — investigate").
--   2. Then run the APPLY block. It ends with a verification SELECT and
--      COMMIT.

-- ════════════════════════════════════════════════════════════════════
-- PREVIEW  (read-only — makes no changes)
-- ════════════════════════════════════════════════════════════════════
WITH renames(player, class, ismain, newname) AS (VALUES
  -- mains (class NULL → the player's main, whatever class it is)
  ('Bored',        NULL,      TRUE,  'Boredudu'),
  ('Bungle',       NULL,      TRUE,  'Cowabungle'),
  ('Capriciousxo', NULL,      TRUE,  'Caprice'),
  ('Dommymommy',   NULL,      TRUE,  'Dómmymómmy'),
  ('Chainsaw',     NULL,      TRUE,  'Chainsawgirl'),
  ('Whappintime',  NULL,      TRUE,  'Thatsmydog'),
  ('Kalihiwai',    NULL,      TRUE,  'Kuleana'),
  ('Keefy',        NULL,      TRUE,  'Slurrtwister'),
  ('Massesto',     NULL,      TRUE,  'Smashonebutn'),
  ('Sleepyrat',    NULL,      TRUE,  'Thesleepyrat'),
  ('Sergo',        NULL,      TRUE,  'Sérgo'),
  ('Shmoo',        NULL,      TRUE,  'Shmooches'),
  ('Barbatos',     NULL,      TRUE,  'Oguricap'),
  ('Dody',         NULL,      TRUE,  'Dodyx'),
  ('Dil',          NULL,      TRUE,  'Dildots'),
  ('Doge',         NULL,      TRUE,  'Dogelock'),
  -- alts (matched by player + class)
  ('Bugatti',      'Druid',   FALSE, 'Aeloris'),
  ('Massesto',     'Druid',   FALSE, 'Rxdruid'),
  ('Skryt',        'Druid',   FALSE, 'Skrytzo'),
  ('Zephleo',      'Druid',   FALSE, 'Leokitten'),
  ('Creek',        'Druid',   FALSE, 'Creeq'),
  ('Kalihiwai',    'Druid',   FALSE, 'Fishynethers'),
  ('Bored',        'Mage',    FALSE, 'Boredmage'),
  ('Cash',         'Hunter',  FALSE, 'Defcash'),
  ('Doge',         'Hunter',  FALSE, 'Dogehunter'),
  ('Glzy',         'Paladin', FALSE, 'Lipstix'),   -- both Ret + Holy alts → Lipstix
  ('Pizookies',    'Paladin', FALSE, 'Zookiez'),
  ('Bugatti',      'Paladin', FALSE, 'Aeternis'),
  ('Bake',         'Shaman',  FALSE, 'Bakeshaman'),
  ('Corr',         'Shaman',  FALSE, 'Côrr'),
  ('Gono',         'Shaman',  FALSE, 'Gonoe'),
  ('Rfx',          'Shaman',  FALSE, 'Rfxx'),
  ('Skryt',        'Shaman',  FALSE, 'Zynandcoffee'),
  ('Sleepyrat',    'Shaman',  FALSE, 'Thesleepyhit'),
  ('Elektro',      'Shaman',  FALSE, 'Elektrya'),
  ('Daladed',      'Warlock', FALSE, 'Daladots'),
  ('Koco',         'Warlock', FALSE, 'Coko'),
  ('Massesto',     'Warlock', FALSE, 'Yuppers'),
  ('Vspades',      'Warlock', FALSE, 'Lyvh')
)
SELECT r.player, r.ismain, r.class AS match_class, r.newname AS proposed,
       c.id, c.name AS current_name, c.class AS db_class, c.spec AS db_spec
FROM renames r
LEFT JOIN "Player" p ON p."displayName" = r.player
LEFT JOIN "Character" c
       ON c."playerId" = p.id
      AND c."isMain"   = r.ismain
      AND (r.class IS NULL OR c.class = r.class)
ORDER BY r.player, r.ismain DESC, r.class NULLS FIRST;

-- ════════════════════════════════════════════════════════════════════
-- APPLY  (run after the preview looks right)
-- ════════════════════════════════════════════════════════════════════
BEGIN;

-- Mains — one main per player, match by (player + isMain).
UPDATE "Character" c SET name = v.newname
FROM (VALUES
  ('Bored','Boredudu'),
  ('Bungle','Cowabungle'),
  ('Capriciousxo','Caprice'),
  ('Dommymommy','Dómmymómmy'),
  ('Chainsaw','Chainsawgirl'),
  ('Whappintime','Thatsmydog'),
  ('Kalihiwai','Kuleana'),
  ('Keefy','Slurrtwister'),
  ('Massesto','Smashonebutn'),
  ('Sleepyrat','Thesleepyrat'),
  ('Sergo','Sérgo'),
  ('Shmoo','Shmooches'),
  ('Barbatos','Oguricap'),
  ('Dody','Dodyx'),
  ('Dil','Dildots'),
  ('Doge','Dogelock')
) AS v(player, newname)
WHERE c."isMain" = TRUE
  AND c."playerId" = (SELECT id FROM "Player" WHERE "displayName" = v.player);

-- Alts — match by (player + class), isMain = FALSE.
UPDATE "Character" c SET name = v.newname
FROM (VALUES
  ('Bugatti','Druid','Aeloris'),
  ('Massesto','Druid','Rxdruid'),
  ('Skryt','Druid','Skrytzo'),
  ('Zephleo','Druid','Leokitten'),
  ('Creek','Druid','Creeq'),
  ('Kalihiwai','Druid','Fishynethers'),
  ('Bored','Mage','Boredmage'),
  ('Cash','Hunter','Defcash'),
  ('Doge','Hunter','Dogehunter'),
  ('Glzy','Paladin','Lipstix'),
  ('Pizookies','Paladin','Zookiez'),
  ('Bugatti','Paladin','Aeternis'),
  ('Bake','Shaman','Bakeshaman'),
  ('Corr','Shaman','Côrr'),
  ('Gono','Shaman','Gonoe'),
  ('Rfx','Shaman','Rfxx'),
  ('Skryt','Shaman','Zynandcoffee'),
  ('Sleepyrat','Shaman','Thesleepyhit'),
  ('Elektro','Shaman','Elektrya'),
  ('Daladed','Warlock','Daladots'),
  ('Koco','Warlock','Coko'),
  ('Massesto','Warlock','Yuppers'),
  ('Vspades','Warlock','Lyvh')
) AS v(player, class, newname)
WHERE c."isMain" = FALSE
  AND c.class = v.class
  AND c."playerId" = (SELECT id FROM "Player" WHERE "displayName" = v.player);

-- Verify, then COMMIT (or ROLLBACK; if anything looks wrong).
SELECT p."displayName" AS player, c."isMain", c.class, c.spec, c.name
FROM "Character" c JOIN "Player" p ON p.id = c."playerId"
ORDER BY p."displayName", c."isMain" DESC, c.class;

COMMIT;
