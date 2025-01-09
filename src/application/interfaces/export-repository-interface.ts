export type ExportRepository = {
  getExport(exportId: string): Promise<Buffer | null>;
  storeExport(entitiesToExport: Record<string, unknown>[], sheetName: string): Promise<string>;
};
