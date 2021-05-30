import Hapi from "@hapi/hapi";
import { Profile, PrismaClient } from "@prisma/client";
import Boom from "@hapi/boom";
import Joi from "joi";

declare module "@hapi/hapi" {
  interface ServerApplicationState {
    prisma: PrismaClient;
  }
}

export const usersPlugin: Hapi.Plugin<null> = {
  name: "users",
  dependencies: ["prisma"],
  register: async function (server: Hapi.Server) {
    server.route([
      {
        method: "GET",
        path: "/users",
        options: {
          auth: false
        },
        handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
          const { prisma } = request.server.app;
          try {
            const users = (await prisma.profile.findMany()) as Profile[];

            if (!users) {
              return Boom.notFound("No users found");
            }

            return h.response(users).code(200);
          } catch (err) {
            return Boom.badImplementation(err);
          }
        }
      }
    ]);
  }
};
