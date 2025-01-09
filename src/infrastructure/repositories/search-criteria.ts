import type { SearchCriteria } from "@domain/search/search-criteria.js";
import type { Database } from "@infrastructure/kysely/kysely.js";
import escapeStringRegexp from "escape-string-regexp";
import type { ExpressionBuilder, OperandExpression, SqlBool } from "kysely";

// Optimized version of the function withSearchCriteria
// that does not include join tables to improve performance
export const withSearchCriteriaMinimal = (
  searchCriteria: Omit<SearchCriteria, "behaviorIds" | "environmentIds" | "breeders" | "associateIds" | "weatherIds">,
) => {
  return (eb: ExpressionBuilder<Database, "espece" | "donnee" | "inventaire" | "commune" | "lieudit">) => {
    const expressions: OperandExpression<SqlBool>[] = [];

    if (searchCriteria.entryId != null) {
      expressions.push(eb("donnee.id", "=", searchCriteria.entryId));
    }

    if (searchCriteria.inventoryId != null) {
      expressions.push(eb("donnee.inventaireId", "=", searchCriteria.inventoryId));
    }

    if (searchCriteria.observerIds?.length) {
      expressions.push(
        eb(
          "inventaire.observateurId",
          "in",
          searchCriteria.observerIds.map((elt) => Number.parseInt(elt)),
        ),
      );
    }

    if (searchCriteria.temperature != null) {
      expressions.push(eb("inventaire.temperature", "=", searchCriteria.temperature));
    }

    if (searchCriteria.time != null) {
      expressions.push(eb("inventaire.heure", "=", searchCriteria.time));
    }

    if (searchCriteria.duration != null) {
      expressions.push(eb("inventaire.duree", "=", searchCriteria.duration));
    }

    if (searchCriteria.classIds?.length) {
      expressions.push(
        eb(
          "espece.classeId",
          "in",
          searchCriteria.classIds.map((elt) => Number.parseInt(elt)),
        ),
      );
    }

    if (searchCriteria.speciesIds?.length) {
      expressions.push(
        eb(
          "donnee.especeId",
          "in",
          searchCriteria.speciesIds.map((elt) => Number.parseInt(elt)),
        ),
      );
    }

    if (searchCriteria.departmentIds?.length) {
      expressions.push(
        eb(
          "commune.departementId",
          "in",
          searchCriteria.departmentIds.map((elt) => Number.parseInt(elt)),
        ),
      );
    }

    if (searchCriteria.townIds?.length) {
      expressions.push(
        eb(
          "lieudit.communeId",
          "in",
          searchCriteria.townIds.map((elt) => Number.parseInt(elt)),
        ),
      );
    }

    if (searchCriteria.localityIds?.length) {
      expressions.push(
        eb(
          "inventaire.lieuditId",
          "in",
          searchCriteria.localityIds.map((elt) => Number.parseInt(elt)),
        ),
      );
    }

    if (searchCriteria.number != null) {
      expressions.push(eb("donnee.nombre", "=", searchCriteria.number));
    }

    if (searchCriteria.numberEstimateIds?.length) {
      expressions.push(
        eb(
          "donnee.estimationNombreId",
          "in",
          searchCriteria.numberEstimateIds.map((elt) => Number.parseInt(elt)),
        ),
      );
    }

    if (searchCriteria.sexIds?.length) {
      expressions.push(
        eb(
          "donnee.sexeId",
          "in",
          searchCriteria.sexIds.map((elt) => Number.parseInt(elt)),
        ),
      );
    }

    if (searchCriteria.ageIds?.length) {
      expressions.push(
        eb(
          "donnee.ageId",
          "in",
          searchCriteria.ageIds.map((elt) => Number.parseInt(elt)),
        ),
      );
    }

    if (searchCriteria.distance != null) {
      expressions.push(eb("donnee.distance", "=", searchCriteria.distance));
    }

    if (searchCriteria.distanceEstimateIds?.length) {
      expressions.push(
        eb(
          "donnee.estimationDistanceId",
          "in",
          searchCriteria.distanceEstimateIds.map((elt) => Number.parseInt(elt)),
        ),
      );
    }

    if (searchCriteria.fromDate != null) {
      expressions.push(eb("inventaire.date", ">=", new Date(searchCriteria.fromDate)));
    }

    if (searchCriteria.toDate != null) {
      expressions.push(eb("inventaire.date", "<=", new Date(searchCriteria.toDate)));
    }

    if (searchCriteria.comment != null) {
      expressions.push(eb("donnee.commentaire", "~*", escapeStringRegexp(searchCriteria.comment)));
    }

    if (searchCriteria.ownerId != null) {
      expressions.push(eb("inventaire.ownerId", "=", searchCriteria.ownerId));
    }

    return eb.and(expressions);
  };
};

export const withSearchCriteria = (searchCriteria: SearchCriteria) => {
  return (
    eb: ExpressionBuilder<
      Database,
      | "espece"
      | "donnee"
      | "inventaire"
      | "inventaire_meteo"
      | "inventaire_associe"
      | "commune"
      | "lieudit"
      | "donnee_comportement"
      | "donnee_milieu"
      | "comportement"
    >,
  ) => {
    const expressions: OperandExpression<SqlBool>[] = [];

    if (searchCriteria.entryId != null) {
      expressions.push(eb("donnee.id", "=", searchCriteria.entryId));
    }

    if (searchCriteria.inventoryId != null) {
      expressions.push(eb("donnee.inventaireId", "=", searchCriteria.inventoryId));
    }

    if (searchCriteria.observerIds?.length) {
      expressions.push(
        eb(
          "inventaire.observateurId",
          "in",
          searchCriteria.observerIds.map((elt) => Number.parseInt(elt)),
        ),
      );
    }

    if (searchCriteria.temperature != null) {
      expressions.push(eb("inventaire.temperature", "=", searchCriteria.temperature));
    }

    if (searchCriteria.weatherIds?.length) {
      expressions.push(
        eb(
          "inventaire_meteo.meteoId",
          "in",
          searchCriteria.weatherIds.map((elt) => Number.parseInt(elt)),
        ),
      );
    }

    if (searchCriteria.associateIds?.length) {
      expressions.push(
        eb(
          "inventaire_associe.observateurId",
          "in",
          searchCriteria.associateIds.map((elt) => Number.parseInt(elt)),
        ),
      );
    }

    if (searchCriteria.time != null) {
      expressions.push(eb("inventaire.heure", "=", searchCriteria.time));
    }

    if (searchCriteria.duration != null) {
      expressions.push(eb("inventaire.duree", "=", searchCriteria.duration));
    }

    if (searchCriteria.classIds?.length) {
      expressions.push(
        eb(
          "espece.classeId",
          "in",
          searchCriteria.classIds.map((elt) => Number.parseInt(elt)),
        ),
      );
    }

    if (searchCriteria.speciesIds?.length) {
      expressions.push(
        eb(
          "donnee.especeId",
          "in",
          searchCriteria.speciesIds.map((elt) => Number.parseInt(elt)),
        ),
      );
    }

    if (searchCriteria.departmentIds?.length) {
      expressions.push(
        eb(
          "commune.departementId",
          "in",
          searchCriteria.departmentIds.map((elt) => Number.parseInt(elt)),
        ),
      );
    }

    if (searchCriteria.townIds?.length) {
      expressions.push(
        eb(
          "lieudit.communeId",
          "in",
          searchCriteria.townIds.map((elt) => Number.parseInt(elt)),
        ),
      );
    }

    if (searchCriteria.localityIds?.length) {
      expressions.push(
        eb(
          "inventaire.lieuditId",
          "in",
          searchCriteria.localityIds.map((elt) => Number.parseInt(elt)),
        ),
      );
    }

    if (searchCriteria.number != null) {
      expressions.push(eb("donnee.nombre", "=", searchCriteria.number));
    }

    if (searchCriteria.numberEstimateIds?.length) {
      expressions.push(
        eb(
          "donnee.estimationNombreId",
          "in",
          searchCriteria.numberEstimateIds.map((elt) => Number.parseInt(elt)),
        ),
      );
    }

    if (searchCriteria.sexIds?.length) {
      expressions.push(
        eb(
          "donnee.sexeId",
          "in",
          searchCriteria.sexIds.map((elt) => Number.parseInt(elt)),
        ),
      );
    }

    if (searchCriteria.ageIds?.length) {
      expressions.push(
        eb(
          "donnee.ageId",
          "in",
          searchCriteria.ageIds.map((elt) => Number.parseInt(elt)),
        ),
      );
    }

    if (searchCriteria.distance != null) {
      expressions.push(eb("donnee.distance", "=", searchCriteria.distance));
    }

    if (searchCriteria.distanceEstimateIds?.length) {
      expressions.push(
        eb(
          "donnee.estimationDistanceId",
          "in",
          searchCriteria.distanceEstimateIds.map((elt) => Number.parseInt(elt)),
        ),
      );
    }

    if (searchCriteria.fromDate != null) {
      expressions.push(eb("inventaire.date", ">=", new Date(searchCriteria.fromDate)));
    }

    if (searchCriteria.toDate != null) {
      expressions.push(eb("inventaire.date", "<=", new Date(searchCriteria.toDate)));
    }

    if (searchCriteria.comment != null) {
      expressions.push(eb("donnee.commentaire", "~*", escapeStringRegexp(searchCriteria.comment)));
    }

    if (searchCriteria.breeders?.length) {
      expressions.push(eb("comportement.nicheur", "in", searchCriteria.breeders));
    }

    if (searchCriteria.behaviorIds?.length) {
      expressions.push(
        eb(
          "donnee_comportement.comportementId",
          "in",
          searchCriteria.behaviorIds.map((elt) => Number.parseInt(elt)),
        ),
      );
    }

    if (searchCriteria.environmentIds?.length) {
      expressions.push(
        eb(
          "donnee_milieu.milieuId",
          "in",
          searchCriteria.environmentIds.map((elt) => Number.parseInt(elt)),
        ),
      );
    }

    if (searchCriteria.ownerId != null) {
      expressions.push(eb("inventaire.ownerId", "=", searchCriteria.ownerId));
    }

    return eb.and(expressions);
  };
};
