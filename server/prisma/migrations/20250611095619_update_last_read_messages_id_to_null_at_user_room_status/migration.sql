-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_user_room_status" (
    "user_id" INTEGER NOT NULL,
    "room_id" INTEGER NOT NULL,
    "last_read_message_id" INTEGER,
    "updated_at" DATETIME NOT NULL,

    PRIMARY KEY ("user_id", "room_id"),
    CONSTRAINT "user_room_status_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "user_room_status_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "user_room_status_last_read_message_id_fkey" FOREIGN KEY ("last_read_message_id") REFERENCES "room_messages" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_user_room_status" ("last_read_message_id", "room_id", "updated_at", "user_id") SELECT "last_read_message_id", "room_id", "updated_at", "user_id" FROM "user_room_status";
DROP TABLE "user_room_status";
ALTER TABLE "new_user_room_status" RENAME TO "user_room_status";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
