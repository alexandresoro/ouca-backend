import type { Generated } from "kysely";

export type Town = {
  id: Generated<number>;
  departementId: number;
  code: number;
  nom: string;
  ownerId: string | null;
};
