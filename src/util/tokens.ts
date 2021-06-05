import { sign, verify } from "jsonwebtoken";
import { User } from "@prisma/client";

export const createAccessToken = (user: User) => {
  return sign({ userId: user.id, homeId: user.homeId }, process.env.ACCESS_TOKEN_SECRET!, { algorithm: "HS256", expiresIn: 60 * 60 });
};
