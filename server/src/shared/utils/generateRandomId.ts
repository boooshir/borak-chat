import { prisma } from "../../infrastructure/db/db";

export const generatePublicId = async () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const length = 10;
  let publicId;
  let isUnique = false;

  while (!isUnique) {
    publicId = "";
    for (let i = 0; i < length; i++) {
      publicId += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }

    // Check for uniqueness
    const existing = await prisma.user.findUnique({
      where: { public_id: publicId },
    });
    if (!existing) isUnique = true;
  }
  return publicId;
};
