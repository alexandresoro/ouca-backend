import type { Inventory } from "@domain/inventory/inventory.js";
import type { AccessFailureReason } from "@domain/shared/failure-reason.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import type { Inventory as InventoryApi } from "@ou-ca/common/api/entities/inventory.js";
import { Result, err, ok } from "neverthrow";
import { getDateOnlyAsLocalISOString } from "../../../utils/time-utils.js";
import type { Services } from "../../services/services.js";

export const enrichedInventory = async (
  services: Services,
  inventory: Inventory,
  user: LoggedUser | null,
): Promise<Result<InventoryApi, AccessFailureReason | "extendedDataNotFound">> => {
  const enrichedResult = Result.combine([
    await services.observerService.findObserver(Number.parseInt(inventory.observerId), user),
    await services.observerService.findObservers(inventory.associateIds, user),
    await services.localityService.findLocality(Number.parseInt(inventory.localityId), user),
    await services.weatherService.findWeathers(inventory.weatherIds, user),
  ]);

  if (enrichedResult.isErr()) {
    return err(enrichedResult.error);
  }

  const [observer, associates, locality, weathers] = enrichedResult.value;

  if (!observer || !locality) {
    return err("extendedDataNotFound");
  }

  const { time, duration, date, ...restInventory } = inventory;

  return ok({
    ...restInventory,
    heure: time,
    duree: duration,
    date: getDateOnlyAsLocalISOString(date),
    observer,
    associates,
    locality,
    weathers,
  });
};
