import fastifyCors from "@fastify/cors";
import fastifyMultipart from "@fastify/multipart";
import { fastifySensible } from "@fastify/sensible";
import fastifyUnderPressure from "@fastify/under-pressure";
import { buildBullBoardAdapter } from "@infrastructure/bullmq/bullboard.js";
import type { Queues } from "@infrastructure/bullmq/queues.js";
import * as Sentry from "@sentry/node";
import fastify, {
  type FastifyInstance,
  type RawReplyDefaultExpression,
  type RawRequestDefaultExpression,
  type RawServerDefault,
} from "fastify";
import type { Logger } from "pino";
import { logger as loggerParent } from "../../utils/logger.js";

export const buildServer = async (
  queues: Queues,
): Promise<
  FastifyInstance<
    RawServerDefault,
    RawRequestDefaultExpression<RawServerDefault>,
    RawReplyDefaultExpression<RawServerDefault>,
    Logger
  >
> => {
  const logger = loggerParent.child({ module: "fastify" });

  // Server
  const server = fastify.default({
    logger: loggerParent,
    bodyLimit: 1048576 * 10, // 10 MB
    trustProxy: true,
  });

  // Middlewares
  await server.register(fastifySensible);
  await server.register(fastifyMultipart);
  await server.register(fastifyCors, {
    origin: true,
    credentials: true,
    maxAge: 3600,
    exposedHeaders: ["Location"],
  });
  await server.register(fastifyUnderPressure, {
    exposeStatusRoute: "/healthz",
  });

  logger.debug("Fastify middlewares successfully registered");

  // Remove default text/plain parser
  // https://fastify.dev/docs/latest/Reference/ContentTypeParser/
  server.removeContentTypeParser(["text/plain"]);

  // BullBoard
  const serverAdapter = buildBullBoardAdapter(queues);
  await server.register(serverAdapter.registerPlugin(), { basePath: "/jobs", prefix: "/jobs" });
  logger.debug("BullBoard successfully registered");

  // Sentry
  Sentry.setupFastifyErrorHandler(server);

  return server;
};
