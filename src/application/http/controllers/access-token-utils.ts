import type { FastifyRequest } from "fastify";
import { type Result, err, ok } from "neverthrow";

const BEARER_PATTERN = /^Bearer (.+)$/;

export const getAccessToken = (req: FastifyRequest): Result<string, "headerNotFound" | "headerInvalidFormat"> => {
  const authorizationHeader = req.headers.authorization;

  // Check if authorization header is missing
  if (!authorizationHeader) {
    return err("headerNotFound");
  }

  // Check if authorization header format is incorrect
  const bearerGroups = BEARER_PATTERN.exec(authorizationHeader);
  if (!bearerGroups) {
    return err("headerInvalidFormat");
  }

  // Access token extracted
  return ok(bearerGroups[1]);
};
