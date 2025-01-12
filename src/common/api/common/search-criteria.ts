import { BREEDER_CODES } from "@domain/behavior/breeder.js";
import { z } from "zod";

export const getSearchCriteriaParamsSchema = z.object({
  entryId: z.string().optional(),
  inventoryId: z.string().optional(),
  observerIds: z.union([z.array(z.string()), z.string().transform((value) => [value])]).optional(),
  temperature: z.number().optional(),
  weatherIds: z.union([z.array(z.string()), z.string().transform((value) => [value])]).optional(),
  associateIds: z.union([z.array(z.string()), z.string().transform((value) => [value])]).optional(),
  time: z.string().optional(),
  duration: z.string().optional(),
  classIds: z.union([z.array(z.string()), z.string().transform((value) => [value])]).optional(),
  speciesIds: z.union([z.array(z.string()), z.string().transform((value) => [value])]).optional(),
  departmentIds: z.union([z.array(z.string()), z.string().transform((value) => [value])]).optional(),
  townIds: z.union([z.array(z.string()), z.string().transform((value) => [value])]).optional(),
  localityIds: z.union([z.array(z.string()), z.string().transform((value) => [value])]).optional(),
  number: z.number().optional(),
  numberEstimateIds: z.union([z.array(z.string()), z.string().transform((value) => [value])]).optional(),
  sexIds: z.union([z.array(z.string()), z.string().transform((value) => [value])]).optional(),
  ageIds: z.union([z.array(z.string()), z.string().transform((value) => [value])]).optional(),
  distance: z.number().optional(),
  distanceEstimateIds: z.union([z.array(z.string()), z.string().transform((value) => [value])]).optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  comment: z.string().optional(),
  breeders: z.union([z.array(z.enum(BREEDER_CODES)), z.enum(BREEDER_CODES).transform((value) => [value])]).optional(),
  behaviorIds: z.union([z.array(z.string()), z.string().transform((value) => [value])]).optional(),
  environmentIds: z.union([z.array(z.string()), z.string().transform((value) => [value])]).optional(),
  fromAllUsers: z
    .preprocess((val) => {
      return typeof val === "string" ? val === "true" : val;
    }, z.coerce.boolean())
    .optional(),
});

export type SearchCriteriaParams = z.infer<typeof getSearchCriteriaParamsSchema>;
