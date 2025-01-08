import { useNotifications } from "@hooks/useNotifications";
import usePaginationParams from "@hooks/usePaginationParams";
import { useUser } from "@hooks/useUser";
import ContentContainerLayout from "@layouts/ContentContainerLayout";
import type { GetV1TownsOrderBy, UpsertTownInput } from "@ou-ca/api/models";
import type { Town } from "@ou-ca/common/api/entities/town";
import { useApiDownloadExport } from "@services/api/export/api-export-queries";
import {
  useApiTownCreate,
  useApiTownDelete,
  useApiTownUpdate,
  useApiTownsInfiniteQuery,
} from "@services/api/town/api-town-queries";
import { FetchError } from "@utils/fetch-api";
import { type FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import useDeepCompareEffect from "use-deep-compare-effect";
import EntityUpsertDialog from "../common/EntityUpsertDialog";
import ManageEntitiesHeader from "../common/ManageEntitiesHeader";
import ManageTopBar from "../common/ManageTopBar";
import CommuneCreate from "./CommuneCreate";
import CommuneDeleteDialog from "./CommuneDeleteDialog";
import CommuneTable from "./CommuneTable";
import CommuneUpdate from "./CommuneUpdate";

const CommunePage: FunctionComponent = () => {
  const { t } = useTranslation();

  const user = useUser();

  const { displayNotification } = useNotifications();

  const [upsertTownDialog, setUpsertTownDialog] = useState<null | { mode: "create" } | { mode: "update"; town: Town }>(
    null,
  );
  const [townToDelete, setTownToDelete] = useState<Town | null>(null);

  const { query, setQuery, orderBy, setOrderBy, sortOrder, setSortOrder } = usePaginationParams<GetV1TownsOrderBy>({
    orderBy: "nom",
  });

  const queryParams = {
    q: query,
    pageSize: 10,
    orderBy,
    sortOrder,
  };

  const { data, fetchNextPage, hasNextPage, mutate } = useApiTownsInfiniteQuery(queryParams);

  // When query params change, we need to refetch the data
  useDeepCompareEffect(() => {
    void mutate();
  }, [queryParams, mutate]);

  const handleRequestSort = (sortingColumn: GetV1TownsOrderBy) => {
    const isAsc = orderBy === sortingColumn && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setOrderBy(sortingColumn);
  };

  const createTown = useApiTownCreate();

  const handleUpsertTownError = (e: unknown) => {
    if (e instanceof FetchError && e.status === 409) {
      displayNotification({
        type: "error",
        message: t("townAlreadyExistingError"),
      });
    } else {
      displayNotification({
        type: "error",
        message: t("retrieveGenericSaveError"),
      });
    }
  };

  const { trigger: updateTown } = useApiTownUpdate(
    upsertTownDialog?.mode === "update" ? upsertTownDialog.town?.id : null,
    {
      onSuccess: () => {
        void mutate();

        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertTownDialog(null);
      },
      onError: (e) => {
        void mutate();

        handleUpsertTownError(e);
      },
    },
  );

  const { trigger: deleteTown } = useApiTownDelete(townToDelete?.id ?? null, {
    onSuccess: () => {
      void mutate();

      displayNotification({
        type: "success",
        message: t("deleteConfirmationMessage"),
      });
      setTownToDelete(null);
    },
    onError: () => {
      void mutate();

      displayNotification({
        type: "error",
        message: t("deleteErrorMessage"),
      });
    },
  });

  const downloadExport = useApiDownloadExport({ filename: t("towns"), path: "/generate-export/towns" });

  const handleCreateClick = () => {
    setUpsertTownDialog({ mode: "create" });
  };

  const handleUpdateClick = (town: Town) => {
    setUpsertTownDialog({ mode: "update", town });
  };

  const handleExportClick = () => {
    void downloadExport();
  };

  const handleCreateTown = (input: UpsertTownInput) => {
    createTown({ body: input })
      .then(() => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertTownDialog(null);
      })
      .catch((e) => {
        handleUpsertTownError(e);
      })
      .finally(() => {
        void mutate();
      });
  };

  const handleUpdateTown = (_id: string, input: UpsertTownInput) => {
    void updateTown({ body: input });
  };

  const handleDeleteTown = () => {
    void deleteTown();
  };

  return (
    <>
      <ManageTopBar
        title={t("towns")}
        enableCreate={user?.permissions.town.canCreate}
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
        <CommuneTable
          towns={data?.flatMap((page) => page.data)}
          onClickUpdateTown={handleUpdateClick}
          onClickDeleteTown={setTownToDelete}
          hasNextPage={hasNextPage}
          onMoreRequested={fetchNextPage}
          orderBy={orderBy}
          sortOrder={sortOrder}
          handleRequestSort={handleRequestSort}
        />
      </ContentContainerLayout>
      <EntityUpsertDialog
        open={upsertTownDialog != null}
        onClose={() => setUpsertTownDialog(null)}
        title={
          upsertTownDialog?.mode === "create"
            ? t("townCreationTitle")
            : upsertTownDialog?.mode === "update"
              ? t("townEditionTitle")
              : undefined
        }
      >
        {upsertTownDialog?.mode === "create" && (
          <CommuneCreate onCancel={() => setUpsertTownDialog(null)} onSubmit={handleCreateTown} />
        )}
        {upsertTownDialog?.mode === "update" && (
          <CommuneUpdate
            town={upsertTownDialog.town}
            onCancel={() => setUpsertTownDialog(null)}
            onSubmit={handleUpdateTown}
          />
        )}
      </EntityUpsertDialog>
      <CommuneDeleteDialog
        townToDelete={townToDelete}
        onCancelDeletion={() => setTownToDelete(null)}
        onConfirmDeletion={handleDeleteTown}
      />
    </>
  );
};

export default CommunePage;
