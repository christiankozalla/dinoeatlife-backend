const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

// const seedData = [
//   {
//     email: "christian@christian.de",
//     password: "christiansNicePassword",
//     household: {
//       create: { name: "Koala-Bude" }
//     }
//   },
//   {
//     email: "bingo@lino.de",
//     password: "bingosNicePassword",
//     household: {
//       create: { name: "BingoBingo" }
//     }
//   },
//   {
//     email: "lalala@lo.de",
//     password: "lalalasNicePassword",
//     household: {
//       create: { name: "Alalalalalong" }
//     }
//   }
// ];

// //Add second user to household
// const secondUser = {
//   email: "stephie@stephie.de",
//   password: "stephiesNicePassword"
// };

// const userProfiles = [
//   {
//     name: "Christian",
//     city: "Dresden",
//     bio: "My live is a blast.....",
//     social: {
//       twitter: "@CKozalla",
//       github: "christiankozalla",
//       website: "chrisko.io"
//     }
//   },
//   {
//     name: "Dirk",
//     city: "Dortmund",
//     bio: "Haaaaaleeelujaaaah",
//     social: {
//       twitter: "@dirkydirk",
//       github: "rollo"
//     }
//   },
//   {
//     name: "Stephanie",
//     city: "Dresden",
//     bio: "Yipppie",
//     social: {
//       twitter: "@stephieswerk",
//       website: "www.stephieswerk.de"
//     }
//   }
// ];

// async function main() {
//   console.log(`Start seeding ...`);
//   for (let i = 0; i < seedData.length; i++) {
//     seedData[i].password = await bcrypt.hash(seedData[i].password, 10);
//     const user = await prisma.user.create({
//       data: seedData[i]
//     });

//     await prisma.profile.create({
//       data: {
//         ...userProfiles[i],
//         user: {
//           connect: { email: seedData[i].email }
//         }
//       }
//     });
//     console.log(`Created user with id: ${user.id}`);
//   }

//   secondUser.password = await bcrypt.hash(secondUser.password, 10);

//   await prisma.user.create({
//     data: {
//       ...secondUser,
//       householdId: 1,
//     },
//   });
//   console.log(`Seeding finished.`);
// }

async function main() {
  console.log(`Start seeding ...`);

  const user = await prisma.user.findUnique({
    where: {
      email: "christian@christian.de"
    }
  });

  console.log(user);

  await prisma.recipe.create({
    data: {
      name: "New Recipe",
      duration: 1000,
      description: "A new recipe created by christian",
      user: {
        connect: {
          id: user.id
        }
      },
      household: {
        connect: {
          id: user.householdId
        }
      }
    }
  });

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
