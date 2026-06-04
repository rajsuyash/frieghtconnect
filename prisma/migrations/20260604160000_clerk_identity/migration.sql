-- AlterTable
ALTER TABLE "User" ADD COLUMN     "clerkId" TEXT,
ALTER COLUMN "passwordHash" DROP NOT NULL;

-- DropTable
DROP TABLE "VerificationToken";

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

