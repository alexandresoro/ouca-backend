import type { ObserverCreateInput } from "@domain/observer/observer.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import type { Observer } from "@ou-ca/common/api/entities/observer.js";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service.js";

export class ImportObservateurService extends ImportEntiteAvecLibelleService {
  protected init = async (): Promise<void> => {
    this.entitiesToInsert = [];
    this.entities = await this.services.observerService.findAllObservers();
  };

  protected getThisEntityName(): string {
    return "Cet observateur";
  }

  protected saveEntities = (
    observateurs: Omit<ObserverCreateInput, "ownerId">[],
    loggedUser: LoggedUser,
  ): Promise<Observer[]> => {
    return this.services.observerService.createObservers(observateurs, loggedUser);
  };
}
