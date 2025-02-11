import { z } from "zod";

export const idParamAsNumberSchema = z.object({
  id: z.coerce.number(),
});

export const idParamSchema = z.object({
  id: z.string().nonempty(),
});
