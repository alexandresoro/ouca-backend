import { startWorker, workerLogger } from "@infrastructure/bullmq/worker.js";
import type { GeoJSONService } from "../../services/locality/geojson-service.js";

const GEOJSON_QUEUE_NAME = "geojson";

type WorkerGeoJSONDependencies = {
  geojsonService: GeoJSONService;
};

export const startGeoJSONWorker = ({ geojsonService }: WorkerGeoJSONDependencies): void => {
  startWorker(
    "geojson",
    async (job) => {
      workerLogger.debug({ worker: GEOJSON_QUEUE_NAME, job: job.name }, `Job ${job.name} received`);

      switch (job.name) {
        case "geojsonrefresh":
          await geojsonService.updateGeoJSONData();
          break;
        default:
          break;
      }
    },
    {
      limiter: {
        max: 5,
        duration: 30000,
      },
    },
  );
};
