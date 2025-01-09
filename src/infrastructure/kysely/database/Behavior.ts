import type { Generated } from "kysely";

type Breeder = "possible" | "probable" | "certain";

export type Behavior = {
  id: Generated<number>;
  code: string;
  libelle: string;
  nicheur: Breeder | null;
  ownerId: string | null;
};
