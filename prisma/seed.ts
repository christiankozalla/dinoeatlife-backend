const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

// const seedData = [
//   {
//     name: "Christian",
//     email: "christian@christian.de",
//     password: "christiansNicePassword",
//     household: {
//       create: { name: "Koala-Bude" },
//     },
//   },
//   {
//     name: "Bingo",
//     email: "bingo@lino.de",
//     password: "bingosNicePassword",
//     household: {
//       create: { name: "BingoBingo" },
//     },
//   },
//   {
//     name: "Lalala",
//     email: "lalala@lo.de",
//     password: "lalalasNicePassword",
//     household: {
//       create: { name: "Alalalalalong" },
//     },
//   },
// ];

// Add second user to household
// const secondUser = {
//   name: "Stephanie",
//   email: "stephie@stephie.de",
//   password: "stephiesNicePassword",
// };

const userProfiles = [
  {
    userId: 1,
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
    userId: 2,
    name: "Dirk",
    city: "Dortmund",
    bio: "Haaaaaleeelujaaaah",
    social: {
      twitter: "@dirkydirk",
      github: "rollo"
    }
  },
  {
    userId: 4,
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
  for (let u of userProfiles) {
    // u.password = await bcrypt.hash(u.password, 10);
    const user = await prisma.profile.create({
      data: u
    });
    console.log(`Created user with id: ${user.id}`);
  }
  // secondUser.password = await bcrypt.hash(secondUser.password, 10);

  // await prisma.user.create({
  //   data: {
  //     ...secondUser,
  //     householdId: 1,
  //   },
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
