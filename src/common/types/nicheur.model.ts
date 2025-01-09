export const POSSIBLE = "possible";
export const PROBABLE = "probable";
export const CERTAIN = "certain";

export const NICHEUR_CODES = [POSSIBLE, PROBABLE, CERTAIN] as const;

export type NicheurCode = (typeof NICHEUR_CODES)[number];

export type Nicheur = {
  code: NicheurCode;
  name: string;
  weight: number;
};

export const NICHEUR_POSSIBLE: Nicheur = {
  code: POSSIBLE,
  name: "Nicheur possible",
  weight: 1,
};

export const NICHEUR_PROBABLE: Nicheur = {
  code: PROBABLE,
  name: "Nicheur probable",
  weight: 2,
};

export const NICHEUR_CERTAIN: Nicheur = {
  code: CERTAIN,
  name: "Nicheur certain",
  weight: 3,
};

export const NICHEUR_VALUES: Record<NicheurCode, Nicheur> = {
  possible: NICHEUR_POSSIBLE,
  probable: NICHEUR_PROBABLE,
  certain: NICHEUR_CERTAIN,
};
