import type { DistanceEstimate } from "@domain/distance-estimate/distance-estimate.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service.js";

export class ImportEstimationDistanceService extends ImportEntiteAvecLibelleService {
  protected init = async (): Promise<void> => {
    this.entitiesToInsert = [];
    this.entities = await this.services.distanceEstimateService.findAllDistanceEstimates();
  };

  protected getThisEntityName(): string {
    return "Cette estimation de la distance";
  }

  protected saveEntities = (
    estimationsDistance: Omit<DistanceEstimate, "ownerId">[],
    loggedUser: LoggedUser,
  ): Promise<readonly DistanceEstimate[]> => {
    return this.services.distanceEstimateService.createDistanceEstimates(estimationsDistance, loggedUser);
  };
}
