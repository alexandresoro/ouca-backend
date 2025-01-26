import type { ImportStatus } from "@domain/import/import-status.js";
import { startWorker } from "@infrastructure/bullmq/worker.js";
import type { ImportService } from "../../services/import/import-service.js";

const SANDBOXED_WORKER_PATH = new URL("./import-worker-sandboxed.ts", import.meta.url);

type WorkerImportDependencies = {
  importService: ImportService;
};

export const startImportWorker = ({ importService }: WorkerImportDependencies): void => {
  const importWorker = startWorker("import", SANDBOXED_WORKER_PATH as URL, {
    useWorkerThreads: false,
  });

  importWorker.on("progress", (_, progress) => {
    // if (job.id) {
    //   void job.extendLock(job.id, 1000 * 60); // Extend lock for 1 minute after each progress update
    // }
    void importService.writeImportStatus(progress as ImportStatus);
  });
};
