import type { EntryFindManyInput } from "@domain/entry/entry.js";

export const getOrderByIdentifier = (orderBy: EntryFindManyInput["orderBy"]) => {
  switch (orderBy) {
    case "speciesCode":
      return "espece.code";
    case "speciesName":
      return "espece.nomFrancais";
    case "number":
      return "donnee.nombre";
    case "observerName":
      return "inventaire.observateurId";
    case "date":
      return "inventaire.date";
    case "time":
      return "inventaire.heure";
    case "duration":
      return "inventaire.duree";
    case "locality":
      return "lieudit.nom";
    case "townCode":
      return "commune.code";
    case "townName":
      return "commune.nom";
    case "department":
      return "departement.code";
    case "creationDate":
      return "donnee.dateCreation";
    default:
      return null;
  }
};
