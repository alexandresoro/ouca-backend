import * as Sentry from "@sentry/bun";

export const captureException = (e: unknown) => {
  Sentry.captureException(e);
};
