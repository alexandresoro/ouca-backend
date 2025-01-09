import type { Department } from "@domain/department/department.js";

const CODE_INDEX = 0;
const CODE_MAX_LENGTH = 100;

export class ImportedDepartement {
  code: string;

  constructor(departementTab: string[]) {
    this.code = departementTab[CODE_INDEX].trim();
  }

  buildDepartement = (): Pick<Department, "code"> => {
    return {
      code: this.code,
    };
  };

  checkValidity = (): string | null => {
    const codeError = this.checkCodeValidity();
    if (codeError) {
      return codeError;
    }
    return null;
  };

  private checkCodeValidity = (): string | null => {
    if (!this.code) {
      return "Le département ne peut pas être vide";
    }

    if (this.code.length > CODE_MAX_LENGTH) {
      return `La longueur maximale du département est de ${CODE_MAX_LENGTH} caractères`;
    }

    return null;
  };
}
