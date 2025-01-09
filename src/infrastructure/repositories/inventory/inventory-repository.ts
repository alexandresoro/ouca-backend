import {
  type Inventory,
  type InventoryCreateInput,
  type InventoryFindManyInput,
  inventorySchema,
} from "@domain/inventory/inventory.js";
import { kysely } from "@infrastructure/kysely/kysely.js";
import { type Expression, type OperandExpression, type SqlBool, sql } from "kysely";
import { nanoid } from "nanoid";
import { z } from "zod";
import { areSetsContainingSameValues } from "../../../utils/utils.js";
import { countSchema } from "../common.js";
import { reshapeRawInventory } from "./inventory-repository-reshape.js";

const findInventoryById = async (id: string): Promise<Inventory | null> => {
  const inventoryResult = await kysely
    .selectFrom("inventaire")
    .leftJoin("inventaire_associe", "inventaire.id", "inventaire_associe.inventaireId")
    .leftJoin("inventaire_meteo", "inventaire.id", "inventaire_meteo.inventaireId")
    .select([
      "id",
      sql<string>`inventaire.observateur_id::text`.as("observateurId"),
      "date",
      "heure",
      "duree",
      sql<string>`lieudit_id::text`.as("lieuditId"),
      "altitude",
      "longitude",
      "latitude",
      "temperature",
      "dateCreation",
      "ownerId",
      sql<string[]>`array_remove(array_agg(inventaire_associe.observateur_id::text), NULL)`.as("associateIds"),
      sql<string[]>`array_remove(array_agg(inventaire_meteo.meteo_id::text), NULL)`.as("weatherIds"),
    ])
    .where("id", "=", id)
    .groupBy("inventaire.id")
    .executeTakeFirst();

  return inventoryResult ? inventorySchema.parse(reshapeRawInventory(inventoryResult)) : null;
};

const findInventoryByEntryId = async (entryId: string): Promise<Inventory | null> => {
  const inventoryResult = await kysely
    .selectFrom("inventaire")
    .leftJoin("donnee", "inventaire.id", "donnee.inventaireId")
    .leftJoin("inventaire_associe", "inventaire.id", "inventaire_associe.inventaireId")
    .leftJoin("inventaire_meteo", "inventaire.id", "inventaire_meteo.inventaireId")
    .select([
      "inventaire.id",
      sql<string>`inventaire.observateur_id::text`.as("observateurId"),
      "inventaire.date",
      "inventaire.heure",
      "inventaire.duree",
      sql<string>`inventaire.lieudit_id::text`.as("lieuditId"),
      "inventaire.altitude",
      "inventaire.longitude",
      "inventaire.latitude",
      "inventaire.temperature",
      "inventaire.dateCreation",
      "inventaire.ownerId",
      sql<string[]>`array_remove(array_agg(inventaire_associe.observateur_id::text), NULL)`.as("associateIds"),
      sql<string[]>`array_remove(array_agg(inventaire_meteo.meteo_id::text), NULL)`.as("weatherIds"),
    ])
    .where("donnee.id", "=", entryId)
    .groupBy("inventaire.id")
    .executeTakeFirst();

  return inventoryResult ? inventorySchema.parse(reshapeRawInventory(inventoryResult)) : null;
};

const findInventoryIndex = async (
  id: string,
  {
    // biome-ignore lint/correctness/noUnusedVariables: <explanation>
    orderBy,
    sortOrder,
    ownerId,
  }: {
    orderBy: NonNullable<InventoryFindManyInput["orderBy"]>;
    sortOrder: NonNullable<InventoryFindManyInput["sortOrder"]>;
    ownerId: string | null;
  },
): Promise<number | null> => {
  const orderByIdentifier = "date_creation";

  const indexResult = await kysely
    .selectFrom((eb) =>
      eb
        .selectFrom("inventaire")
        .select([
          "id",
          sql`ROW_NUMBER() OVER ( ORDER BY ${sql.ref(orderByIdentifier)} ${sql.raw(sortOrder)} )`.as("index"),
        ])
        .where((ebWhere) => {
          const filters: Expression<SqlBool>[] = [];

          if (ownerId != null) {
            filters.push(ebWhere("inventaire.ownerId", "=", ownerId));
          }

          return ebWhere.and(filters);
        })
        .as("result"),
    )
    .select("result.index")
    .where("result.id", "=", id)
    .executeTakeFirst();

  return indexResult ? z.object({ index: z.coerce.number() }).parse(indexResult).index : null;
};

const findInventories = async ({
  orderBy,
  sortOrder,
  offset,
  limit,
  ownerId,
}: InventoryFindManyInput = {}): Promise<Inventory[]> => {
  let queryInventories = kysely
    .selectFrom("inventaire")
    .leftJoin("inventaire_associe", "inventaire.id", "inventaire_associe.inventaireId")
    .leftJoin("inventaire_meteo", "inventaire.id", "inventaire_meteo.inventaireId")
    .select([
      "id",
      sql<string>`inventaire.observateur_id::text`.as("observateurId"),
      "date",
      "heure",
      "duree",
      sql<string>`lieudit_id::text`.as("lieuditId"),
      "altitude",
      "longitude",
      "latitude",
      "temperature",
      "dateCreation",
      "ownerId",
      sql<string[]>`array_remove(array_agg(inventaire_associe.observateur_id::text), NULL)`.as("associateIds"),
      sql<string[]>`array_remove(array_agg(inventaire_meteo.meteo_id::text), NULL)`.as("weatherIds"),
    ]);

  if (ownerId != null) {
    queryInventories = queryInventories.where("ownerId", "=", ownerId);
  }

  if (orderBy != null) {
    const orderByIdentifier = "dateCreation";
    queryInventories = queryInventories.orderBy(orderByIdentifier, sortOrder ?? undefined);
  }

  if (offset != null) {
    queryInventories = queryInventories.offset(offset);
  }

  if (limit != null) {
    queryInventories = queryInventories.limit(limit);
  }

  const rawInventories = await queryInventories.groupBy("inventaire.id").execute();

  return z.array(inventorySchema).parse(rawInventories.map((rawInventory) => reshapeRawInventory(rawInventory)));
};

const findExistingInventory = async (criteria: InventoryCreateInput): Promise<Inventory | null> => {
  const inventoryResultWithoutLinks = await kysely
    .selectFrom("inventaire")
    .leftJoin("inventaire_associe", "inventaire.id", "inventaire_associe.inventaireId")
    .leftJoin("inventaire_meteo", "inventaire.id", "inventaire_meteo.inventaireId")
    .select([
      "inventaire.id",
      sql<string>`inventaire.observateur_id::text`.as("observateurId"),
      "inventaire.date",
      "inventaire.heure",
      "inventaire.duree",
      sql<string>`inventaire.lieudit_id::text`.as("lieuditId"),
      "inventaire.altitude",
      "inventaire.longitude",
      "inventaire.latitude",
      "inventaire.temperature",
      "inventaire.dateCreation",
      "inventaire.ownerId",
      sql<string[]>`array_remove(array_agg(inventaire_associe.observateur_id::text), NULL)`.as("associateIds"),
      sql<string[]>`array_remove(array_agg(inventaire_meteo.meteo_id::text), NULL)`.as("weatherIds"),
    ])
    .where((eb) => {
      const clause: OperandExpression<SqlBool>[] = [];

      clause.push(eb("inventaire.observateurId", "=", Number.parseInt(criteria.observerId)));
      clause.push(eb("inventaire.date", "=", new Date(criteria.date)));

      if (criteria.time != null) {
        clause.push(eb("inventaire.heure", "=", criteria.time));
      } else {
        clause.push(eb("inventaire.heure", "is", null));
      }

      if (criteria.duration != null) {
        clause.push(eb("inventaire.duree", "=", criteria.duration));
      } else {
        clause.push(eb("inventaire.duree", "is", null));
      }

      clause.push(eb("inventaire.lieuditId", "=", Number.parseInt(criteria.localityId)));

      if (criteria.customizedCoordinates?.altitude != null) {
        clause.push(eb("inventaire.altitude", "=", criteria.customizedCoordinates.altitude));
      } else {
        clause.push(eb("inventaire.altitude", "is", null));
      }

      if (criteria.customizedCoordinates?.longitude != null) {
        clause.push(eb("inventaire.longitude", "=", criteria.customizedCoordinates.longitude));
      } else {
        clause.push(eb("inventaire.longitude", "is", null));
      }

      if (criteria.customizedCoordinates?.latitude != null) {
        clause.push(eb("inventaire.latitude", "=", criteria.customizedCoordinates.latitude));
      } else {
        clause.push(eb("inventaire.latitude", "is", null));
      }

      if (criteria.temperature != null) {
        clause.push(eb("inventaire.temperature", "=", criteria.temperature));
      } else {
        clause.push(eb("inventaire.temperature", "is", null));
      }

      return eb.and(clause);
    })
    .groupBy("inventaire.id")
    .execute();

  if (inventoryResultWithoutLinks.length === 0) {
    return null;
  }

  const inventoryResult = inventoryResultWithoutLinks.filter((inventory) => {
    return (
      areSetsContainingSameValues(new Set(inventory.associateIds), new Set(criteria.associateIds)) &&
      areSetsContainingSameValues(new Set(inventory.weatherIds), new Set(criteria.weatherIds))
    );
  });

  if (inventoryResult.length === 0) {
    return null;
  }

  return inventorySchema.parse(reshapeRawInventory(inventoryResult[0]));
};

const getCount = async ({ ownerId }: { ownerId: string | null }): Promise<number> => {
  let queryCount = kysely.selectFrom("inventaire").select((eb) => eb.fn.countAll().as("count"));

  if (ownerId != null) {
    queryCount = queryCount.where("ownerId", "=", ownerId);
  }

  const countResult = await queryCount.executeTakeFirstOrThrow();

  return countSchema.parse(countResult).count;
};

const getEntriesCountById = async (id: string): Promise<number> => {
  const countResult = await kysely
    .selectFrom("donnee")
    .select((eb) => eb.fn.countAll().as("count"))
    .where("inventaireId", "=", id)
    .executeTakeFirstOrThrow();

  return countSchema.parse(countResult).count;
};

const getCountByLocality = async (localityId: string): Promise<number> => {
  const countResult = await kysely
    .selectFrom("inventaire")
    .select((eb) => eb.fn.countAll().as("count"))
    .where("inventaire.lieuditId", "=", Number.parseInt(localityId))
    .executeTakeFirstOrThrow();

  return countSchema.parse(countResult).count;
};

const createInventory = async (inventoryInput: InventoryCreateInput): Promise<Inventory> => {
  const createdInventory = await kysely.transaction().execute(async (trx) => {
    const inventoryResult = await trx
      .insertInto("inventaire")
      .values({
        id: nanoid(12),
        observateurId: Number.parseInt(inventoryInput.observerId),
        date: new Date(inventoryInput.date),
        heure: inventoryInput.time,
        duree: inventoryInput.duration,
        lieuditId: Number.parseInt(inventoryInput.localityId),
        altitude: inventoryInput.customizedCoordinates?.altitude,
        longitude: inventoryInput.customizedCoordinates?.longitude,
        latitude: inventoryInput.customizedCoordinates?.latitude,
        temperature: inventoryInput.temperature,
        dateCreation: new Date(),
        ownerId: inventoryInput.ownerId,
      })
      .returning([
        "id",
        sql<string>`observateur_id::text`.as("observateurId"),
        "date",
        "heure",
        "duree",
        sql<string>`lieudit_id::text`.as("lieuditId"),
        "altitude",
        "longitude",
        "latitude",
        "temperature",
        "dateCreation",
        "ownerId",
      ])
      .executeTakeFirstOrThrow();

    let associateIdsResult: { observateurId: string }[] = [];
    if (inventoryInput.associateIds.length) {
      associateIdsResult = await trx
        .insertInto("inventaire_associe")
        .values(
          inventoryInput.associateIds.map((associateId) => {
            return { inventaireId: inventoryResult.id, observateurId: Number.parseInt(associateId) };
          }),
        )
        .returning(sql<string>`inventaire_associe.observateur_id::text`.as("observateurId"))
        .execute();
    }

    let weatherIdsResult: { meteoId: string }[] = [];
    if (inventoryInput.weatherIds.length) {
      weatherIdsResult = await trx
        .insertInto("inventaire_meteo")
        .values(
          inventoryInput.weatherIds.map((weatherId) => {
            return { inventaireId: inventoryResult.id, meteoId: Number.parseInt(weatherId) };
          }),
        )
        .returning(sql<string>`inventaire_meteo.meteo_id::text`.as("meteoId"))
        .execute();
    }

    return {
      ...inventoryResult,
      associateIds: associateIdsResult.map((associateId) => associateId.observateurId),
      weatherIds: weatherIdsResult.map((weatherId) => weatherId.meteoId),
    };
  });

  return inventorySchema.parse(reshapeRawInventory(createdInventory));
};

const updateInventory = async (inventoryId: string, inventoryInput: InventoryCreateInput): Promise<Inventory> => {
  const updatedInventory = await kysely.transaction().execute(async (trx) => {
    const inventoryResult = await trx
      .updateTable("inventaire")
      .set({
        observateurId: Number.parseInt(inventoryInput.observerId),
        date: new Date(inventoryInput.date),
        heure: inventoryInput.time,
        duree: inventoryInput.duration,
        lieuditId: Number.parseInt(inventoryInput.localityId),
        altitude: inventoryInput.customizedCoordinates?.altitude,
        longitude: inventoryInput.customizedCoordinates?.longitude,
        latitude: inventoryInput.customizedCoordinates?.latitude,
        temperature: inventoryInput.temperature,
        ownerId: inventoryInput.ownerId,
      })
      .where("id", "=", inventoryId)
      .returning([
        "id",
        sql<string>`observateur_id::text`.as("observateurId"),
        "date",
        "heure",
        "duree",
        sql<string>`lieudit_id::text`.as("lieuditId"),
        "altitude",
        "longitude",
        "latitude",
        "temperature",
        "dateCreation",
        "ownerId",
      ])
      .executeTakeFirstOrThrow();

    await kysely.deleteFrom("inventaire_associe").where("inventaireId", "=", inventoryId).execute();

    let associateIdsResult: { observateurId: string }[] = [];
    if (inventoryInput.associateIds.length) {
      associateIdsResult = await trx
        .insertInto("inventaire_associe")
        .values(
          inventoryInput.associateIds.map((associateId) => {
            return { inventaireId: inventoryResult.id, observateurId: Number.parseInt(associateId) };
          }),
        )
        .returning(sql<string>`inventaire_associe.observateur_id::text`.as("observateurId"))
        .execute();
    }

    await kysely.deleteFrom("inventaire_meteo").where("inventaireId", "=", inventoryId).execute();

    let weatherIdsResult: { meteoId: string }[] = [];
    if (inventoryInput.weatherIds.length) {
      weatherIdsResult = await trx
        .insertInto("inventaire_meteo")
        .values(
          inventoryInput.weatherIds.map((weatherId) => {
            return { inventaireId: inventoryResult.id, meteoId: Number.parseInt(weatherId) };
          }),
        )
        .returning(sql<string>`inventaire_meteo.meteo_id::text`.as("meteoId"))
        .execute();
    }

    return {
      ...inventoryResult,
      associateIds: associateIdsResult.map((associateId) => associateId.observateurId),
      weatherIds: weatherIdsResult.map((weatherId) => weatherId.meteoId),
    };
  });

  return inventorySchema.parse(reshapeRawInventory(updatedInventory));
};

const deleteInventoryById = async (inventoryId: string): Promise<Inventory | null> => {
  const associateIdsResult = await kysely
    .selectFrom("inventaire_associe")
    .select(sql<string>`observateur_id::text`.as("observateurId"))
    .where("inventaireId", "=", inventoryId)
    .execute();

  const weatherIdsResult = await kysely
    .selectFrom("inventaire_meteo")
    .select(sql<string>`meteo_id::text`.as("meteoId"))
    .where("inventaireId", "=", inventoryId)
    .execute();

  const deletedInventory = await kysely
    .deleteFrom("inventaire")
    .where("id", "=", inventoryId)
    .returning([
      "id",
      sql<string>`observateur_id::text`.as("observateurId"),
      "date",
      "heure",
      "duree",
      sql<string>`lieudit_id::text`.as("lieuditId"),
      "altitude",
      "longitude",
      "latitude",
      "temperature",
      "dateCreation",
      "ownerId",
    ])
    .executeTakeFirst();

  return deletedInventory
    ? inventorySchema.parse(
        reshapeRawInventory({
          ...deletedInventory,
          associateIds: associateIdsResult.map((associateId) => associateId.observateurId),
          weatherIds: weatherIdsResult.map((weatherId) => weatherId.meteoId),
        }),
      )
    : null;
};

export const inventoryRepository = {
  findInventoryById,
  findInventoryByEntryId,
  findInventoryIndex,
  findInventories,
  findExistingInventory,
  getCount,
  getEntriesCountById,
  getCountByLocality,
  createInventory,
  updateInventory,
  deleteInventoryById,
};
