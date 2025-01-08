import type { UpsertEntryInput } from "@ou-ca/common/api/entry";
import type { UpsertInventoryInput } from "@ou-ca/common/api/inventory";
import { getMinutesFromTime } from "@ou-ca/common/utils/time-format-convert";
import { getDateOnlyAsLocalISOString } from "../../../../../utils/time-utils.js";
import { getFormattedDate, getFormattedTime, isTimeValid } from "../../../../../utils/utils.js";
import { CoordinatesValidatorHelper } from "./coordinates-validation.helper.js";

const OBSERVATEUR_INDEX = 0;
const ASSOCIES_INDEX = 1;
const DATE_INDEX = 2;
const HEURE_INDEX = 3;
const DUREE_INDEX = 4;
const DEPARTEMENT_INDEX = 5;
const COMMUNE_INDEX = 6;
const LIEUDIT_INDEX = 7;
const LATITUDE_INDEX = 8;
const LONGITUDE_INDEX = 9;
const ALTITUDE_INDEX = 10;
const TEMPERATURE_INDEX = 11;
const METEOS_INDEX = 12;
const ESPECE_INDEX = 13;
const NOMBRE_INDEX = 14;
const ESTIMATION_NOMBRE_INDEX = 15;
const SEXE_INDEX = 16;
const AGE_INDEX = 17;
const ESTIMATION_DISTANCE_INDEX = 18;
const DISTANCE_INDEX = 19;
const COMP_1_INDEX = 20;
const COMP_6_INDEX = 25;
const MILIEU_1_INDEX = 26;
const MILIEU_4_INDEX = 29;
const COMMENTAIRE_INDEX = 30;

const LIST_SEPARATOR = ",";

const TEMPERATURE_MIN_VALUE = -128;
const TEMPERATURE_MAX_VALUE = 127;
const NOMBRE_MIN_VALUE = 1;
const NOMBRE_MAX_VALUE = 65535;
const DISTANCE_MIN_VALUE = 0;
const DISTANCE_MAX_VALUE = 65535;

export class ImportedDonnee {
  observateur: string;
  associes: string[];
  date: string;
  heure: string;
  duree: string;
  departement: string;
  commune: string;
  lieuDit: string;
  latitude: string;
  longitude: string;
  altitude: string;
  temperature: string;
  meteos: string[];
  espece: string;
  age: string;
  sexe: string;
  nombre: string;
  estimationNombre: string;
  distance: string;
  estimationDistance: string;
  commentaire: string;
  milieux: string[];
  comportements: string[];

  constructor(donneeTab: string[]) {
    this.observateur = donneeTab[OBSERVATEUR_INDEX].trim();
    this.associes = donneeTab[ASSOCIES_INDEX] ? donneeTab[ASSOCIES_INDEX].trim().split(LIST_SEPARATOR) : [];
    this.date = donneeTab[DATE_INDEX].trim();
    this.heure = donneeTab[HEURE_INDEX].trim();
    this.duree = donneeTab[DUREE_INDEX].trim();
    this.departement = donneeTab[DEPARTEMENT_INDEX].trim();
    this.commune = donneeTab[COMMUNE_INDEX].trim();
    this.lieuDit = donneeTab[LIEUDIT_INDEX].trim();
    this.altitude = donneeTab[ALTITUDE_INDEX].trim().replace(",", ".");
    this.longitude = donneeTab[LONGITUDE_INDEX].trim().replace(",", ".");
    this.latitude = donneeTab[LATITUDE_INDEX].trim().replace(",", ".");
    this.temperature = donneeTab[TEMPERATURE_INDEX].trim().replace(",", ".");
    this.meteos = donneeTab[METEOS_INDEX] ? donneeTab[METEOS_INDEX].trim().split(LIST_SEPARATOR) : [];
    this.espece = donneeTab[ESPECE_INDEX].trim();
    this.age = donneeTab[AGE_INDEX].trim();
    this.sexe = donneeTab[SEXE_INDEX].trim();
    this.nombre = donneeTab[NOMBRE_INDEX].trim().replace(",", ".");
    this.estimationNombre = donneeTab[ESTIMATION_NOMBRE_INDEX].trim();
    this.distance = donneeTab[DISTANCE_INDEX].trim().replace(",", ".");
    this.estimationDistance = donneeTab[ESTIMATION_DISTANCE_INDEX].trim();
    this.commentaire = donneeTab[COMMENTAIRE_INDEX].trim().replace(";", ",");

    this.comportements = [];
    for (let comportementIndex = COMP_1_INDEX; comportementIndex <= COMP_6_INDEX; comportementIndex++) {
      const comportement: string = donneeTab[comportementIndex].trim();
      if (comportement) {
        this.comportements.push(comportement);
      }
    }

    this.milieux = [];
    for (let milieuIndex = MILIEU_1_INDEX; milieuIndex <= MILIEU_4_INDEX; milieuIndex++) {
      const milieu: string = donneeTab[milieuIndex].trim();
      if (milieu) {
        this.milieux.push(milieu);
      }
    }
  }

  buildInputDonnee = (
    inventoryId: string,
    especeId: string,
    sexeId: string,
    ageId: string,
    estimationNombreId: string,
    estimationDistanceId: string | null,
    comportementsIds: Set<string>,
    milieuxIds: Set<string>,
  ): UpsertEntryInput => {
    return {
      inventoryId: inventoryId,
      speciesId: especeId,
      sexId: sexeId,
      ageId: ageId,
      numberEstimateId: estimationNombreId,
      number: this.nombre ? +this.nombre : null,
      distanceEstimateId: estimationDistanceId ?? null,
      distance: this.distance ? +this.distance : null,
      comment: this.commentaire ? this.commentaire : null,
      behaviorIds: [...comportementsIds],
      environmentIds: [...milieuxIds],
    };
  };

  buildInputInventaire = (
    observateurId: string,
    associesIds: Set<string>,
    lieuditId: string,
    meteosIds: Set<string>,
    customizedAltitude: number | null,
    customizedCoordinates: { latitude: number; longitude: number } | null,
  ): UpsertInventoryInput => {
    const customizedCoordinatesStr =
      customizedAltitude != null && customizedCoordinates != null
        ? {
            altitude: customizedAltitude,
            latitude: customizedCoordinates?.latitude,
            longitude: customizedCoordinates?.longitude,
          }
        : null;

    const formattedDate = getFormattedDate(this.date);

    return {
      observerId: observateurId,
      date: formattedDate ? getDateOnlyAsLocalISOString(formattedDate) : "null",
      time: getFormattedTime(this.heure),
      duration: this.duree.length ? getMinutesFromTime(this.duree) : null,
      localityId: lieuditId,
      coordinates: customizedCoordinatesStr,
      temperature: this.temperature == null || this.temperature === "" ? null : +this.temperature,
      weatherIds: [...meteosIds],
      associateIds: [...associesIds],
    };
  };

  checkValidity = (): string | null => {
    const observateurError = this.checkObservateurValidity();
    if (observateurError) {
      return observateurError;
    }

    const dateError = this.checkDateValidity();
    if (dateError) {
      return dateError;
    }

    const heureError = this.checkHeureValidity();
    if (heureError) {
      return heureError;
    }

    const dureeError = this.checkDureeValidity();
    if (dureeError) {
      return dureeError;
    }

    const departementError = this.checkDepartementValidity();
    if (departementError) {
      return departementError;
    }

    const communeError = this.checkCommuneValidity();
    if (communeError) {
      return communeError;
    }

    const lieuDitError = this.checkLieuditValidity();
    if (lieuDitError) {
      return lieuDitError;
    }

    const latitudeError = CoordinatesValidatorHelper.checkLatitudeValidity(this.latitude);
    if (latitudeError) {
      return latitudeError;
    }

    const longitudeError = CoordinatesValidatorHelper.checkLongitudeValidity(this.longitude);
    if (longitudeError) {
      return longitudeError;
    }

    const altitudeError = CoordinatesValidatorHelper.checkAltitudeValidity(this.altitude);
    if (altitudeError) {
      return altitudeError;
    }

    const temperatureError = this.checkTemperatureValidity();
    if (temperatureError) {
      return temperatureError;
    }

    const especeError = this.checkEspeceValidity();
    if (especeError) {
      return especeError;
    }

    const sexeError = this.checkSexeValidity();
    if (sexeError) {
      return sexeError;
    }

    const ageError = this.checkAgeValidity();
    if (ageError) {
      return ageError;
    }

    const nombreError = this.checkNombreValidity();
    if (nombreError) {
      return nombreError;
    }

    const estimationNombreError = this.checkEstimationNombreValidity();
    if (estimationNombreError) {
      return estimationNombreError;
    }

    const distanceError = this.checkDistanceValidity();
    if (distanceError) {
      return distanceError;
    }

    return null;
  };

  private checkObservateurValidity = (): string | null => {
    return this.observateur ? null : "L'observateur ne peut pas être vide";
  };

  private checkDateValidity = (): string | null => {
    if (!this.date) {
      return "La date ne peut pas être vide";
    }

    if (!getFormattedDate(this.date)) {
      return "La date ne respecte pas le format demandé: JJ/MM/AAAA";
    }

    return null;
  };

  private checkHeureValidity = (): string | null => {
    if (this.heure && !isTimeValid(this.heure)) {
      return "L'heure ne respecte pas le format demandé: HH:MM";
    }
    return null;
  };

  private checkDureeValidity = (): string | null => {
    if (this.duree && !isTimeValid(this.duree)) {
      return "La durée ne respecte pas le format demandé: HH:MM";
    }
    return null;
  };

  private checkDepartementValidity = (): string | null => {
    return this.departement ? null : "Le département ne peut pas être vide";
  };

  private checkCommuneValidity = (): string | null => {
    return this.commune ? null : "La commune du lieu-dit ne peut pas être vide";
  };

  private checkLieuditValidity = (): string | null => {
    return this.lieuDit ? null : "Le lieu-dit ne peut pas être vide";
  };

  private checkTemperatureValidity = (): string | null => {
    if (this.temperature) {
      const temperature = Number(this.temperature);

      if (!Number.isInteger(temperature)) {
        return "La température doit être un entier";
      }

      if (temperature < TEMPERATURE_MIN_VALUE || temperature > TEMPERATURE_MAX_VALUE) {
        return `La temperature doit être un entier compris entre ${TEMPERATURE_MIN_VALUE} et ${TEMPERATURE_MAX_VALUE}`;
      }
    }

    return null;
  };

  private checkEspeceValidity = (): string | null => {
    return this.espece ? null : "L'espèce ne peut pas être vide";
  };

  private checkSexeValidity = (): string | null => {
    return this.sexe ? null : "Le sexe ne peut pas être vide";
  };

  private checkAgeValidity = (): string | null => {
    return this.age ? null : "L'âge ne peut pas être vide";
  };

  private checkEstimationNombreValidity = (): string | null => {
    return this.estimationNombre ? null : "L'estimation du nombre ne peut pas être vide";
  };

  private checkNombreValidity = (): string | null => {
    if (this.nombre) {
      const nombre = Number(this.nombre);

      if (!Number.isInteger(nombre)) {
        return "Le nombre d'individus doit être un entier";
      }

      if (nombre < NOMBRE_MIN_VALUE || nombre > NOMBRE_MAX_VALUE) {
        return `Le nombre d'individus doit être un entier compris entre ${NOMBRE_MIN_VALUE} et ${NOMBRE_MAX_VALUE}`;
      }
    }

    return null;
  };

  private checkDistanceValidity = (): string | null => {
    if (this.distance) {
      const distance = Number(this.distance);

      if (!Number.isInteger(distance)) {
        return "La distance de contact doit être un entier";
      }

      if (distance < DISTANCE_MIN_VALUE || distance > DISTANCE_MAX_VALUE) {
        return `La distance de contact doit être un entier compris entre ${DISTANCE_MIN_VALUE} et ${DISTANCE_MAX_VALUE}`;
      }
    }

    return null;
  };
}
