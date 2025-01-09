import type { BehaviorNicheur } from "@ou-ca/api/models";

const NICHEUR_WEIGHTS = {
  possible: 1,
  probable: 2,
  certain: 3,
} satisfies Record<NonNullable<BehaviorNicheur>, number>;

export const getHighestBreederStatus = (comportements: { nicheur: BehaviorNicheur }[]): BehaviorNicheur => {
  // Compute nicheur status for the Donnée (i.e. highest nicheur status of the comportements)
  // First we keep only the comportements having a nicheur status
  const nicheurStatuses = comportements
    ?.filter((comportement): comportement is { nicheur: NonNullable<BehaviorNicheur> } => {
      return comportement.nicheur != null;
    })
    .map(({ nicheur }) => nicheur);

  // Then we keep the highest nicheur status
  return (
    nicheurStatuses
      .sort((firstStatus, secondStatus) => NICHEUR_WEIGHTS[secondStatus] - NICHEUR_WEIGHTS[firstStatus])
      .at(0) ?? null
  );
};
