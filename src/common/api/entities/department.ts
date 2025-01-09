import { z } from "zod";

export const departmentSchema = z.object({
  id: z.string(),
  code: z.string(),
  ownerId: z.string().uuid().nullable(),
});

export type Department = z.infer<typeof departmentSchema>;
