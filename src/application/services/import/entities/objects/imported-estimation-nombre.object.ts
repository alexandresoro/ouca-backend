import type { NumberEstimate } from "@domain/number-estimate/number-estimate.js";
import { ImportedEntiteAvecLibelle } from "./imported-entite-avec-libelle.object.js";

export class ImportedEstimationNombre extends ImportedEntiteAvecLibelle {
  buildEntiteAvecLibelle = (): Pick<NumberEstimate, "libelle" | "nonCompte"> => {
    return {
      libelle: this.libelle,
      nonCompte: false,
    };
  };
}
