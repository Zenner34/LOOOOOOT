-- Phase 1 of the Assignments feature: persist raid teams (up to 3 per
-- week is the expected scale) and their weekly assignment-sheet
-- snapshots. The sheet body is a flexible JSON blob — groups, buffs,
-- per-boss section assignments — so the schema doesn't need to migrate
-- every time the editor evolves.

CREATE TABLE "RaidTeam" (
  "id"        SERIAL       PRIMARY KEY,
  "name"      TEXT         NOT NULL,
  "color"     TEXT         NOT NULL DEFAULT '#1e3a5f',
  "active"    BOOLEAN      NOT NULL DEFAULT true,
  "notes"     TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "RaidTeam_name_key" ON "RaidTeam" ("name");

CREATE TABLE "AssignmentSheet" (
  "id"        SERIAL       PRIMARY KEY,
  "teamId"    INTEGER      NOT NULL,
  "weekOf"    TIMESTAMP(3) NOT NULL,
  "data"      JSONB        NOT NULL DEFAULT '{}'::jsonb,
  "notes"     TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AssignmentSheet_teamId_fkey"
    FOREIGN KEY ("teamId") REFERENCES "RaidTeam"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "AssignmentSheet_teamId_weekOf_key" ON "AssignmentSheet" ("teamId", "weekOf");
CREATE INDEX "AssignmentSheet_teamId_idx" ON "AssignmentSheet" ("teamId");
CREATE INDEX "AssignmentSheet_weekOf_idx" ON "AssignmentSheet" ("weekOf");
