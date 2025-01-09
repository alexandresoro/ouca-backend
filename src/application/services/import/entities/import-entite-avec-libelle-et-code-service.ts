import type { LoggedUser } from "@domain/user/logged-user.js";
import { ImportService } from "./import-service.js";
import { ImportedEntiteAvecLibelleEtCode } from "./objects/imported-entite-avec-libelle-et-code.object.js";

export abstract class ImportEntiteAvecLibelleEtCodeService<T = unknown> extends ImportService {
  protected entities!: { libelle: string; code: string }[];

  protected entitiesToInsert!: { libelle: string; code: string }[];

  protected getNumberOfColumns = (): number => {
    return 2;
  };

  protected validateAndPrepareEntity = (entityTab: string[]): string | null => {
    const importedEntity = new ImportedEntiteAvecLibelleEtCode(entityTab);

    const dataValidity = importedEntity.checkValidity();
    if (dataValidity) {
      return dataValidity;
    }

    // Check that the entity does not exist
    const existingEntity = this.entities.find((e) => {
      return this.compareStrings(e.code, importedEntity.code) || this.compareStrings(e.libelle, importedEntity.libelle);
    });
    if (existingEntity) {
      return `Il existe déjà ${this.getAnEntityName()} avec ce code ou ce libellé`;
    }

    // Create and save the entity
    const entityToSave = importedEntity.buildEntiteAvecLibelleEtCode();

    this.entitiesToInsert.push(entityToSave);
    this.entities.push(entityToSave);
    return null;
  };

  protected persistAllValidEntities = async (loggedUser: LoggedUser): Promise<void> => {
    if (this.entitiesToInsert.length) {
      await this.saveEntities(this.entitiesToInsert, loggedUser);
    }
  };

  protected abstract saveEntities(
    entities: { libelle: string; code: string }[],
    loggedUser: LoggedUser,
  ): Promise<readonly T[]>;

  protected abstract getAnEntityName(): string;
}
