import type { ServerType } from "@hono/node-server";
import { kysely } from "@infrastructure/kysely/kysely.js";
import * as Sentry from "@sentry/node";
import type {
  FastifyInstance,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
} from "fastify";
import type { Logger } from "pino";
import { logger } from "./utils/logger.js";

// Handle shutdown request gracefully
// This is used when inside a container
// See https://emmer.dev/blog/you-don-t-need-an-init-system-for-node.js-in-docker/
export const shutdown =
  (
    server: FastifyInstance<
      RawServerDefault,
      RawRequestDefaultExpression<RawServerDefault>,
      RawReplyDefaultExpression<RawServerDefault>,
      Logger
    >,
  ): (() => void) =>
  () => {
    logger.info("Shutdown requested");
    void Promise.all([
      Sentry.close(2000),
      kysely.destroy().then(() => {
        logger.info("Kysely database connection has been shut down");
      }),
      server.close().then(() => {
        logger.info("Web server has been shut down");
      }),
    ]).finally(() => {
      process.exit(0);
    });
  };

const closeServer = (server: ServerType): Promise<void> => {
  return new Promise((resolve, reject) => {
    server.close((err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
};

export const shutdownHono =
  (server: ServerType): (() => void) =>
  () => {
    logger.info("Shutdown requested");
    server.close();
    void Promise.all([
      Sentry.close(2000),
      kysely.destroy().then(() => {
        logger.info("Kysely database connection has been shut down");
      }),
      closeServer(server),
    ]).finally(() => {
      process.exit(0);
    });
  };
