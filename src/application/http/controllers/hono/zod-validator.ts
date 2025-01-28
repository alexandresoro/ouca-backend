import type { ValidationTargets } from "hono";
import { validator } from "hono-openapi/zod";
import type { ZodSchema } from "zod";

export const zodValidator = <T extends ZodSchema, Target extends keyof ValidationTargets>(target: Target, schema: T) =>
  validator(target, schema, (result, c) => {
    if (!result.success) {
      return c.json({ issues: result.error.issues }, 422);
    }
  });
