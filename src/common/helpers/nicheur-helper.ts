import { NICHEUR_VALUES, type NicheurCode } from "../types/nicheur.model.js";

export const getHighestNicheurStatus = (comportements: { nicheur?: NicheurCode | null }[]): NicheurCode | null => {
  // Compute nicheur status for the Donnée (i.e. highest nicheur status of the comportements)
  // First we keep only the comportements having a nicheur status
  const nicheurStatuses = comportements
    ?.filter((comportement): comportement is { nicheur: NicheurCode } => {
      return comportement?.nicheur != null;
    })
    .map((comportement) => {
      return comportement.nicheur;
    });

  // Then we keep the highest nicheur status
  const nicheurStatusCode =
    nicheurStatuses?.length &&
    nicheurStatuses.reduce((nicheurStatusOne, nicheurStatusTwo) => {
      return NICHEUR_VALUES[nicheurStatusOne].weight >= NICHEUR_VALUES[nicheurStatusTwo].weight
        ? nicheurStatusOne
        : nicheurStatusTwo;
    });

  return nicheurStatusCode ? NICHEUR_VALUES[nicheurStatusCode].code : null;
};

export const getNicheurStatusToDisplay = (
  comportements: { nicheur?: NicheurCode | null }[],
  noNicheurFoundText: string,
): string => {
  const nicheurStatusCode = getHighestNicheurStatus(comportements);

  return nicheurStatusCode ? NICHEUR_VALUES[nicheurStatusCode].name : noNicheurFoundText;
};
