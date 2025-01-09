import { type Entry, type EntryCreateInput, type EntryFindManyInput, entrySchema } from "@domain/entry/entry.js";
import type { SearchCriteria } from "@domain/search/search-criteria.js";
import { kysely } from "@infrastructure/kysely/kysely.js";
import { countSchema } from "@infrastructure/repositories/common.js";
import { getOrderByIdentifier } from "@infrastructure/repositories/entry/entry-repository-helper.js";
import { reshapeRawEntry } from "@infrastructure/repositories/entry/entry-repository-reshape.js";
import { withSearchCriteria, withSearchCriteriaMinimal } from "@infrastructure/repositories/search-criteria.js";
import { type OperandExpression, type SqlBool, sql } from "kysely";
import { nanoid } from "nanoid";
import { z } from "zod";
import { areSetsContainingSameValues } from "../../../utils/utils.js";

const findEntryById = async (id: string): Promise<Entry | null> => {
  const entryResult = await kysely
    .selectFrom("donnee")
    .leftJoin("donnee_comportement", "donnee.id", "donnee_comportement.donneeId")
    .leftJoin("donnee_milieu", "donnee.id", "donnee_milieu.donneeId")
    .select([
      "donnee.id",
      "donnee.inventaireId",
      sql<string>`donnee.espece_id::text`.as("especeId"),
      sql<string>`donnee.sexe_id::text`.as("sexeId"),
      sql<string>`donnee.age_id::text`.as("ageId"),
      sql<string>`donnee.estimation_nombre_id::text`.as("estimationNombreId"),
      "nombre",
      sql<string>`donnee.estimation_distance_id::text`.as("estimationDistanceId"),
      "distance",
      "commentaire",
      "dateCreation",
      sql<string[]>`array_remove(array_agg(donnee_comportement.comportement_id::text), NULL)`.as("behaviorIds"),
      sql<string[]>`array_remove(array_agg(donnee_milieu.milieu_id::text), NULL)`.as("environmentIds"),
    ])
    .where("donnee.id", "=", id)
    .groupBy("donnee.id")
    .executeTakeFirst();

  return entryResult ? entrySchema.parse(reshapeRawEntry(entryResult)) : null;
};

const findExistingEntry = async (criteria: EntryCreateInput): Promise<Entry | null> => {
  const entryResultWithoutLinks = await kysely
    .selectFrom("donnee")
    .leftJoin("donnee_comportement", "donnee.id", "donnee_comportement.donneeId")
    .leftJoin("donnee_milieu", "donnee.id", "donnee_milieu.donneeId")
    .select([
      "donnee.id",
      "donnee.inventaireId",
      sql<string>`donnee.espece_id::text`.as("especeId"),
      sql<string>`donnee.sexe_id::text`.as("sexeId"),
      sql<string>`donnee.age_id::text`.as("ageId"),
      sql<string>`donnee.estimation_nombre_id::text`.as("estimationNombreId"),
      "nombre",
      sql<string>`donnee.estimation_distance_id::text`.as("estimationDistanceId"),
      "distance",
      "commentaire",
      "dateCreation",
      sql<string[]>`array_remove(array_agg(donnee_comportement.comportement_id::text), NULL)`.as("behaviorIds"),
      sql<string[]>`array_remove(array_agg(donnee_milieu.milieu_id::text), NULL)`.as("environmentIds"),
    ])
    .where((eb) => {
      const clause: OperandExpression<SqlBool>[] = [];

      clause.push(eb("donnee.inventaireId", "=", criteria.inventoryId));
      clause.push(eb("donnee.especeId", "=", Number.parseInt(criteria.speciesId)));
      clause.push(eb("donnee.sexeId", "=", Number.parseInt(criteria.sexId)));
      clause.push(eb("donnee.ageId", "=", Number.parseInt(criteria.ageId)));
      clause.push(eb("donnee.estimationNombreId", "=", Number.parseInt(criteria.numberEstimateId)));

      if (criteria.number != null) {
        clause.push(eb("donnee.nombre", "=", criteria.number));
      } else {
        clause.push(eb("donnee.nombre", "is", null));
      }

      if (criteria.distanceEstimateId != null) {
        clause.push(eb("donnee.estimationDistanceId", "=", Number.parseInt(criteria.distanceEstimateId)));
      } else {
        clause.push(eb("donnee.estimationDistanceId", "is", null));
      }

      if (criteria.distance != null) {
        clause.push(eb("donnee.distance", "=", criteria.distance));
      } else {
        clause.push(eb("donnee.distance", "is", null));
      }

      if (criteria.comment != null) {
        clause.push(eb("donnee.commentaire", "=", criteria.comment));
      } else {
        clause.push(eb("donnee.commentaire", "is", null));
      }

      return eb.and(clause);
    })
    .groupBy("donnee.id")
    .execute();

  if (entryResultWithoutLinks.length === 0) {
    return null;
  }

  const entryResult = entryResultWithoutLinks.filter((entry) => {
    return (
      areSetsContainingSameValues(new Set(entry.behaviorIds), new Set(criteria.behaviorIds)) &&
      areSetsContainingSameValues(new Set(entry.environmentIds), new Set(criteria.environmentIds))
    );
  });

  if (entryResult.length === 0) {
    return null;
  }

  return entrySchema.parse(reshapeRawEntry(entryResult[0]));
};

const findEntries = async ({
  orderBy,
  sortOrder,
  searchCriteria,
  offset,
  limit,
}: EntryFindManyInput = {}): Promise<Entry[]> => {
  const {
    behaviorIds = [],
    environmentIds = [],
    breeders = [],
    associateIds = [],
    weatherIds = [],
  } = searchCriteria ?? {};
  const associatesNeeded = !!associateIds.length;
  const weathersNeeded = !!weatherIds.length;
  const behaviorTableNeeded = !!breeders.length;
  const behaviorsNeeded = behaviorTableNeeded || !!behaviorIds.length;
  const environmentsNeeded = !!environmentIds.length;

  let queryEntry = kysely
    .selectFrom("donnee")
    .$if(behaviorsNeeded, (qb) =>
      qb
        .leftJoin("donnee_comportement", "donnee.id", "donnee_comportement.donneeId")
        .$if(behaviorIds.length > 0, (qb) =>
          qb.where(
            "donnee_comportement.comportementId",
            "in",
            behaviorIds.map((elt) => Number.parseInt(elt)),
          ),
        )
        .$if(behaviorTableNeeded, (qb) =>
          qb
            .leftJoin("comportement", "donnee_comportement.comportementId", "comportement.id")
            .where("comportement.nicheur", "in", breeders),
        ),
    )
    .$if(environmentsNeeded, (qb) =>
      qb.leftJoin("donnee_milieu", "donnee.id", "donnee_milieu.donneeId").where(
        "donnee_milieu.milieuId",
        "in",
        environmentIds.map((elt) => Number.parseInt(elt)),
      ),
    )
    .leftJoin("inventaire", "donnee.inventaireId", "inventaire.id")
    .$if(weathersNeeded, (qb) =>
      qb.leftJoin("inventaire_meteo", "inventaire.id", "inventaire_meteo.inventaireId").where(
        "inventaire_meteo.meteoId",
        "in",
        weatherIds.map((elt) => Number.parseInt(elt)),
      ),
    )
    .$if(associatesNeeded, (qb) =>
      qb.leftJoin("inventaire_associe", "inventaire.id", "inventaire_associe.inventaireId").where(
        "inventaire_associe.observateurId",
        "in",
        associateIds.map((elt) => Number.parseInt(elt)),
      ),
    )
    .leftJoin("lieudit", "inventaire.lieuditId", "lieudit.id")
    .leftJoin("commune", "lieudit.communeId", "commune.id")
    .leftJoin("departement", "commune.departementId", "departement.id")
    .leftJoin("espece", "donnee.especeId", "espece.id")
    .select([
      "donnee.id",
      "donnee.inventaireId",
      sql<string>`donnee.espece_id::text`.as("especeId"),
      sql<string>`donnee.sexe_id::text`.as("sexeId"),
      sql<string>`donnee.age_id::text`.as("ageId"),
      sql<string>`donnee.estimation_nombre_id::text`.as("estimationNombreId"),
      "donnee.nombre",
      sql<string>`donnee.estimation_distance_id::text`.as("estimationDistanceId"),
      "donnee.distance",
      "donnee.commentaire",
      "donnee.dateCreation",
    ]);

  if (searchCriteria != null) {
    queryEntry = queryEntry.where(withSearchCriteriaMinimal(searchCriteria));
  }

  queryEntry = queryEntry.groupBy("donnee.id");

  const orderByIdentifier = getOrderByIdentifier(orderBy);
  if (orderByIdentifier != null) {
    queryEntry = queryEntry.groupBy(orderByIdentifier).orderBy(orderByIdentifier, sortOrder ?? undefined);
  }

  queryEntry = queryEntry
    .orderBy("donnee.dateCreation", sortOrder ?? undefined)
    .orderBy("donnee.id", sortOrder ?? undefined);

  if (offset) {
    queryEntry = queryEntry.offset(offset);
  }
  if (limit) {
    queryEntry = queryEntry.limit(limit);
  }

  const entriesResult = await queryEntry.execute();

  // Lookup for behaviorIds and environmentIds separately to improve performance
  const behaviorIdsResult = entriesResult.length
    ? await kysely
        .selectFrom("donnee_comportement")
        .select([
          "donnee_comportement.donneeId",
          sql<string>`donnee_comportement.comportement_id::text`.as("comportementId"),
        ])
        .where(
          "donneeId",
          "in",
          entriesResult.map((entry) => entry.id),
        )
        .execute()
    : [];

  const environmentIdsResult = entriesResult.length
    ? await kysely
        .selectFrom("donnee_milieu")
        .select(["donnee_milieu.donneeId", sql<string>`donnee_milieu.milieu_id::text`.as("milieuId")])
        .where(
          "donneeId",
          "in",
          entriesResult.map((entry) => entry.id),
        )
        .execute()
    : [];

  return z.array(entrySchema).parse(
    entriesResult.map((entry) =>
      reshapeRawEntry({
        ...entry,
        behaviorIds: behaviorIdsResult
          .filter((result) => result.donneeId === entry.id)
          .map((result) => result.comportementId),
        environmentIds: environmentIdsResult
          .filter((result) => result.donneeId === entry.id)
          .map((result) => result.milieuId),
      }),
    ),
  );
};

const getCount = async (criteria?: SearchCriteria | null): Promise<number> => {
  const townTableNeeded = !!criteria?.departmentIds?.length;
  const localityTableNeeded = townTableNeeded || !!criteria?.townIds?.length;
  const associatesNeeded = !!criteria?.associateIds?.length;
  const weathersNeeded = !!criteria?.weatherIds?.length;
  const behaviorTableNeeded = !!criteria?.breeders?.length;
  const behaviorsNeeded = behaviorTableNeeded || !!criteria?.behaviorIds?.length;
  const environmentsNeeded = !!criteria?.environmentIds?.length;
  const speciesTableNeeded = !!criteria?.classIds?.length;

  let query = kysely
    .selectFrom("donnee")
    .leftJoin("inventaire", "donnee.inventaireId", "inventaire.id")
    .$if(speciesTableNeeded, (qb) => qb.leftJoin("espece", "donnee.especeId", "espece.id"))
    .$if(behaviorsNeeded, (qb) =>
      qb
        .leftJoin("donnee_comportement", "donnee.id", "donnee_comportement.donneeId")
        .$if(behaviorTableNeeded, (qb) =>
          qb.leftJoin("comportement", "donnee_comportement.comportementId", "comportement.id"),
        ),
    )
    .$if(environmentsNeeded, (qb) => qb.leftJoin("donnee_milieu", "donnee.id", "donnee_milieu.donneeId"))
    .$if(localityTableNeeded, (qb) =>
      qb
        .leftJoin("lieudit", "inventaire.lieuditId", "lieudit.id")
        .$if(townTableNeeded, (qb) => qb.leftJoin("commune", "lieudit.communeId", "commune.id")),
    )
    .$if(weathersNeeded, (qb) => qb.leftJoin("inventaire_meteo", "inventaire.id", "inventaire_meteo.inventaireId"))
    .$if(associatesNeeded, (qb) =>
      qb.leftJoin("inventaire_associe", "inventaire.id", "inventaire_associe.inventaireId"),
    )
    .select((eb) => eb.fn.count("donnee.id").distinct().as("count"));

  if (criteria != null) {
    query = query.where(withSearchCriteria(criteria));
  }

  const countResult = await query.executeTakeFirstOrThrow();

  return countSchema.parse(countResult).count;
};

const createEntry = async (entryInput: EntryCreateInput): Promise<Entry> => {
  const createdEntry = await kysely.transaction().execute(async (trx) => {
    const entryResult = await trx
      .insertInto("donnee")
      .values({
        id: nanoid(12),
        inventaireId: entryInput.inventoryId,
        especeId: Number.parseInt(entryInput.speciesId),
        sexeId: Number.parseInt(entryInput.sexId),
        ageId: Number.parseInt(entryInput.ageId),
        estimationNombreId: Number.parseInt(entryInput.numberEstimateId),
        nombre: entryInput.number,
        estimationDistanceId:
          entryInput.distanceEstimateId != null ? Number.parseInt(entryInput.distanceEstimateId) : null,
        distance: entryInput.distance,
        commentaire: entryInput.comment,
        dateCreation: new Date(),
      })
      .returning([
        "donnee.id",
        "donnee.inventaireId",
        sql<string>`donnee.espece_id::text`.as("especeId"),
        sql<string>`donnee.sexe_id::text`.as("sexeId"),
        sql<string>`donnee.age_id::text`.as("ageId"),
        sql<string>`donnee.estimation_nombre_id::text`.as("estimationNombreId"),
        "nombre",
        sql<string>`donnee.estimation_distance_id::text`.as("estimationDistanceId"),
        "distance",
        "commentaire",
        "dateCreation",
      ])
      .executeTakeFirstOrThrow();

    let behaviorIdsResult: { comportementId: string }[] = [];
    if (entryInput.behaviorIds.length) {
      behaviorIdsResult = await trx
        .insertInto("donnee_comportement")
        .values(
          entryInput.behaviorIds.map((behaviorId) => {
            return { donneeId: entryResult.id, comportementId: Number.parseInt(behaviorId) };
          }),
        )
        .returning(sql<string>`donnee_comportement.comportement_id::text`.as("comportementId"))
        .execute();
    }

    let environmentIdsResult: { milieuId: string }[] = [];
    if (entryInput.environmentIds.length) {
      environmentIdsResult = await trx
        .insertInto("donnee_milieu")
        .values(
          entryInput.environmentIds.map((environmentId) => {
            return { donneeId: entryResult.id, milieuId: Number.parseInt(environmentId) };
          }),
        )
        .returning(sql<string>`donnee_milieu.milieu_id::text`.as("milieuId"))
        .execute();
    }

    return {
      ...entryResult,
      behaviorIds: behaviorIdsResult.map((behaviorId) => behaviorId.comportementId),
      environmentIds: environmentIdsResult.map((environmentId) => environmentId.milieuId),
    };
  });

  return entrySchema.parse(reshapeRawEntry(createdEntry));
};

const updateEntry = async (entryId: string, entryInput: EntryCreateInput): Promise<Entry> => {
  const updatedEntry = await kysely.transaction().execute(async (trx) => {
    const entryResult = await trx
      .updateTable("donnee")
      .set({
        inventaireId: entryInput.inventoryId,
        especeId: Number.parseInt(entryInput.speciesId),
        sexeId: Number.parseInt(entryInput.sexId),
        ageId: Number.parseInt(entryInput.ageId),
        estimationNombreId: Number.parseInt(entryInput.numberEstimateId),
        nombre: entryInput.number,
        estimationDistanceId:
          entryInput.distanceEstimateId != null ? Number.parseInt(entryInput.distanceEstimateId) : null,
        distance: entryInput.distance,
        commentaire: entryInput.comment,
      })
      .where("id", "=", entryId)
      .returning([
        "donnee.id",
        "donnee.inventaireId",
        sql<string>`donnee.espece_id::text`.as("especeId"),
        sql<string>`donnee.sexe_id::text`.as("sexeId"),
        sql<string>`donnee.age_id::text`.as("ageId"),
        sql<string>`donnee.estimation_nombre_id::text`.as("estimationNombreId"),
        "nombre",
        sql<string>`donnee.estimation_distance_id::text`.as("estimationDistanceId"),
        "distance",
        "commentaire",
        "dateCreation",
      ])
      .executeTakeFirstOrThrow();

    await kysely.deleteFrom("donnee_comportement").where("donneeId", "=", entryId).execute();

    let behaviorIdsResult: { comportementId: string }[] = [];
    if (entryInput.behaviorIds.length) {
      behaviorIdsResult = await trx
        .insertInto("donnee_comportement")
        .values(
          entryInput.behaviorIds.map((behaviorId) => {
            return { donneeId: entryResult.id, comportementId: Number.parseInt(behaviorId) };
          }),
        )
        .returning(sql<string>`donnee_comportement.comportement_id::text`.as("comportementId"))
        .execute();
    }

    await kysely.deleteFrom("donnee_milieu").where("donneeId", "=", entryId).execute();

    let environmentIdsResult: { milieuId: string }[] = [];
    if (entryInput.environmentIds.length) {
      environmentIdsResult = await trx
        .insertInto("donnee_milieu")
        .values(
          entryInput.environmentIds.map((environmentId) => {
            return { donneeId: entryResult.id, milieuId: Number.parseInt(environmentId) };
          }),
        )
        .returning(sql<string>`donnee_milieu.milieu_id::text`.as("milieuId"))
        .execute();
    }

    return {
      ...entryResult,
      behaviorIds: behaviorIdsResult.map((behaviorId) => behaviorId.comportementId),
      environmentIds: environmentIdsResult.map((environmentId) => environmentId.milieuId),
    };
  });

  return entrySchema.parse(reshapeRawEntry(updatedEntry));
};

const deleteEntryById = async (entryId: string): Promise<Entry | null> => {
  const behaviorIdsResult = await kysely
    .selectFrom("donnee_comportement")
    .select(sql<string>`comportement_id::text`.as("comportementId"))
    .where("donneeId", "=", entryId)
    .execute();

  const environmentIdsResult = await kysely
    .selectFrom("donnee_milieu")
    .select(sql<string>`milieu_id::text`.as("milieuId"))
    .where("donneeId", "=", entryId)
    .execute();

  const deletedEntry = await kysely
    .deleteFrom("donnee")
    .where("id", "=", entryId)
    .returning([
      "donnee.id",
      "donnee.inventaireId",
      sql<string>`donnee.espece_id::text`.as("especeId"),
      sql<string>`donnee.sexe_id::text`.as("sexeId"),
      sql<string>`donnee.age_id::text`.as("ageId"),
      sql<string>`donnee.estimation_nombre_id::text`.as("estimationNombreId"),
      "nombre",
      sql<string>`donnee.estimation_distance_id::text`.as("estimationDistanceId"),
      "distance",
      "commentaire",
      "dateCreation",
    ])
    .executeTakeFirst();

  return deletedEntry
    ? entrySchema.parse(
        reshapeRawEntry({
          ...deletedEntry,
          behaviorIds: behaviorIdsResult.map((behaviorId) => behaviorId.comportementId),
          environmentIds: environmentIdsResult.map((environmentId) => environmentId.milieuId),
        }),
      )
    : null;
};

const updateAssociatedInventory = async (currentInventoryId: string, newInventoryId: string): Promise<void> => {
  await kysely
    .updateTable("donnee")
    .set({
      inventaireId: newInventoryId,
    })
    .where("inventaireId", "=", currentInventoryId)
    .execute();
};

export const entryRepository = {
  findEntryById,
  findExistingEntry,
  findEntries,
  getCount,
  createEntry,
  updateEntry,
  deleteEntryById,
  updateAssociatedInventory,
};
