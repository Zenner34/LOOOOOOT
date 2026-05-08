-- Drop the unique constraint on Character.name. We allow multiple characters
-- with the same name because in this app a Character is "a player's spec
-- slot" rather than a server-unique WoW toon: a single human (Player) often
-- has several characters whose displayed name == the player's name.
DROP INDEX "Character_name_key";
