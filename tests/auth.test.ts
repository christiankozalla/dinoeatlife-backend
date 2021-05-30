import { createServer } from "../src/server";
import Hapi from "@hapi/hapi";

describe("POST /register - register a user", () => {
  let server: Hapi.Server;

  beforeAll(async () => {
    server = await createServer();
  });

  afterAll(async () => {
    await server.stop();
  });

  let userId;

  test("create user in DB", async () => {
    const response = await server.inject({
      method: "POST",
      url: "/register",
      payload: {
        name: "My Test Name",
        email: "testan@malle.de",
        password: "1234abc"
      }
    });

    expect(response.statusCode).toEqual(201);
    userId = JSON.parse(response.payload)?.id;
    expect(typeof userId === "number").toBeTruthy();
  });
});
