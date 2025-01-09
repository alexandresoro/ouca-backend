import type { QueueName, QueuesConfig } from "@infrastructure/bullmq/queues.js";
import { redis } from "@infrastructure/ioredis/redis.js";
import { type Processor, Worker, type WorkerOptions } from "bullmq";
import { logger } from "../../utils/logger.js";

export const workerLogger = logger.child({ module: "workers" });

export const startWorker = <
  Q extends QueueName,
  DataType,
  ResultType,
  NameType extends QueuesConfig[Q]["jobs"][number],
>(
  queueName: Q,
  processor?: string | URL | null | Processor<DataType, ResultType, NameType>,
  opts?: Omit<WorkerOptions, "connection">,
): Worker<DataType, ResultType, NameType> => {
  const worker = new Worker<DataType, ResultType, NameType>(queueName, processor, {
    connection: redis,
    ...opts,
  });

  workerLogger.debug({ worker: queueName }, `Worker for queue ${queueName} started`);

  return worker;
};
