/*
  Warnings:

  - Added the required column `token` to the `friendships` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_friendships" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "token" TEXT NOT NULL,
    "requester_id" INTEGER NOT NULL,
    "requestee_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "friendships_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "friendships_requestee_id_fkey" FOREIGN KEY ("requestee_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_friendships" ("created_at", "id", "requestee_id", "requester_id", "status", "updated_at") SELECT "created_at", "id", "requestee_id", "requester_id", "status", "updated_at" FROM "friendships";
DROP TABLE "friendships";
ALTER TABLE "new_friendships" RENAME TO "friendships";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
