import type { LoggedUser } from "@domain/user/logged-user.js";
import type { NumberEstimate } from "@ou-ca/common/api/entities/number-estimate.js";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service.js";
import { ImportedEstimationNombre } from "./objects/imported-estimation-nombre.object.js";

export class ImportEstimationNombreService extends ImportEntiteAvecLibelleService {
  protected init = async (): Promise<void> => {
    this.entitiesToInsert = [];
    this.entities = await this.services.numberEstimateService.findAllNumberEstimates();
  };

  protected getThisEntityName(): string {
    return "Cette estimation du nombre";
  }

  protected getImportedEntity = (entityTab: string[]): ImportedEstimationNombre => {
    return new ImportedEstimationNombre(entityTab);
  };

  protected saveEntities = (
    estimationsNombre: Omit<NumberEstimate, "id" | "ownerId">[],
    loggedUser: LoggedUser,
  ): Promise<readonly NumberEstimate[]> => {
    return this.services.numberEstimateService.createNumberEstimates(
      estimationsNombre.map((estimationNombre) => {
        return {
          ...estimationNombre,
          nonCompte: false,
        };
      }),
      loggedUser,
    );
  };
}
