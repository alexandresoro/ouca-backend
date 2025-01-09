import type { Generated } from "kysely";

export type DistanceEstimate = {
  id: Generated<number>;
  libelle: string;
  ownerId: string | null;
};
