import { useNotifications } from "@hooks/useNotifications";
import usePaginationParams from "@hooks/usePaginationParams";
import { useUser } from "@hooks/useUser";
import ContentContainerLayout from "@layouts/ContentContainerLayout";
import type { GetV1SexesOrderBy, UpsertSexInput } from "@ou-ca/api/models";
import type { Sex } from "@ou-ca/common/api/entities/sex";
import { useApiDownloadExport } from "@services/api/export/api-export-queries";
import {
  useApiSexCreate,
  useApiSexDelete,
  useApiSexUpdate,
  useApiSexesInfiniteQuery,
} from "@services/api/sex/api-sex-queries";
import { FetchError } from "@utils/fetch-api";
import { type FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import useDeepCompareEffect from "use-deep-compare-effect";
import EntityUpsertDialog from "../common/EntityUpsertDialog";
import ManageEntitiesHeader from "../common/ManageEntitiesHeader";
import ManageTopBar from "../common/ManageTopBar";
import SexeCreate from "./SexeCreate";
import SexeDeleteDialog from "./SexeDeleteDialog";
import SexeTable from "./SexeTable";
import SexeUpdate from "./SexeUpdate";

const SexePage: FunctionComponent = () => {
  const { t } = useTranslation();

  const user = useUser();

  const { displayNotification } = useNotifications();

  const [upsertSexDialog, setUpsertSexDialog] = useState<null | { mode: "create" } | { mode: "update"; sex: Sex }>(
    null,
  );
  const [sexToDelete, setSexToDelete] = useState<Sex | null>(null);

  const { query, setQuery, orderBy, setOrderBy, sortOrder, setSortOrder } = usePaginationParams<GetV1SexesOrderBy>({
    orderBy: "libelle",
  });

  const queryParams = {
    q: query,
    pageSize: 10,
    orderBy,
    sortOrder,
  };

  const { data, fetchNextPage, hasNextPage, mutate } = useApiSexesInfiniteQuery(queryParams);

  // When query params change, we need to refetch the data
  useDeepCompareEffect(() => {
    void mutate();
  }, [queryParams, mutate]);

  const handleRequestSort = (sortingColumn: GetV1SexesOrderBy) => {
    const isAsc = orderBy === sortingColumn && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setOrderBy(sortingColumn);
  };

  const createSex = useApiSexCreate();

  const handleUpsertSexError = (e: unknown) => {
    if (e instanceof FetchError && e.status === 409) {
      displayNotification({
        type: "error",
        message: t("sexAlreadyExistingError"),
      });
    } else {
      displayNotification({
        type: "error",
        message: t("retrieveGenericSaveError"),
      });
    }
  };

  const { trigger: updateSex } = useApiSexUpdate(upsertSexDialog?.mode === "update" ? upsertSexDialog.sex?.id : null, {
    onSuccess: () => {
      void mutate();

      displayNotification({
        type: "success",
        message: t("retrieveGenericSaveSuccess"),
      });
      setUpsertSexDialog(null);
    },
    onError: (e) => {
      void mutate();

      handleUpsertSexError(e);
    },
  });

  const { trigger: deleteSex } = useApiSexDelete(sexToDelete?.id ?? null, {
    onSuccess: () => {
      void mutate();

      displayNotification({
        type: "success",
        message: t("deleteConfirmationMessage"),
      });
      setSexToDelete(null);
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
    filename: t("genders"),
    path: "/generate-export/sexes",
  });

  const handleCreateClick = () => {
    setUpsertSexDialog({ mode: "create" });
  };

  const handleUpdateClick = (sex: Sex) => {
    setUpsertSexDialog({ mode: "update", sex });
  };

  const handleExportClick = () => {
    void downloadExport();
  };

  const handleCreateSex = (input: UpsertSexInput) => {
    createSex({ body: input })
      .then(() => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertSexDialog(null);
      })
      .catch((e) => {
        handleUpsertSexError(e);
      })
      .finally(() => {
        void mutate();
      });
  };

  const handleUpdateSex = (_id: string, input: UpsertSexInput) => {
    void updateSex({ body: input });
  };

  const handleDeleteSex = () => {
    void deleteSex();
  };

  return (
    <>
      <ManageTopBar
        title={t("genders")}
        enableCreate={user?.permissions.sex.canCreate}
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
        <SexeTable
          sexes={data?.flatMap((page) => page.data)}
          onClickUpdateSex={handleUpdateClick}
          onClickDeleteSex={setSexToDelete}
          hasNextPage={hasNextPage}
          onMoreRequested={fetchNextPage}
          orderBy={orderBy}
          sortOrder={sortOrder}
          handleRequestSort={handleRequestSort}
        />
      </ContentContainerLayout>
      <EntityUpsertDialog
        open={upsertSexDialog != null}
        onClose={() => setUpsertSexDialog(null)}
        title={
          upsertSexDialog?.mode === "create"
            ? t("sexCreationTitle")
            : upsertSexDialog?.mode === "update"
              ? t("sexEditionTitle")
              : undefined
        }
      >
        {upsertSexDialog?.mode === "create" && (
          <SexeCreate onCancel={() => setUpsertSexDialog(null)} onSubmit={handleCreateSex} />
        )}
        {upsertSexDialog?.mode === "update" && (
          <SexeUpdate sex={upsertSexDialog.sex} onCancel={() => setUpsertSexDialog(null)} onSubmit={handleUpdateSex} />
        )}
      </EntityUpsertDialog>
      <SexeDeleteDialog
        sexToDelete={sexToDelete}
        onCancelDeletion={() => setSexToDelete(null)}
        onConfirmDeletion={handleDeleteSex}
      />
    </>
  );
};

export default SexePage;
