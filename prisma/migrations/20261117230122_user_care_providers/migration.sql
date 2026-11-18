-- CreateTable
CREATE TABLE "UserCareProvider" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "careProviderId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserCareProvider_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserCareProvider_careProviderId_fkey" FOREIGN KEY ("careProviderId") REFERENCES "CareProvider" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "UserCareProvider_userId_idx" ON "UserCareProvider"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserCareProvider_userId_careProviderId_key" ON "UserCareProvider"("userId", "careProviderId");
