-- CreateTable
CREATE TABLE "PatientProviderMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "careProviderId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PatientProviderMessage_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PatientProviderMessage_careProviderId_fkey" FOREIGN KEY ("careProviderId") REFERENCES "CareProvider" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PatientProviderMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "PatientProviderMessage_patientId_careProviderId_idx" ON "PatientProviderMessage"("patientId", "careProviderId");

-- CreateIndex
CREATE INDEX "PatientProviderMessage_careProviderId_idx" ON "PatientProviderMessage"("careProviderId");
