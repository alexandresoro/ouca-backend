import { z } from "zod";

export const idParamAsNumberSchema = z.object({
  id: z.coerce.number(),
});

export const idParamSchema = z.object({
  id: z.string().nonempty(),
});

export const fastifyDefaultErrorResponseSchema = (statusCode: number) =>
  z.object({
    statusCode: z.literal(statusCode),
    error: z.string(),
    message: z.string(),
  });

export type FastifyDefaultErrorResponseSchema = ReturnType<typeof fastifyDefaultErrorResponseSchema>;

export const buildFastifyDefaultErrorResponses = <C extends number>(
  statusCodes: C[],
): { [K in C]: FastifyDefaultErrorResponseSchema } => {
  return Object.fromEntries(
    statusCodes.map((statusCode) => {
      return [statusCode, fastifyDefaultErrorResponseSchema(statusCode)] as const;
    }),
    // cast as unknown because fromEntries will return as string key
  ) as unknown as { [K in C]: FastifyDefaultErrorResponseSchema };
};
