import type { Queues } from "@infrastructure/bullmq/queues.js";

export const startRecurringJobs = async (queues: Queues): Promise<void> => {
  const { geojson } = queues;

  // Trigger a recurring job to refresh the GeoJSON data every 5 minutes
  await geojson.add("geojsonrefresh", undefined, {
    removeOnComplete: true,
    repeat: {
      every: 300000,
    },
  });
};
