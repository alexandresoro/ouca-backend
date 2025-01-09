import { z } from "zod";

export const importStatusSchema = z
  .union([
    z.object({
      status: z.literal("notStarted"),
    }),
    z.object({
      status: z.literal("ongoing"),
      step: z.enum(["processStarted", "importRetrieved", "retrievingRequiredData"]),
    }),
    z.object({
      status: z.literal("ongoing"),
      step: z.enum(["validatingInputFile", "insertingImportedData"]),
      totalLinesInFile: z.number(),
      validEntries: z.number(),
      validatedEntries: z.number(),
      errors: z.array(z.array(z.string())),
    }),
    z.object({
      status: z.literal("completed"),
      totalLinesInFile: z.number(),
      validEntries: z.number(),
      validatedEntries: z.number(),
      errors: z.array(z.array(z.string())),
    }),
    z.object({
      status: z.literal("failed"),
      reason: z.string(),
    }),
  ])
  .and(
    z.object({
      importId: z.string(),
      userId: z.string(),
    }),
  );

export type ImportStatus = z.infer<typeof importStatusSchema>;
