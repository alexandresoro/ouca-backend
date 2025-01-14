type SortOrder = "asc" | "desc";

export type PaginationOptions = {
  pageNumber?: number;
  pageSize?: number;
};

export type EntitiesCommonQueryParams = PaginationOptions & {
  q?: string;
  sortOrder?: SortOrder;
};

export type EntitiesWithLabelOrderByCommon = "id" | "libelle" | "nbDonnees";
