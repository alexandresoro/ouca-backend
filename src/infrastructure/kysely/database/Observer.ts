import type { Generated } from "kysely";

export type Observer = {
  id: Generated<number>;
  libelle: string;
  ownerId: string | null;
};
