-- AlterTable
ALTER TABLE "Person" ADD COLUMN "email" TEXT;

-- CreateIndex
CREATE INDEX "Person_email_idx" ON "Person"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Person_groupId_email_key" ON "Person"("groupId", "email");