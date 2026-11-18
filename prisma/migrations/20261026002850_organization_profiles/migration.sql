-- AlterTable
ALTER TABLE "Organization" ADD COLUMN "accreditations" TEXT;
ALTER TABLE "Organization" ADD COLUMN "hoursOverview" TEXT;
ALTER TABLE "Organization" ADD COLUMN "patientPopulation" TEXT;
ALTER TABLE "Organization" ADD COLUMN "phone" TEXT;
ALTER TABLE "Organization" ADD COLUMN "streetAddress" TEXT;
ALTER TABLE "Organization" ADD COLUMN "website" TEXT;
ALTER TABLE "Organization" ADD COLUMN "zipCode" TEXT;

-- CreateTable
CREATE TABLE "OrganizationFacility" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "phone" TEXT,
    "description" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "OrganizationFacility_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrganizationSpecialty" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "OrganizationSpecialty_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CareProvider" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "credentials" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "isPrimaryCare" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "CareProvider_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
