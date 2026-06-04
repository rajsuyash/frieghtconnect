-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('shipper', 'forwarder', 'admin');

-- CreateEnum
CREATE TYPE "ForwarderStatus" AS ENUM ('draft', 'pending', 'approved', 'rejected', 'suspended');

-- CreateEnum
CREATE TYPE "InquiryStatus" AS ENUM ('sent', 'queued', 'failed');

-- CreateEnum
CREATE TYPE "KycType" AS ENUM ('business_registration', 'trade_license', 'certificate', 'other');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'shipper',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForwarderProfile" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "primaryCountry" TEXT NOT NULL,
    "yearEstablished" INTEGER,
    "websiteUrl" TEXT,
    "about" TEXT,
    "logoUrl" TEXT,
    "status" "ForwarderStatus" NOT NULL DEFAULT 'draft',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "modes" TEXT[],
    "services" TEXT[],
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ForwarderProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CountryCoverage" (
    "id" TEXT NOT NULL,
    "forwarderId" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT,
    "isHeadquarters" BOOLEAN NOT NULL DEFAULT false,
    "ports" TEXT[],

    CONSTRAINT "CountryCoverage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TradeLane" (
    "id" TEXT NOT NULL,
    "forwarderId" TEXT NOT NULL,
    "originCountry" TEXT NOT NULL,
    "destinationCountry" TEXT NOT NULL,

    CONSTRAINT "TradeLane_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KycDocument" (
    "id" TEXT NOT NULL,
    "forwarderId" TEXT NOT NULL,
    "type" "KycType" NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KycDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inquiry" (
    "id" TEXT NOT NULL,
    "forwarderId" TEXT NOT NULL,
    "shipperName" TEXT NOT NULL,
    "shipperEmail" TEXT NOT NULL,
    "shipperCompany" TEXT,
    "originCountry" TEXT,
    "originPort" TEXT,
    "destinationCountry" TEXT,
    "destinationPort" TEXT,
    "mode" TEXT,
    "cargoType" TEXT,
    "message" TEXT NOT NULL,
    "status" "InquiryStatus" NOT NULL DEFAULT 'queued',
    "idempotencyKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Inquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Country" (
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "Port" (
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,

    CONSTRAINT "Port_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "Mode" (
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "Mode_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "Service" (
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("code")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ForwarderProfile_ownerUserId_key" ON "ForwarderProfile"("ownerUserId");

-- CreateIndex
CREATE UNIQUE INDEX "ForwarderProfile_slug_key" ON "ForwarderProfile"("slug");

-- CreateIndex
CREATE INDEX "ForwarderProfile_status_idx" ON "ForwarderProfile"("status");

-- CreateIndex
CREATE INDEX "ForwarderProfile_primaryCountry_idx" ON "ForwarderProfile"("primaryCountry");

-- CreateIndex
CREATE INDEX "ForwarderProfile_modes_idx" ON "ForwarderProfile" USING GIN ("modes");

-- CreateIndex
CREATE INDEX "ForwarderProfile_services_idx" ON "ForwarderProfile" USING GIN ("services");

-- CreateIndex
CREATE INDEX "CountryCoverage_forwarderId_idx" ON "CountryCoverage"("forwarderId");

-- CreateIndex
CREATE INDEX "CountryCoverage_country_idx" ON "CountryCoverage"("country");

-- CreateIndex
CREATE INDEX "TradeLane_forwarderId_idx" ON "TradeLane"("forwarderId");

-- CreateIndex
CREATE INDEX "TradeLane_originCountry_destinationCountry_idx" ON "TradeLane"("originCountry", "destinationCountry");

-- CreateIndex
CREATE INDEX "KycDocument_forwarderId_idx" ON "KycDocument"("forwarderId");

-- CreateIndex
CREATE UNIQUE INDEX "Inquiry_idempotencyKey_key" ON "Inquiry"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Inquiry_forwarderId_idx" ON "Inquiry"("forwarderId");

-- CreateIndex
CREATE INDEX "Inquiry_shipperEmail_createdAt_idx" ON "Inquiry"("shipperEmail", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_targetType_targetId_idx" ON "AuditLog"("targetType", "targetId");

-- AddForeignKey
ALTER TABLE "ForwarderProfile" ADD CONSTRAINT "ForwarderProfile_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForwarderProfile" ADD CONSTRAINT "ForwarderProfile_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CountryCoverage" ADD CONSTRAINT "CountryCoverage_forwarderId_fkey" FOREIGN KEY ("forwarderId") REFERENCES "ForwarderProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeLane" ADD CONSTRAINT "TradeLane_forwarderId_fkey" FOREIGN KEY ("forwarderId") REFERENCES "ForwarderProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KycDocument" ADD CONSTRAINT "KycDocument_forwarderId_fkey" FOREIGN KEY ("forwarderId") REFERENCES "ForwarderProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inquiry" ADD CONSTRAINT "Inquiry_forwarderId_fkey" FOREIGN KEY ("forwarderId") REFERENCES "ForwarderProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

