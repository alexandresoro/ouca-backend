import type { Town } from "@domain/town/town.js";
import type { Town as TownRepository } from "@infrastructure/kysely/database/Town.js";

type RawTown = Omit<TownRepository, "id" | "departementId"> & {
  id: string;
  departementId: string;
};

export const reshapeRawTown = (rawTown: RawTown): Town => {
  const { departementId, ...restRawTown } = rawTown;

  return {
    ...restRawTown,
    departmentId: departementId,
  };
};

export const reshapeRawTownWithDepartmentCode = (rawTown: RawTown & { departmentCode: string | null }) => {
  const { departementId, ...restRawTown } = rawTown;

  return {
    ...restRawTown,
    departmentId: departementId,
  };
};
