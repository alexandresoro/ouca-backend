import type { ImportType } from "@domain/import/import-type.js";
import type { Services } from "../../services.js";
import { ImportAgeService } from "./import-age-service.js";
import { ImportClasseService } from "./import-classe-service.js";
import { ImportCommuneService } from "./import-commune-service.js";
import { ImportComportementService } from "./import-comportement-service.js";
import { ImportDepartementService } from "./import-departement-service.js";
import { ImportDonneeService } from "./import-donnee-service.js";
import { ImportEspeceService } from "./import-espece-service.js";
import { ImportEstimationDistanceService } from "./import-estimation-distance-service.js";
import { ImportEstimationNombreService } from "./import-estimation-nombre-service.js";
import { ImportLieuxditService } from "./import-lieudit-service.js";
import { ImportMeteoService } from "./import-meteo-service.js";
import { ImportMilieuService } from "./import-milieu-service.js";
import { ImportObservateurService } from "./import-observateur-service.js";
import type { ImportService } from "./import-service.js";
import { ImportSexeService } from "./import-sexe-service.js";

export const getNewImportServiceForRequestType = (requestType: ImportType, services: Services): ImportService => {
  switch (requestType) {
    case "observer":
      return new ImportObservateurService(services);
    case "department":
      return new ImportDepartementService(services);
    case "town":
      return new ImportCommuneService(services);
    case "locality":
      return new ImportLieuxditService(services);
    case "weather":
      return new ImportMeteoService(services);
    case "species-class":
      return new ImportClasseService(services);
    case "species":
      return new ImportEspeceService(services);
    case "age":
      return new ImportAgeService(services);
    case "sex":
      return new ImportSexeService(services);
    case "number-estimate":
      return new ImportEstimationNombreService(services);
    case "distance-estimate":
      return new ImportEstimationDistanceService(services);
    case "behavior":
      return new ImportComportementService(services);
    case "environment":
      return new ImportMilieuService(services);
    case "entry":
      return new ImportDonneeService(services);
    default:
      throw new Error("I,port of unknown type requested");
  }
};
