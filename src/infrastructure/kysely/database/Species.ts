import type { Generated } from "kysely";

export type Species = {
  id: Generated<number>;
  classeId: number | null;
  code: string;
  nomFrancais: string;
  nomLatin: string;
  ownerId: string | null;
};
