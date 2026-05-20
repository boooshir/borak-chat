/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `friendships` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "friendships_token_key" ON "friendships"("token");
