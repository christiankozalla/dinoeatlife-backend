import Hapi from "@hapi/hapi";
import { Ingredient, Recipe, PrismaClient } from "@prisma/client";
import Boom from "@hapi/boom";
import Joi from "joi";

declare module "@hapi/hapi" {
  interface ServerApplicationState {
    prisma: PrismaClient;
  }
}

type credentials = {
  userId: number;
  homeId: number;
  iat: number;
  exp: number;
};

export const homePlugin: Hapi.Plugin<null> = {
  name: "home",
  dependencies: ["prisma", "hapi-auth-jwt2"],
  register: async function (server: Hapi.Server) {
    server.route([
      {
        method: "GET",
        path: "/home/{homeId}",
        handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
          // Returns all resources of a Home for an authenticated User of the Home
          // Resources: Recipe[], Ingredient[]
          
          const { prisma } = request.server.app;
          const { credentials } = request.auth;

          try {
            // Fetch the home users
            const allUserIds = await prisma.home.findUnique({
              where: {
                id: credentials.homeId as credentials["homeId"]
              },
              select: {
                users: {
                  select: {
                    id: true
                  }
                }
              }
            });

            if (!allUserIds) {
              return Boom.notFound("No users in home");
            }

            if (allUserIds.users.some((data) => data.id === credentials.userId)) {
              // The user truely belongs to the home

              // Fetch all recipes
              const recipes: Recipe[] = await prisma.recipe.findMany({
                where: {
                  homeId: credentials.homeId as credentials["homeId"]
                }
              });

              // Fetch all ingredients
              const ingredients: Ingredient[] = await prisma.ingredient.findMany({
                where: {
                  homeId: credentials.homeId as credentials["homeId"]
                }
              });

              return h.response({ recipes, ingredients }).code(200);
            } else {
              return Boom.forbidden("You cannot access that data.");
            }
          } catch (err) {
            return Boom.badImplementation(err);
          }
        }
      }
    ]);
  }
};
