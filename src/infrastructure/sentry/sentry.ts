import { sentryConfig } from "@infrastructure/config/sentry-config.js";
import * as Sentry from "@sentry/node";
import { logger } from "../../utils/logger.js";

// Sentry
logger.debug(`Sentry instrumenting ${sentryConfig.dsn ? "enabled" : "disabled"}`);

Sentry.init({
  dsn: sentryConfig.dsn,
  environment: sentryConfig.environment,
  release: sentryConfig.release,
  tracesSampleRate: sentryConfig.tracesSampleRate,
});
