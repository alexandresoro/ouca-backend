import { sentryConfig } from "@infrastructure/config/sentry-config.js";
import * as Sentry from "@sentry/bun";
import { logger } from "../../utils/logger.js";

// Sentry
logger.debug(`Sentry instrumenting ${sentryConfig.dsn ? "enabled" : "disabled"}`);

Sentry.init({
  dsn: sentryConfig.dsn,
  environment: sentryConfig.environment,
  release: sentryConfig.release,
  tracesSampleRate: sentryConfig.tracesSampleRate,
  beforeSend: (event, hint) => {
    if (
      typeof hint.originalException === "object" &&
      hint.originalException !== null &&
      "statusCode" in hint.originalException &&
      typeof hint.originalException.statusCode === "number" &&
      hint.originalException.statusCode >= 400 &&
      hint.originalException.statusCode < 500
    ) {
      return null;
    }

    return event;
  },
});
