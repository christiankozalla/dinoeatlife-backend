import { sign, verify } from "jsonwebtoken";
import { User } from "@prisma/client";
import { AuthCredentials } from "@hapi/hapi";

export interface AccessTokenPayload {
  userId: User["id"];
  homeId: User["homeId"];
}

export interface RefreshTokenPayload extends AccessTokenPayload {
  remoteAddress: string;
}

export interface ResponseOnAuth extends AccessTokenPayload {
  accessToken: string;
}

export const createAccessToken = (userId: User["id"], homeId: User["homeId"]) => {
  return sign({ userId, homeId }, process.env.ACCESS_TOKEN_SECRET!, {
    algorithm: "HS256",
    expiresIn: 60 * 60
  });
};

export const createRefreshToken = (
  credentials: AccessTokenPayload,
  remoteAddress: RefreshTokenPayload["remoteAddress"]
) => {
  return sign(
    { userId: credentials.userId, homeId: credentials.homeId, remoteAddress: remoteAddress },
    process.env.REFRESH_TOKEN_SECRET!,
    { algorithm: "HS256", expiresIn: "7d" }
  );
};

export const verifyAccessToken = (accessToken: string) => {
  return verify(accessToken, process.env.ACCESS_TOKEN_SECRET!, {
    algorithms: ["HS256"]
  }) as AccessTokenPayload;
};

export const verifyRefreshToken = (refreshToken: string) => {
  try {
    const decoded = verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!, {
      algorithms: ["HS256"]
    }) as RefreshTokenPayload;

    return decoded;
  } catch (err) {
    throw new Error(err);
  }
};
