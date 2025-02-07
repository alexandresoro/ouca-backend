import { buildHono, honoLogger } from "@infrastructure/hono/hono.js";
import type { Services } from "../services/services.js";
import { downloadHandler } from "./controllers/download-handler.js";
import { buildHonoApi } from "./routes/hono-api.js";

export const buildHonoApp = (services: Services) => {
  const app = buildHono(services.queues);

  // API
  app.route("/", buildHonoApi(services, honoLogger));

  // Static routes
  app.route("/download", downloadHandler(services));

  honoLogger.debug("Hono static routes added");

  return app;
};
