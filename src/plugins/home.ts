import Hapi from "@hapi/hapi";
import { Ingredient, Recipe, PrismaClient } from "@prisma/client";
import Boom from "@hapi/boom";
import { userIsAuthorized } from "../util/authorization";
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
          const homeId = parseInt(request.params.homeId, 10);
          const { credentials } = request.auth;

          if (homeId === credentials.homeId) {
            try {
              if (userIsAuthorized(homeId, credentials.userId as credentials["userId"], prisma)) {
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
                return Boom.unauthorized();
              }
            } catch (err) {
              return Boom.badImplementation(err);
            }
          } else {
            return Boom.unauthorized();
          }
        }
      }
    ]);
  }
};
