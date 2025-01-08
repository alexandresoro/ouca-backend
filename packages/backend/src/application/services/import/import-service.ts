import { randomUUID } from "node:crypto";
import { type ImportStatus, importStatusSchema } from "@domain/import/import-status.js";
import type { ImportType } from "@domain/import/import-type.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import type { Queues } from "@infrastructure/bullmq/queues.js";
import { redis } from "@infrastructure/ioredis/redis.js";
import { logger } from "../../../utils/logger.js";

const IMPORT_STATUS_KEY_PREFIX = "importStatus";

export const UPLOADS_KEY_PREFIX = "uploads";

const UPLOAD_DATA_EXPIRATION = 3600; // 1h

const IMPORT_STATUS_DATA_EXPIRATION = 86400; // 1d

type ImportServiceDependencies = {
  importQueue: Queues["import"];
};

export const buildImportService = ({ importQueue }: ImportServiceDependencies) => {
  const createImportJob = async (data: Buffer, entityName: ImportType, loggedUser: LoggedUser): Promise<string> => {
    const uploadId = randomUUID();

    const key = `${UPLOADS_KEY_PREFIX}:${uploadId}`;

    // Store data in cache
    await redis.set(key, data, "EX", UPLOAD_DATA_EXPIRATION);

    // Create import job
    await importQueue.add(
      "import",
      { uploadId, entityName, loggedUser },
      {
        removeOnComplete: true,
      },
    );

    return uploadId;
  };

  const getUploadData = async (uploadId: string): Promise<string | null> => {
    const key = `${UPLOADS_KEY_PREFIX}:${uploadId}`;

    return redis.get(key);
  };

  const getImportStatus = async (importId: string, loggedUser: LoggedUser): Promise<ImportStatus | null> => {
    const key = `${IMPORT_STATUS_KEY_PREFIX}:${loggedUser.id}:${importId}`;

    const statusStr = await redis.get(key);

    return statusStr ? importStatusSchema.parse(JSON.parse(statusStr)) : null;
  };

  const writeImportStatus = async (importStatus: ImportStatus): Promise<void> => {
    logger.debug({ ...importStatus }, "Writing import status");

    const key = `${IMPORT_STATUS_KEY_PREFIX}:${importStatus.userId}:${importStatus.importId}`;

    await redis.set(key, JSON.stringify(importStatus), "EX", IMPORT_STATUS_DATA_EXPIRATION);
  };

  return {
    createImportJob,
    getUploadData,
    getImportStatus,
    writeImportStatus,
  };
};

export type ImportService = ReturnType<typeof buildImportService>;
