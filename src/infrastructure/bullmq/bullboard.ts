import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter.js";
import { FastifyAdapter } from "@bull-board/fastify";
import type { Queues } from "./queues.js";

export const buildBullBoardAdapter = (queues: Queues): FastifyAdapter => {
  const serverAdapter = new FastifyAdapter();

  createBullBoard({
    queues: Object.values(queues).map((queue) => new BullMQAdapter(queue)),
    serverAdapter,
  });

  serverAdapter.setBasePath("/jobs");

  return serverAdapter;
};
