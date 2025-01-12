import { type BreederCode, getHighestBreederStatus } from "@domain/behavior/breeder.js";

export const BREEDER_NAMES = {
  possible: "Nicheur possible",
  probable: "Nicheur probable",
  certain: "Nicheur certain",
} satisfies Record<BreederCode, string>;

export const getNicheurStatusToDisplay = (
  comportements: { nicheur?: BreederCode | null }[],
  noNicheurFoundText: string,
): string => {
  const nicheurStatusCode = getHighestBreederStatus(comportements.map((behavior) => behavior?.nicheur ?? null));

  return nicheurStatusCode ? BREEDER_NAMES[nicheurStatusCode] : noNicheurFoundText;
};
