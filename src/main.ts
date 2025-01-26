import "@infrastructure/sentry/sentry.js";

import { serverConfig } from "@infrastructure/config/server-config.js";
import { honoLogger } from "@infrastructure/hono/hono.js";
import { captureException } from "@infrastructure/sentry/capture-exception.js";
import { runMigrations } from "@infrastructure/umzug/umzug-instance.js";
import { buildHonoApp } from "./application/http/hono.js";
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

  const app = buildHonoApp(services);

  const server = Bun.serve({
    fetch: app.fetch,
    port: serverConfig.port,
  });

  honoLogger.info(`Server listening on port ${serverConfig.port}`);

  process.on("SIGINT", shutdown(server));
  process.on("SIGTERM", shutdown(server));
};

await startApp().catch((e) => {
  captureException(e);
  logger.error(e);
});
