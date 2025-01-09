import type { LoggedUser } from "@domain/user/logged-user.js";
import type { Sex } from "@ou-ca/common/api/entities/sex.js";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service.js";

export class ImportSexeService extends ImportEntiteAvecLibelleService {
  protected init = async (): Promise<void> => {
    this.entitiesToInsert = [];
    this.entities = await this.services.sexService.findAllSexes();
  };

  protected getThisEntityName(): string {
    return "Ce sexe";
  }

  protected saveEntities = (ages: Omit<Sex, "id" | "ownerId">[], loggedUser: LoggedUser): Promise<readonly Sex[]> => {
    return this.services.sexService.createSexes(ages, loggedUser);
  };
}
