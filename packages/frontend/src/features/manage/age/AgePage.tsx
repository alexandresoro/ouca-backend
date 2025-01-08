import { useNotifications } from "@hooks/useNotifications";
import usePaginationParams from "@hooks/usePaginationParams";
import { useUser } from "@hooks/useUser";
import ContentContainerLayout from "@layouts/ContentContainerLayout";
import type { UpsertAgeInput } from "@ou-ca/api/models";
import type { EntitiesWithLabelOrderBy } from "@ou-ca/common/api/common/entitiesSearchParams";
import type { Age } from "@ou-ca/common/api/entities/age";
import {
  useApiAgeCreate,
  useApiAgeDelete,
  useApiAgeUpdate,
  useApiAgesInfiniteQuery,
} from "@services/api/age/api-age-queries";
import { useApiDownloadExport } from "@services/api/export/api-export-queries";
import { FetchError } from "@utils/fetch-api";
import { type FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import useDeepCompareEffect from "use-deep-compare-effect";
import EntityUpsertDialog from "../common/EntityUpsertDialog";
import ManageEntitiesHeader from "../common/ManageEntitiesHeader";
import ManageTopBar from "../common/ManageTopBar";
import AgeCreate from "./AgeCreate";
import AgeDeleteDialog from "./AgeDeleteDialog";
import AgeTable from "./AgeTable";
import AgeUpdate from "./AgeUpdate";

const AgePage: FunctionComponent = () => {
  const { t } = useTranslation();

  const user = useUser();

  const { displayNotification } = useNotifications();

  const [upsertAgeDialog, setUpsertAgeDialog] = useState<null | { mode: "create" } | { mode: "update"; age: Age }>(
    null,
  );
  const [ageToDelete, setAgeToDelete] = useState<Age | null>(null);

  const { query, setQuery, orderBy, setOrderBy, sortOrder, setSortOrder } =
    usePaginationParams<EntitiesWithLabelOrderBy>({ orderBy: "libelle" });

  const queryParams = {
    q: query,
    pageSize: 10,
    orderBy,
    sortOrder,
  };

  const { data, fetchNextPage, hasNextPage, mutate } = useApiAgesInfiniteQuery(queryParams);

  // When query params change, we need to refetch the data
  useDeepCompareEffect(() => {
    void mutate();
  }, [queryParams, mutate]);

  const handleRequestSort = (sortingColumn: EntitiesWithLabelOrderBy) => {
    const isAsc = orderBy === sortingColumn && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setOrderBy(sortingColumn);
  };

  const createAge = useApiAgeCreate();

  const handleUpsertAgeError = (e: unknown) => {
    if (e instanceof FetchError && e.status === 409) {
      displayNotification({
        type: "error",
        message: t("ageAlreadyExistingError"),
      });
    } else {
      displayNotification({
        type: "error",
        message: t("retrieveGenericSaveError"),
      });
    }
  };

  const { trigger: updateAge } = useApiAgeUpdate(upsertAgeDialog?.mode === "update" ? upsertAgeDialog.age?.id : null, {
    onSuccess: () => {
      void mutate();

      displayNotification({
        type: "success",
        message: t("retrieveGenericSaveSuccess"),
      });
      setUpsertAgeDialog(null);
    },
    onError: (e) => {
      void mutate();

      handleUpsertAgeError(e);
    },
  });

  const { trigger: deleteAge } = useApiAgeDelete(ageToDelete?.id ?? null, {
    onSuccess: () => {
      void mutate();

      displayNotification({
        type: "success",
        message: t("deleteConfirmationMessage"),
      });
      setAgeToDelete(null);
    },
    onError: () => {
      void mutate();

      displayNotification({
        type: "error",
        message: t("deleteErrorMessage"),
      });
    },
  });

  const downloadExport = useApiDownloadExport({ filename: t("ages"), path: "/generate-export/ages" });

  const handleCreateClick = () => {
    setUpsertAgeDialog({ mode: "create" });
  };

  const handleUpdateClick = (age: Age) => {
    setUpsertAgeDialog({ mode: "update", age });
  };

  const handleExportClick = () => {
    void downloadExport();
  };

  const handleCreateAge = (input: UpsertAgeInput) => {
    createAge({ body: input })
      .then(() => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertAgeDialog(null);
      })
      .catch((e) => {
        handleUpsertAgeError(e);
      })
      .finally(() => {
        void mutate();
      });
  };

  const handleUpdateAge = (_id: string, input: UpsertAgeInput) => {
    void updateAge({ body: input });
  };

  const handleDeleteAge = () => {
    void deleteAge();
  };

  return (
    <>
      <ManageTopBar
        title={t("ages")}
        enableCreate={user?.permissions.age.canCreate}
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
        <AgeTable
          ages={data?.flatMap((page) => page.data)}
          onClickUpdateAge={handleUpdateClick}
          onClickDeleteAge={setAgeToDelete}
          hasNextPage={hasNextPage}
          onMoreRequested={fetchNextPage}
          orderBy={orderBy}
          sortOrder={sortOrder}
          handleRequestSort={handleRequestSort}
        />
      </ContentContainerLayout>
      <EntityUpsertDialog
        open={upsertAgeDialog != null}
        onClose={() => setUpsertAgeDialog(null)}
        title={
          upsertAgeDialog?.mode === "create"
            ? t("ageCreationTitle")
            : upsertAgeDialog?.mode === "update"
              ? t("ageEditionTitle")
              : undefined
        }
      >
        {upsertAgeDialog?.mode === "create" && (
          <AgeCreate onCancel={() => setUpsertAgeDialog(null)} onSubmit={handleCreateAge} />
        )}
        {upsertAgeDialog?.mode === "update" && (
          <AgeUpdate age={upsertAgeDialog.age} onCancel={() => setUpsertAgeDialog(null)} onSubmit={handleUpdateAge} />
        )}
      </EntityUpsertDialog>
      <AgeDeleteDialog
        ageToDelete={ageToDelete}
        onCancelDeletion={() => setAgeToDelete(null)}
        onConfirmDeletion={handleDeleteAge}
      />
    </>
  );
};

export default AgePage;
