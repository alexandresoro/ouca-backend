import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter.js";
import { HonoAdapter } from "@bull-board/hono";
import { serveStatic } from "@hono/node-server/serve-static";
import type { Queues } from "@infrastructure/bullmq/queues.js";
import { Hono } from "hono";
import { type Env, pinoLogger } from "hono-pino";
import { cors } from "hono/cors";
import { logger as loggerParent } from "../../utils/logger.js";

export const honoLogger = loggerParent.child({ module: "hono" });

export const buildHono = (queues: Queues) => {
  const app = new Hono<Env<"logger">>();

  app.use(
    pinoLogger({
      pino: honoLogger,
      http: {
        onReqBindings: (c) => {
          return {
            req: {
              url: c.req.path,
              method: c.req.method,
              query: c.req.query(),
            },
          };
        },
        onResBindings: (c) => {
          return {
            res: {
              status: c.res.status,
            },
          };
        },
      },
    }),
  );

  app.use(
    cors({
      origin: (origin) => origin,
      credentials: true,
      maxAge: 3600,
      exposeHeaders: ["Location"],
    }),
  );

  // Healthcheck route
  // TODO: Check if we need a proper middleware for this (like under-pressure)
  app.get("/healthz", (c) => {
    return c.json({ status: "ok" }, 200);
  });

  // BullBoard
  const serverAdapter = new HonoAdapter(serveStatic);
  createBullBoard({
    queues: Object.values(queues).map((queue) => new BullMQAdapter(queue)),
    serverAdapter,
  });
  serverAdapter.setBasePath("/jobs");
  app.route("/jobs", serverAdapter.registerPlugin());
  honoLogger.debug("BullBoard successfully registered");

  honoLogger.debug("Hono middlewares successfully registered");

  return app;
};
