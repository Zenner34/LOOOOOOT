-- Standalone per-phase assignment sheet fed by the Raid-Helper Discord
-- bot's composition export (Black Temple / Mount Hyjal). One row per
-- phase slug; the entire sheet — imported members, groups, buffs, boss
-- sections — lives in the JSON blob so the editor can evolve without
-- schema migrations.

CREATE TABLE "PhaseSheet" (
  "id"        SERIAL       PRIMARY KEY,
  "slug"      TEXT         NOT NULL,
  "data"      JSONB        NOT NULL DEFAULT '{}'::jsonb,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE UNIQUE INDEX "PhaseSheet_slug_key" ON "PhaseSheet" ("slug");
