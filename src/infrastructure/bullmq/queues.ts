import { redis } from "@infrastructure/ioredis/redis.js";
import { Queue } from "bullmq";
import { logger as mainLogger } from "../../utils/logger.js";

const logger = mainLogger.child({ module: "queues" });

const QUEUES = {
  geojson: {
    jobs: ["geojsonrefresh"] as const,
  },
  import: {
    jobs: ["import"] as const,
  },
};

export type QueueName = keyof typeof QUEUES;

export type QueuesConfig = typeof QUEUES;

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type Queues = { [K in keyof QueuesConfig]: Queue<any, any, QueuesConfig[K]["jobs"][number]> };

export const createQueues = (): Queues => {
  logger.info("Creating queues");

  return Object.fromEntries(
    Object.keys(QUEUES).map((queueName) => {
      const queue = new Queue(queueName, { connection: redis });
      logger.debug(`Queue ${queueName} has being created`);

      return [queueName, queue];
    }),
  ) as Queues;
};
