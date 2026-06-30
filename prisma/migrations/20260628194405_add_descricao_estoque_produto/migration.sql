/*
  Warnings:

  - Added the required column `descricao` to the `Produto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `estoque` to the `Produto` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Produto" ADD COLUMN     "descricao" TEXT NOT NULL,
ADD COLUMN     "estoque" INTEGER NOT NULL;
