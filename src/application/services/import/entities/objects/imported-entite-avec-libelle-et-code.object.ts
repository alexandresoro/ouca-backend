const CODE_INDEX = 0;
const LIBELLE_INDEX = 1;

const CODE_MAX_LENGTH = 6;
const LIBELLE_MAX_LENGTH = 100;

export class ImportedEntiteAvecLibelleEtCode {
  code: string;
  libelle: string;

  constructor(entiteAvecLibelleEtCodeTab: string[]) {
    this.code = entiteAvecLibelleEtCodeTab[CODE_INDEX].trim();
    this.libelle = entiteAvecLibelleEtCodeTab[LIBELLE_INDEX].trim();
  }

  buildEntiteAvecLibelleEtCode = (): {
    libelle: string;
    code: string;
  } => {
    return {
      code: this.code,
      libelle: this.libelle,
    };
  };

  checkValidity = (): string | undefined => {
    const codeError = this.checkCodeValidity();
    if (codeError) {
      return codeError;
    }

    const libelleError = this.checkLibelleValidity();
    if (libelleError) {
      return libelleError;
    }
  };

  private checkCodeValidity = (): string | null => {
    if (!this.code) {
      return "Le code ne peut pas être vide";
    }

    if (this.code.length > CODE_MAX_LENGTH) {
      return `La longueur maximale du code est de ${CODE_MAX_LENGTH} caractères`;
    }

    return null;
  };

  private checkLibelleValidity = (): string | null => {
    if (!this.libelle) {
      return "Le libellé ne peut pas être vide";
    }

    if (this.libelle.length > LIBELLE_MAX_LENGTH) {
      return `La longueur maximale du libellé est de ${LIBELLE_MAX_LENGTH} caractères`;
    }

    return null;
  };
}
