const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const seedData = [
  {
    name: "Christian",
    email: "christian@christian.de",
    password: "christiansNicePassword",
    household: {
      create: { name: "Koala-Bude" },
    },
  },
  {
    name: "Bingo",
    email: "bingo@lino.de",
    password: "bingosNicePassword",
    household: {
      create: { name: "BingoBingo" },
    },
  },
  {
    name: "Lalala",
    email: "lalala@lo.de",
    password: "lalalasNicePassword",
    household: {
      create: { name: "Alalalalalong" },
    },
  },
];

// Add second user to household
// const secondUser = {
//   name: "Stephanie",
//   email: "stephie@stephie.de",
//   password: "stephiesNicePassword",
// };

async function main() {
  console.log(`Start seeding ...`);
  for (let u of seedData) {
    u.password = await bcrypt.hash(u.password, 10);
    const user = await prisma.user.create({
      data: u,
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
