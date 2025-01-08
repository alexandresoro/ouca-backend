import { useNotifications } from "@hooks/useNotifications";
import usePaginationParams from "@hooks/usePaginationParams";
import { useUser } from "@hooks/useUser";
import ContentContainerLayout from "@layouts/ContentContainerLayout";
import type { GetV1WeathersOrderBy, UpsertWeatherInput, Weather } from "@ou-ca/api/models";
import { useApiDownloadExport } from "@services/api/export/api-export-queries";
import {
  useApiWeatherCreate,
  useApiWeatherDelete,
  useApiWeatherUpdate,
  useApiWeathersInfiniteQuery,
} from "@services/api/weather/api-weather-queries";
import { FetchError } from "@utils/fetch-api";
import { type FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import useDeepCompareEffect from "use-deep-compare-effect";
import EntityUpsertDialog from "../common/EntityUpsertDialog";
import ManageEntitiesHeader from "../common/ManageEntitiesHeader";
import ManageTopBar from "../common/ManageTopBar";
import MeteoCreate from "./MeteoCreate";
import MeteoDeleteDialog from "./MeteoDeleteDialog";
import MeteoTable from "./MeteoTable";
import MeteoUpdate from "./MeteoUpdate";

const MeteoPage: FunctionComponent = () => {
  const { t } = useTranslation();

  const user = useUser();

  const { displayNotification } = useNotifications();

  const [upsertWeatherDialog, setUpsertWeatherDialog] = useState<
    null | { mode: "create" } | { mode: "update"; weather: Weather }
  >(null);
  const [weatherToDelete, setWeatherToDelete] = useState<Weather | null>(null);

  const { query, setQuery, orderBy, setOrderBy, sortOrder, setSortOrder } = usePaginationParams<GetV1WeathersOrderBy>({
    orderBy: "libelle",
  });

  const queryParams = {
    q: query,
    pageSize: 10,
    orderBy,
    sortOrder,
  };

  const { data, fetchNextPage, hasNextPage, mutate } = useApiWeathersInfiniteQuery(queryParams);

  // When query params change, we need to refetch the data
  useDeepCompareEffect(() => {
    void mutate();
  }, [queryParams, mutate]);

  const handleRequestSort = (sortingColumn: GetV1WeathersOrderBy) => {
    const isAsc = orderBy === sortingColumn && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setOrderBy(sortingColumn);
  };

  const createWeather = useApiWeatherCreate();

  const handleUpsertWeatherError = (e: unknown) => {
    if (e instanceof FetchError && e.status === 409) {
      displayNotification({
        type: "error",
        message: t("weatherAlreadyExistingError"),
      });
    } else {
      displayNotification({
        type: "error",
        message: t("retrieveGenericSaveError"),
      });
    }
  };

  const { trigger: updateWeather } = useApiWeatherUpdate(
    upsertWeatherDialog?.mode === "update" ? upsertWeatherDialog.weather?.id : null,
    {
      onSuccess: () => {
        void mutate();

        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertWeatherDialog(null);
      },
      onError: (e) => {
        void mutate();

        handleUpsertWeatherError(e);
      },
    },
  );

  const { trigger: deleteWeather } = useApiWeatherDelete(weatherToDelete?.id ?? null, {
    onSuccess: () => {
      void mutate();

      displayNotification({
        type: "success",
        message: t("deleteConfirmationMessage"),
      });
      setWeatherToDelete(null);
    },
    onError: () => {
      void mutate();

      displayNotification({
        type: "error",
        message: t("deleteErrorMessage"),
      });
    },
  });

  const downloadExport = useApiDownloadExport({
    filename: t("weathers"),
    path: "/generate-export/weathers",
  });

  const handleCreateClick = () => {
    setUpsertWeatherDialog({ mode: "create" });
  };

  const handleUpdateClick = (weather: Weather) => {
    setUpsertWeatherDialog({ mode: "update", weather });
  };

  const handleExportClick = () => {
    void downloadExport();
  };

  const handleCreateWeather = (input: UpsertWeatherInput) => {
    createWeather({ body: input })
      .then(() => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertWeatherDialog(null);
      })
      .catch((e) => {
        handleUpsertWeatherError(e);
      })
      .finally(() => {
        void mutate();
      });
  };

  const handleUpdateWeather = (_id: string, input: UpsertWeatherInput) => {
    void updateWeather({ body: input });
  };

  const handleDeleteWeather = () => {
    void deleteWeather();
  };

  return (
    <>
      <ManageTopBar
        title={t("weathers")}
        enableCreate={user?.permissions.weather.canCreate}
        onClickCreate={handleCreateClick}
        onClickExport={handleExportClick}
      />
      <ContentContainerLayout>
        <ManageEntitiesHeader
          value={query}
          onChange={(e) => {
            setQuery(e.currentTarget.value);
          }}
          count={data?.[0]?.meta.count}
        />
        <MeteoTable
          weathers={data?.flatMap((page) => page.data)}
          onClickUpdateWeather={handleUpdateClick}
          onClickDeleteWeather={setWeatherToDelete}
          hasNextPage={hasNextPage}
          onMoreRequested={fetchNextPage}
          orderBy={orderBy}
          sortOrder={sortOrder}
          handleRequestSort={handleRequestSort}
        />
      </ContentContainerLayout>
      <EntityUpsertDialog
        open={upsertWeatherDialog != null}
        onClose={() => setUpsertWeatherDialog(null)}
        title={
          upsertWeatherDialog?.mode === "create"
            ? t("weatherCreationTitle")
            : upsertWeatherDialog?.mode === "update"
              ? t("weatherEditionTitle")
              : undefined
        }
      >
        {upsertWeatherDialog?.mode === "create" && (
          <MeteoCreate onCancel={() => setUpsertWeatherDialog(null)} onSubmit={handleCreateWeather} />
        )}
        {upsertWeatherDialog?.mode === "update" && (
          <MeteoUpdate
            weather={upsertWeatherDialog.weather}
            onCancel={() => setUpsertWeatherDialog(null)}
            onSubmit={handleUpdateWeather}
          />
        )}
      </EntityUpsertDialog>
      <MeteoDeleteDialog
        weatherToDelete={weatherToDelete}
        onCancelDeletion={() => setWeatherToDelete(null)}
        onConfirmDeletion={handleDeleteWeather}
      />
    </>
  );
};

export default MeteoPage;
