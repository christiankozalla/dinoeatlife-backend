const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  const userId = 3; // From verfied access_token
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    }
  });

  console.log(user);

  const userIds = await prisma.household.findUnique({
    where: {
      id: user.householdId
    },
    select: {
      users: {
        select: {
          id: true
        }
      }
    }
  });

  console.log(userIds);

  // await prisma.recipe.create({
  //   data: {
  //     name: "New Recipe",
  //     duration: 1000,
  //     description: "A new recipe created by christian",
  //     user: {
  //       connect: {
  //         id: user.id
  //       }
  //     },
  //     household: {
  //       connect: {
  //         id: user.householdId
  //       }
  //     }
  //   }
  // });

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
