import { getKyselyInstance } from "@infrastructure/kysely/kysely.js";
import { getUmzugInstance } from "@infrastructure/umzug/umzug-instance.js";

// Use dedicated Kysely instance to be able to tear it down as soon as CLI is finished
const kysely = getKyselyInstance();

await getUmzugInstance(kysely).runAsCLI();

await kysely.destroy();
