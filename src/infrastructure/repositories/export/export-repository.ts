import { randomUUID } from "node:crypto";
import { redis } from "@infrastructure/ioredis/redis.js";
import { writeExcelToBuffer } from "../../../utils/export-excel-utils.js";

const EXPORT_ENTITY_RESULT_PREFIX = "exportEntity";

const getExport = async (exportId: string): Promise<Buffer | null> => {
  return redis.getBuffer(`${EXPORT_ENTITY_RESULT_PREFIX}:${exportId}`);
};

const storeExport = async (entitiesToExport: Record<string, unknown>[], sheetName: string): Promise<string> => {
  const exportArrayBuffer = await writeExcelToBuffer(entitiesToExport, sheetName);
  const exportBuffer = Buffer.from(exportArrayBuffer);

  const id = randomUUID();
  const redisKey = `${EXPORT_ENTITY_RESULT_PREFIX}:${id}`;
  await redis.set(redisKey, exportBuffer, "EX", 600);

  return id;
};

export const exportRepository = {
  getExport,
  storeExport,
};
