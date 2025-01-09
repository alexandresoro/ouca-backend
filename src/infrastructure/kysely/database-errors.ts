import type { EntityFailureReason } from "@domain/shared/failure-reason.js";
import pg from "pg";

// Sources:
// https://www.postgresql.org/docs/current/errcodes-appendix.html
// https://github.com/brianc/node-postgres/blob/9c3ecdca6953b8cde01fcb6ab6042e8274dc2e9b/packages/pg-protocol/src/parser.ts#L369

const isDatabaseError = (error: unknown): error is pg.DatabaseError => {
  return error instanceof pg.DatabaseError;
};

export const isUniqueViolationError = (error: unknown): boolean => {
  return isDatabaseError(error) && error.code === "23505";
};

export const handleDatabaseError = (error: unknown): EntityFailureReason => {
  if (isUniqueViolationError(error)) {
    return "alreadyExists";
  }

  throw error;
};
