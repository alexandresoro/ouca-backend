import { createMiddleware } from "hono/factory";
import type { Services } from "../../services/services.js";

export type ServicesVariables = {
  services: Services;
};

export const injectServices = (services: Services) =>
  createMiddleware<{
    // biome-ignore lint/style/useNamingConvention: <explanation>
    Variables: ServicesVariables;
  }>(async (c, next) => {
    c.set("services", services);
    await next();
  });
