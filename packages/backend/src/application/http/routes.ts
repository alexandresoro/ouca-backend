import type {
  FastifyInstance,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
} from "fastify";
import type { Logger } from "pino";
import { logger as loggerParent } from "../../utils/logger.js";
import type { Services } from "../services/services.js";
import { downloadController } from "./controllers/download-controller.js";
import { apiRoutes } from "./routes/api.js";

const logger = loggerParent.child({ module: "fastify" });

export const registerRoutes = async (
  server: FastifyInstance<
    RawServerDefault,
    RawRequestDefaultExpression<RawServerDefault>,
    RawReplyDefaultExpression<RawServerDefault>,
    Logger
  >,
  services: Services,
): Promise<void> => {
  // API
  await server.register(apiRoutes, { services });

  // Static routes
  await server.register(downloadController, { services, prefix: "/download" });

  logger.debug("Fastify static routes added");
};
