/*
  Warnings:

  - Added the required column `updatedAt` to the `Entry` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Entry_goalId_date_key";

-- AlterTable
ALTER TABLE "Entry" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "EntryEdit" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "previousNote" TEXT,
    "previousWeight" INTEGER,
    "newNote" TEXT,
    "newWeight" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EntryEdit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EntryEdit_entryId_idx" ON "EntryEdit"("entryId");

-- AddForeignKey
ALTER TABLE "EntryEdit" ADD CONSTRAINT "EntryEdit_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "Entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
