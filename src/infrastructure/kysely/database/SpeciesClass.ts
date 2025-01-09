import type { Generated } from "kysely";

export type SpeciesClass = {
  id: Generated<number>;
  libelle: string;
  ownerId: string | null;
};
