export const POSSIBLE = "possible";
export const PROBABLE = "probable";
export const CERTAIN = "certain";

export const BREEDER_CODES = [POSSIBLE, PROBABLE, CERTAIN] as const;

export type BreederCode = (typeof BREEDER_CODES)[number];

export const BREEDER_WEIGHTS = {
  possible: 1,
  probable: 2,
  certain: 3,
} satisfies Record<BreederCode, number>;

export const getHighestBreederStatus = (breederStatuses: (BreederCode | null)[]): BreederCode | null => {
  // Compute nicheur status for the Donnée (i.e. highest nicheur status of the comportements)
  // First we keep only the comportements having a nicheur status
  const breederStatusesNonNull = breederStatuses.filter((breederStatus): breederStatus is BreederCode => {
    return breederStatuses != null;
  });

  // Then we keep the highest nicheur status
  return (
    breederStatusesNonNull
      .sort((firstStatus, secondStatus) => BREEDER_WEIGHTS[secondStatus] - BREEDER_WEIGHTS[firstStatus])
      .at(0) ?? null
  );
};
