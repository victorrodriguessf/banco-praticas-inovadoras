-- CreateEnum
CREATE TYPE "Role" AS ENUM ('DOCENTE', 'ADMIN', 'REVISOR');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'DOCENTE',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Edital" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Edital_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submissao" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "editalId" TEXT NOT NULL,
    "instrutor" TEXT NOT NULL,
    "segmento" TEXT NOT NULL,
    "unidade" TEXT,
    "descricao" TEXT NOT NULL,
    "ods" INTEGER[],
    "marcasFormativas" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'recebida',
    "criadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Submissao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- AddForeignKey
ALTER TABLE "Submissao" ADD CONSTRAINT "Submissao_editalId_fkey" FOREIGN KEY ("editalId") REFERENCES "Edital"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
