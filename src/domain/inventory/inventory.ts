import type { AccessFailureReason } from "@domain/shared/failure-reason.js";
import { z } from "zod";
import type { SortOrder } from "../shared/sort-order.js";

export type InventoryFailureReason = AccessFailureReason;

export type InventoryUpsertFailureReason =
  | InventoryFailureReason
  | "requiredDataNotFound"
  | {
      inventaireExpectedToBeUpdated: number;
      correspondingInventaireFound: string;
    };

export type InventoryUpdateFailureReason =
  | {
      type: InventoryUpsertFailureReason;
    }
  | {
      type: "similarInventoryAlreadyExists";
      correspondingInventoryFound: string;
    };

export type InventoryDeleteFailureReason = InventoryFailureReason | "inventoryStillInUse";

export const inventorySchema = z.object({
  id: z.string(),
  observerId: z.string(),
  associateIds: z.array(z.string()),
  date: z.date(), // YYYY-MM-DD
  time: z.string().nullable(),
  duration: z.string().nullable(),
  localityId: z.string(),
  customizedCoordinates: z
    .object({
      altitude: z.number(),
      longitude: z.number(),
      latitude: z.number(),
    })
    .nullable(),
  temperature: z.number().nullable(),
  weatherIds: z.array(z.string()),
  creationDate: z.date(),
  ownerId: z.string().uuid().nullable(),
});

export type Inventory = z.infer<typeof inventorySchema>;

export type InventoryFindManyInput = Partial<{
  orderBy: "creationDate" | null;
  sortOrder: SortOrder;
  offset: number | null;
  limit: number | null;
  ownerId: string | null;
}>;

export type InventoryCreateInput = {
  observerId: string;
  associateIds: string[];
  date: string; // YYYY-MM-DD
  time?: string | null;
  duration?: string | null;
  localityId: string;
  customizedCoordinates?: {
    altitude: number;
    longitude: number;
    latitude: number;
  } | null;
  temperature?: number | null;
  weatherIds: string[];
  ownerId?: string | null;
};
