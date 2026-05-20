/*
  Warnings:

  - The required column `publicId` was added to the `rooms` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_rooms" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "publicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "creator_id" INTEGER NOT NULL,
    "is_private" BOOLEAN NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "rooms_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_rooms" ("created_at", "creator_id", "id", "is_private", "name", "updated_at") SELECT "created_at", "creator_id", "id", "is_private", "name", "updated_at" FROM "rooms";
DROP TABLE "rooms";
ALTER TABLE "new_rooms" RENAME TO "rooms";
CREATE UNIQUE INDEX "rooms_publicId_key" ON "rooms"("publicId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
