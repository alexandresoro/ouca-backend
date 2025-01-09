import { BREEDER_CODES } from "@domain/behavior/breeder.js";
import type { AccessFailureReason } from "@domain/shared/failure-reason.js";
import { z } from "zod";
import type { SearchCriteria } from "../search/search-criteria.js";
import type { SortOrder } from "../shared/sort-order.js";

export type EntryFailureReason = AccessFailureReason;

export type EntryUpsertFailureReason =
  | {
      type: EntryFailureReason;
    }
  | {
      type: "similarEntryAlreadyExists";
      correspondingEntryFound: string;
    };

export const entrySchema = z.object({
  id: z.string(),
  inventoryId: z.string(),
  speciesId: z.string(),
  sexId: z.string(),
  ageId: z.string(),
  numberEstimateId: z.string(),
  number: z.number().nullable(),
  distanceEstimateId: z.string().nullable(),
  distance: z.number().nullable(),
  behaviorIds: z.array(z.string()),
  environmentIds: z.array(z.string()),
  comment: z.string().nullable(),
  creationDate: z.date(),
});

export type Entry = z.infer<typeof entrySchema>;

export type EntryFindManyInput = Partial<{
  searchCriteria: SearchCriteria | null | undefined;
  orderBy:
    | "number"
    | "speciesCode"
    | "speciesName"
    | "department"
    | "townCode"
    | "townName"
    | "locality"
    | "date"
    | "time"
    | "duration"
    | "observerName"
    | "creationDate"
    | null;
  sortOrder: SortOrder;
  offset: number | null;
  limit: number | null;
}>;

export type EntryCreateInput = {
  inventoryId: string;
  speciesId: string;
  sexId: string;
  ageId: string;
  numberEstimateId: string;
  number?: number | null;
  distanceEstimateId?: string | null;
  distance?: number | null;
  behaviorIds: string[];
  environmentIds: string[];
  comment?: string | null;
};

export const entryForExportSchema = z.object({
  id: z.string(),
  observerName: z.string(),
  inventoryDate: z.date(),
  inventoryTime: z.string().nullable(),
  inventoryDuration: z.string().nullable(),
  inventoryAltitude: z.number().nullable(),
  inventoryLatitude: z.number().nullable(),
  inventoryLongitude: z.number().nullable(),
  departmentCode: z.string(),
  townCode: z.number(),
  townName: z.string(),
  localityName: z.string(),
  localityAltitude: z.number(),
  localityLatitude: z.number(),
  localityLongitude: z.number(),
  temperature: z.number().nullable(),
  className: z.string().nullable(),
  speciesCode: z.string(),
  speciesName: z.string(),
  speciesScientificName: z.string(),
  sexName: z.string(),
  ageName: z.string(),
  number: z.number().nullable(),
  numberEstimateName: z.string(),
  distanceEstimateName: z.string().nullable(),
  distance: z.number().nullable(),
  comment: z.string().nullable(),
  behaviors: z.array(z.string()),
  breeders: z.array(z.enum(BREEDER_CODES)),
  environments: z.array(z.string()),
  weathers: z.array(z.string()),
  associates: z.array(z.string()),
});

export type EntryForExport = z.infer<typeof entryForExportSchema>;
