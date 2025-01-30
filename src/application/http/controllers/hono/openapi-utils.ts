import type { ResolverResult } from "hono-openapi";
import { resolver } from "hono-openapi/zod";
import type { OpenAPIV3 } from "openapi-types";
import { type ZodSchema, z } from "zod";

export const openApiJsonResponse = <S extends ZodSchema>(
  statusCode: number,
  schema: S,
  { description }: { description?: string } = {},
) => {
  return {
    [statusCode]: {
      description: description ?? "Default response",
      content: {
        "application/json": {
          schema: resolver(schema),
        },
      },
    },
  };
};

type OpenApiMediaTypeObjectWithResolverResult = Omit<OpenAPIV3.MediaTypeObject, "schema"> & {
  schema?: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject | ResolverResult;
};

type OpenApiResponseTypeWithResolverResult = OpenAPIV3.ResponseObject & {
  content?: {
    [key: string]: Omit<OpenAPIV3.MediaTypeObject, "schema"> & {
      schema?: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject | ResolverResult;
    };
  };
};

const authenticationErrorResponseCodes = [400, 401, 403, 500] as const;
type AuthenticationErrorResponseCodes = (typeof authenticationErrorResponseCodes)[number];

export const openApiDefaultErrorResponses = <C extends number>(
  statusCodes: C[],
  addCommonAuthenticationErrors = true,
) => {
  return [...statusCodes, ...(addCommonAuthenticationErrors ? authenticationErrorResponseCodes : [])].reduce(
    (obj, statusCode) => {
      let content:
        | {
            [media: string]: OpenApiMediaTypeObjectWithResolverResult;
          }
        | undefined = undefined;
      switch (statusCode) {
        case 422:
          // Zod validation issues
          content = {
            "application/json": {
              schema: resolver(
                z.object({
                  issues: z.array(z.any()),
                }),
              ),
            },
          };
          break;
        case 500:
          content = undefined;
          break;
        default:
          content = {
            "text/plain": {
              schema: {
                type: "string",
              },
            },
          };
      }

      obj[`${statusCode}`] = {
        // TODO improve that
        description: "",
        content,
      };
      return obj;
    },
    {} as { [K in `${C | AuthenticationErrorResponseCodes}`]: OpenApiResponseTypeWithResolverResult },
  );
};
