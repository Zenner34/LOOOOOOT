-- Rename Character.name to real in-game names (mains + alts).
-- Generated from data/roster-rename-edit.tsv (admin-corrected).
--
-- SAFE / NON-DESTRUCTIVE — only UPDATEs Character.name in place:
--   * Character ids never change → LootAward / Attendance / RosterMember
--     / assignment-sheet references stay intact.
--   * Players are NOT touched (Player.displayName unchanged).
--   * Loot imports resolve by (player + class + spec), never by name,
--     so imports are unaffected.
--   * Character.name has no unique index → renames can't collide.
--
-- Matching: MAINS by (player, isMain=TRUE); ALTS by (player, class,
-- isMain=FALSE). Spec is NOT used (live-DB specs drifted from roster.tsv).
-- Glzy's two Paladin alts BOTH become 'Lipstix' by design.
--
-- Not renamed (absent from the sheet — left untouched): Shawtydgaf
-- (Druid alt), Whappintime (Hunter alt), Keefy (Shaman alt).
--
-- HOW TO RUN (Neon SQL editor): run PREVIEW first and confirm every row
-- shows current_name -> proposed with a non-NULL id; then run APPLY.

-- ════════════════════════════════════════════════════════════════════
-- PREVIEW  (read-only)
-- ════════════════════════════════════════════════════════════════════
WITH renames(player, class, ismain, newname) AS (VALUES
  ('Bored', NULL, TRUE, 'Boredudu'),
  ('Bungle', NULL, TRUE, 'Cowabungle'),
  ('Capriciousxo', NULL, TRUE, 'Caprice'),
  ('Dommymommy', NULL, TRUE, 'Dómmymómmy'),
  ('Chainsaw', NULL, TRUE, 'Chainsawgirl'),
  ('Whappintime', NULL, TRUE, 'Thatsmydog'),
  ('Creek', NULL, TRUE, 'Creekx'),
  ('Cash', NULL, TRUE, 'Notcash'),
  ('Kalihiwai', NULL, TRUE, 'Kuleana'),
  ('Keefy', NULL, TRUE, 'Slurrtwister'),
  ('Massesto', NULL, TRUE, 'Smashonebutn'),
  ('Sleepyrat', NULL, TRUE, 'Thesleepyrat'),
  ('Bake', NULL, TRUE, 'Bakepriest'),
  ('Mac', NULL, TRUE, 'Macncheese'),
  ('Sergo', NULL, TRUE, 'Sérgo'),
  ('Shmoo', NULL, TRUE, 'Shmooches'),
  ('Barbatos', NULL, TRUE, 'Oguricap'),
  ('Dody', NULL, TRUE, 'Dodyx'),
  ('Dil', NULL, TRUE, 'Dildots'),
  ('Doge', NULL, TRUE, 'Dogelock'),
  ('Elektro', 'Shaman', FALSE, 'Elektrya'),
  ('Bugatti', 'Druid', FALSE, 'Aeloris'),
  ('Massesto', 'Druid', FALSE, 'Rxdruid'),
  ('Skryt', 'Druid', FALSE, 'Skrytzo'),
  ('Zephleo', 'Druid', FALSE, 'Leokitten'),
  ('Creek', 'Druid', FALSE, 'Creeq'),
  ('Kalihiwai', 'Druid', FALSE, 'Fishynethers'),
  ('Bored', 'Mage', FALSE, 'Boredmage'),
  ('Cash', 'Hunter', FALSE, 'Defcash'),
  ('Doge', 'Hunter', FALSE, 'Dogehunter'),
  ('Glzy', 'Paladin', FALSE, 'Lipstix'),   -- matches BOTH his Ret + Holy paladin alts
  ('Pizookies', 'Paladin', FALSE, 'Zookiez'),
  ('Bugatti', 'Paladin', FALSE, 'Aeternis'),
  ('Bake', 'Shaman', FALSE, 'Bakeshaman'),
  ('Corr', 'Shaman', FALSE, 'Côrr'),
  ('Gono', 'Shaman', FALSE, 'Gonoe'),
  ('Rfx', 'Shaman', FALSE, 'Rfxx'),
  ('Skryt', 'Shaman', FALSE, 'Zynandcoffee'),
  ('Sleepyrat', 'Shaman', FALSE, 'Thesleepyhit'),
  ('Daladed', 'Warlock', FALSE, 'Daladots'),
  ('Koco', 'Warlock', FALSE, 'Coko'),
  ('Massesto', 'Warlock', FALSE, 'Yuppers'),
  ('Vspades', 'Warlock', FALSE, 'Lyvh')
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
-- APPLY
-- ════════════════════════════════════════════════════════════════════
BEGIN;

-- Mains — match by (player, isMain=TRUE).
UPDATE "Character" c SET name = v.newname
FROM (VALUES
  ('Bored', 'Boredudu'),
  ('Bungle', 'Cowabungle'),
  ('Capriciousxo', 'Caprice'),
  ('Dommymommy', 'Dómmymómmy'),
  ('Chainsaw', 'Chainsawgirl'),
  ('Whappintime', 'Thatsmydog'),
  ('Creek', 'Creekx'),
  ('Cash', 'Notcash'),
  ('Kalihiwai', 'Kuleana'),
  ('Keefy', 'Slurrtwister'),
  ('Massesto', 'Smashonebutn'),
  ('Sleepyrat', 'Thesleepyrat'),
  ('Bake', 'Bakepriest'),
  ('Mac', 'Macncheese'),
  ('Sergo', 'Sérgo'),
  ('Shmoo', 'Shmooches'),
  ('Barbatos', 'Oguricap'),
  ('Dody', 'Dodyx'),
  ('Dil', 'Dildots'),
  ('Doge', 'Dogelock')
) AS v(player, newname)
WHERE c."isMain" = TRUE
  AND c."playerId" = (SELECT id FROM "Player" WHERE "displayName" = v.player);

-- Alts — match by (player, class), isMain=FALSE.
UPDATE "Character" c SET name = v.newname
FROM (VALUES
  ('Elektro', 'Shaman', 'Elektrya'),
  ('Bugatti', 'Druid', 'Aeloris'),
  ('Massesto', 'Druid', 'Rxdruid'),
  ('Skryt', 'Druid', 'Skrytzo'),
  ('Zephleo', 'Druid', 'Leokitten'),
  ('Creek', 'Druid', 'Creeq'),
  ('Kalihiwai', 'Druid', 'Fishynethers'),
  ('Bored', 'Mage', 'Boredmage'),
  ('Cash', 'Hunter', 'Defcash'),
  ('Doge', 'Hunter', 'Dogehunter'),
  ('Glzy', 'Paladin', 'Lipstix'),   -- matches BOTH his Ret + Holy paladin alts
  ('Pizookies', 'Paladin', 'Zookiez'),
  ('Bugatti', 'Paladin', 'Aeternis'),
  ('Bake', 'Shaman', 'Bakeshaman'),
  ('Corr', 'Shaman', 'Côrr'),
  ('Gono', 'Shaman', 'Gonoe'),
  ('Rfx', 'Shaman', 'Rfxx'),
  ('Skryt', 'Shaman', 'Zynandcoffee'),
  ('Sleepyrat', 'Shaman', 'Thesleepyhit'),
  ('Daladed', 'Warlock', 'Daladots'),
  ('Koco', 'Warlock', 'Coko'),
  ('Massesto', 'Warlock', 'Yuppers'),
  ('Vspades', 'Warlock', 'Lyvh')
) AS v(player, class, newname)
WHERE c."isMain" = FALSE
  AND c.class = v.class
  AND c."playerId" = (SELECT id FROM "Player" WHERE "displayName" = v.player);

-- Verify, then COMMIT (or ROLLBACK; if anything is off).
SELECT p."displayName" AS player, c."isMain", c.class, c.spec, c.name
FROM "Character" c JOIN "Player" p ON p.id = c."playerId"
ORDER BY p."displayName", c."isMain" DESC, c.class;

COMMIT;

-- ════════════════════════════════════════════════════════════════════
-- OPTIONAL — move the "Yamz" Warlock from player Yamz → Lebearjames
-- ════════════════════════════════════════════════════════════════════
-- This is a PLAYER reassignment, NOT a rename (the toon keeps the name
-- "Yamz"). It re-parents the Warlock to the Lebearjames player and marks
-- it an alt (Lebearjames' Druid stays the main).
--
-- Loot impact: future loot for this toon must be logged under player
-- 'Lebearjames' (Warlock, Affliction) instead of 'Yamz'. Past awards
-- stay attached to the same character row (matched by id), so in the
-- Overview they'll re-attribute from Yamz to Lebearjames. The now-empty
-- 'Yamz' player row is LEFT in place (harmless) — delete it only if you
-- confirm it owns no other characters.
--
-- Run this block only after you've confirmed the above.
BEGIN;
UPDATE "Character"
   SET "playerId" = (SELECT id FROM "Player" WHERE "displayName" = 'Lebearjames'),
       "isMain"   = FALSE
 WHERE class = 'Warlock'
   AND "playerId" = (SELECT id FROM "Player" WHERE "displayName" = 'Yamz');

SELECT p."displayName" AS player, c."isMain", c.class, c.spec, c.name
FROM "Character" c JOIN "Player" p ON p.id = c."playerId"
WHERE p."displayName" IN ('Lebearjames', 'Yamz')
ORDER BY p."displayName", c."isMain" DESC;

COMMIT;
