-- Collapse AssignmentSheet to one persistent sheet per team (drop the
-- weekly key). Defensive dedupe keeps the most recently updated sheet for
-- each team; today every team already has exactly one sheet, so this is a
-- no-op on current data and no assignments are lost.

DELETE FROM "AssignmentSheet" a
USING "AssignmentSheet" b
WHERE a."teamId" = b."teamId"
  AND (a."updatedAt" < b."updatedAt"
       OR (a."updatedAt" = b."updatedAt" AND a."id" < b."id"));

-- Drop the old week-based indexes / unique constraint.
DROP INDEX "AssignmentSheet_teamId_weekOf_key";
DROP INDEX "AssignmentSheet_weekOf_idx";
DROP INDEX "AssignmentSheet_teamId_idx";

-- weekOf is now optional history, not a lookup key.
ALTER TABLE "AssignmentSheet" ALTER COLUMN "weekOf" DROP NOT NULL;

-- Enforce one sheet per team.
CREATE UNIQUE INDEX "AssignmentSheet_teamId_key" ON "AssignmentSheet"("teamId");
