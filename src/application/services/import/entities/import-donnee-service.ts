import type { Entry } from "@domain/entry/entry.js";
import type { Inventory } from "@domain/inventory/inventory.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import type { Age } from "@ou-ca/common/api/entities/age.js";
import type { Behavior } from "@ou-ca/common/api/entities/behavior.js";
import type { Department } from "@ou-ca/common/api/entities/department.js";
import type { DistanceEstimate } from "@ou-ca/common/api/entities/distance-estimate.js";
import type { Environment } from "@ou-ca/common/api/entities/environment.js";
import type { Locality } from "@ou-ca/common/api/entities/locality.js";
import type { NumberEstimate } from "@ou-ca/common/api/entities/number-estimate.js";
import type { Observer } from "@ou-ca/common/api/entities/observer.js";
import type { Sex } from "@ou-ca/common/api/entities/sex.js";
import type { Species } from "@ou-ca/common/api/entities/species.js";
import type { Town } from "@ou-ca/common/api/entities/town.js";
import type { Weather } from "@ou-ca/common/api/entities/weather.js";
import type { UpsertEntryInput } from "@ou-ca/common/api/entry.js";
import { areCoordinatesCustom } from "../../../../utils/coordinates-helper.js";
import { logger } from "../../../../utils/logger.js";
import { getDateOnlyAsLocalISOString } from "../../../../utils/time-utils.js";
import { areSetsContainingSameValues, isIdInListIds } from "../../../../utils/utils.js";
import { ImportService } from "./import-service.js";
import { ImportedDonnee } from "./objects/imported-donnee.object.js";

export class ImportDonneeService extends ImportService {
  private observateurs!: Observer[];
  private departements!: Department[];
  private communes!: Town[];
  private lieuxDits!: Locality[];
  private especes!: Species[];
  private ages!: Age[];
  private sexes!: Sex[];
  private estimationsNombre!: NumberEstimate[];
  private estimationsDistance!: DistanceEstimate[];
  private comportements!: Behavior[];
  private milieux!: Environment[];
  private meteos!: Weather[];
  private inventaires: Inventory[] = []; // The list of existing inventories + the ones we created along with the validation

  private existingDonnees!: Entry[];

  private newDonnees!: UpsertEntryInput[];

  protected getNumberOfColumns = (): number => {
    return 32;
  };

  protected init = async (loggedUser: LoggedUser): Promise<void> => {
    this.newDonnees = [];

    this.observateurs = await this.services.observerService.findAllObservers();
    this.departements = await this.services.departmentService.findAllDepartments();
    this.communes = await this.services.townService.findAllTowns();
    this.lieuxDits = await this.services.localityService.findAllLocalities();
    this.meteos = await this.services.weatherService.findAllWeathers();
    this.especes = (await this.services.speciesService.findAllSpecies(loggedUser))._unsafeUnwrap();
    this.sexes = await this.services.sexService.findAllSexes();
    this.ages = await this.services.ageService.findAllAges();
    this.estimationsNombre = await this.services.numberEstimateService.findAllNumberEstimates();
    this.estimationsDistance = await this.services.distanceEstimateService.findAllDistanceEstimates();
    this.comportements = await this.services.behaviorService.findAllBehaviors();
    this.milieux = await this.services.environmentService.findAllEnvironments();
    this.inventaires = await this.services.inventoryService.findAllInventories();
    this.existingDonnees = await this.services.entryService.findAllEntries();
  };

  protected validateAndPrepareEntity = async (donneeTab: string[], loggedUser: LoggedUser): Promise<string | null> => {
    const importedDonnee: ImportedDonnee = new ImportedDonnee(donneeTab);

    const dataValidity = importedDonnee.checkValidity();
    if (dataValidity) {
      return dataValidity;
    }

    // Then start getting the requested sub-objects to create the new "Donnee"

    // Get the "Observateur" or return an error if it doesn't exist
    const observateur = this.findObservateur(importedDonnee.observateur);
    if (!observateur) {
      return `L'observateur ${importedDonnee.observateur} n'existe pas`;
    }

    // Get the "Observateurs associes" or return an error if some of them doesn't exist
    const associesIds = new Set<string>();
    for (const associeLibelle of importedDonnee.associes) {
      const associe = this.findObservateur(associeLibelle);
      if (!associe) {
        return `L'observateur associé ${associeLibelle} n'existe pas`;
      }

      if (!isIdInListIds(associesIds, associe.id)) {
        associesIds.add(associe.id);
      }
    }

    // Get the "Departement" or return an error if it doesn't exist
    const departement = this.findDepartement(importedDonnee.departement);
    if (!departement) {
      return `Le département ${importedDonnee.departement} n'existe pas`;
    }

    // Get the "Commune" or return an error if it does not exist
    const commune = this.findCommune(departement.id, importedDonnee.commune);
    if (!commune) {
      return `La commune avec pour code ou nom ${importedDonnee.commune} n'existe pas dans le département ${departement.code}`;
    }

    // Get the "Lieu-dit" or return an error if it does not exist
    const lieudit = this.findLieuDit(commune.id, importedDonnee.lieuDit);
    if (!lieudit) {
      return `Le lieu-dit ${importedDonnee.lieuDit} n'existe pas dans la commune ${commune.code} - ${commune.nom} du département ${departement.code}`;
    }

    // Get the customized coordinates
    let altitude: number | null = +importedDonnee.altitude;
    let coordinates: { longitude: number; latitude: number } | null = {
      longitude: +importedDonnee.longitude,
      latitude: +importedDonnee.latitude,
    };

    // Round the coordinates
    coordinates.longitude = +coordinates.longitude.toFixed(6);
    coordinates.latitude = +coordinates.latitude.toFixed(6);

    if (!areCoordinatesCustom(lieudit, altitude, coordinates.longitude, coordinates.latitude)) {
      altitude = null;
      coordinates = null;
    }

    // Get the "Meteos" or return an error if some of them doesn't exist
    const meteosIds = new Set<string>();
    for (const libelleMeteo of importedDonnee.meteos) {
      const meteo = this.findMeteo(libelleMeteo);
      if (!meteo) {
        return `La météo ${libelleMeteo} n'existe pas`;
      }

      if (!isIdInListIds(meteosIds, meteo.id)) {
        meteosIds.add(meteo.id);
      }
    }

    // Get the "Espece" or return an error if it doesn't exist
    const espece = this.findEspece(importedDonnee.espece);
    if (!espece) {
      return `L'espèce avec pour code, nom français ou nom scientifique ${importedDonnee.espece} n'existe pas`;
    }

    // Get the "Sexe" or return an error if it doesn't exist
    const sexe = this.findSexe(importedDonnee.sexe);
    if (!sexe) {
      return `Le sexe ${importedDonnee.sexe} n'existe pas`;
    }

    // Get the "Age" or return an error if it doesn't exist
    const age = this.findAge(importedDonnee.age);
    if (!age) {
      return `L'âge ${importedDonnee.age} n'existe pas`;
    }

    // Get the "Estimation du nombre" or return an error if it doesn't exist
    const estimationNombre = this.findEstimationNombre(importedDonnee.estimationNombre);
    if (!estimationNombre) {
      return `L'estimation du nombre ${importedDonnee.estimationNombre} n'existe pas`;
    }

    // Get the "Nombre"
    const nombre = importedDonnee.nombre ? +importedDonnee.nombre : null;

    if (!estimationNombre.nonCompte && !nombre) {
      // If "Estimation du nombre" is of type "Compté" then "Nombre" should not be empty
      return `Le nombre ne doit pas être vide quand l'estimation du nombre est de type Compté`;
      // biome-ignore lint/style/noUselessElse: <explanation>
    } else if (!!estimationNombre.nonCompte && !!nombre) {
      // If "Estimation du nombre" is of type "Non-compté" then "Nombre" should be empty
      return `L'estimation du nombre ${estimationNombre.libelle} est de type Non-compté donc le nombre devrait être vide`;
    }

    // Get the "Estimation de la distance" or return an error if it doesn't exist
    let estimationDistance: DistanceEstimate | undefined | null = null;
    if (importedDonnee.estimationDistance) {
      estimationDistance = this.findEstimationDistance(importedDonnee.estimationDistance);
      if (!estimationDistance) {
        return `L'estimation de la distance ${importedDonnee.estimationDistance} n'existe pas`;
      }
    }

    // Get the "Comportements" or return an error if some of them does not exist
    const comportementsIds = new Set<string>();
    for (const comportementStr of importedDonnee.comportements) {
      const comportement = this.findComportement(comportementStr);
      if (!comportement) {
        return `Le comportement avec pour code ou libellé ${comportementStr} n'existe pas`;
      }

      if (!isIdInListIds(comportementsIds, comportement.id)) {
        comportementsIds.add(comportement.id);
      }
    }

    // Get the "Milieux" or return an error if some of them does not exist
    const milieuxIds = new Set<string>();
    for (const milieuStr of importedDonnee.milieux) {
      const milieu = this.findMilieu(milieuStr);
      if (!milieu) {
        return `Le milieu avec pour code ou libellé ${milieuStr} n'existe pas`;
      }

      if (!isIdInListIds(milieuxIds, milieu.id)) {
        milieuxIds.add(milieu.id);
      }
    }

    // OK 68 premières lignes

    const inputInventaire = importedDonnee.buildInputInventaire(
      observateur.id,
      associesIds,
      lieudit.id,
      meteosIds,
      altitude,
      coordinates,
    );

    // Find if we already have an existing inventaire that matches the one from the current donnee
    const existingInventaire = this.inventaires.find((existingInventaire) => {
      return (
        `${existingInventaire.observerId}` === inputInventaire.observerId &&
        getDateOnlyAsLocalISOString(existingInventaire.date) === inputInventaire.date &&
        existingInventaire.time === inputInventaire.time &&
        existingInventaire.duration === inputInventaire.duration &&
        `${existingInventaire?.localityId}` === inputInventaire.localityId &&
        existingInventaire.customizedCoordinates?.altitude === inputInventaire.coordinates?.altitude &&
        existingInventaire.customizedCoordinates?.longitude === inputInventaire.coordinates?.longitude &&
        existingInventaire.customizedCoordinates?.latitude === inputInventaire.coordinates?.latitude &&
        existingInventaire.temperature === inputInventaire.temperature &&
        areSetsContainingSameValues(new Set(existingInventaire.associateIds), new Set(inputInventaire.associateIds)) &&
        areSetsContainingSameValues(new Set(existingInventaire.weatherIds), new Set(inputInventaire.weatherIds))
      );
    });

    // Check if already have a similar donnee in the database
    const existingDonneeDatabase = this.existingDonnees.find((donnee) => {
      return (
        donnee.inventoryId === existingInventaire?.id &&
        donnee.speciesId === espece.id &&
        donnee.sexId === sexe.id &&
        donnee.ageId === age.id &&
        donnee.number === (importedDonnee.nombre ? +importedDonnee.nombre : null) &&
        donnee.numberEstimateId === estimationNombre.id &&
        donnee.distance === (importedDonnee.distance ? +importedDonnee.distance : null) &&
        donnee.distanceEstimateId === (estimationDistance?.id ?? null) &&
        this.compareStrings(donnee.comment, importedDonnee.commentaire) &&
        areSetsContainingSameValues(new Set(donnee.behaviorIds), comportementsIds) &&
        areSetsContainingSameValues(new Set(donnee.environmentIds), milieuxIds)
      );
    });

    if (existingDonneeDatabase) {
      return `Une donnée similaire existe déjà (voir ID=${existingDonneeDatabase.id})`;
    }

    // Check if already have a similar donnee in the ones we want to create
    const existingDonneeNew = this.newDonnees.find((donnee) => {
      return (
        donnee.inventoryId === existingInventaire?.id &&
        `${donnee.speciesId}` === espece.id &&
        `${donnee.sexId}` === sexe.id &&
        `${donnee.ageId}` === age.id &&
        donnee.number === (importedDonnee.nombre ? +importedDonnee.nombre : null) &&
        `${donnee.numberEstimateId}` === estimationNombre.id &&
        donnee.distance === (importedDonnee.distance ? +importedDonnee.distance : null) &&
        donnee.distanceEstimateId === (estimationDistance?.id ?? null) &&
        this.compareStrings(donnee.comment, importedDonnee.commentaire) &&
        areSetsContainingSameValues(new Set(donnee.behaviorIds), comportementsIds) &&
        areSetsContainingSameValues(new Set(donnee.environmentIds), milieuxIds)
      );
    });

    if (existingDonneeNew) {
      return "Une donnée similaire existe déjà dans la liste à importer";
    }

    // Now we know that we need to add this donnee
    let inventoryId: string;

    if (!existingInventaire) {
      // Create the inventaire if it does not exist yet
      const inventaire = (
        await this.services.inventoryService.createInventory(inputInventaire, loggedUser)
      )._unsafeUnwrap();
      inventoryId = `${inventaire.id}`;

      // Add the inventaire to the list
      this.inventaires.push(inventaire);
    } else {
      inventoryId = `${existingInventaire.id}`;
    }

    // Build the donnee
    const newDonnee = importedDonnee.buildInputDonnee(
      inventoryId,
      espece.id,
      sexe.id,
      age.id,
      estimationNombre.id,
      estimationDistance?.id ?? null,
      comportementsIds,
      milieuxIds,
    );

    this.newDonnees.push(newDonnee);

    return null;
  };

  protected persistAllValidEntities = async (loggedUser: LoggedUser): Promise<void> => {
    logger.info({ loggedUser }, `Inserting ${this.newDonnees.length} new entries`);
    for (const inputDonnee of this.newDonnees) {
      const insertionResult = await this.services.entryService.createEntry(inputDonnee, loggedUser);

      if (insertionResult.isErr()) {
        logger.error({ loggedUser, inputDonnee }, `Error while inserting entry: ${insertionResult.error.type}`);
        return Promise.reject(insertionResult.error);
      }
    }
  };

  private findObservateur = (libelleObservateur: string): Observer | undefined => {
    return this.observateurs.find((observateur) => {
      return this.compareStrings(observateur.libelle, libelleObservateur);
    });
  };

  private findDepartement = (codeDepartement: string): Department | undefined => {
    return this.departements.find((departement) => {
      return this.compareStrings(departement.code, codeDepartement);
    });
  };

  private findCommune = (departementId: string, nomOrCodeCommune: string): Town | undefined => {
    return this.communes.find((commune) => {
      return (
        commune.departmentId === departementId &&
        (this.compareStrings(`${commune.code}`, nomOrCodeCommune) || this.compareStrings(commune.nom, nomOrCodeCommune))
      );
    });
  };

  private findLieuDit = (communeId: string, nomLieuDit: string): Locality | undefined => {
    return this.lieuxDits.find((lieuDit) => {
      return lieuDit.townId === communeId && this.compareStrings(lieuDit.nom, nomLieuDit);
    });
  };

  private findMeteo = (libelleMeteo: string): Weather | undefined => {
    return this.meteos.find((meteo) => {
      return this.compareStrings(meteo.libelle, libelleMeteo);
    });
  };

  private findEspece = (codeOrNomEspece: string): Species | undefined => {
    return this.especes.find((espece) => {
      return (
        this.compareStrings(espece.code, codeOrNomEspece) ||
        this.compareStrings(espece.nomFrancais, codeOrNomEspece) ||
        this.compareStrings(espece.nomLatin, codeOrNomEspece)
      );
    });
  };

  private findSexe = (libelleSexe: string): Sex | undefined => {
    return this.sexes.find((sexe) => {
      return this.compareStrings(sexe.libelle, libelleSexe);
    });
  };

  private findAge = (libelleMeteo: string): Age | undefined => {
    return this.ages.find((age) => {
      return this.compareStrings(age.libelle, libelleMeteo);
    });
  };

  private findEstimationNombre = (libelleEstimation: string): NumberEstimate | undefined => {
    return this.estimationsNombre.find((estimation) => {
      return this.compareStrings(estimation.libelle, libelleEstimation);
    });
  };

  private findEstimationDistance = (libelleEstimation: string): DistanceEstimate | undefined => {
    return this.estimationsDistance.find((estimation) => {
      return this.compareStrings(estimation.libelle, libelleEstimation);
    });
  };

  private findComportement = (codeOrLibelleComportement: string): Behavior | undefined => {
    return this.comportements.find((comportement) => {
      return (
        this.compareStrings(comportement.code, codeOrLibelleComportement) ||
        this.compareStrings(comportement.libelle, codeOrLibelleComportement)
      );
    });
  };

  private findMilieu = (codeOrLibelleMilieu: string): Environment | undefined => {
    return this.milieux.find((milieu) => {
      return (
        this.compareStrings(milieu.code, codeOrLibelleMilieu) ||
        this.compareStrings(milieu.libelle, codeOrLibelleMilieu)
      );
    });
  };
}
