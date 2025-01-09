import type { Department } from "@domain/department/department.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import { ImportService } from "./import-service.js";
import { ImportedDepartement } from "./objects/imported-departement.object.js";

export class ImportDepartementService extends ImportService {
  private departements!: (Department | Omit<Department, "id" | "ownerId">)[];

  private departementsToInsert!: Omit<Department, "id" | "ownerId">[];

  protected getNumberOfColumns = (): number => {
    return 1;
  };

  protected init = async (): Promise<void> => {
    this.departementsToInsert = [];
    this.departements = await this.services.departmentService.findAllDepartments();
  };

  protected validateAndPrepareEntity = (departementTab: string[]): string | null => {
    const importedDepartement = new ImportedDepartement(departementTab);

    const dataValidity = importedDepartement.checkValidity();
    if (dataValidity) {
      return dataValidity;
    }

    // Check that the departement does not exist
    const existingDepartement = this.departements.find((d) => {
      return this.compareStrings(d.code, importedDepartement.code);
    });
    if (existingDepartement) {
      return "Ce département existe déjà";
    }

    // Create and save the commune
    const departementToSave = importedDepartement.buildDepartement();

    this.departementsToInsert.push(departementToSave);
    this.departements.push(departementToSave);
    return null;
  };

  protected persistAllValidEntities = async (loggedUser: LoggedUser): Promise<void> => {
    if (this.departementsToInsert.length) {
      await this.services.departmentService.createDepartments(this.departementsToInsert, loggedUser);
    }
  };
}
