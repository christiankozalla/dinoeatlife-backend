import Hapi from "@hapi/hapi";
import { Profile, PrismaClient } from "@prisma/client";
import Joi from "joi";
import Boom from "@hapi/boom";

declare module "@hapi/hapi" {
  interface ServerApplicationState {
    prisma: PrismaClient;
  }
}

export const profilePlugin: Hapi.Plugin<null> = {
  name: "users",
  dependencies: ["prisma", "hapi-auth-jwt2"],
  register: async function (server: Hapi.Server) {
    server.route([
      {
        method: "GET",
        path: "/profile/{userId}",
        options: {
          auth: false,
          tags: ["api"]
        },
        handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
          const { prisma } = request.server.app;
          const userId: number = parseInt(request.params.userId, 10);

          try {
            const profile = (await prisma.profile.findUnique({
              where: {
                userId: userId
              }
            })) as Profile;

            if (!profile) {
              return Boom.notFound("No Profile found");
            }

            return h.response(profile).code(200);
          } catch (err) {
            console.error(err);
            return Boom.badImplementation(err);
          }
        }
      },
      {
        method: "POST",
        path: "/profile/{userId}",
        options: {
          validate: {
            payload: profileValidation,
            failAction: async (request, h, err) => {
              if (process.env.NODE_ENV === "production") {
                // In prod, log a limited error message and throw the default Bad Request error.
                err && console.error("ValidationError:", err.message);
                throw Boom.badRequest(`Invalid request payload input`);
              } else {
                // During development, log and respond with the full error.
                if (err) {
                  console.error(err);
                  throw err;
                }
              }
            }
          },
          tags: ["api"]
        },
        handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
          // Creates a new Profile, if none exists yet for the authenticated user
          const { prisma } = request.server.app;
          const userId: number = parseInt(request.params.userId, 10);
          const userIdToken = request.auth.credentials.userId as number;
          const newProfile = request.payload as Profile;

          if (userIdToken === userId) {
            try {
              const createProfile = await prisma.profile.create({
                data: { ...newProfile, userId: userId }
              });

              return h.response().code(201);
            } catch (err) {
              console.error(err);
              return Boom.badRequest();
            }
          } else {
            return Boom.unauthorized();
          }
        }
      },
      {
        method: "PUT",
        path: "/profile/{userId}",
        options: {
          validate: {
            payload: profileValidation,
            failAction: async (request, h, err) => {
              if (process.env.NODE_ENV === "production") {
                // In prod, log a limited error message and throw the default Bad Request error.
                err && console.error("ValidationError:", err.message);
                throw Boom.badRequest(`Invalid request payload input`);
              } else {
                // During development, log and respond with the full error.
                if (err) {
                  console.error(err);
                  throw err;
                }
              }
            }
          },
          tags: ["api"]
        },
        handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
          const { prisma } = request.server.app;
          const userId: number = parseInt(request.params.userId, 10);
          const userIdToken = request.auth.credentials.userId as number;
          const newProfile = request.payload as Profile;

          if (userIdToken === userId) {
            try {
              let existingProfile = await prisma.profile.findUnique({
                where: {
                  userId
                }
              });

              if (existingProfile !== null) {
                let updatedProfile = Object.assign(existingProfile, newProfile);

                await prisma.profile.update({
                  where: {
                    userId
                  },
                  data: {
                    ...updatedProfile
                  }
                });

                return h.response().code(201);
              }
            } catch (err) {
              console.error(err);
              return Boom.badRequest();
            }
          } else {
            return Boom.unauthorized();
          }
        }
      },
      {
        method: "DELETE",
        path: "/profile/{userId}",
        options: {
          tags: ["api"]
        },
        handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
          const { prisma } = request.server.app;
          const userId: number = parseInt(request.params.userId, 10);
          const userIdToken = request.auth.credentials.userId as number;

          if (userIdToken === userId) {
            try {
              await prisma.profile.delete({
                where: {
                  userId
                }
              });

              return h.response().code(204);
            } catch (err) {
              console.error(err);
              return Boom.badRequest();
            }
          } else {
            return Boom.unauthorized();
          }
        }
      }
    ]);
  }
};

const profileValidation = Joi.object({
  name: Joi.string().max(255),
  bio: Joi.string().max(2000),
  city: Joi.string().max(30),
  social: Joi.object({
    facebook: Joi.string().optional(),
    twitter: Joi.string().optional(),
    github: Joi.string().optional(),
    website: Joi.string().optional()
  }).optional()
}).label("profile");
