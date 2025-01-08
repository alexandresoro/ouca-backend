import { useNotifications } from "@hooks/useNotifications";
import usePaginationParams from "@hooks/usePaginationParams";
import { useUser } from "@hooks/useUser";
import ContentContainerLayout from "@layouts/ContentContainerLayout";
import type { DistanceEstimate, GetV1DistanceEstimatesOrderBy, UpsertDistanceEstimateInput } from "@ou-ca/api/models";
import {
  useApiDistanceEstimateCreate,
  useApiDistanceEstimateDelete,
  useApiDistanceEstimateUpdate,
  useApiDistanceEstimatesInfiniteQuery,
} from "@services/api/distance-estimate/api-distance-estimate-queries";
import { useApiDownloadExport } from "@services/api/export/api-export-queries";
import { FetchError } from "@utils/fetch-api";
import { type FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import useDeepCompareEffect from "use-deep-compare-effect";
import EntityUpsertDialog from "../common/EntityUpsertDialog";
import ManageEntitiesHeader from "../common/ManageEntitiesHeader";
import ManageTopBar from "../common/ManageTopBar";
import EstimationDistanceCreate from "./EstimationDistanceCreate";
import EstimationDistanceDeleteDialog from "./EstimationDistanceDeleteDialog";
import EstimationDistanceTable from "./EstimationDistanceTable";
import EstimationDistanceUpdate from "./EstimationDistanceUpdate";

const EstimationDistancePage: FunctionComponent = () => {
  const { t } = useTranslation();

  const user = useUser();

  const { displayNotification } = useNotifications();

  const [upsertDistanceEstimateDialog, setUpsertDistanceEstimateDialog] = useState<
    null | { mode: "create" } | { mode: "update"; distanceEstimate: DistanceEstimate }
  >(null);
  const [distanceEstimateToDelete, setDistanceEstimateToDelete] = useState<DistanceEstimate | null>(null);

  const { query, setQuery, orderBy, setOrderBy, sortOrder, setSortOrder } =
    usePaginationParams<GetV1DistanceEstimatesOrderBy>({ orderBy: "libelle" });

  const queryParams = {
    q: query,
    pageSize: 10,
    orderBy,
    sortOrder,
  };

  const { data, fetchNextPage, hasNextPage, mutate } = useApiDistanceEstimatesInfiniteQuery(queryParams);

  // When query params change, we need to refetch the data
  useDeepCompareEffect(() => {
    void mutate();
  }, [queryParams, mutate]);

  const handleRequestSort = (sortingColumn: GetV1DistanceEstimatesOrderBy) => {
    const isAsc = orderBy === sortingColumn && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setOrderBy(sortingColumn);
  };

  const createDistanceEstimate = useApiDistanceEstimateCreate();

  const handleUpsertDistanceEstimateError = (e: unknown) => {
    if (e instanceof FetchError && e.status === 409) {
      displayNotification({
        type: "error",
        message: t("distancePrecisionAlreadyExistingError"),
      });
    } else {
      displayNotification({
        type: "error",
        message: t("retrieveGenericSaveError"),
      });
    }
  };

  const { trigger: updateDistanceEstimate } = useApiDistanceEstimateUpdate(
    upsertDistanceEstimateDialog?.mode === "update" ? upsertDistanceEstimateDialog.distanceEstimate?.id : null,
    {
      onSuccess: () => {
        void mutate();

        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertDistanceEstimateDialog(null);
      },
      onError: (e) => {
        void mutate();

        handleUpsertDistanceEstimateError(e);
      },
    },
  );

  const { trigger: deleteDistanceEstimate } = useApiDistanceEstimateDelete(distanceEstimateToDelete?.id ?? null, {
    onSuccess: () => {
      void mutate();

      displayNotification({
        type: "success",
        message: t("deleteConfirmationMessage"),
      });
      setDistanceEstimateToDelete(null);
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
    filename: t("distancePrecisions"),
    path: "/generate-export/distance-estimates",
  });

  const handleCreateClick = () => {
    setUpsertDistanceEstimateDialog({ mode: "create" });
  };

  const handleUpdateClick = (distanceEstimate: DistanceEstimate) => {
    setUpsertDistanceEstimateDialog({ mode: "update", distanceEstimate });
  };

  const handleExportClick = () => {
    void downloadExport();
  };

  const handleCreateDistanceEstimate = (input: UpsertDistanceEstimateInput) => {
    createDistanceEstimate({ body: input })
      .then(() => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertDistanceEstimateDialog(null);
      })
      .catch((e) => {
        handleUpsertDistanceEstimateError(e);
      })
      .finally(() => {
        void mutate();
      });
  };

  const handleUpdateDistanceEstimate = (_id: string, input: UpsertDistanceEstimateInput) => {
    void updateDistanceEstimate({ body: input });
  };

  const handleDeleteDistanceEstimate = () => {
    void deleteDistanceEstimate();
  };

  return (
    <>
      <ManageTopBar
        title={t("distancePrecisions")}
        enableCreate={user?.permissions.distanceEstimate.canCreate}
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
        <EstimationDistanceTable
          distanceEstimates={data?.flatMap((page) => page.data)}
          onClickUpdateDistanceEstimate={handleUpdateClick}
          onClickDeleteDistanceEstimate={setDistanceEstimateToDelete}
          hasNextPage={hasNextPage}
          onMoreRequested={fetchNextPage}
          orderBy={orderBy}
          sortOrder={sortOrder}
          handleRequestSort={handleRequestSort}
        />
      </ContentContainerLayout>
      <EntityUpsertDialog
        open={upsertDistanceEstimateDialog != null}
        onClose={() => setUpsertDistanceEstimateDialog(null)}
        title={
          upsertDistanceEstimateDialog?.mode === "create"
            ? t("distancePrecisionCreationTitle")
            : upsertDistanceEstimateDialog?.mode === "update"
              ? t("distancePrecisionEditionTitle")
              : undefined
        }
      >
        {upsertDistanceEstimateDialog?.mode === "create" && (
          <EstimationDistanceCreate
            onCancel={() => setUpsertDistanceEstimateDialog(null)}
            onSubmit={handleCreateDistanceEstimate}
          />
        )}
        {upsertDistanceEstimateDialog?.mode === "update" && (
          <EstimationDistanceUpdate
            distanceEstimate={upsertDistanceEstimateDialog.distanceEstimate}
            onCancel={() => setUpsertDistanceEstimateDialog(null)}
            onSubmit={handleUpdateDistanceEstimate}
          />
        )}
      </EntityUpsertDialog>
      <EstimationDistanceDeleteDialog
        distanceEstimateToDelete={distanceEstimateToDelete}
        onCancelDeletion={() => setDistanceEstimateToDelete(null)}
        onConfirmDeletion={handleDeleteDistanceEstimate}
      />
    </>
  );
};

export default EstimationDistancePage;
