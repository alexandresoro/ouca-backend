import type { Generated } from "kysely";

export type Environment = {
  id: Generated<number>;
  code: string;
  libelle: string;
  ownerId: string | null;
};
