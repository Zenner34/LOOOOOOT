-- Merge Glzy's duplicate paladin: fold the Holy Lipstix into the Ret
-- Lipstix, keep ONE paladin (Retribution).
--
-- Both rows were renamed to 'Lipstix'; they differ only by spec
-- (Retribution Paladin = keep, Holy Paladin = remove). All loot from the
-- Holy dup is repointed to the Ret paladin BEFORE deletion (LootAward
-- cascade-deletes with its character, so order matters). Attendance and
-- RosterMember rows are de-duplicated to respect their unique
-- constraints. The whole thing is atomic — it raises (and rolls back) if
-- both paladins aren't found.
--
-- NOTE: if the Holy character id happens to sit in an assignment-sheet's
-- groups/assignments JSON, it'll just stop rendering after the merge and
-- gets cleaned the next time that team's Group Setup is edited (the
-- prune-to-roster step). No loot/attendance is affected by that.

-- ════════════════════════════════════════════════════════════════════
-- PRE-CHECK (read-only) — see both paladins and their award counts.
-- Expect exactly two rows (Holy + Retribution).
-- ════════════════════════════════════════════════════════════════════
SELECT c.id, c.name, c.spec, c."isMain",
       (SELECT count(*) FROM "LootAward" la WHERE la."characterId" = c.id) AS awards
FROM "Character" c JOIN "Player" p ON c."playerId" = p.id
WHERE p."displayName" = 'Glzy' AND c.class = 'Paladin'
ORDER BY c.spec;

-- ════════════════════════════════════════════════════════════════════
-- APPLY
-- ════════════════════════════════════════════════════════════════════
BEGIN;
DO $$
DECLARE
  ret_id  int;
  holy_id int;
BEGIN
  SELECT c.id INTO ret_id
    FROM "Character" c JOIN "Player" p ON c."playerId" = p.id
   WHERE p."displayName" = 'Glzy' AND c.class = 'Paladin' AND c.spec = 'Retribution Paladin'
   LIMIT 1;
  SELECT c.id INTO holy_id
    FROM "Character" c JOIN "Player" p ON c."playerId" = p.id
   WHERE p."displayName" = 'Glzy' AND c.class = 'Paladin' AND c.spec = 'Holy Paladin'
   LIMIT 1;

  IF ret_id IS NULL OR holy_id IS NULL THEN
    RAISE EXCEPTION 'Aborting — could not find both Glzy paladins (ret=%, holy=%)', ret_id, holy_id;
  END IF;

  -- 1. Move all loot from the Holy dup onto the Ret paladin.
  UPDATE "LootAward" SET "characterId" = ret_id WHERE "characterId" = holy_id;

  -- 2. Move non-colliding attendance; drop the rest (unique raidNight+char).
  UPDATE "Attendance" a SET "characterId" = ret_id
   WHERE a."characterId" = holy_id
     AND NOT EXISTS (
       SELECT 1 FROM "Attendance" a2
        WHERE a2."raidNightId" = a."raidNightId" AND a2."characterId" = ret_id);
  DELETE FROM "Attendance" WHERE "characterId" = holy_id;

  -- 3. Drop the dup's roster membership (Ret is already a member).
  DELETE FROM "RosterMember" WHERE "characterId" = holy_id;

  -- 4. Delete the Holy duplicate.
  DELETE FROM "Character" WHERE id = holy_id;

  RAISE NOTICE 'Merged Glzy Holy paladin (id %) into Ret paladin (id %).', holy_id, ret_id;
END $$;

-- Post-check: Glzy should now have exactly one paladin (Retribution).
SELECT c.id, c.name, c.spec,
       (SELECT count(*) FROM "LootAward" la WHERE la."characterId" = c.id) AS awards
FROM "Character" c JOIN "Player" p ON c."playerId" = p.id
WHERE p."displayName" = 'Glzy' AND c.class = 'Paladin';

COMMIT;
