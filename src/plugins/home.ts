import Hapi from "@hapi/hapi";
import { Ingredient, Recipe, User, PrismaClient } from "@prisma/client";
import Boom from "@hapi/boom";
import Joi from "joi";

declare module "@hapi/hapi" {
  interface ServerApplicationState {
    prisma: PrismaClient;
  }

  interface AuthCredentials {
    email?: User["email"];
    password?: User["password"];
    userId: User["id"];
    homeId: User["homeId"];
  }
}

interface IngredientInput {
  name: Ingredient["name"];
  unit: Ingredient["unit"];
}

interface RecipeInput {
  name: Recipe["name"];
  duration: Recipe["duration"];
  description: Recipe["description"];
}

export const homePlugin: Hapi.Plugin<null> = {
  name: "home",
  dependencies: ["prisma", "hapi-auth-jwt2"],
  register: async function (server: Hapi.Server) {
    server.route([
      {
        method: "GET",
        path: "/home",
        options: {
          tags: ["api"]
        },
        handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
          // Returns all resources of a Home for an authenticated User of the Home
          // Resources: Recipe[], Ingredient[]

          const { prisma } = request.server.app;
          const { credentials } = request.auth;

          try {
            // Fetch all recipes
            const recipes: Recipe[] = await prisma.recipe.findMany({
              where: {
                homeId: credentials.homeId,
                isDeleted: false
              }
            });

            // Fetch all ingredients
            const ingredients: Ingredient[] = await prisma.ingredient.findMany({
              where: {
                homeId: credentials.homeId,
                isDeleted: false
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
          },
          tags: ["api"]
        },
        handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
          const { prisma } = request.server.app;
          const { credentials } = request.auth;
          const ingredients = request.payload as IngredientInput[];

          try {
            await prisma.ingredient.createMany({
              data: ingredients.map((ingredient) => ({
                homeId: credentials.homeId,
                name: ingredient.name,
                unit: ingredient.unit
              }))
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
          },
          tags: ["api"]
        },
        handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
          const { prisma } = request.server.app;
          const { credentials } = request.auth;
          const ingredientId = parseInt(request.params.ingredientId, 10) as Ingredient["id"];

          try {
            let ingredient = await prisma.ingredient.findUnique({
              where: {
                id: ingredientId
              }
            });

            if (!ingredient) {
              return Boom.notFound();
            }

            if (ingredient.homeId === credentials.homeId) {
              await prisma.ingredient.update({
                where: {
                  id: ingredientId
                },
                data: {
                  isDeleted: true
                }
              });
            }

            return h.response().code(204);
          } catch (err) {
            return Boom.badImplementation(err);
          }
        }
      },
      {
        method: "POST",
        path: "/home/recipes",
        options: {
          validate: {
            payload: validateRecipeInput
          },
          tags: ["api"]
        },
        handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
          const { prisma } = request.server.app;
          const { credentials } = request.auth;
          const { name, duration, description } = request.payload as RecipeInput;

          try {
            await prisma.recipe.create({
              data: {
                homeId: credentials.homeId,
                userId: credentials.userId,
                name,
                duration,
                description
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
        path: "/home/recipes/{recipeId}",
        options: {
          validate: {
            payload: validateRecipeInput
          },
          tags: ["api"]
        },
        handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
          const { prisma } = request.server.app;
          const { credentials } = request.auth;
          const { name, duration, description } = request.payload as RecipeInput;
          const recipeId = parseInt(request.params.recipeId, 10) as Recipe["id"];

          try {
            let recipe = await prisma.recipe.findUnique({
              where: {
                id: recipeId
              }
            });

            if (!recipe) {
              return Boom.notFound();
            }

            if (recipe.userId === credentials.userId && recipe.homeId === credentials.homeId) {
              // Update recipe if authenticated user has created it - i.e. is the owner
              await prisma.recipe.update({
                where: {
                  id: recipe.id
                },
                data: {
                  homeId: credentials.homeId,
                  userId: credentials.userId,
                  name,
                  duration,
                  description
                }
              });

              return h.response().code(204);
            } else {
              return Boom.unauthorized();
            }
          } catch (err) {
            return Boom.badImplementation(err);
          }
        }
      },
      {
        method: "DELETE",
        path: "/home/recipes/{recipeId}",
        options: {
          tags: ["api"]
        },
        handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
          const { prisma } = request.server.app;
          const { credentials } = request.auth;
          const recipeId = parseInt(request.params.recipeId, 10) as Recipe["id"];

          try {
            let recipe = await prisma.recipe.findUnique({
              where: {
                id: recipeId
              }
            });

            if (!recipe) {
              return Boom.notFound();
            }

            if (recipe.userId === credentials.userId && recipe.homeId === credentials.homeId) {
              // Update recipe if authenticated user has created it - i.e. is the owner

              // Really delete the recipe
              // await prisma.recipe.delete({
              //   where: {
              //     id: recipe.id
              //   }
              // });

              // OR set isDeleted to true - i.e. soft delete
              await prisma.recipe.update({
                where: {
                  id: recipeId
                },
                data: {
                  isDeleted: true
                }
              });

              return h.response().code(204);
            } else {
              return Boom.unauthorized();
            }
          } catch (err) {
            return Boom.badImplementation(err);
          }
        }
      }
    ]);
  }
};

const validateIngredientInput = Joi.array().items(
  Joi.object({
    name: Joi.string().required(),
    unit: Joi.string().required()
  })
);

const validateRecipeInput = Joi.object({
  name: Joi.string().max(255).required(),
  duration: Joi.number().required(),
  description: Joi.string().required()
});
