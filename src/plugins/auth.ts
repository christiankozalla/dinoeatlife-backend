import Hapi from "@hapi/hapi";
import { User, PrismaClient } from "@prisma/client";
import Boom from "@hapi/boom";
import { compare, hash } from "bcryptjs";

import { createAccessToken } from "../util/tokens";
import Joi from "joi";

declare module "@hapi/hapi" {
  interface AuthCredentials {
    email: string;
    password: string;
  }
  interface ServerApplicationState {
    prisma: PrismaClient;
  }
}

interface AccessTokenPayload {
  userId: number;
}

export const authPlugin: Hapi.Plugin<null> = {
  name: "auth",
  dependencies: ["prisma", "hapi-auth-jwt2", "@hapi/basic"],
  register: async function (server: Hapi.Server) {
    if (!process.env.ACCESS_TOKEN_SECRET) {
      server.log(
        "warn",
        "The JWT_SECRET env var is not set. This is unsafe! If running in production, set it."
      );
    }

    // Credentials must be passed via request.headers.authorization
    // Format: Basic <base64 encoded useremail:password>
    // Example: request.headers.authorization = btoa("christian@christian.de:christiansNicePassword");
    server.auth.strategy("authPassword", "basic", { validate: validateUserPassword });

    server.auth.strategy("authJWT", "jwt", {
      key: process.env.ACCESS_TOKEN_SECRET,
      verifyOptions: { algorithms: ["HS256"] },
      validate: validateAccessToken
    });

    server.auth.default("authJWT");

    // routes
    server.route([
      {
        method: "POST",
        path: "/register",
        options: {
          auth: false,
          validate: {
            payload: Joi.object({
              email: Joi.string().email().required(),
              password: Joi.string().required()
            })
          }
        },
        handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
          const { prisma } = request.server.app;
          const { email, password } = request.payload as User;

          if (!email || !password) {
            return Boom.badRequest("Credentials missing");
          }

          try {
            const newUser = await prisma.user.create({
              data: {
                email,
                password: await hash(password, 10),
                home: {
                  create: {
                    name: "Default Home Name"
                  }
                }
              }
            });

            if (!newUser) {
              return Boom.badData("Email already exists");
            }

            const credentials = {
              userId: newUser.id,
              accessToken: createAccessToken(newUser)
            };

            return h.response(credentials).code(201);
          } catch (err) {
            return Boom.badImplementation(err);
          }
        }
      },
      {
        method: "GET",
        path: "/login",
        options: {
          auth: "authPassword"
        },
        handler: (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
          return request.auth.credentials;
        }
      }
    ]);
  }
};

const validateUserPassword = async (
  request: Hapi.Request,
  username: string,
  password: string,
  h: Hapi.ResponseToolkit
) => {
  const { prisma } = request.server.app;

  request.server.log("data", { username, password });

  try {
    // Fetch user from DB
    const registeredUser = await prisma.user.findUnique({
      where: {
        email: username
      }
    });

    if (!registeredUser) {
      return Boom.notFound("User not found");
    }

    const isValid = await compare(password, registeredUser.password);

    if (!isValid) {
      return { isValid };
    }

    // Passed to request.auth.credentials in route handler
    const credentials = {
      userId: registeredUser.id,
      accessToken: createAccessToken(registeredUser)
    };

    return { isValid, credentials };
  } catch (err) {
    return Boom.badImplementation("Error in validateUserPassword");
  }
};

const validateAccessToken = async (
  decoded: AccessTokenPayload,
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) => {
  const { prisma } = request.server.app;
  const { userId } = decoded;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      }
    });

    if (!user) {
      return { isValid: false };
    } else {
      return { isValid: true };
    }
  } catch (err) {
    return Boom.badImplementation("Error in validateAccessToken");
  }
};
