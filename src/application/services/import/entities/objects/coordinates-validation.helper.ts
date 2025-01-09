const ALTITUDE_MIN_VALUE = 0;
const ALTITUDE_MAX_VALUE = 65535;

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class CoordinatesValidatorHelper {
  public static checkAltitudeValidity(altitudeStr: string): string | null {
    if (!altitudeStr) {
      return "L'altitude du lieu-dit ne peut pas être vide";
    }

    const altitude = Number(altitudeStr);

    if (!Number.isInteger(altitude)) {
      return "L'altitude du lieu-dit doit être un entier";
    }

    if (altitude < ALTITUDE_MIN_VALUE || altitude > ALTITUDE_MAX_VALUE) {
      return `L'altitude du lieu-dit doit être un entier compris entre ${ALTITUDE_MIN_VALUE} et ${ALTITUDE_MAX_VALUE}`;
    }

    return null;
  }

  public static checkLongitudeValidity(longitudeStr: string): string | undefined {
    if (!longitudeStr) {
      return "La longitude du lieu-dit ne peut pas être vide";
    }

    const longitude = Number(longitudeStr);

    if (Number.isNaN(longitude) || longitude < -180 || longitude > 180) {
      return "La longitude du lieu-dit doit être un nombre compris entre -180 et 180";
    }
  }

  public static checkLatitudeValidity(latitudeStr: string): string | undefined {
    if (!latitudeStr) {
      return "La latitude du lieu-dit ne peut pas être vide";
    }

    const latitude = Number(latitudeStr);

    if (Number.isNaN(latitude) || latitude < -90 || latitude > 90) {
      return "La latitude du lieu-dit doit être un entier compris entre -90 et 90";
    }
  }
}
