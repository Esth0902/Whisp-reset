/*
  Warnings:

  - A unique constraint covering the columns `[friendId]` on the table `Friendship` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Friendship_friendId_key" ON "Friendship"("friendId");
