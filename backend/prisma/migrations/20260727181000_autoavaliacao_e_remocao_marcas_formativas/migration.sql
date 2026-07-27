/*
  Warnings:

  - You are about to drop the column `marcasFormativas` on the `Submissao` table. All the data in the column will be lost.
  - Added the required column `autoavaliacao` to the `Submissao` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Submissao" DROP COLUMN "marcasFormativas",
ADD COLUMN     "autoavaliacao" JSONB NOT NULL;
