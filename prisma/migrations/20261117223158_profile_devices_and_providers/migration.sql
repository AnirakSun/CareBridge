-- AlterTable
ALTER TABLE "CareProvider" ADD COLUMN "department" TEXT;
ALTER TABLE "CareProvider" ADD COLUMN "email" TEXT;
ALTER TABLE "CareProvider" ADD COLUMN "phone" TEXT;

-- AlterTable
ALTER TABLE "Submission" ADD COLUMN "deviceContext" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "phone" TEXT;

-- CreateTable
CREATE TABLE "ConnectedHealthDevice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "deviceType" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "connectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSyncAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ConnectedHealthDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ConnectedHealthDevice_userId_idx" ON "ConnectedHealthDevice"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ConnectedHealthDevice_userId_deviceType_key" ON "ConnectedHealthDevice"("userId", "deviceType");
