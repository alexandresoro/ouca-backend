import type { ImportStatus } from "@domain/import/import-status.js";
import type { ImportType } from "@domain/import/import-type.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import { workerLogger } from "@infrastructure/bullmq/worker.js";
import type { SandboxedJob } from "bullmq";
import { getNewImportServiceForRequestType } from "../../services/import/entities/import-service-per-request-type.js";
import { buildServices } from "../../services/services.js";

const IMPORT_QUEUE_NAME = "import";

type ImportJobData = {
  uploadId: string;
  entityName: ImportType;
  loggedUser: LoggedUser;
};

// biome-ignore lint/style/noDefaultExport: <explanation>
export default async (job: SandboxedJob<ImportJobData>) => {
  workerLogger.debug({ worker: IMPORT_QUEUE_NAME, job: job.name }, `Job ${job.name} received`);

  const { uploadId, entityName, loggedUser } = job.data;

  workerLogger.info(
    { worker: IMPORT_QUEUE_NAME, job: job.name, uploadId, entityName, userId: loggedUser.id },
    "Processing import job",
  );

  const services = buildServices();
  const importService = getNewImportServiceForRequestType(entityName, services);

  await services.importService.writeImportStatus({
    importId: uploadId,
    userId: loggedUser.id,
    status: "notStarted",
  } satisfies ImportStatus);

  await importService.importFile(uploadId, loggedUser, job);
};
