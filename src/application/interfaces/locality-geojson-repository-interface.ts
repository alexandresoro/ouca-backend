export type LocalityGeoJSONRepository = {
  getLocalities(): Promise<Buffer | null>;
  saveLocalities(localitiesCollection: unknown): Promise<void>;
};
