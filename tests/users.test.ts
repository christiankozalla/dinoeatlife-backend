import { createServer } from "../src/server";
import { Profile } from "@prisma/client";
import Hapi from "@hapi/hapi";

interface userResponse {
  userId: number;
  name: string;
  bio: string;
  city: string;
  social: Object;
}

describe("GET /users - get all user profiles (public)", () => {
  let server: Hapi.Server;

  beforeAll(async () => {
    server = await createServer();
  });

  afterAll(async () => {
    await server.stop();
  });

  test("fetch users", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/users"
    });


    expect(response.statusCode).toEqual(200);
    expect(Array.isArray(response.result)).toBeTruthy;

    const userRes = response.result as Profile[];

    const expected: number[] = [0, 2, 3];
    expect(userRes[0].userId === expected[0]).toBeTruthy;
  });
});
