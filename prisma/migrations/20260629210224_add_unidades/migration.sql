-- AlterTable
ALTER TABLE "Pedido" ADD COLUMN     "unidadeId" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Produto" ADD COLUMN     "unidadeId" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Usuario" ALTER COLUMN "consentimentoFidelidade" SET DEFAULT true;

-- CreateTable
CREATE TABLE "Unidade" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,

    CONSTRAINT "Unidade_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "Unidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Produto" ADD CONSTRAINT "Produto_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "Unidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
