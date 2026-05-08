-- CreateTable
CREATE TABLE "Player" (
    "id" SERIAL NOT NULL,
    "displayName" TEXT NOT NULL,
    "discordHandle" TEXT,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_displayName_key" ON "Player"("displayName");

-- AlterTable
ALTER TABLE "Character" ADD COLUMN "playerId" INTEGER;
ALTER TABLE "Character" ADD COLUMN "isMain" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Character_playerId_idx" ON "Character"("playerId");

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;
