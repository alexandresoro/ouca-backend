import * as Sentry from "@sentry/node";

export const captureException = (e: unknown) => {
  Sentry.captureException(e);
};
