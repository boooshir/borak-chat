/*
  Warnings:

  - You are about to drop the `group_messaged` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "group_messaged";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "room_messages" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "room_id" INTEGER NOT NULL,
    "sender_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "room_messages_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "room_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_user_room_status" (
    "userId" INTEGER NOT NULL,
    "room_id" INTEGER NOT NULL,
    "lastReadMessageId" INTEGER NOT NULL,
    "updatedAt" DATETIME NOT NULL,

    PRIMARY KEY ("userId", "room_id"),
    CONSTRAINT "user_room_status_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "user_room_status_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "user_room_status_lastReadMessageId_fkey" FOREIGN KEY ("lastReadMessageId") REFERENCES "room_messages" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_user_room_status" ("lastReadMessageId", "room_id", "updatedAt", "userId") SELECT "lastReadMessageId", "room_id", "updatedAt", "userId" FROM "user_room_status";
DROP TABLE "user_room_status";
ALTER TABLE "new_user_room_status" RENAME TO "user_room_status";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
