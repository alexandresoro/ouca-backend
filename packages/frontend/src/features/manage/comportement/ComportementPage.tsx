import { useNotifications } from "@hooks/useNotifications";
import usePaginationParams from "@hooks/usePaginationParams";
import { useUser } from "@hooks/useUser";
import ContentContainerLayout from "@layouts/ContentContainerLayout";
import type { Behavior, GetV1BehaviorsOrderBy, UpsertBehaviorInput } from "@ou-ca/api/models";
import {
  useApiBehaviorCreate,
  useApiBehaviorDelete,
  useApiBehaviorUpdate,
  useApiBehaviorsInfiniteQuery,
} from "@services/api/behavior/api-behavior-queries";
import { useApiDownloadExport } from "@services/api/export/api-export-queries";
import { FetchError } from "@utils/fetch-api";
import { type FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import useDeepCompareEffect from "use-deep-compare-effect";
import EntityUpsertDialog from "../common/EntityUpsertDialog";
import ManageEntitiesHeader from "../common/ManageEntitiesHeader";
import ManageTopBar from "../common/ManageTopBar";
import ComportementCreate from "./ComportementCreate";
import ComportementDeleteDialog from "./ComportementDeleteDialog";
import ComportementTable from "./ComportementTable";
import ComportementUpdate from "./ComportementUpdate";

const ComportementPage: FunctionComponent = () => {
  const { t } = useTranslation();

  const user = useUser();

  const { displayNotification } = useNotifications();

  const [upsertBehaviorDialog, setUpsertBehaviorDialog] = useState<
    null | { mode: "create" } | { mode: "update"; behavior: Behavior }
  >(null);
  const [behaviorToDelete, setBehaviorToDelete] = useState<Behavior | null>(null);

  const { query, setQuery, orderBy, setOrderBy, sortOrder, setSortOrder } = usePaginationParams<GetV1BehaviorsOrderBy>({
    orderBy: "code",
  });

  const queryParams = {
    q: query,
    pageSize: 10,
    orderBy,
    sortOrder,
  };

  const { data, fetchNextPage, hasNextPage, mutate } = useApiBehaviorsInfiniteQuery(queryParams);

  // When query params change, we need to refetch the data
  useDeepCompareEffect(() => {
    void mutate();
  }, [queryParams, mutate]);

  const handleRequestSort = (sortingColumn: GetV1BehaviorsOrderBy) => {
    const isAsc = orderBy === sortingColumn && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setOrderBy(sortingColumn);
  };

  const createBehavior = useApiBehaviorCreate();

  const handleUpsertBehaviorError = (e: unknown) => {
    if (e instanceof FetchError && e.status === 409) {
      displayNotification({
        type: "error",
        message: t("behaviorAlreadyExistingError"),
      });
    } else {
      displayNotification({
        type: "error",
        message: t("retrieveGenericSaveError"),
      });
    }
  };

  const { trigger: updateBehavior } = useApiBehaviorUpdate(
    upsertBehaviorDialog?.mode === "update" ? upsertBehaviorDialog.behavior?.id : null,
    {
      onSuccess: () => {
        void mutate();

        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertBehaviorDialog(null);
      },
      onError: (e) => {
        void mutate();

        handleUpsertBehaviorError(e);
      },
    },
  );

  const { trigger: deleteBehavior } = useApiBehaviorDelete(behaviorToDelete?.id ?? null, {
    onSuccess: () => {
      void mutate();

      displayNotification({
        type: "success",
        message: t("deleteConfirmationMessage"),
      });
      setBehaviorToDelete(null);
    },
    onError: () => {
      void mutate();

      displayNotification({
        type: "error",
        message: t("deleteErrorMessage"),
      });
    },
  });

  const downloadExport = useApiDownloadExport({ filename: t("behaviors"), path: "/generate-export/behaviors" });

  const handleCreateClick = () => {
    setUpsertBehaviorDialog({ mode: "create" });
  };

  const handleUpdateClick = (behavior: Behavior) => {
    setUpsertBehaviorDialog({ mode: "update", behavior });
  };

  const handleExportClick = () => {
    void downloadExport();
  };

  const handleCreateBehavior = (input: UpsertBehaviorInput) => {
    createBehavior({ body: input })
      .then(() => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertBehaviorDialog(null);
      })
      .catch((e) => {
        handleUpsertBehaviorError(e);
      })
      .finally(() => {
        void mutate();
      });
  };

  const handleUpdateBehavior = (_id: string, input: UpsertBehaviorInput) => {
    void updateBehavior({ body: input });
  };

  const handleDeleteBehavior = () => {
    void deleteBehavior();
  };

  return (
    <>
      <ManageTopBar
        title={t("behaviors")}
        enableCreate={user?.permissions.behavior.canCreate}
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
        <ComportementTable
          behaviors={data?.flatMap((page) => page.data)}
          onClickUpdateBehavior={handleUpdateClick}
          onClickDeleteBehavior={setBehaviorToDelete}
          hasNextPage={hasNextPage}
          onMoreRequested={fetchNextPage}
          orderBy={orderBy}
          sortOrder={sortOrder}
          handleRequestSort={handleRequestSort}
        />
      </ContentContainerLayout>
      <EntityUpsertDialog
        open={upsertBehaviorDialog != null}
        onClose={() => setUpsertBehaviorDialog(null)}
        title={
          upsertBehaviorDialog?.mode === "create"
            ? t("behaviorCreationTitle")
            : upsertBehaviorDialog?.mode === "update"
              ? t("behaviorEditionTitle")
              : undefined
        }
      >
        {upsertBehaviorDialog?.mode === "create" && (
          <ComportementCreate onCancel={() => setUpsertBehaviorDialog(null)} onSubmit={handleCreateBehavior} />
        )}
        {upsertBehaviorDialog?.mode === "update" && (
          <ComportementUpdate
            behavior={upsertBehaviorDialog.behavior}
            onCancel={() => setUpsertBehaviorDialog(null)}
            onSubmit={handleUpdateBehavior}
          />
        )}
      </EntityUpsertDialog>
      <ComportementDeleteDialog
        behaviorToDelete={behaviorToDelete}
        onCancelDeletion={() => setBehaviorToDelete(null)}
        onConfirmDeletion={handleDeleteBehavior}
      />
    </>
  );
};

export default ComportementPage;
