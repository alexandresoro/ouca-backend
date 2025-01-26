import { kysely } from "@infrastructure/kysely/kysely.js";
import * as Sentry from "@sentry/bun";
import type { Server } from "bun";
import { logger } from "./utils/logger.js";

export const shutdown =
  (server: Server): (() => void) =>
  () => {
    logger.info("Shutdown requested");
    void Promise.all([
      Sentry.close(2000),
      kysely.destroy().then(() => {
        logger.info("Kysely database connection has been shut down");
      }),
      server.stop(),
    ]).finally(() => {
      process.exit(0);
    });
  };
