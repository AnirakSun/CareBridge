-- CreateTable
CREATE TABLE "StaffMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StaffMessage_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StaffMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StaffMessage_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "StaffMessage_organizationId_idx" ON "StaffMessage"("organizationId");

-- CreateIndex
CREATE INDEX "StaffMessage_senderId_recipientId_idx" ON "StaffMessage"("senderId", "recipientId");

-- CreateIndex
CREATE INDEX "StaffMessage_recipientId_senderId_idx" ON "StaffMessage"("recipientId", "senderId");
