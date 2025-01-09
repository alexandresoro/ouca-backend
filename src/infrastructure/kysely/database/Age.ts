import type { Generated } from "kysely";

export type Age = {
  id: Generated<number>;
  libelle: string;
  ownerId: string | null;
};
