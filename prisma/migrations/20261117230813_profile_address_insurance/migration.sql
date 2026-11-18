-- AlterTable
ALTER TABLE "User" ADD COLUMN "addressLine2" TEXT;
ALTER TABLE "User" ADD COLUMN "city" TEXT;
ALTER TABLE "User" ADD COLUMN "state" TEXT;
ALTER TABLE "User" ADD COLUMN "streetAddress" TEXT;
ALTER TABLE "User" ADD COLUMN "zipCode" TEXT;

-- CreateTable
CREATE TABLE "UserInsurance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "providerName" TEXT NOT NULL,
    "planName" TEXT,
    "memberId" TEXT,
    "groupNumber" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserInsurance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "UserInsurance_userId_idx" ON "UserInsurance"("userId");
