import type { LoggedUser } from "@domain/user/logged-user.js";
import type { Weather } from "@domain/weather/weather.js";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service.js";

export class ImportMeteoService extends ImportEntiteAvecLibelleService {
  protected init = async (): Promise<void> => {
    this.entitiesToInsert = [];
    this.entities = await this.services.weatherService.findAllWeathers();
  };

  protected getThisEntityName(): string {
    return "Cette météo";
  }

  protected saveEntities = (
    ages: Omit<Weather, "id" | "ownerId">[],
    loggedUser: LoggedUser,
  ): Promise<readonly Weather[]> => {
    return this.services.weatherService.createWeathers(ages, loggedUser);
  };
}
