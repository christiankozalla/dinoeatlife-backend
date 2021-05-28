import { sign, verify } from "jsonwebtoken";
import { User } from "@prisma/client";

export const createAccessToken = (userId: User["id"]) => {
  return sign({ userId }, process.env.ACCESS_TOKEN_SECRET!, { algorithm: "HS256", expiresIn: 60 * 15 });
};
