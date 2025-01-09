import type { ColumnType, Generated } from "kysely";

export type Locality = {
  id: Generated<number>;
  communeId: number;
  nom: string;
  altitude: number;
  longitude: number;
  latitude: number;
  ownerId: string | null;

  // TODO: To be removed once we clean up the database
  coordinatesSystem: ColumnType<never, "gps", never>;
};
