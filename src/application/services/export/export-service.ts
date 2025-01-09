import type { AccessFailureReason } from "@domain/shared/failure-reason.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import { findFullEntriesForExport } from "@infrastructure/repositories/entry/entry-export.js";
import type { ExportRepository } from "@interfaces/export-repository-interface.js";
import type { EntriesSearchParams } from "@ou-ca/common/api/entry.js";
import { getNicheurStatusToDisplay } from "@ou-ca/common/helpers/nicheur-helper.js";
import { type Result, err, ok } from "neverthrow";
import { getDateOnlyAsUTCDate } from "../../../utils/time-utils.js";
import type { AgeService } from "../age/age-service.js";
import type { BehaviorService } from "../behavior/behavior-service.js";
import type { DepartmentService } from "../department/department-service.js";
import type { DistanceEstimateService } from "../distance-estimate/distance-estimate-service.js";
import type { EnvironmentService } from "../environment/environment-service.js";
import type { LocalityService } from "../locality/locality-service.js";
import type { NumberEstimateService } from "../number-estimate/number-estimate-service.js";
import type { ObserverService } from "../observer/observer-service.js";
import type { SexService } from "../sex/sex-service.js";
import type { SpeciesClassService } from "../species-class/species-class-service.js";
import type { SpeciesService } from "../species/species-service.js";
import type { TownService } from "../town/town-service.js";
import type { WeatherService } from "../weather/weather-service.js";

const SEPARATOR_COMMA = ", ";

type ExportServiceDependencies = {
  exportRepository: ExportRepository;
  ageService: AgeService;
  behaviorService: BehaviorService;
  classService: SpeciesClassService;
  departmentService: DepartmentService;
  distanceEstimateService: DistanceEstimateService;
  environmentService: EnvironmentService;
  localityService: LocalityService;
  numberEstimateService: NumberEstimateService;
  observerService: ObserverService;
  sexService: SexService;
  speciesService: SpeciesService;
  townService: TownService;
  weatherService: WeatherService;
};

export const buildExportService = (dependencies: ExportServiceDependencies) => {
  const {
    exportRepository,
    ageService,
    behaviorService,
    classService,
    departmentService,
    distanceEstimateService,
    environmentService,
    localityService,
    numberEstimateService,
    observerService,
    sexService,
    speciesService,
    townService,
    weatherService,
  } = dependencies;

  const generateAgesExport = async (loggedUser: LoggedUser | null): Promise<Result<string, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const agesDb = await ageService.findAllAges();

    const agesToExport = agesDb.map((ageDb) => {
      return {
        // biome-ignore lint/style/useNamingConvention: <explanation>
        Âge: ageDb.libelle,
      };
    });

    const id = await exportRepository.storeExport(agesToExport, "Âges");
    return ok(id);
  };

  const generateClassesExport = async (loggedUser: LoggedUser | null): Promise<Result<string, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const classes = await classService.findAllSpeciesClasses();

    const objectsToExport = classes.map((object) => {
      // biome-ignore lint/style/useNamingConvention: <explanation>
      return { Classe: object.libelle };
    });

    const id = await exportRepository.storeExport(objectsToExport, "Classes");
    return ok(id);
  };

  const generateTownsExport = async (loggedUser: LoggedUser | null): Promise<Result<string, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const communesDb = await townService.findAllTownsWithDepartments();

    const objectsToExport = communesDb.map((communeDb) => {
      return {
        // biome-ignore lint/style/useNamingConvention: <explanation>
        Département: communeDb.departmentCode,
        // biome-ignore lint/style/useNamingConvention: <explanation>
        Code: communeDb.code,
        // biome-ignore lint/style/useNamingConvention: <explanation>
        Nom: communeDb.nom,
      };
    });

    const id = await exportRepository.storeExport(objectsToExport, "Communes");
    return ok(id);
  };

  const generateBehaviorsExport = async (
    loggedUser: LoggedUser | null,
  ): Promise<Result<string, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const comportementsDb = await behaviorService.findAllBehaviors();

    const comportementsToExport = comportementsDb.map((object) => {
      return {
        // biome-ignore lint/style/useNamingConvention: <explanation>
        Code: object.code,
        // biome-ignore lint/style/useNamingConvention: <explanation>
        Libellé: object.libelle,
      };
    });

    const id = await exportRepository.storeExport(comportementsToExport, "Comportements");
    return ok(id);
  };

  const generateDepartmentsExport = async (
    loggedUser: LoggedUser | null,
  ): Promise<Result<string, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const departementsDb = await departmentService.findAllDepartments();

    const objectsToExport = departementsDb.map((object) => {
      return {
        // biome-ignore lint/style/useNamingConvention: <explanation>
        Département: object.code,
      };
    });

    const id = await exportRepository.storeExport(objectsToExport, "Départements");
    return ok(id);
  };

  const generateEntriesExport = async (
    loggedUser: LoggedUser | null,
    searchCriteria: Omit<EntriesSearchParams, "pageNumber" | "pageSize"> &
      Partial<{ pageNumber: number; pageSize: number }>,
  ): Promise<Result<string, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const coordinatesSuffix = " en degrés (GPS)";

    const { fromAllUsers } = searchCriteria;

    const reshapedSearchCriteria = {
      ...searchCriteria,
      ownerId: fromAllUsers && loggedUser.permissions.canManageAllEntries ? undefined : loggedUser.id,
    };

    const entriesForExport = await findFullEntriesForExport(reshapedSearchCriteria);

    const objectsToExport = entriesForExport.map((entryForExport) => {
      const nicheurStatus = getNicheurStatusToDisplay(
        entryForExport.breeders.map((breeder) => {
          return { nicheur: breeder };
        }),
        "",
      );

      return {
        // biome-ignore lint/style/useNamingConvention: <explanation>
        ID: entryForExport.id,
        // biome-ignore lint/style/useNamingConvention: <explanation>
        Observateur: entryForExport.observerName,
        "Observateurs associés": entryForExport.associates.length
          ? entryForExport.associates.join(SEPARATOR_COMMA)
          : "",
        // biome-ignore lint/style/useNamingConvention: <explanation>
        Date: getDateOnlyAsUTCDate(entryForExport.inventoryDate),
        // biome-ignore lint/style/useNamingConvention: <explanation>
        Heure: entryForExport.inventoryTime,
        // biome-ignore lint/style/useNamingConvention: <explanation>
        Durée: entryForExport.inventoryDuration,
        // biome-ignore lint/style/useNamingConvention: <explanation>
        Département: entryForExport.departmentCode,
        "Code commune": entryForExport.townCode,
        "Nom commune": entryForExport.townName,
        "Lieu-dit": entryForExport.localityName,
        [`Latitude${coordinatesSuffix}`]: entryForExport.inventoryLatitude ?? entryForExport.localityLatitude,
        [`Longitude${coordinatesSuffix}`]: entryForExport.inventoryLongitude ?? entryForExport.localityLongitude,
        "Altitude en mètres": entryForExport.inventoryAltitude ?? entryForExport.localityAltitude,
        "Température en °C": entryForExport.temperature,
        // biome-ignore lint/style/useNamingConvention: <explanation>
        Météo: entryForExport.weathers.length ? entryForExport.weathers.join(SEPARATOR_COMMA) : "",
        // biome-ignore lint/style/useNamingConvention: <explanation>
        Classe: entryForExport.className,
        "Code espèce": entryForExport.speciesCode,
        "Nom francais": entryForExport.speciesName,
        "Nom scientifique": entryForExport.speciesScientificName,
        // biome-ignore lint/style/useNamingConvention: <explanation>
        Sexe: entryForExport.sexName,
        // biome-ignore lint/style/useNamingConvention: <explanation>
        Âge: entryForExport.ageName,
        "Nombre d'individus": entryForExport.number,
        "Estimation du nombre": entryForExport.numberEstimateName,
        "Estimation de la distance": entryForExport.distanceEstimateName,
        "Distance en mètres": entryForExport.distance,
        // biome-ignore lint/style/useNamingConvention: <explanation>
        Nicheur: nicheurStatus,
        "Comportement 1": getComportement(entryForExport.behaviors, 1),
        "Comportement 2": getComportement(entryForExport.behaviors, 2),
        "Comportement 3": getComportement(entryForExport.behaviors, 3),
        "Comportement 4": getComportement(entryForExport.behaviors, 4),
        "Comportement 5": getComportement(entryForExport.behaviors, 5),
        "Comportement 6": getComportement(entryForExport.behaviors, 6),
        "Milieu 1": getMilieu(entryForExport.environments, 1),
        "Milieu 2": getMilieu(entryForExport.environments, 2),
        "Milieu 3": getMilieu(entryForExport.environments, 3),
        "Milieu 4": getMilieu(entryForExport.environments, 4),
        // biome-ignore lint/style/useNamingConvention: <explanation>
        Commentaires: entryForExport.comment,
      };
    });

    const id = await exportRepository.storeExport(objectsToExport, "Données");
    return ok(id);
  };

  const generateSpeciesExport = async (loggedUser: LoggedUser | null): Promise<Result<string, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const especes = await speciesService.findAllSpeciesWithClasses();

    const objectsToExport = especes.map((espece) => {
      return {
        // biome-ignore lint/style/useNamingConvention: <explanation>
        Classe: espece.classLabel,
        // biome-ignore lint/style/useNamingConvention: <explanation>
        Code: espece.code,
        "Nom français": espece.nomFrancais,
        "Nom scientifique": espece.nomLatin,
      };
    });

    const id = await exportRepository.storeExport(objectsToExport, "Espèces");
    return ok(id);
  };

  const generateDistanceEstimatesExport = async (
    loggedUser: LoggedUser | null,
  ): Promise<Result<string, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const estimations = await distanceEstimateService.findAllDistanceEstimates();

    const objectsToExport = estimations.map((object) => {
      return {
        "Estimation de la distance": object.libelle,
      };
    });

    const id = await exportRepository.storeExport(objectsToExport, "Estimations de la distance");
    return ok(id);
  };

  const generateNumberEstimatesExport = async (
    loggedUser: LoggedUser | null,
  ): Promise<Result<string, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const estimations = await numberEstimateService.findAllNumberEstimates();

    const objectsToExport = estimations.map((object) => {
      return {
        "Estimation du nombre": object.libelle,
      };
    });

    const id = await exportRepository.storeExport(objectsToExport, "Estimations du nombre");
    return ok(id);
  };

  const generateLocalitiesExport = async (
    loggedUser: LoggedUser | null,
  ): Promise<Result<string, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const lieuxDits = await localityService.findAllLocalitiesWithTownAndDepartment();

    const objectsToExport = lieuxDits.map((lieudit) => {
      return {
        // biome-ignore lint/style/useNamingConvention: <explanation>
        Département: lieudit.departmentCode,
        "Code commune": lieudit.townCode,
        "Nom commune": lieudit.townName,
        "Lieu-dit": lieudit.nom,
        // biome-ignore lint/style/useNamingConvention: <explanation>
        Latitude: lieudit.latitude,
        // biome-ignore lint/style/useNamingConvention: <explanation>
        Longitude: lieudit.longitude,
        // biome-ignore lint/style/useNamingConvention: <explanation>
        Altitude: lieudit.altitude,
      };
    });

    const id = await exportRepository.storeExport(objectsToExport, "Lieux-dits");
    return ok(id);
  };

  const generateWeathersExport = async (
    loggedUser: LoggedUser | null,
  ): Promise<Result<string, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const meteos = await weatherService.findAllWeathers();

    const objectsToExport = meteos.map((object) => {
      return {
        // biome-ignore lint/style/useNamingConvention: <explanation>
        Météo: object.libelle,
      };
    });

    const id = await exportRepository.storeExport(objectsToExport, "Météos");
    return ok(id);
  };

  const generateEnvironmentsExport = async (
    loggedUser: LoggedUser | null,
  ): Promise<Result<string, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const milieuxDb = await environmentService.findAllEnvironments();

    const milieuxToExport = milieuxDb.map((object) => {
      return {
        // biome-ignore lint/style/useNamingConvention: <explanation>
        Code: object.code,
        // biome-ignore lint/style/useNamingConvention: <explanation>
        Libellé: object.libelle,
      };
    });

    const id = await exportRepository.storeExport(milieuxToExport, "Milieux");
    return ok(id);
  };

  const generateObserversExport = async (
    loggedUser: LoggedUser | null,
  ): Promise<Result<string, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const observateurs = await observerService.findAllObservers();

    const objectsToExport = observateurs.map((object) => {
      return {
        // biome-ignore lint/style/useNamingConvention: <explanation>
        Observateur: object.libelle,
      };
    });

    const id = await exportRepository.storeExport(objectsToExport, "Observateurs");
    return ok(id);
  };

  const generateSexesExport = async (loggedUser: LoggedUser | null): Promise<Result<string, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const sexes = await sexService.findAllSexes();

    const objectsToExport = sexes.map((object) => {
      return {
        // biome-ignore lint/style/useNamingConvention: <explanation>
        Sexe: object.libelle,
      };
    });

    const id = await exportRepository.storeExport(objectsToExport, "Sexes");
    return ok(id);
  };

  const getExport = async (exportId: string): Promise<Buffer | null> => {
    return exportRepository.getExport(exportId);
  };

  return {
    generateAgesExport,
    generateClassesExport,
    generateTownsExport,
    generateBehaviorsExport,
    generateDepartmentsExport,
    generateEntriesExport,
    generateSpeciesExport,
    generateDistanceEstimatesExport,
    generateNumberEstimatesExport,
    generateLocalitiesExport,
    generateWeathersExport,
    generateEnvironmentsExport,
    generateObserversExport,
    generateSexesExport,
    getExport,
  };
};

export type ExportService = ReturnType<typeof buildExportService>;

const getComportement = (comportements: string[], index: number): string => {
  return comportements.length >= index ? comportements[index - 1] : "";
};

const getMilieu = (milieux: string[], index: number): string => {
  return milieux.length >= index ? milieux[index - 1] : "";
};
