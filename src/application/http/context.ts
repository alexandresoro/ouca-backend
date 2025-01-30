import type { Factory } from "hono/factory";
import type { LoggedUserVariables } from "./middlewares/logged-user.js";

export type Env<T> = {
  // biome-ignore lint/style/useNamingConvention: <explanation>
  Variables: T;
};

export type EnvApiV1 = Env<LoggedUserVariables>;

export type ApiV1Factory = Factory<EnvApiV1>;
