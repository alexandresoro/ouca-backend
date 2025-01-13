import type { Behavior } from "@domain/behavior/behavior.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import { ImportEntiteAvecLibelleEtCodeService } from "./import-entite-avec-libelle-et-code-service.js";

export class ImportComportementService extends ImportEntiteAvecLibelleEtCodeService {
  protected init = async (): Promise<void> => {
    this.entitiesToInsert = [];
    this.entities = await this.services.behaviorService.findAllBehaviors();
  };

  protected getAnEntityName(): string {
    return "un comportement";
  }

  protected saveEntities = (
    comportements: Omit<Behavior, "id" | "ownerId">[],
    loggedUser: LoggedUser,
  ): Promise<readonly Behavior[]> => {
    return this.services.behaviorService.createBehaviors(comportements, loggedUser);
  };
}
