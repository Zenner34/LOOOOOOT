-- CreateTable
CREATE TABLE "Phase" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "Phase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Raid" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "phaseId" INTEGER NOT NULL,

    CONSTRAINT "Raid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Boss" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "raidId" INTEGER NOT NULL,

    CONSTRAINT "Boss_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slot" TEXT,
    "itemLevel" INTEGER,
    "wowheadId" INTEGER,
    "notes" TEXT,
    "bossId" INTEGER NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemWeight" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "spec" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ItemWeight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Character" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "spec" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Roster" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Roster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RosterMember" (
    "id" SERIAL NOT NULL,
    "rosterId" INTEGER NOT NULL,
    "characterId" INTEGER NOT NULL,
    "memberRole" TEXT NOT NULL DEFAULT 'main',

    CONSTRAINT "RosterMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RaidNight" (
    "id" SERIAL NOT NULL,
    "rosterId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,

    CONSTRAINT "RaidNight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" SERIAL NOT NULL,
    "raidNightId" INTEGER NOT NULL,
    "characterId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LootAward" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "characterId" INTEGER NOT NULL,
    "rosterId" INTEGER NOT NULL,
    "raidNightId" INTEGER,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "LootAward_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Phase_order_key" ON "Phase"("order");

-- CreateIndex
CREATE UNIQUE INDEX "Raid_shortName_key" ON "Raid"("shortName");

-- CreateIndex
CREATE INDEX "Raid_phaseId_idx" ON "Raid"("phaseId");

-- CreateIndex
CREATE INDEX "Boss_raidId_idx" ON "Boss"("raidId");

-- CreateIndex
CREATE UNIQUE INDEX "Boss_raidId_name_key" ON "Boss"("raidId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Item_wowheadId_key" ON "Item"("wowheadId");

-- CreateIndex
CREATE INDEX "Item_bossId_idx" ON "Item"("bossId");

-- CreateIndex
CREATE INDEX "ItemWeight_itemId_idx" ON "ItemWeight"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "ItemWeight_itemId_spec_key" ON "ItemWeight"("itemId", "spec");

-- CreateIndex
CREATE UNIQUE INDEX "Character_name_key" ON "Character"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Roster_name_key" ON "Roster"("name");

-- CreateIndex
CREATE INDEX "RosterMember_rosterId_idx" ON "RosterMember"("rosterId");

-- CreateIndex
CREATE INDEX "RosterMember_characterId_idx" ON "RosterMember"("characterId");

-- CreateIndex
CREATE UNIQUE INDEX "RosterMember_rosterId_characterId_key" ON "RosterMember"("rosterId", "characterId");

-- CreateIndex
CREATE INDEX "RaidNight_rosterId_idx" ON "RaidNight"("rosterId");

-- CreateIndex
CREATE INDEX "Attendance_raidNightId_idx" ON "Attendance"("raidNightId");

-- CreateIndex
CREATE INDEX "Attendance_characterId_idx" ON "Attendance"("characterId");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_raidNightId_characterId_key" ON "Attendance"("raidNightId", "characterId");

-- CreateIndex
CREATE INDEX "LootAward_itemId_idx" ON "LootAward"("itemId");

-- CreateIndex
CREATE INDEX "LootAward_characterId_idx" ON "LootAward"("characterId");

-- CreateIndex
CREATE INDEX "LootAward_rosterId_idx" ON "LootAward"("rosterId");

-- CreateIndex
CREATE INDEX "LootAward_raidNightId_idx" ON "LootAward"("raidNightId");

-- AddForeignKey
ALTER TABLE "Raid" ADD CONSTRAINT "Raid_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "Phase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Boss" ADD CONSTRAINT "Boss_raidId_fkey" FOREIGN KEY ("raidId") REFERENCES "Raid"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_bossId_fkey" FOREIGN KEY ("bossId") REFERENCES "Boss"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemWeight" ADD CONSTRAINT "ItemWeight_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RosterMember" ADD CONSTRAINT "RosterMember_rosterId_fkey" FOREIGN KEY ("rosterId") REFERENCES "Roster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RosterMember" ADD CONSTRAINT "RosterMember_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RaidNight" ADD CONSTRAINT "RaidNight_rosterId_fkey" FOREIGN KEY ("rosterId") REFERENCES "Roster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_raidNightId_fkey" FOREIGN KEY ("raidNightId") REFERENCES "RaidNight"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LootAward" ADD CONSTRAINT "LootAward_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LootAward" ADD CONSTRAINT "LootAward_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LootAward" ADD CONSTRAINT "LootAward_rosterId_fkey" FOREIGN KEY ("rosterId") REFERENCES "Roster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LootAward" ADD CONSTRAINT "LootAward_raidNightId_fkey" FOREIGN KEY ("raidNightId") REFERENCES "RaidNight"("id") ON DELETE SET NULL ON UPDATE CASCADE;

