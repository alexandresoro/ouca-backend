export const POSSIBLE = "possible";
export const PROBABLE = "probable";
export const CERTAIN = "certain";

export const BREEDER_CODES = [POSSIBLE, PROBABLE, CERTAIN] as const;

export type BreederCode = (typeof BREEDER_CODES)[number];
