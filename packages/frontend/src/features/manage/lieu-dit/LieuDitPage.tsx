import { useNotifications } from "@hooks/useNotifications";
import usePaginationParams from "@hooks/usePaginationParams";
import { useUser } from "@hooks/useUser";
import ContentContainerLayout from "@layouts/ContentContainerLayout";
import type { GetV1LocalitiesOrderBy, Locality, UpsertLocalityInput } from "@ou-ca/api/models";
import { getTownResponse } from "@ou-ca/common/api/town";
import { useApiDownloadExport } from "@services/api/export/api-export-queries";
import {
  useApiLocalitiesInfiniteQuery,
  useApiLocalityCreate,
  useApiLocalityDelete,
  useApiLocalityUpdate,
} from "@services/api/locality/api-locality-queries";
import { useApiFetch } from "@services/api/useApiFetch";
import { FetchError } from "@utils/fetch-api";
import { type FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import useDeepCompareEffect from "use-deep-compare-effect";
import EntityUpsertDialog from "../common/EntityUpsertDialog";
import ManageEntitiesHeader from "../common/ManageEntitiesHeader";
import ManageTopBar from "../common/ManageTopBar";
import LieuDitCreate from "./LieuDitCreate";
import LieuDitDeleteDialog from "./LieuDitDeleteDialog";
import LieuDitTable from "./LieuDitTable";
import LieuDitUpdate from "./LieuDitUpdate";

const LieuDitPage: FunctionComponent = () => {
  const { t } = useTranslation();

  const user = useUser();

  const { displayNotification } = useNotifications();

  const [upsertLocalityDialog, setUpsertLocalityDialog] = useState<
    null | { mode: "create" } | { mode: "update"; locality: Locality; departmentId: string }
  >(null);
  const [localityToDelete, setLocalityToDelete] = useState<Locality | null>(null);

  const { query, setQuery, orderBy, setOrderBy, sortOrder, setSortOrder } = usePaginationParams<GetV1LocalitiesOrderBy>(
    {
      orderBy: "nom",
    },
  );

  const queryParams = {
    q: query,
    pageSize: 10,
    orderBy,
    sortOrder,
  };

  const { data, fetchNextPage, hasNextPage, mutate } = useApiLocalitiesInfiniteQuery(queryParams);

  // When query params change, we need to refetch the data
  useDeepCompareEffect(() => {
    void mutate();
  }, [queryParams, mutate]);

  const handleRequestSort = (sortingColumn: GetV1LocalitiesOrderBy) => {
    const isAsc = orderBy === sortingColumn && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setOrderBy(sortingColumn);
  };

  const createLocality = useApiLocalityCreate();

  const handleUpsertLocalityError = (e: unknown) => {
    if (e instanceof FetchError && e.status === 409) {
      displayNotification({
        type: "error",
        message: t("localityAlreadyExistingError"),
      });
    } else {
      displayNotification({
        type: "error",
        message: t("retrieveGenericSaveError"),
      });
    }
  };

  const fetchTown = useApiFetch({
    schema: getTownResponse,
  });

  const { trigger: updateLocality } = useApiLocalityUpdate(
    upsertLocalityDialog?.mode === "update" ? upsertLocalityDialog.locality?.id : null,
    {
      onSuccess: () => {
        void mutate();

        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertLocalityDialog(null);
      },
      onError: (e) => {
        void mutate();

        handleUpsertLocalityError(e);
      },
    },
  );

  const { trigger: deleteLocality } = useApiLocalityDelete(localityToDelete?.id ?? null, {
    onSuccess: () => {
      void mutate();

      displayNotification({
        type: "success",
        message: t("deleteConfirmationMessage"),
      });
      setLocalityToDelete(null);
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
    filename: t("localities"),
    path: "/generate-export/localities",
  });

  const handleCreateClick = () => {
    setUpsertLocalityDialog({ mode: "create" });
  };

  const handleUpdateClick = async (locality: Locality) => {
    const townOfLocality = await fetchTown({
      path: `/towns/${locality.townId}`,
    }).catch(() => {
      displayNotification({
        type: "error",
        message: t("retrieveGenericError"),
      });
      throw new Error("Error while fetching town of locality.");
    });

    setUpsertLocalityDialog({ mode: "update", locality, departmentId: townOfLocality.departmentId });
  };

  const handleExportClick = () => {
    void downloadExport();
  };

  const handleCreateLocality = (input: UpsertLocalityInput) => {
    createLocality({ body: input })
      .then(() => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertLocalityDialog(null);
      })
      .catch((e) => {
        handleUpsertLocalityError(e);
      })
      .finally(() => {
        void mutate();
      });
  };

  const handleUpdateLocality = (_id: string, input: UpsertLocalityInput) => {
    void updateLocality({ body: input });
  };

  const handleDeleteLocality = () => {
    void deleteLocality();
  };

  return (
    <>
      <ManageTopBar
        title={t("localities")}
        enableCreate={user?.permissions.locality.canCreate}
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
        <LieuDitTable
          localities={data?.flatMap((page) => page.data)}
          onClickUpdateLocality={handleUpdateClick}
          onClickDeleteLocality={setLocalityToDelete}
          hasNextPage={hasNextPage}
          onMoreRequested={fetchNextPage}
          orderBy={orderBy}
          sortOrder={sortOrder}
          handleRequestSort={handleRequestSort}
        />
      </ContentContainerLayout>
      <EntityUpsertDialog
        open={upsertLocalityDialog != null}
        onClose={() => setUpsertLocalityDialog(null)}
        title={
          upsertLocalityDialog?.mode === "create"
            ? t("localityCreationTitle")
            : upsertLocalityDialog?.mode === "update"
              ? t("localityEditionTitle")
              : undefined
        }
      >
        {upsertLocalityDialog?.mode === "create" && (
          <LieuDitCreate onCancel={() => setUpsertLocalityDialog(null)} onSubmit={handleCreateLocality} />
        )}
        {upsertLocalityDialog?.mode === "update" && (
          <LieuDitUpdate
            locality={upsertLocalityDialog.locality}
            selectedDepartmentId={upsertLocalityDialog.departmentId}
            onCancel={() => setUpsertLocalityDialog(null)}
            onSubmit={handleUpdateLocality}
          />
        )}
      </EntityUpsertDialog>
      <LieuDitDeleteDialog
        localityToDelete={localityToDelete}
        onCancelDeletion={() => setLocalityToDelete(null)}
        onConfirmDeletion={handleDeleteLocality}
      />
    </>
  );
};

export default LieuDitPage;
