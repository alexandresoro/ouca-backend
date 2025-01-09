import type { Services } from "../services/services.js";
import { startRecurringJobs } from "./recurring-jobs.js";
import { startWorkers } from "./workers.js";

export const startWorkersAndJobs = async (services: Services): Promise<void> => {
  // Start workers
  startWorkers(services);

  // Start recurring jobs
  await startRecurringJobs(services.queues);
};
