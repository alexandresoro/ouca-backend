import type { AgeCreateInput } from "@domain/age/age.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import type { Age } from "@ou-ca/common/api/entities/age.js";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service.js";

export class ImportAgeService extends ImportEntiteAvecLibelleService<Age> {
  protected init = async (): Promise<void> => {
    this.entitiesToInsert = [];
    this.entities = await this.services.ageService.findAllAges();
  };

  protected getThisEntityName(): string {
    return "Cet âge";
  }

  protected saveEntities = (
    ages: Omit<AgeCreateInput, "ownerId">[],
    loggedUser: LoggedUser,
  ): Promise<readonly Age[]> => {
    return this.services.ageService.createAges(ages, loggedUser);
  };
}
