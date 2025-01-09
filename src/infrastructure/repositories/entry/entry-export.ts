import { type EntryForExport, entryForExportSchema } from "@domain/entry/entry.js";
import type { SearchCriteria } from "@domain/search/search-criteria.js";
import { kysely } from "@infrastructure/kysely/kysely.js";
import { withSearchCriteria } from "@infrastructure/repositories/search-criteria.js";
import { sql } from "kysely";
import { z } from "zod";

export const findFullEntriesForExport = async (
  searchCriteria: SearchCriteria | null | undefined,
): Promise<EntryForExport[]> => {
  let query = kysely
    .selectFrom("donnee")
    .leftJoin("donnee_comportement", "donnee.id", "donnee_comportement.donneeId")
    .leftJoin("comportement", "donnee_comportement.comportementId", "comportement.id")
    .leftJoin("donnee_milieu", "donnee.id", "donnee_milieu.donneeId")
    .leftJoin("milieu", "donnee_milieu.milieuId", "milieu.id")
    .leftJoin("inventaire", "donnee.inventaireId", "inventaire.id")
    .leftJoin("inventaire_meteo", "inventaire.id", "inventaire_meteo.inventaireId")
    .leftJoin("meteo", "inventaire_meteo.meteoId", "meteo.id")
    .leftJoin("inventaire_associe", "inventaire.id", "inventaire_associe.inventaireId")
    .leftJoin("observateur as associate", "inventaire_associe.observateurId", "associate.id")
    .leftJoin("lieudit", "inventaire.lieuditId", "lieudit.id")
    .leftJoin("commune", "lieudit.communeId", "commune.id")
    .leftJoin("departement", "commune.departementId", "departement.id")
    .leftJoin("espece", "donnee.especeId", "espece.id")
    .leftJoin("age", "donnee.ageId", "age.id")
    .leftJoin("sexe", "donnee.sexeId", "sexe.id")
    .leftJoin("observateur", "inventaire.observateurId", "observateur.id")
    .leftJoin("classe", "espece.classeId", "classe.id")
    .leftJoin("estimation_nombre", "donnee.estimationNombreId", "estimation_nombre.id")
    .leftJoin("estimation_distance", "donnee.estimationDistanceId", "estimation_distance.id")
    .select([
      sql<string>`donnee.id`.as("id"),
      sql<string>`any_value(observateur.libelle)`.as("observerName"),
      sql<Date>`any_value(inventaire.date)`.as("inventoryDate"),
      sql<string>`any_value(inventaire.heure)`.as("inventoryTime"),
      sql<string>`any_value(inventaire.duree)`.as("inventoryDuration"),
      sql<number>`any_value(inventaire.altitude)`.as("inventoryAltitude"),
      sql<number>`any_value(inventaire.latitude)`.as("inventoryLatitude"),
      sql<number>`any_value(inventaire.longitude)`.as("inventoryLongitude"),
      sql<string>`any_value(departement.code)`.as("departmentCode"),
      sql<number>`any_value(commune.code)`.as("townCode"),
      sql<string>`any_value(commune.nom)`.as("townName"),
      sql<string>`any_value(lieudit.nom)`.as("localityName"),
      sql<number>`any_value(lieudit.altitude)`.as("localityAltitude"),
      sql<number>`any_value(lieudit.latitude)`.as("localityLatitude"),
      sql<number>`any_value(lieudit.longitude)`.as("localityLongitude"),
      sql<number>`any_value(inventaire.temperature)`.as("temperature"),
      sql<string>`any_value(classe.libelle)`.as("className"),
      sql<string>`any_value(espece.code)`.as("speciesCode"),
      sql<string>`any_value(espece.nom_francais)`.as("speciesName"),
      sql<string>`any_value(espece.nom_latin)`.as("speciesScientificName"),
      sql<string>`any_value(sexe.libelle)`.as("sexName"),
      sql<string>`any_value(age.libelle)`.as("ageName"),
      sql<number>`any_value(donnee.nombre)`.as("number"),
      sql<string>`any_value(estimation_nombre.libelle)`.as("numberEstimateName"),
      sql<string>`any_value(estimation_distance.libelle)`.as("distanceEstimateName"),
      sql<number>`any_value(donnee.distance)`.as("distance"),
      sql<string>`any_value(donnee.commentaire)`.as("comment"),
      sql<string[]>`array_remove(array_agg(CONCAT(comportement.code, ' - ', comportement.libelle)), NULL)`.as(
        "behaviors",
      ),
      sql<string[]>`array_remove(array_agg(comportement.nicheur::text), NULL)`.as("breeders"),
      sql<string[]>`array_remove(array_agg(CONCAT(milieu.code, ' - ', milieu.libelle)), NULL)`.as("environments"),
      sql<string[]>`array_remove(array_agg(meteo.libelle), NULL)`.as("weathers"),
      sql<string[]>`array_remove(array_agg(associate.libelle), NULL)`.as("associates"),
    ]);

  if (searchCriteria != null) {
    query = query.where(withSearchCriteria(searchCriteria));
  }

  query = query.groupBy("donnee.id").orderBy("donnee.dateCreation asc");

  const rawResult = await query.execute();

  return z.array(entryForExportSchema).parse(rawResult);
};
