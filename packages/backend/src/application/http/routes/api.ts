import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { upsertAgeInput } from "@ou-ca/common/api/age";
import { upsertBehaviorInput } from "@ou-ca/common/api/behavior";
import { upsertDepartmentInput } from "@ou-ca/common/api/department";
import { upsertDistanceEstimateInput } from "@ou-ca/common/api/distance-estimate";
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
import { upsertEntryInput } from "@ou-ca/common/api/entry";
import { upsertEnvironmentInput } from "@ou-ca/common/api/environment";
import { upsertInventoryInput } from "@ou-ca/common/api/inventory";
import { upsertLocalityInput } from "@ou-ca/common/api/locality";
import { upsertNumberEstimateInput } from "@ou-ca/common/api/number-estimate";
import { upsertObserverInput } from "@ou-ca/common/api/observer";
import { upsertSexInput } from "@ou-ca/common/api/sex";
import { upsertSpeciesInput } from "@ou-ca/common/api/species";
import { upsertClassInput } from "@ou-ca/common/api/species-class";
import { upsertTownInput } from "@ou-ca/common/api/town";
import { upsertWeatherInput } from "@ou-ca/common/api/weather";
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
import { userController } from "../controllers/user-controller.js";
import { apiV1Routes } from "./api-v1-routes.js";

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
        // biome-ignore lint/style/useNamingConvention: <explanation>
        UpsertAgeInput: upsertAgeInput,
        // biome-ignore lint/style/useNamingConvention: <explanation>
        UpsertBehaviorInput: upsertBehaviorInput,
        // biome-ignore lint/style/useNamingConvention: <explanation>
        UpsertDepartmentInput: upsertDepartmentInput,
        // biome-ignore lint/style/useNamingConvention: <explanation>=
        UpsertDistanceEstimateInput: upsertDistanceEstimateInput,
        // biome-ignore lint/style/useNamingConvention: <explanation>
        UpsertEntryInput: upsertEntryInput,
        // biome-ignore lint/style/useNamingConvention: <explanation>
        UpsertEnvironmentInput: upsertEnvironmentInput,
        // biome-ignore lint/style/useNamingConvention: <explanation>
        UpsertInventoryInput: upsertInventoryInput,
        // biome-ignore lint/style/useNamingConvention: <explanation>
        UpsertLocalityInput: upsertLocalityInput,
        // biome-ignore lint/style/useNamingConvention: <explanation>
        UpsertNumberEstimateInput: upsertNumberEstimateInput,
        // biome-ignore lint/style/useNamingConvention: <explanation>
        UpsertObserverInput: upsertObserverInput,
        // biome-ignore lint/style/useNamingConvention: <explanation>
        UpsertSexInput: upsertSexInput,
        // biome-ignore lint/style/useNamingConvention: <explanation>
        UpsertSpeciesInput: upsertSpeciesInput,
        // biome-ignore lint/style/useNamingConvention: <explanation>
        UpsertSpeciesClassInput: upsertClassInput,
        // biome-ignore lint/style/useNamingConvention: <explanation>
        UpsertTownInput: upsertTownInput,
        // biome-ignore lint/style/useNamingConvention: <explanation>
        UpsertWeatherInput: upsertWeatherInput,
      },
    }),
  });

  // OpenAPI spec for API
  await fastify.register(fastifySwaggerUi);

  await fastify.register(apiV1Routes, { services, prefix: V1_PREFIX });
  await fastify.register(userController, { services, prefix: `${V1_PREFIX}/user` });
  logger.debug("Fastify API routes registered");
};
