const SORT_ORDER = ["asc", "desc", null] as const;

export type SortOrder = (typeof SORT_ORDER)[number];
