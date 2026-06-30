/*
  Warnings:

  - The values [PRONTO,ENTREGUE] on the enum `StatusPedido` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `descricao` on the `Produto` table. All the data in the column will be lost.
  - You are about to drop the column `estoque` on the `Produto` table. All the data in the column will be lost.
  - Changed the type of `canalPedido` on the `Pedido` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TipoFidelidade" AS ENUM ('ACUMULO', 'RESGATE');

-- AlterEnum
BEGIN;
CREATE TYPE "StatusPedido_new" AS ENUM ('AGUARDANDO_PAGAMENTO', 'PAGO', 'CANCELADO');
ALTER TABLE "Pedido" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Pedido" ALTER COLUMN "status" TYPE "StatusPedido_new" USING ("status"::text::"StatusPedido_new");
ALTER TYPE "StatusPedido" RENAME TO "StatusPedido_old";
ALTER TYPE "StatusPedido_new" RENAME TO "StatusPedido";
DROP TYPE "StatusPedido_old";
ALTER TABLE "Pedido" ALTER COLUMN "status" SET DEFAULT 'AGUARDANDO_PAGAMENTO';
COMMIT;

-- AlterTable
ALTER TABLE "Pedido" DROP COLUMN "canalPedido",
ADD COLUMN     "canalPedido" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Produto" DROP COLUMN "descricao",
DROP COLUMN "estoque";

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "consentimentoFidelidade" BOOLEAN NOT NULL DEFAULT false;

-- DropEnum
DROP TYPE "CanalPedido";

-- CreateTable
CREATE TABLE "Fidelidade" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "pontos" INTEGER NOT NULL,
    "tipo" "TipoFidelidade" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Fidelidade_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Fidelidade" ADD CONSTRAINT "Fidelidade_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
