import type { SpeciesCreateInput } from "@domain/species/species.js";

const CLASSE_INDEX = 0;
const CODE_INDEX = 1;
const NOM_FRANCAIS_INDEX = 2;
const NOM_LATIN_INDEX = 3;

const CODE_MAX_LENGTH = 20;
const NOM_FRANCAIS_MAX_LENGTH = 100;
const NOM_LATIN_MAX_LENGTH = 100;

export class ImportedEspece {
  classe: string;
  code: string;
  nomFrancais: string;
  nomLatin: string;

  constructor(especeTab: string[]) {
    this.classe = especeTab[CLASSE_INDEX].trim();
    this.code = especeTab[CODE_INDEX].trim();
    this.nomFrancais = especeTab[NOM_FRANCAIS_INDEX].trim();
    this.nomLatin = especeTab[NOM_LATIN_INDEX].trim();
  }

  buildEspece = (classeId: string): Omit<SpeciesCreateInput, "ownerId"> => {
    return {
      classId: classeId,
      code: this.code,
      nomFrancais: this.nomFrancais,
      nomLatin: this.nomLatin,
    };
  };

  checkValidity = (): string | null => {
    const classeError = this.checkClasseValidity();
    if (classeError) {
      return classeError;
    }

    const codeError = this.checkCodeValidity();
    if (codeError) {
      return codeError;
    }

    const nomFrancaisError = this.checkNomFrancaisValidity();
    if (nomFrancaisError) {
      return nomFrancaisError;
    }

    const nomLatinError = this.checkNomLatinValidity();
    if (nomLatinError) {
      return nomLatinError;
    }

    return null;
  };

  private checkClasseValidity = (): string | null => {
    return this.classe ? null : "La classe de l'espèce ne peut pas être vide";
  };

  private checkCodeValidity = (): string | null => {
    if (!this.code) {
      return "Le code de l'espèce ne peut pas être vide";
    }

    if (this.code.length > CODE_MAX_LENGTH) {
      return `La longueur maximale du code de l'espèce est de ${CODE_MAX_LENGTH} caractères`;
    }

    return null;
  };

  private checkNomFrancaisValidity = (): string | null => {
    if (!this.nomFrancais) {
      return "Le nom français ne peut pas être vide";
    }

    if (this.nomFrancais.length > NOM_FRANCAIS_MAX_LENGTH) {
      return `La longueur maximale du nom français est de ${NOM_FRANCAIS_MAX_LENGTH} caractères`;
    }

    return null;
  };

  private checkNomLatinValidity = (): string | null => {
    if (!this.nomLatin) {
      return "Le nom scientifique ne peut pas être vide";
    }

    if (this.nomLatin.length > NOM_LATIN_MAX_LENGTH) {
      return `La longueur maximale du nom scientifique est de ${NOM_LATIN_MAX_LENGTH} caractères`;
    }

    return null;
  };
}
