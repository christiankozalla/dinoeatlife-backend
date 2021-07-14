import { prisma } from "./prismaClient";
import bcrypt from "bcryptjs";


const seedData = [
  {
    email: "christian@christian.de",
    password: "christiansNicePassword",
    home: {
      create: { name: "Koala-Bude" }
    }
  },
  {
    email: "bingo@lino.de",
    password: "bingosNicePassword",
    home: {
      create: { name: "BingoBingo" }
    }
  },
  {
    email: "lalala@lo.de",
    password: "lalalasNicePassword",
    home: {
      create: { name: "Alalalalalong" }
    }
  }
];

const ingredients = [
  {
    name: "Milch",
    unit: "1L"
  },
  {
    name: "Butter",
    unit: "250g"
  },
  {
    name: "Schweine-Ohren",
    unit: "2"
  },
  {
    name: "Tralala",
    unit: "200g"
  },
  {
    name: "Hakuna",
    unit: "400kg"
  },
  {
    name: "Matata",
    unit: "11t"
  }
];

const recipes = [
  {
    name: "Erdbeer-Torte",
    duration: 200,
    description: "Make the cake"
  }
];

//Add second user to home
const secondUser = {
  email: "stephie@stephie.de",
  password: "stephiesNicePassword"
};

const userProfiles = [
  {
    name: "Christian",
    city: "Dresden",
    bio: "My live is a blast.....",
    social: {
      twitter: "@CKozalla",
      github: "christiankozalla",
      website: "chrisko.io"
    }
  },
  {
    name: "Dirk",
    city: "Dortmund",
    bio: "Haaaaaleeelujaaaah",
    social: {
      twitter: "@dirkydirk",
      github: "rollo"
    }
  },
  {
    name: "Stephanie",
    city: "Dresden",
    bio: "Yipppie",
    social: {
      twitter: "@stephieswerk",
      website: "www.stephieswerk.de"
    }
  }
];

async function main() {
  console.log(`Start seeding ...`);
  for (let i = 0; i < seedData.length; i++) {
    seedData[i].password = await bcrypt.hash(seedData[i].password, 10);
    const user = await prisma.user.create({
      data: seedData[i]
    });

    await prisma.profile.create({
      data: {
        ...userProfiles[i],
        user: {
          connect: { email: seedData[i].email }
        }
      }
    });
    console.log(`Created user with id: ${user.id}`);
  }

  secondUser.password = await bcrypt.hash(secondUser.password, 10);

  await prisma.user.create({
    data: {
      ...secondUser,
      homeId: 1
    }
  });
  console.log(`Seeding finished.`);
}

// async function main() {
//   console.log(`Start seeding ...`);

//   const user = await prisma.user.findUnique({
//     where: {
//       email: "christian@christian.de"
//     }
//   });

//   console.log(user);

//   await prisma.recipe.create({
//     data: {
//       name: "New Recipe",
//       duration: 1000,
//       description: "A new recipe created by christian",
//       user: {
//         connect: {
//           id: user.id
//         }
//       },
//       home: {
//         connect: {
//           id: user.homeId
//         }
//       }
//     }
//   });

//   console.log(`Seeding finished.`);
// }

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
