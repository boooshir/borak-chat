/*
  Warnings:

  - You are about to drop the column `createdAt` on the `invitations` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `invitations` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `invitations` table. All the data in the column will be lost.
  - You are about to drop the column `roomId` on the `invitations` table. All the data in the column will be lost.
  - You are about to drop the column `usedAt` on the `invitations` table. All the data in the column will be lost.
  - You are about to drop the column `usedBy` on the `invitations` table. All the data in the column will be lost.
  - You are about to drop the column `isAdmin` on the `room_members` table. All the data in the column will be lost.
  - You are about to drop the column `publicId` on the `rooms` table. All the data in the column will be lost.
  - The primary key for the `user_room_status` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `lastReadMessageId` on the `user_room_status` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `user_room_status` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `user_room_status` table. All the data in the column will be lost.
  - Added the required column `created_by` to the `invitations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expires_at` to the `invitations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `room_id` to the `invitations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `used_by` to the `invitations` table without a default value. This is not possible if the table is not empty.
  - The required column `public_id` was added to the `rooms` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `last_read_message_id` to the `user_room_status` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `user_room_status` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `user_room_status` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_invitations" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "room_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "created_by" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" DATETIME NOT NULL,
    "used_by" INTEGER NOT NULL,
    "used_at" DATETIME,
    CONSTRAINT "invitations_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "invitations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "invitations_used_by_fkey" FOREIGN KEY ("used_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_invitations" ("id", "token") SELECT "id", "token" FROM "invitations";
DROP TABLE "invitations";
ALTER TABLE "new_invitations" RENAME TO "invitations";
CREATE TABLE "new_room_members" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "room_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "joined_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "room_members_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "room_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_room_members" ("id", "joined_at", "room_id", "user_id") SELECT "id", "joined_at", "room_id", "user_id" FROM "room_members";
DROP TABLE "room_members";
ALTER TABLE "new_room_members" RENAME TO "room_members";
CREATE TABLE "new_rooms" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "public_id" TEXT NOT NULL,
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
CREATE UNIQUE INDEX "rooms_public_id_key" ON "rooms"("public_id");
CREATE TABLE "new_user_room_status" (
    "user_id" INTEGER NOT NULL,
    "room_id" INTEGER NOT NULL,
    "last_read_message_id" INTEGER NOT NULL,
    "updated_at" DATETIME NOT NULL,

    PRIMARY KEY ("user_id", "room_id"),
    CONSTRAINT "user_room_status_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "user_room_status_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "user_room_status_last_read_message_id_fkey" FOREIGN KEY ("last_read_message_id") REFERENCES "room_messages" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_user_room_status" ("room_id") SELECT "room_id" FROM "user_room_status";
DROP TABLE "user_room_status";
ALTER TABLE "new_user_room_status" RENAME TO "user_room_status";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
