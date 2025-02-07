import "@infrastructure/sentry/sentry.js";

import { serve } from "@hono/node-server";
import { serverConfig } from "@infrastructure/config/server-config.js";
import { buildServer } from "@infrastructure/fastify/fastify.js";
import { honoLogger } from "@infrastructure/hono/hono.js";
import { captureException } from "@infrastructure/sentry/capture-exception.js";
import { runMigrations } from "@infrastructure/umzug/umzug-instance.js";
import { buildHonoApp } from "./application/http/hono.js";
import { registerRoutes } from "./application/http/routes.js";
import { startWorkersAndJobs } from "./application/jobs/jobs.js";
import { buildServices } from "./application/services/services.js";
import { shutdown, shutdownHono } from "./shutdown.js";
import { logger } from "./utils/logger.js";

logger.debug("Starting app");

// Run database migrations if active
await runMigrations().catch((e) => {
  captureException(e);
  logger.error(e);
});

const startApp = async () => {
  const services = buildServices();

  await startWorkersAndJobs(services);

  logger.info(`Using ${serverConfig.useHonoServer ? "Hono" : "Fastify"} to serve requests`);

  if (serverConfig.useHonoServer) {
    const app = buildHonoApp(services);

    const server = serve(
      {
        fetch: app.fetch,
        port: serverConfig.port,
      },
      (info) => {
        honoLogger.info(`Server listening on port ${info.port}`);
      },
    );

    process.on("SIGINT", shutdownHono(server));
    process.on("SIGTERM", shutdownHono(server));
  } else {
    const server = await buildServer(services.queues);

    await registerRoutes(server, services);

    process.on("SIGINT", shutdown(server));
    process.on("SIGTERM", shutdown(server));

    await server.listen({ ...serverConfig });
  }
};

await startApp().catch((e) => {
  captureException(e);
  logger.error(e);
});
