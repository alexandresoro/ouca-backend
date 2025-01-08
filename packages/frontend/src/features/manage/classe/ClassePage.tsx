import { useNotifications } from "@hooks/useNotifications";
import usePaginationParams from "@hooks/usePaginationParams";
import { useUser } from "@hooks/useUser";
import ContentContainerLayout from "@layouts/ContentContainerLayout";
import type { GetV1ClassesOrderBy, SpeciesClass, UpsertSpeciesClassInput } from "@ou-ca/api/models";
import { useApiDownloadExport } from "@services/api/export/api-export-queries";
import {
  useApiSpeciesClassCreate,
  useApiSpeciesClassDelete,
  useApiSpeciesClassUpdate,
  useApiSpeciesClassesInfiniteQuery,
} from "@services/api/species-class/api-species-class-queries";
import { FetchError } from "@utils/fetch-api";
import { type FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import useDeepCompareEffect from "use-deep-compare-effect";
import EntityUpsertDialog from "../common/EntityUpsertDialog";
import ManageEntitiesHeader from "../common/ManageEntitiesHeader";
import ManageTopBar from "../common/ManageTopBar";
import ClasseCreate from "./ClasseCreate";
import ClasseDeleteDialog from "./ClasseDeleteDialog";
import ClasseTable from "./ClasseTable";
import ClasseUpdate from "./ClasseUpdate";

const ClassePage: FunctionComponent = () => {
  const { t } = useTranslation();

  const user = useUser();

  const { displayNotification } = useNotifications();

  const [upsertSpeciesClassDialog, setUpsertSpeciesClassDialog] = useState<
    null | { mode: "create" } | { mode: "update"; speciesClass: SpeciesClass }
  >(null);
  const [speciesClassToDelete, setSpeciesClassToDelete] = useState<SpeciesClass | null>(null);

  const { query, setQuery, orderBy, setOrderBy, sortOrder, setSortOrder } = usePaginationParams<GetV1ClassesOrderBy>({
    orderBy: "libelle",
  });

  const queryParams = {
    q: query,
    pageSize: 10,
    orderBy,
    sortOrder,
  };

  const { data, fetchNextPage, hasNextPage, mutate } = useApiSpeciesClassesInfiniteQuery(queryParams);

  // When query params change, we need to refetch the data
  useDeepCompareEffect(() => {
    void mutate();
  }, [queryParams, mutate]);

  const handleRequestSort = (sortingColumn: GetV1ClassesOrderBy) => {
    const isAsc = orderBy === sortingColumn && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setOrderBy(sortingColumn);
  };

  const createSpeciesClass = useApiSpeciesClassCreate();

  const handleUpsertSpeciesClassError = (e: unknown) => {
    if (e instanceof FetchError && e.status === 409) {
      displayNotification({
        type: "error",
        message: t("speciesClassAlreadyExistingError"),
      });
    } else {
      displayNotification({
        type: "error",
        message: t("retrieveGenericSaveError"),
      });
    }
  };

  const { trigger: updateSpeciesClass } = useApiSpeciesClassUpdate(
    upsertSpeciesClassDialog?.mode === "update" ? upsertSpeciesClassDialog.speciesClass?.id : null,
    {
      onSuccess: () => {
        void mutate();

        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertSpeciesClassDialog(null);
      },
      onError: (e) => {
        void mutate();

        handleUpsertSpeciesClassError(e);
      },
    },
  );

  const { trigger: deleteSpeciesClass } = useApiSpeciesClassDelete(speciesClassToDelete?.id ?? null, {
    onSuccess: () => {
      void mutate();

      displayNotification({
        type: "success",
        message: t("deleteConfirmationMessage"),
      });
      setSpeciesClassToDelete(null);
    },
    onError: () => {
      void mutate();

      displayNotification({
        type: "error",
        message: t("deleteErrorMessage"),
      });
    },
  });

  const downloadExport = useApiDownloadExport({ filename: t("speciesClasses"), path: "/generate-export/classes" });

  const handleCreateClick = () => {
    setUpsertSpeciesClassDialog({ mode: "create" });
  };

  const handleUpdateClick = (speciesClass: SpeciesClass) => {
    setUpsertSpeciesClassDialog({ mode: "update", speciesClass });
  };

  const handleExportClick = () => {
    void downloadExport();
  };

  const handleCreateSpeciesClass = (input: UpsertSpeciesClassInput) => {
    createSpeciesClass({ body: input })
      .then(() => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertSpeciesClassDialog(null);
      })
      .catch((e) => {
        handleUpsertSpeciesClassError(e);
      })
      .finally(() => {
        void mutate();
      });
  };

  const handleUpdateSpeciesClass = (_id: string, input: UpsertSpeciesClassInput) => {
    void updateSpeciesClass({ body: input });
  };

  const handleDeleteSpeciesClass = () => {
    void deleteSpeciesClass();
  };

  return (
    <>
      <ManageTopBar
        title={t("speciesClasses")}
        enableCreate={user?.permissions.speciesClass.canCreate}
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
        <ClasseTable
          speciesClasses={data?.flatMap((page) => page.data)}
          onClickUpdateSpeciesClass={handleUpdateClick}
          onClickDeleteSpeciesClass={setSpeciesClassToDelete}
          hasNextPage={hasNextPage}
          onMoreRequested={fetchNextPage}
          orderBy={orderBy}
          sortOrder={sortOrder}
          handleRequestSort={handleRequestSort}
        />
      </ContentContainerLayout>
      <EntityUpsertDialog
        open={upsertSpeciesClassDialog != null}
        onClose={() => setUpsertSpeciesClassDialog(null)}
        title={
          upsertSpeciesClassDialog?.mode === "create"
            ? t("speciesClassCreationTitle")
            : upsertSpeciesClassDialog?.mode === "update"
              ? t("speciesClassEditionTitle")
              : undefined
        }
      >
        {upsertSpeciesClassDialog?.mode === "create" && (
          <ClasseCreate onCancel={() => setUpsertSpeciesClassDialog(null)} onSubmit={handleCreateSpeciesClass} />
        )}
        {upsertSpeciesClassDialog?.mode === "update" && (
          <ClasseUpdate
            speciesClass={upsertSpeciesClassDialog.speciesClass}
            onCancel={() => setUpsertSpeciesClassDialog(null)}
            onSubmit={handleUpdateSpeciesClass}
          />
        )}
      </EntityUpsertDialog>
      <ClasseDeleteDialog
        speciesClassToDelete={speciesClassToDelete}
        onCancelDeletion={() => setSpeciesClassToDelete(null)}
        onConfirmDeletion={handleDeleteSpeciesClass}
      />
    </>
  );
};

export default ClassePage;
