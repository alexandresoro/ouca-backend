import type { Generated } from "kysely";

export type Department = {
  id: Generated<number>;
  code: string;
  ownerId: string | null;
};
