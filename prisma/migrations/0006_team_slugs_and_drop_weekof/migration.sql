-- Add URL slugs to raid teams and drop the now-unused weekOf column.

-- 1) Slug column, backfilled from the (unique) team name:
--    "Tuesday" -> "tuesday", "Sunday Main" -> "sunday-main".
ALTER TABLE "RaidTeam" ADD COLUMN "slug" TEXT;

UPDATE "RaidTeam"
SET "slug" = trim(both '-' from lower(regexp_replace(trim("name"), '[^a-zA-Z0-9]+', '-', 'g')));

-- Guard against any row that slugified to empty (e.g. name was all symbols).
UPDATE "RaidTeam" SET "slug" = 'team-' || "id" WHERE "slug" IS NULL OR "slug" = '';

-- Disambiguate any collisions deterministically by id.
UPDATE "RaidTeam" t
SET "slug" = t."slug" || '-' || t."id"
WHERE EXISTS (
  SELECT 1 FROM "RaidTeam" o
  WHERE o."slug" = t."slug" AND o."id" < t."id"
);

ALTER TABLE "RaidTeam" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "RaidTeam_slug_key" ON "RaidTeam"("slug");

-- 2) Drop the legacy weekly key — one sheet per team now.
ALTER TABLE "AssignmentSheet" DROP COLUMN "weekOf";
