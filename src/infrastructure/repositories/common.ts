import { z } from "zod";

export const countSchema = z.object({
  count: z.coerce.number(),
});
