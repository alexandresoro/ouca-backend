import { loggerConfig } from "@infrastructure/config/logger-config.js";
import { type TransportTargetOptions, pino } from "pino";

const getPinoTransportsToUse = ({ level, pretty }: typeof loggerConfig) => {
  const transports: TransportTargetOptions[] = [];

  if (pretty) {
    transports.push({
      target: "pino-pretty",
      level,
      options: {
        colorize: true,
        translateTime: true,
      },
    });
  } else {
    transports.push({
      target: "pino/file",
      level,
      options: {},
    });
  }

  return transports?.length
    ? {
        targets: transports,
      }
    : undefined;
};

export const logger = pino({
  level: loggerConfig.level,
  base: undefined,
  transport: getPinoTransportsToUse(loggerConfig),
});
