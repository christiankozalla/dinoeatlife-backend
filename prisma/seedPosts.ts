import { prisma } from "./prismaClient";
import { User } from "@prisma/client";

const seedPosts = [
  {
    content:
      "Yesterday I found this app. I invited my husband to join me and manage meals together!",
    createdAt: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
    user: {
      connect: { email: "stephie@stephie.de" }
    }
  },
  {
    content:
      "WHooohoo, this is a superb app - I love to manage all my eating related stuff here =)))",
    createdAt: new Date(new Date().setDate(new Date().getDate() - 11)).toISOString(),
    user: {
      connect: { email: "stephie@stephie.de" }
    }
  },
  {
    content: "I just can't get enough!",
    createdAt: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
    user: {
      connect: { email: "stephie@stephie.de" }
    }
  }
];

async function main() {
  console.log(`Start seeding ...`);
  for (let i = 0; i < seedPosts.length; i++) {
    const user: User | null = await prisma.user.findUnique({
      where: {
        email: seedPosts[i].user.connect.email
      }
    });

    if (user) {
      const post = await prisma.post.create({
        data: {
          ...seedPosts[i],
          home: {
            connect: {
              id: user.homeId
            }
          }
        }
      });
    }
  }
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
