-- WarcraftLogs (Fresh) parse cache + character identity for the API lookup.
ALTER TABLE "Character"
  ADD COLUMN "realm"            TEXT NOT NULL DEFAULT 'Nightslayer',
  ADD COLUMN "region"           TEXT NOT NULL DEFAULT 'US',
  ADD COLUMN "wclBestPerfAvg"   DOUBLE PRECISION,
  ADD COLUMN "wclMedianPerfAvg" DOUBLE PRECISION,
  ADD COLUMN "wclKillsLogged"   INTEGER,
  ADD COLUMN "wclData"          JSONB,
  ADD COLUMN "wclUpdatedAt"     TIMESTAMP(3);
