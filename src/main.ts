import "@infrastructure/sentry/sentry.js";

import { serverConfig } from "@infrastructure/config/server-config.js";
import { buildServer } from "@infrastructure/fastify/fastify.js";
import { captureException } from "@infrastructure/sentry/capture-exception.js";
import { runMigrations } from "@infrastructure/umzug/umzug-instance.js";
import { registerRoutes } from "./application/http/routes.js";
import { startWorkersAndJobs } from "./application/jobs/jobs.js";
import { buildServices } from "./application/services/services.js";
import { shutdown } from "./shutdown.js";
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

  const server = await buildServer(services.queues);

  await registerRoutes(server, services);

  process.on("SIGINT", shutdown(server));
  process.on("SIGTERM", shutdown(server));

  await server.listen({ ...serverConfig });
};

await startApp().catch((e) => {
  captureException(e);
  logger.error(e);
});
