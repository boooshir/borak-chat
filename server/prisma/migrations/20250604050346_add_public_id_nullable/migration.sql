/*
  Warnings:

  - A unique constraint covering the columns `[public_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN "public_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_public_id_key" ON "users"("public_id");
