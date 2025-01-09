import { z } from "zod";

export const entityInfoSchema = z.object({
  canBeDeleted: z.boolean(),
  ownEntriesCount: z.number(),
});
