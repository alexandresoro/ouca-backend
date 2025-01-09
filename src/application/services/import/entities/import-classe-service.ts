import type { LoggedUser } from "@domain/user/logged-user.js";
import type { SpeciesClass } from "@ou-ca/common/api/entities/species-class.js";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service.js";

export class ImportClasseService extends ImportEntiteAvecLibelleService {
  protected init = async (): Promise<void> => {
    this.entitiesToInsert = [];
    this.entities = await this.services.classService.findAllSpeciesClasses();
  };

  protected getThisEntityName(): string {
    return "Cette classe espèce";
  }

  protected saveEntities = (
    classes: Omit<SpeciesClass, "id" | "ownerId">[],
    loggedUser: LoggedUser,
  ): Promise<readonly SpeciesClass[]> => {
    return this.services.classService.createMultipleSpeciesClasses(classes, loggedUser);
  };
}
