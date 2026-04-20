-- CreateTable
CREATE TABLE "Phase" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Raid" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "phaseId" INTEGER NOT NULL,
    CONSTRAINT "Raid_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "Phase" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Boss" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "raidId" INTEGER NOT NULL,
    CONSTRAINT "Boss_raidId_fkey" FOREIGN KEY ("raidId") REFERENCES "Raid" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Item" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slot" TEXT,
    "itemLevel" INTEGER,
    "wowheadId" INTEGER,
    "notes" TEXT,
    "bossId" INTEGER NOT NULL,
    CONSTRAINT "Item_bossId_fkey" FOREIGN KEY ("bossId") REFERENCES "Boss" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ItemWeight" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "itemId" INTEGER NOT NULL,
    "spec" TEXT NOT NULL,
    "weight" REAL NOT NULL,
    CONSTRAINT "ItemWeight_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Character" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "spec" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Roster" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "RosterMember" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rosterId" INTEGER NOT NULL,
    "characterId" INTEGER NOT NULL,
    "memberRole" TEXT NOT NULL DEFAULT 'main',
    CONSTRAINT "RosterMember_rosterId_fkey" FOREIGN KEY ("rosterId") REFERENCES "Roster" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RosterMember_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RaidNight" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rosterId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "notes" TEXT,
    CONSTRAINT "RaidNight_rosterId_fkey" FOREIGN KEY ("rosterId") REFERENCES "Roster" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "raidNightId" INTEGER NOT NULL,
    "characterId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    CONSTRAINT "Attendance_raidNightId_fkey" FOREIGN KEY ("raidNightId") REFERENCES "RaidNight" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Attendance_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LootAward" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "itemId" INTEGER NOT NULL,
    "characterId" INTEGER NOT NULL,
    "rosterId" INTEGER NOT NULL,
    "raidNightId" INTEGER,
    "awardedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    CONSTRAINT "LootAward_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LootAward_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LootAward_rosterId_fkey" FOREIGN KEY ("rosterId") REFERENCES "Roster" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LootAward_raidNightId_fkey" FOREIGN KEY ("raidNightId") REFERENCES "RaidNight" ("id") ON DELETE SET NULL ON UPDATE CASCADE
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
