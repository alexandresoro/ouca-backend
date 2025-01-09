import type { Generated, JSONColumnType } from "kysely";

export type User = {
  id: Generated<string>;
  extProviderName: string;
  extProviderId: string;
  settings: JSONColumnType<object> | null;
};
