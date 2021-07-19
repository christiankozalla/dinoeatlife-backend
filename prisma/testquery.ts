const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log(`Start query ...`);

  const home = await prisma.home.findUnique({
    where: {
      id: 1
    }
  });

  if (home) {
    console.log(home);
  }

  console.log(`Query finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
