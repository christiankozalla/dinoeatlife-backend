import Hapi from "@hapi/hapi";
import { Ingredient, Recipe, PrismaClient } from "@prisma/client";
import Boom from "@hapi/boom";
import Joi from "joi";

declare module "@hapi/hapi" {
  interface ServerApplicationState {
    prisma: PrismaClient;
  }

  interface AuthCredentials {
    userId: number;
    homeId: number;
  }
}

interface IngredientInput {
  name: string;
  unit: string;
}

export const homePlugin: Hapi.Plugin<null> = {
  name: "home",
  dependencies: ["prisma", "hapi-auth-jwt2"],
  register: async function (server: Hapi.Server) {
    server.route([
      {
        method: "GET",
        path: "/home",
        handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
          // Returns all resources of a Home for an authenticated User of the Home
          // Resources: Recipe[], Ingredient[]

          const { prisma } = request.server.app;
          const { credentials } = request.auth;

          try {
            // The user truely belongs to the home

            // Fetch all recipes
            const recipes: Recipe[] = await prisma.recipe.findMany({
              where: {
                homeId: credentials.homeId
              }
            });

            // Fetch all ingredients
            const ingredients: Ingredient[] = await prisma.ingredient.findMany({
              where: {
                homeId: credentials.homeId
              }
            });

            return h.response({ recipes, ingredients }).code(200);
          } catch (err) {
            return Boom.badImplementation(err);
          }
        }
      },
      {
        method: "POST",
        path: "/home/ingredients",
        options: {
          validate: {
            payload: validateIngredientInput
          }
        },
        handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
          const { prisma } = request.server.app;
          const { credentials } = request.auth;
          const { name, unit } = request.payload as IngredientInput;

          try {
            await prisma.ingredient.create({
              data: {
                homeId: credentials.homeId,
                name,
                unit
              }
            });

            return h.response().code(201);
          } catch (err) {
            return Boom.badImplementation(err);
          }
        }
      },
      {
        method: "DELETE",
        path: "/home/ingredients/{ingredientId}",
        options: {
          validate: {
            payload: validateIngredientInput
          }
        },
        handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
          const { prisma } = request.server.app;
          const ingredientId = parseInt(request.params.id, 10) as Ingredient["id"];

          try {
            await prisma.ingredient.delete({
              where: {
                id: ingredientId
              }
            });

            return h.response().code(201);
          } catch (err) {
            return Boom.badImplementation(err);
          }
        }
      }
    ]);
  }
};

const validateIngredientInput = Joi.object({
  name: Joi.string().required(),
  unit: Joi.string().required()
});
