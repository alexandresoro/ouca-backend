import { z } from "zod";
import "zod-openapi/extend";

export const departmentSchema = z
  .object({
    id: z.string(),
    code: z.string(),
    ownerId: z.string().uuid().nullable(),
  })
  .openapi({ ref: "Department" });
