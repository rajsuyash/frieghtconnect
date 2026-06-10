-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "forwarderId" TEXT NOT NULL,
    "inquiryId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "status" "ReviewStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Review_inquiryId_key" ON "Review"("inquiryId");

-- CreateIndex
CREATE INDEX "Review_forwarderId_status_idx" ON "Review"("forwarderId", "status");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_forwarderId_fkey" FOREIGN KEY ("forwarderId") REFERENCES "ForwarderProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "Inquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
