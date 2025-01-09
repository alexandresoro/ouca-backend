import type { Generated } from "kysely";

export type Weather = {
  id: Generated<number>;
  libelle: string;
  ownerId: string | null;
};
