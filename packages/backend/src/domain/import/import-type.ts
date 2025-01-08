export const IMPORT_TYPE = [
  "observer",
  "department",
  "town",
  "locality",
  "weather",
  "species-class",
  "species",
  "age",
  "sex",
  "number-estimate",
  "distance-estimate",
  "behavior",
  "environment",
  "entry",
] as const;

export type ImportType = (typeof IMPORT_TYPE)[number];
