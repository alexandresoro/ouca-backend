import type { Department } from "@domain/department/department.js";
import type { Town, TownCreateInput } from "@domain/town/town.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import { ImportService } from "./import-service.js";
import { ImportedCommune } from "./objects/imported-commune.object.js";

export class ImportCommuneService extends ImportService {
  private departements!: Department[];
  private communes!: (Town | ImportedCommune)[];

  private communesToInsert!: Omit<TownCreateInput, "ownerId">[];

  protected getNumberOfColumns = (): number => {
    return 3;
  };

  protected init = async (): Promise<void> => {
    this.communesToInsert = [];
    [this.departements, this.communes] = await Promise.all([
      this.services.departmentService.findAllDepartments(),
      this.services.townService.findAllTowns(),
    ]);
  };

  protected validateAndPrepareEntity = (communeTab: string[]): string | null => {
    const importedCommune = new ImportedCommune(communeTab);

    const dataValidity = importedCommune.checkValidity();
    if (dataValidity) {
      return dataValidity;
    }

    // Check that the departement exists
    const departement = this.departements.find((departement) => {
      return this.compareStrings(departement.code, importedCommune.departement);
    });
    if (!departement) {
      return "Le département n'existe pas";
    }

    // Check that the commune does not exists
    const commune = this.communes.find((commune) => {
      return (
        ((commune as Town)?.departmentId === departement.id ||
          (commune as ImportedCommune)?.departement === departement.code) &&
        (commune.code === +importedCommune.code || this.compareStrings(commune.nom, importedCommune.nom))
      );
    });
    if (commune) {
      return "Il existe déjà une commune avec ce code ou ce nom dans ce département";
    }

    // Create and save the commune
    const communeToSave = importedCommune.buildCommune(departement.id);

    this.communesToInsert.push(communeToSave);
    this.communes.push(importedCommune);
    return null;
  };

  protected persistAllValidEntities = async (loggedUser: LoggedUser): Promise<void> => {
    if (this.communesToInsert.length) {
      await this.services.townService.createTowns(this.communesToInsert, loggedUser);
    }
  };
}
