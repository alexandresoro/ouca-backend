import { z } from "zod";

export const idParamAsNumberSchema = z.object({
  id: z.coerce.number(),
});

export const idParamSchema = z.object({
  id: z.string().nonempty(),
});

const fastifyDefaultErrorResponseSchema = (statusCode: number) =>
  z.object({
    statusCode: z.literal(statusCode),
    error: z.string(),
    message: z.string(),
  });

export const buildFastifyDefaultErrorResponses = (
  statusCodes: number[],
): Record<number, ReturnType<typeof fastifyDefaultErrorResponseSchema>> => {
  return Object.fromEntries(
    statusCodes.map((statusCode) => {
      return [statusCode, fastifyDefaultErrorResponseSchema(statusCode)];
    }),
  );
};
