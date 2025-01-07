import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import usePaginationParams from "@hooks/usePaginationParams";
import type { GetV1EntriesOrderBy, GetV1SearchSpeciesOrderBy } from "@ou-ca/api/models";
import { useApiEntriesInfiniteQuery } from "@services/api/entry/api-entry-queries";
import { useApiDownloadExport } from "@services/api/export/api-export-queries";
import { useApiSearchInfiniteSpecies } from "@services/api/search/api-search-queries";
import { Export } from "@styled-icons/boxicons-regular";
import { useAtomValue } from "jotai";
import { Fragment, type FunctionComponent, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import useDeepCompareEffect from "use-deep-compare-effect";
import SearchEntriesTable from "./search-entries-table/SearchEntriesTable";
import SearchFilterPanel from "./search-filter-panel/SearchFilterPanel";
import SearchSpeciesTable from "./search-species-table/SearchSpeciesTable";
import { searchEntriesCriteriaAtom } from "./searchEntriesCriteriaAtom";

const SELECTED_TAB_MAPPING = ["entries", "species"] as const;

const SearchPage: FunctionComponent = () => {
  const { t } = useTranslation();

  const searchCriteria = useAtomValue(searchEntriesCriteriaAtom);

  const [selectedTab, setSelectedTab] = useState(0);

  const [isExporting, setIsExporting] = useState(false);

  const {
    orderBy: orderByEntries,
    setOrderBy: setOrderByEntries,
    sortOrder: sortOrderEntries,
    setSortOrder: setSortOrderEntries,
  } = usePaginationParams<GetV1EntriesOrderBy>({
    orderBy: "date",
    sortOrder: "desc",
  });

  const {
    orderBy: orderBySpecies,
    setOrderBy: setOrderBySpecies,
    sortOrder: sortOrderSpecies,
    setSortOrder: setSortOrderSpecies,
  } = usePaginationParams<GetV1SearchSpeciesOrderBy>({
    orderBy: "nbDonnees",
    sortOrder: "desc",
  });

  const {
    data: entriesInfinite,
    fetchNextPage: fetchNextPageEntries,
    hasNextPage: hasNextPageEntries,
    mutate: mutateEntries,
  } = useApiEntriesInfiniteQuery({
    pageSize: 10,
    orderBy: orderByEntries,
    sortOrder: sortOrderEntries,
    ...searchCriteria,
  });

  const {
    data: speciesInfinite,
    fetchNextPage: fetchNextPageSpecies,
    hasNextPage: hasNextPageSpecies,
    mutate: mutateSpecies,
  } = useApiSearchInfiniteSpecies({
    pageSize: 10,
    orderBy: orderBySpecies,
    sortOrder: sortOrderSpecies,
    ...searchCriteria,
  });

  const handleRequestSortEntries = (sortingColumn: GetV1EntriesOrderBy) => {
    const isAsc = orderByEntries === sortingColumn && sortOrderEntries === "asc";
    setSortOrderEntries(isAsc ? "desc" : "asc");
    setOrderByEntries(sortingColumn);
  };

  const handleRequestSortSpecies = (sortingColumn: GetV1SearchSpeciesOrderBy) => {
    const isAsc = orderBySpecies === sortingColumn && sortOrderSpecies === "asc";
    setSortOrderSpecies(isAsc ? "desc" : "asc");
    setOrderBySpecies(sortingColumn);
  };

  const downloadExport = useApiDownloadExport({
    filename: t("exportFilename.entries"),
    path: "/generate-export/entries",
    queryParams: searchCriteria,
  });

  const handleEntryChange = useCallback(async () => {
    await Promise.all([mutateEntries(), mutateSpecies()]);
  }, [mutateEntries, mutateSpecies]);

  // When query params change, we need to refetch the data
  useDeepCompareEffect(() => {
    void handleEntryChange();
  }, [searchCriteria, handleEntryChange]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    void mutateEntries();
  }, [orderByEntries, sortOrderEntries, mutateEntries]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    void mutateSpecies();
  }, [orderBySpecies, sortOrderSpecies, mutateSpecies]);

  const handleExportRequested = async () => {
    setIsExporting(true);
    await downloadExport();
    setIsExporting(false);
  };

  return (
    <div className="container mx-auto flex gap-16 mt-6">
      <div className="flex-shrink-0 w-80">
        <SearchFilterPanel />
      </div>

      <TabGroup selectedIndex={selectedTab} onChange={setSelectedTab} className="flex-grow">
        <div className="flex justify-between items-center mb-12 mr-12">
          <TabList className="join">
            <Tab as={Fragment}>
              {({ selected }) => (
                <button
                  type="button"
                  className={`join-item btn btn-primary uppercase ${
                    selected ? "btn-active" : "btn-primary btn-outline"
                  }`}
                >
                  {t("view.tab.observations")}
                </button>
              )}
            </Tab>
            <Tab as={Fragment}>
              {({ selected }) => (
                <button
                  type="button"
                  className={`join-item btn btn-primary uppercase ${
                    selected ? "btn-active" : "btn-primary btn-outline"
                  }`}
                >
                  {t("view.tab.species")}
                </button>
              )}
            </Tab>
          </TabList>
          <div className="grow justify-end items-center ml-12">
            {SELECTED_TAB_MAPPING[selectedTab] === "entries" && entriesInfinite?.[0]?.meta != null && (
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    // TODO: Test what happens w/ big data sets before enabling this
                    disabled={
                      entriesInfinite[0].meta.count === 0 || entriesInfinite[0].meta.count > 10000 || isExporting
                    }
                    className="btn btn-sm btn-outline btn-secondary uppercase"
                    onClick={() => handleExportRequested()}
                  >
                    {isExporting ? <span className="loading loading-spinner loading-xs" /> : <Export className="h-5" />}
                    {isExporting ? t("observationFilter.exportOnGoing") : t("observationFilter.exportToExcel")}
                  </button>
                  {entriesInfinite[0].meta.count > 10000 && (
                    <div className="tooltip tooltip-bottom" data-tip={t("observationFilter.exportLimitMessage")}>
                      <div className="w-6 border-info border-2 rounded-full text-sm text-info font-semibold cursor-default">
                        ?
                      </div>
                    </div>
                  )}
                </div>
                <span className="text-sm font-bold uppercase text-base-content">
                  {t("search.entriesCount", { count: entriesInfinite[0].meta.count })}
                </span>
              </div>
            )}
            {SELECTED_TAB_MAPPING[selectedTab] === "species" && speciesInfinite?.[0]?.meta != null && (
              <span className="flex justify-end text-sm font-bold uppercase text-base-content">
                {t("search.speciesCount", { count: speciesInfinite[0].meta.count })}
              </span>
            )}
          </div>
        </div>
        <TabPanels>
          <TabPanel>
            <SearchEntriesTable
              entries={entriesInfinite?.flatMap((page) => page.data) ?? []}
              handleRequestSort={handleRequestSortEntries}
              orderBy={orderByEntries}
              sortOrder={sortOrderEntries}
              onEntryUpdated={() => handleEntryChange()}
              onEntryDeleted={() => handleEntryChange()}
              hasNextPage={hasNextPageEntries}
              onMoreRequested={fetchNextPageEntries}
            />
          </TabPanel>
          <TabPanel>
            <SearchSpeciesTable
              species={speciesInfinite?.flatMap((page) => page.data) ?? []}
              handleRequestSort={handleRequestSortSpecies}
              orderBy={orderBySpecies}
              sortOrder={sortOrderSpecies}
              hasNextPage={hasNextPageSpecies}
              onMoreRequested={fetchNextPageSpecies}
            />
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
};

export default SearchPage;
