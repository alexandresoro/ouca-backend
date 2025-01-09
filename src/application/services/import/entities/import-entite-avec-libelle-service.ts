import type { LoggedUser } from "@domain/user/logged-user.js";
import { ImportService } from "./import-service.js";
import { ImportedEntiteAvecLibelle } from "./objects/imported-entite-avec-libelle.object.js";

export abstract class ImportEntiteAvecLibelleService<T = unknown> extends ImportService {
  protected entities!: { libelle: string }[];

  protected entitiesToInsert!: { libelle: string }[];

  protected getNumberOfColumns = (): number => {
    return 1;
  };

  protected getImportedEntity = (entityTab: string[]): ImportedEntiteAvecLibelle => {
    return new ImportedEntiteAvecLibelle(entityTab);
  };
  protected validateAndPrepareEntity = (entityTab: string[]): string | null => {
    const importedEntity = this.getImportedEntity(entityTab);

    const dataValidity = importedEntity.checkValidity();
    if (dataValidity) {
      return dataValidity;
    }

    // Check that the entity does not exist
    const existingEntity = this.entities.find((e) => {
      return this.compareStrings(e.libelle, importedEntity.libelle);
    });
    if (existingEntity) {
      return `${this.getThisEntityName()} existe déjà`;
    }

    // Create and save the entity
    const entityToSave = importedEntity.buildEntiteAvecLibelle();

    this.entitiesToInsert.push(entityToSave);
    this.entities.push(entityToSave);
    return null;
  };

  protected persistAllValidEntities = async (loggedUser: LoggedUser): Promise<void> => {
    if (this.entitiesToInsert.length) {
      await this.saveEntities(this.entitiesToInsert, loggedUser);
    }
  };

  protected abstract saveEntities(entities: { libelle: string }[], loggedUser: LoggedUser): Promise<readonly T[]>;

  protected abstract getThisEntityName(): string;
}
