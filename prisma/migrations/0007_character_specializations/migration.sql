-- Profession specializations (Master Hammersmith / Swordsmith / Axesmith,
-- etc.) chosen in-game per character. Powers the "Can craft" list on the
-- Professions tab for items that have no dropped pattern (e.g. the
-- Blacksmithing weapons crafted from Nether Vortex).

ALTER TABLE "Character"
  ADD COLUMN "craftedSpecializations" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
