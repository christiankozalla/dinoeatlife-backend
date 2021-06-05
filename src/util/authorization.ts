import { Home, User, PrismaClient } from "@prisma/client";

export const userIsAuthorized = async (
  homeId: Home["id"],
  userId: User["id"],
  prisma: PrismaClient
): Promise<boolean> => {
  const allUserIds = await prisma.home.findUnique({
    where: {
      id: homeId
    },
    select: {
      users: {
        select: {
          id: true
        }
      }
    }
  });

  if (allUserIds && allUserIds.users.some((data) => data.id === userId)) {
    return true;
  } else {
    return false;
  }
};
