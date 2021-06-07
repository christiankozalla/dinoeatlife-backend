import Hapi from "@hapi/hapi";

// Plugins
import hapiAuthBasic from "@hapi/basic";
import hapiAuthJWT from "hapi-auth-jwt2";

// Custom Plugins
import { prismaPlugin } from "./plugins/prisma";
import { authPlugin } from "./plugins/auth";
import { homePlugin } from "./plugins/home";
import { profilePlugin } from "./plugins/profile";

// Config
import dotenv from "dotenv";

// Logger
import hapiPino from "hapi-pino";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

const server: Hapi.Server = Hapi.server({
  port: process.env.PORT || 4000,
  host: process.env.HOST || "0.0.0.0",
  debug: false
});

export async function createServer(): Promise<Hapi.Server> {
  // // Register the logger
  await server.register({
    plugin: hapiPino,
    options: {
      prettyPrint: process.env.NODE_ENV !== "production",
      // Redact Authorization headers, see https://getpino.io/#/docs/redaction
      redact: ["req.headers.authorization"]
    }
  });

  // Register Hapi plugins -- like middleware
  await server.register([
    hapiAuthBasic,
    hapiAuthJWT,
    prismaPlugin,
    authPlugin,
    profilePlugin,
    homePlugin
  ]);

  server.route([
    {
      method: "GET",
      path: "/",
      options: {
        auth: false
      },
      handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
        return h.response({ message: "Hello from Hapi Backend" }).code(200);
      }
    },
    {
      method: "GET",
      path: "/protected",
      handler: (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
        return "Only for authenticated users with a valid JWT";
      }
    }
  ]);

  await server.initialize();

  return server;
}

export async function startServer(server: Hapi.Server): Promise<Hapi.Server> {
  await server.start();
  server.log("info", `Server running on ${server.info.uri}`);
  return server;
}

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});
