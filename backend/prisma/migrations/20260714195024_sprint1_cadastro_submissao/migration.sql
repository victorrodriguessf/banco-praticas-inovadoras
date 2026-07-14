/*
  Warnings:

  - You are about to drop the column `instrutor` on the `Submissao` table. All the data in the column will be lost.
  - You are about to drop the column `segmento` on the `Submissao` table. All the data in the column will be lost.
  - You are about to drop the column `unidade` on the `Submissao` table. All the data in the column will be lost.
  - Added the required column `categoria` to the `Submissao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuarioId` to the `Submissao` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Submissao" DROP COLUMN "instrutor",
DROP COLUMN "segmento",
DROP COLUMN "unidade",
ADD COLUMN     "anexos" TEXT[],
ADD COLUMN     "autores" TEXT[],
ADD COLUMN     "categoria" TEXT NOT NULL,
ADD COLUMN     "cursos" TEXT[],
ADD COLUMN     "segmentos" TEXT[],
ADD COLUMN     "termosAceitos" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "unidades" TEXT[],
ADD COLUMN     "usuarioId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "codigoExpiraEm" TIMESTAMP(3),
ADD COLUMN     "codigoVerificacao" TEXT,
ADD COLUMN     "verificado" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "Submissao" ADD CONSTRAINT "Submissao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
