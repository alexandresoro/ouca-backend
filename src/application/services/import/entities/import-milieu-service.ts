import type { Environment } from "@domain/environment/environment.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import { ImportEntiteAvecLibelleEtCodeService } from "./import-entite-avec-libelle-et-code-service.js";

export class ImportMilieuService extends ImportEntiteAvecLibelleEtCodeService {
  protected init = async (): Promise<void> => {
    this.entitiesToInsert = [];
    this.entities = await this.services.environmentService.findAllEnvironments();
  };

  protected getAnEntityName(): string {
    return "un milieu";
  }

  protected saveEntities = (
    milieux: Omit<Environment, "id" | "ownerId">[],
    loggedUser: LoggedUser,
  ): Promise<readonly Environment[]> => {
    return this.services.environmentService.createEnvironments(milieux, loggedUser);
  };
}
