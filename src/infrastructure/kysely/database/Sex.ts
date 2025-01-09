import type { Generated } from "kysely";

export type Sex = {
  id: Generated<number>;
  libelle: string;
  ownerId: string | null;
};
