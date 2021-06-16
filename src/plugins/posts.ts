import Hapi from "@hapi/hapi";
import { Ingredient, Recipe, User, PrismaClient } from "@prisma/client";
import Boom from "@hapi/boom";
import Joi from "joi";

declare module "@hapi/hapi" {
  interface ServerApplicationState {
    prisma: PrismaClient;
  }

  interface AuthCredentials {
    userId: User["id"];
    homeId: User["homeId"];
  }
}

interface PostInput {
  content: string;
}

export const postsPlugin: Hapi.Plugin<null> = {
  name: "posts",
  dependencies: ["prisma", "hapi-auth-jwt2"],
  register: async function (server: Hapi.Server) {
    server.route([
      {
        method: "GET",
        path: "/posts",
        options: {
          auth: false,
          tags: ["api"]
        },
        handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
          const { prisma } = request.server.app;

          try {
            const allPosts = await prisma.post.findMany({
              orderBy: {
                createdAt: "desc"
              },
              take: 20
            });

            return h.response(allPosts).code(200);
          } catch (err) {
            return Boom.badImplementation(err);
          }
        }
      },
      {
        method: "GET",
        path: "/posts/{userId}",
        options: {
          auth: false,
          tags: ["api"]
        },
        handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
          const { prisma } = request.server.app;
          const userId = parseInt(request.params.userId, 10);

          try {
            const allPostsByUser = await prisma.post.findMany({
              where: {
                userId
              },
              orderBy: {
                createdAt: "desc"
              },
              take: 10
            });

            return h.response(allPostsByUser).code(200);
          } catch (err) {
            return Boom.badImplementation(err);
          }
        }
      },
      {
        method: "POST",
        path: "/posts",
        options: {
          validate: {
            payload: validatePostInput
          },
          tags: ["api"]
        },
        handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
          const { prisma } = request.server.app;
          const { credentials } = request.auth;
          const { content } = request.payload as PostInput;

          try {
            await prisma.post.create({
              data: {
                userId: credentials.userId,
                content
              }
            });

            return h.response().code(201);
          } catch (err) {
            return Boom.badImplementation(err);
          }
        }
      },
      {
        method: "PUT",
        path: "/posts/{postId}",
        options: {
          validate: {
            payload: validatePostInput
          },
          tags: ["api"]
        },
        handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
          const { prisma } = request.server.app;
          const { credentials } = request.auth;
          const { content } = request.payload as PostInput;
          const postId = parseInt(request.params.postId, 10);

          try {
            const postById = await prisma.post.findUnique({
              where: {
                id: postId
              },
              select: {
                userId: true
              }
            });

            if (postById && postById.userId === credentials.userId) {
              await prisma.post.update({
                where: {
                  id: postId
                },
                data: {
                  userId: credentials.userId,
                  content
                }
              });

              return h.response().code(201);
            } else {
              return Boom.forbidden();
            }
          } catch (err) {
            return Boom.badImplementation(err);
          }
        }
      },
      {
        method: "DELETE",
        path: "/posts/{postId}",
        options: {
          tags: ["api"]
        },
        handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
          const { prisma } = request.server.app;
          const { credentials } = request.auth;
          const postId = parseInt(request.params.postId, 10);

          try {
            const postById = await prisma.post.findUnique({
              where: {
                id: postId
              },
              select: {
                userId: true
              }
            });

            if (postById && postById.userId === credentials.userId) {
              await prisma.post.delete({
                where: {
                  id: postId
                }
              });

              return h.response().code(201);
            } else {
              return Boom.forbidden();
            }
          } catch (err) {
            return Boom.badImplementation(err);
          }
        }
      }
    ]);
  }
};

const validatePostInput = Joi.object({
  content: Joi.string().max(255).required()
});
