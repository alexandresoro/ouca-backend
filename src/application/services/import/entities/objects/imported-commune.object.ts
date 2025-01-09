import type { TownCreateInput } from "@domain/town/town.js";

const DEPARTEMENT_INDEX = 0;
const CODE_INDEX = 1;
const NOM_INDEX = 2;

const CODE_MIN_VALUE = 0;
const CODE_MAX_VALUE = 65535;
const NOM_MAX_LENGTH = 100;

export class ImportedCommune {
  departement: string;
  code: string;
  nom: string;

  constructor(communeTab: string[]) {
    this.departement = communeTab[DEPARTEMENT_INDEX].trim();
    this.code = communeTab[CODE_INDEX].trim();
    this.nom = communeTab[NOM_INDEX].trim();
  }

  buildCommune = (departmentId: string): Omit<TownCreateInput, "ownerId"> => {
    return {
      departmentId,
      code: +this.code,
      nom: this.nom,
    };
  };

  checkValidity = (): string | undefined => {
    const departementError = this.checkDepartementValidity();
    if (departementError) {
      return departementError;
    }

    const codeCommuneError = this.checkCodeCommuneValidity();
    if (codeCommuneError) {
      return codeCommuneError;
    }

    const nomCommuneError = this.checkNomCommuneValidity();
    if (nomCommuneError) {
      return nomCommuneError;
    }
  };

  private checkDepartementValidity = (): string | null => {
    return this.departement ? null : "Le département de la commune ne peut pas être vide";
  };

  private checkCodeCommuneValidity = (): string | null => {
    if (!this.code) {
      return "Le code de la commune ne peut pas être vide";
    }

    const codeCommune = Number(this.code);

    if (!Number.isInteger(codeCommune)) {
      return "Le code de la commune doit être un entier";
    }

    if (codeCommune < CODE_MIN_VALUE || codeCommune > CODE_MAX_VALUE) {
      return `Le code de la commune doit être un entier compris entre ${CODE_MIN_VALUE} et ${CODE_MAX_VALUE}`;
    }

    return null;
  };

  private checkNomCommuneValidity = (): string | null => {
    if (!this.nom) {
      return "Le nom de la commune ne peut pas être vide";
    }

    if (this.nom.length > NOM_MAX_LENGTH) {
      return `La longueur maximale du nom de la commune est de ${NOM_MAX_LENGTH} caractères`;
    }

    return null;
  };
}
