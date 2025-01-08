import { useNotifications } from "@hooks/useNotifications";
import usePaginationParams from "@hooks/usePaginationParams";
import { useUser } from "@hooks/useUser";
import ContentContainerLayout from "@layouts/ContentContainerLayout";
import type { GetV1NumberEstimatesOrderBy, NumberEstimate, UpsertNumberEstimateInput } from "@ou-ca/api/models";
import { useApiDownloadExport } from "@services/api/export/api-export-queries";
import {
  useApiNumberEstimateCreate,
  useApiNumberEstimateDelete,
  useApiNumberEstimateUpdate,
  useApiNumberEstimatesInfiniteQuery,
} from "@services/api/number-estimate/api-number-estimate-queries";
import { FetchError } from "@utils/fetch-api";
import { type FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import useDeepCompareEffect from "use-deep-compare-effect";
import EntityUpsertDialog from "../common/EntityUpsertDialog";
import ManageEntitiesHeader from "../common/ManageEntitiesHeader";
import ManageTopBar from "../common/ManageTopBar";
import EstimationNombreCreate from "./EstimationNombreCreate";
import EstimationNombreDeleteDialog from "./EstimationNombreDeleteDialog";
import EstimationNombreTable from "./EstimationNombreTable";
import EstimationNombreUpdate from "./EstimationNombreUpdate";

const EstimationNombrePage: FunctionComponent = () => {
  const { t } = useTranslation();

  const user = useUser();

  const { displayNotification } = useNotifications();

  const [upsertNumberEstimateDialog, setUpsertNumberEstimateDialog] = useState<
    null | { mode: "create" } | { mode: "update"; numberEstimate: NumberEstimate }
  >(null);
  const [numberEstimateToDelete, setNumberEstimateToDelete] = useState<NumberEstimate | null>(null);

  const { query, setQuery, orderBy, setOrderBy, sortOrder, setSortOrder } =
    usePaginationParams<GetV1NumberEstimatesOrderBy>({ orderBy: "libelle" });

  const queryParams = {
    q: query,
    pageSize: 10,
    orderBy,
    sortOrder,
  };

  const { data, fetchNextPage, hasNextPage, mutate } = useApiNumberEstimatesInfiniteQuery(queryParams);

  // When query params change, we need to refetch the data
  useDeepCompareEffect(() => {
    void mutate();
  }, [queryParams, mutate]);

  const handleRequestSort = (sortingColumn: GetV1NumberEstimatesOrderBy) => {
    const isAsc = orderBy === sortingColumn && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setOrderBy(sortingColumn);
  };

  const createNumberEstimate = useApiNumberEstimateCreate();

  const handleUpsertNumberEstimateError = (e: unknown) => {
    if (e instanceof FetchError && e.status === 409) {
      displayNotification({
        type: "error",
        message: t("numberPrecisionAlreadyExistingError"),
      });
    } else {
      displayNotification({
        type: "error",
        message: t("retrieveGenericSaveError"),
      });
    }
  };

  const { trigger: updateNumberEstimate } = useApiNumberEstimateUpdate(
    upsertNumberEstimateDialog?.mode === "update" ? upsertNumberEstimateDialog.numberEstimate?.id : null,
    {
      onSuccess: () => {
        void mutate();

        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertNumberEstimateDialog(null);
      },
      onError: (e) => {
        void mutate();

        handleUpsertNumberEstimateError(e);
      },
    },
  );

  const { trigger: deleteNumberEstimate } = useApiNumberEstimateDelete(numberEstimateToDelete?.id ?? null, {
    onSuccess: () => {
      void mutate();

      displayNotification({
        type: "success",
        message: t("deleteConfirmationMessage"),
      });
      setNumberEstimateToDelete(null);
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
    filename: t("numberPrecisions"),
    path: "/generate-export/number-estimates",
  });

  const handleCreateClick = () => {
    setUpsertNumberEstimateDialog({ mode: "create" });
  };

  const handleUpdateClick = (numberEstimate: NumberEstimate) => {
    setUpsertNumberEstimateDialog({ mode: "update", numberEstimate });
  };

  const handleExportClick = () => {
    void downloadExport();
  };

  const handleCreateNumberEstimate = (input: UpsertNumberEstimateInput) => {
    createNumberEstimate({ body: input })
      .then(() => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertNumberEstimateDialog(null);
      })
      .catch((e) => {
        handleUpsertNumberEstimateError(e);
      })
      .finally(() => {
        void mutate();
      });
  };

  const handleUpdateNumberEstimate = (_id: string, input: UpsertNumberEstimateInput) => {
    void updateNumberEstimate({ body: input });
  };

  const handleDeleteNumberEstimate = () => {
    void deleteNumberEstimate();
  };

  return (
    <>
      <ManageTopBar
        title={t("numberPrecisions")}
        enableCreate={user?.permissions.numberEstimate.canCreate}
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
        <EstimationNombreTable
          numberEstimates={data?.flatMap((page) => page.data)}
          onClickUpdateNumberEstimate={handleUpdateClick}
          onClickDeleteNumberEstimate={setNumberEstimateToDelete}
          hasNextPage={hasNextPage}
          onMoreRequested={fetchNextPage}
          orderBy={orderBy}
          sortOrder={sortOrder}
          handleRequestSort={handleRequestSort}
        />
      </ContentContainerLayout>
      <EntityUpsertDialog
        open={upsertNumberEstimateDialog != null}
        onClose={() => setUpsertNumberEstimateDialog(null)}
        title={
          upsertNumberEstimateDialog?.mode === "create"
            ? t("numberPrecisionCreationTitle")
            : upsertNumberEstimateDialog?.mode === "update"
              ? t("numberPrecisionEditionTitle")
              : undefined
        }
      >
        {upsertNumberEstimateDialog?.mode === "create" && (
          <EstimationNombreCreate
            onCancel={() => setUpsertNumberEstimateDialog(null)}
            onSubmit={handleCreateNumberEstimate}
          />
        )}
        {upsertNumberEstimateDialog?.mode === "update" && (
          <EstimationNombreUpdate
            numberEstimate={upsertNumberEstimateDialog.numberEstimate}
            onCancel={() => setUpsertNumberEstimateDialog(null)}
            onSubmit={handleUpdateNumberEstimate}
          />
        )}
      </EntityUpsertDialog>
      <EstimationNombreDeleteDialog
        numberEstimateToDelete={numberEstimateToDelete}
        onCancelDeletion={() => setNumberEstimateToDelete(null)}
        onConfirmDeletion={handleDeleteNumberEstimate}
      />
    </>
  );
};

export default EstimationNombrePage;
