import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { ageSchema } from "@ou-ca/common/api/entities/age";
import { behaviorSchema } from "@ou-ca/common/api/entities/behavior";
import { coordinatesSchema } from "@ou-ca/common/api/entities/coordinates";
import { departmentSchema } from "@ou-ca/common/api/entities/department";
import { distanceEstimateSchema } from "@ou-ca/common/api/entities/distance-estimate";
import { entrySchema } from "@ou-ca/common/api/entities/entry";
import { environmentSchema } from "@ou-ca/common/api/entities/environment";
import { inventorySchema } from "@ou-ca/common/api/entities/inventory";
import { localitySchema } from "@ou-ca/common/api/entities/locality";
import { numberEstimateSchema } from "@ou-ca/common/api/entities/number-estimate";
import { observerSchema } from "@ou-ca/common/api/entities/observer";
import { sexSchema } from "@ou-ca/common/api/entities/sex";
import { speciesSchema } from "@ou-ca/common/api/entities/species";
import { speciesClassSchema } from "@ou-ca/common/api/entities/species-class";
import { townSchema } from "@ou-ca/common/api/entities/town";
import { weatherSchema } from "@ou-ca/common/api/entities/weather";
import type { FastifyPluginAsync } from "fastify";
import {
  createJsonSchemaTransformObject,
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { ZodError } from "zod";
import { logger as loggerParent } from "../../../utils/logger.js";
import type { Services } from "../../services/services.js";
import { apiV1Routes } from "../api-routes.js";
import { userController } from "../controllers/user-controller.js";

const logger = loggerParent.child({ module: "fastify" });

const V1_PREFIX = "/v1";

export const apiRoutes: FastifyPluginAsync<{ services: Services }> = async (fastify, { services }) => {
  // Zod type provider
  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  fastify.setErrorHandler((error, _, reply) => {
    if (error instanceof ZodError) {
      // Treat validation errors as HTTP 422
      reply.status(fastify.httpErrors.unprocessableEntity().statusCode).send({
        statusCode: fastify.httpErrors.unprocessableEntity().statusCode,
        error: fastify.httpErrors.unprocessableEntity().message,
        issues: error.issues,
      });
      return;
    }

    reply.send(error);
  });

  // OpenAPI spec
  await fastify.register(fastifySwagger, {
    openapi: {
      openapi: "3.1.1",
      info: {
        title: "Ou ca API",
        version: "1.0.0",
        description: "",
      },
      components: {
        securitySchemes: {
          token: {
            type: "http",
            scheme: "bearer",
          },
        },
      },
    },
    transform: jsonSchemaTransform,
    transformObject: createJsonSchemaTransformObject({
      schemas: {
        // biome-ignore lint/style/useNamingConvention: <explanation>
        Age: ageSchema,
        // biome-ignore lint/style/useNamingConvention: <explanation>
        Behavior: behaviorSchema,
        // biome-ignore lint/style/useNamingConvention: <explanation>
        Coordinates: coordinatesSchema,
        // biome-ignore lint/style/useNamingConvention: <explanation>
        Department: departmentSchema,
        // biome-ignore lint/style/useNamingConvention: <explanation>=
        DistanceEstimate: distanceEstimateSchema,
        // biome-ignore lint/style/useNamingConvention: <explanation>
        Entry: entrySchema,
        // biome-ignore lint/style/useNamingConvention: <explanation>
        Environment: environmentSchema,
        // biome-ignore lint/style/useNamingConvention: <explanation>
        Inventory: inventorySchema,
        // biome-ignore lint/style/useNamingConvention: <explanation>
        Locality: localitySchema,
        // biome-ignore lint/style/useNamingConvention: <explanation>
        NumberEstimate: numberEstimateSchema,
        // biome-ignore lint/style/useNamingConvention: <explanation>
        Observer: observerSchema,
        // biome-ignore lint/style/useNamingConvention: <explanation>
        Sex: sexSchema,
        // biome-ignore lint/style/useNamingConvention: <explanation>
        Species: speciesSchema,
        // biome-ignore lint/style/useNamingConvention: <explanation>
        SpeciesClass: speciesClassSchema,
        // biome-ignore lint/style/useNamingConvention: <explanation>
        Town: townSchema,
        // biome-ignore lint/style/useNamingConvention: <explanation>
        Weather: weatherSchema,
      },
    }),
  });

  // OpenAPI spec for API
  await fastify.register(fastifySwaggerUi);

  await fastify.register(apiV1Routes, { services, prefix: V1_PREFIX });
  await fastify.register(userController, { services, prefix: `${V1_PREFIX}/user` });
  logger.debug("Fastify API routes registered");
};
