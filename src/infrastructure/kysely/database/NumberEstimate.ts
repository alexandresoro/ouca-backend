import type { Generated } from "kysely";

export type NumberEstimate = {
  id: Generated<number>;
  libelle: string;
  nonCompte: boolean;
  ownerId: string | null;
};
