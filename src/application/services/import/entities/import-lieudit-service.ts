import type { LoggedUser } from "@domain/user/logged-user.js";
import type { Department } from "@ou-ca/common/api/entities/department.js";
import type { Locality } from "@ou-ca/common/api/entities/locality.js";
import type { Town } from "@ou-ca/common/api/entities/town.js";
import type { UpsertLocalityInput } from "@ou-ca/common/api/locality.js";
import { ImportService } from "./import-service.js";
import { ImportedLieuDit } from "./objects/imported-lieu-dit.object.js";

export class ImportLieuxditService extends ImportService {
  private departements!: Department[];
  private communes!: Town[];
  private lieuxDits!: (Locality | ImportedLieuDit)[];

  private lieuxDitsToInsert!: UpsertLocalityInput[];

  protected getNumberOfColumns = (): number => {
    return 6;
  };

  protected init = async (): Promise<void> => {
    this.lieuxDitsToInsert = [];

    [this.departements, this.communes, this.lieuxDits] = await Promise.all([
      this.services.departmentService.findAllDepartments(),
      this.services.townService.findAllTowns(),
      this.services.localityService.findAllLocalities(),
    ]);
  };

  protected validateAndPrepareEntity = (lieuDitTab: string[]): string | null => {
    const importedLieuDit = new ImportedLieuDit(lieuDitTab);

    const dataValidity = importedLieuDit.checkValidity();
    if (dataValidity) {
      return dataValidity;
    }

    // Check that the departement exists
    const departement = this.departements.find((departement) => {
      return this.compareStrings(departement.code, importedLieuDit.departement);
    });
    if (!departement) {
      return "Le département n'existe pas";
    }

    // Check that the commune exists
    const commune = this.communes.find((commune) => {
      return (
        commune.departmentId === departement.id &&
        (this.compareStrings(`${commune.code}`, importedLieuDit.commune) ||
          this.compareStrings(commune.nom, importedLieuDit.commune))
      );
    });
    if (!commune) {
      return "La commune n'existe pas dans ce département";
    }

    // Check that the lieu-dit does not exist yet
    const lieudit = this.lieuxDits.find((lieuDit) => {
      return (
        ((lieuDit as Locality)?.townId === commune.id || (lieuDit as ImportedLieuDit)?.commune === commune.nom) &&
        this.compareStrings(lieuDit.nom, importedLieuDit.nom)
      );
    });
    if (lieudit) {
      return "Il existe déjà un lieu-dit avec ce nom dans cette commune";
    }

    const lieuditToSave = importedLieuDit.buildLieudit(commune.id);

    this.lieuxDitsToInsert.push(lieuditToSave);
    this.lieuxDits.push(importedLieuDit);

    return null;
  };

  protected persistAllValidEntities = async (loggedUser: LoggedUser): Promise<void> => {
    if (this.lieuxDitsToInsert.length) {
      await this.services.localityService.createLocalities(this.lieuxDitsToInsert, loggedUser);
    }
  };
}
