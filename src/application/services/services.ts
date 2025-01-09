import { altitudeFetcher } from "@infrastructure/altitude/altitude-fetcher.js";
import { type Queues, createQueues } from "@infrastructure/bullmq/queues.js";
import { ageRepository } from "@infrastructure/repositories/age/age-repository.js";
import { behaviorRepository } from "@infrastructure/repositories/behavior/behavior-repository.js";
import { departmentRepository } from "@infrastructure/repositories/department/department-repository.js";
import { distanceEstimateRepository } from "@infrastructure/repositories/distance-estimate/distance-estimate-repository.js";
import { entryRepository } from "@infrastructure/repositories/entry/entry-repository.js";
import { environmentRepository } from "@infrastructure/repositories/environment/environment-repository.js";
import { exportRepository } from "@infrastructure/repositories/export/export-repository.js";
import { inventoryRepository } from "@infrastructure/repositories/inventory/inventory-repository.js";
import { localityGeojsonRepository } from "@infrastructure/repositories/locality/locality-geojson-repository.js";
import { localityRepository } from "@infrastructure/repositories/locality/locality-repository.js";
import { numberEstimateRepository } from "@infrastructure/repositories/number-estimate/number-estimate-repository.js";
import { observerRepository } from "@infrastructure/repositories/observer/observer-repository.js";
import { sexRepository } from "@infrastructure/repositories/sex/sex-repository.js";
import { speciesClassRepository } from "@infrastructure/repositories/species-class/species-class-repository.js";
import { speciesRepository } from "@infrastructure/repositories/species/species-repository.js";
import { townRepository } from "@infrastructure/repositories/town/town-repository.js";
import { userRepository } from "@infrastructure/repositories/user/user-repository.js";
import { weatherRepository } from "@infrastructure/repositories/weather/weather-repository.js";
import { logger } from "../../utils/logger.js";
import { type AgeService, buildAgeService } from "./age/age-service.js";
import { type AltitudeService, buildAltitudeService } from "./altitude/altitude-service.js";
import { type BehaviorService, buildBehaviorService } from "./behavior/behavior-service.js";
import { type DepartmentService, buildDepartmentService } from "./department/department-service.js";
import {
  type DistanceEstimateService,
  buildDistanceEstimateService,
} from "./distance-estimate/distance-estimate-service.js";
import { type EntryService, buildEntryService } from "./entry/entry-service.js";
import { type EnvironmentService, buildEnvironmentService } from "./environment/environment-service.js";
import { type ExportService, buildExportService } from "./export/export-service.js";
import { type ImportService, buildImportService } from "./import/import-service.js";
import { type InventoryService, buildInventoryService } from "./inventory/inventory-service.js";
import { type GeoJSONService, buildGeoJSONService } from "./locality/geojson-service.js";
import { type LocalityService, buildLocalityService } from "./locality/locality-service.js";
import { type NumberEstimateService, buildNumberEstimateService } from "./number-estimate/number-estimate-service.js";
import { type ObserverService, buildObserverService } from "./observer/observer-service.js";
import { type OidcService, buildOidcService } from "./oidc/oidc-service.js";
import { type SexService, buildSexService } from "./sex/sex-service.js";
import { type SpeciesClassService, buildSpeciesClassService } from "./species-class/species-class-service.js";
import { type SpeciesService, buildSpeciesService } from "./species/species-service.js";
import { type TownService, buildTownService } from "./town/town-service.js";
import { type UserService, buildUserService } from "./user/user-service.js";
import { type WeatherService, buildWeatherService } from "./weather/weather-service.js";

export type Services = {
  queues: Queues;
  ageService: AgeService;
  altitudeService: AltitudeService;
  behaviorService: BehaviorService;
  classService: SpeciesClassService;
  departmentService: DepartmentService;
  distanceEstimateService: DistanceEstimateService;
  entryService: EntryService;
  environmentService: EnvironmentService;
  inventoryService: InventoryService;
  localityService: LocalityService;
  numberEstimateService: NumberEstimateService;
  observerService: ObserverService;
  sexService: SexService;
  speciesService: SpeciesService;
  townService: TownService;
  weatherService: WeatherService;
  userService: UserService;
  geojsonService: GeoJSONService;
  exportService: ExportService;
  importService: ImportService;
  oidcService: OidcService;
};

export const buildServices = (): Services => {
  const queues = createQueues();

  const ageService = buildAgeService({
    ageRepository,
  });

  const classService = buildSpeciesClassService({
    classRepository: speciesClassRepository,
    speciesRepository,
  });

  const townService = buildTownService({
    townRepository,
    localityRepository,
  });

  const behaviorService = buildBehaviorService({
    behaviorRepository,
  });

  const departmentService = buildDepartmentService({
    departmentRepository,
    townRepository,
    localityRepository,
  });

  const entryService = buildEntryService({
    inventoryRepository,
    entryRepository,
  });

  const speciesService = buildSpeciesService({
    classService,
    speciesRepository,
  });

  const distanceEstimateService = buildDistanceEstimateService({
    distanceEstimateRepository,
  });

  const numberEstimateService = buildNumberEstimateService({
    numberEstimateRepository,
  });

  const inventoryService = buildInventoryService({
    inventoryRepository,
    entryRepository,
    localityRepository,
  });

  const localityService = buildLocalityService({
    localityRepository,
    inventoryRepository,
  });

  const weatherService = buildWeatherService({
    weatherRepository,
  });

  const environmentService = buildEnvironmentService({
    environmentRepository,
  });

  const observerService = buildObserverService({
    observerRepository,
  });

  const sexService = buildSexService({
    sexRepository,
  });

  const userService = buildUserService({
    userRepository,
  });

  const geojsonService = buildGeoJSONService({
    localityRepository,
    localitiesGeoJSONRepository: localityGeojsonRepository,
  });

  const oidcService = buildOidcService({
    userService,
  });

  const exportService = buildExportService({
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
  });

  const altitudeService = buildAltitudeService({
    altitudeFetcher,
  });

  const importService = buildImportService({
    importQueue: queues.import,
  });

  logger.debug("Services initialized successfully");

  return {
    queues,
    ageService,
    altitudeService,
    behaviorService,
    classService,
    departmentService,
    distanceEstimateService,
    entryService,
    environmentService,
    inventoryService,
    localityService,
    numberEstimateService,
    observerService,
    sexService,
    speciesService,
    townService,
    weatherService,
    userService,
    geojsonService,
    oidcService,
    exportService,
    importService,
  };
};
