import { useNotifications } from "@hooks/useNotifications";
import usePaginationParams from "@hooks/usePaginationParams";
import { useUser } from "@hooks/useUser";
import ContentContainerLayout from "@layouts/ContentContainerLayout";
import type { Environment, GetV1EnvironmentsOrderBy, UpsertEnvironmentInput } from "@ou-ca/api/models";
import {
  useApiEnvironmentCreate,
  useApiEnvironmentDelete,
  useApiEnvironmentUpdate,
  useApiEnvironmentsInfiniteQuery,
} from "@services/api/environment/api-environment-queries";
import { useApiDownloadExport } from "@services/api/export/api-export-queries";
import { FetchError } from "@utils/fetch-api";
import { type FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import useDeepCompareEffect from "use-deep-compare-effect";
import EntityUpsertDialog from "../common/EntityUpsertDialog";
import ManageEntitiesHeader from "../common/ManageEntitiesHeader";
import ManageTopBar from "../common/ManageTopBar";
import MilieuCreate from "./MilieuCreate";
import MilieuDeleteDialog from "./MilieuDeleteDialog";
import MilieuTable from "./MilieuTable";
import MilieuUpdate from "./MilieuUpdate";

const MilieuPage: FunctionComponent = () => {
  const { t } = useTranslation();

  const user = useUser();

  const { displayNotification } = useNotifications();

  const [upsertEnvironmentDialog, setUpsertEnvironmentDialog] = useState<
    null | { mode: "create" } | { mode: "update"; environment: Environment }
  >(null);
  const [environmentToDelete, setEnvironmentToDelete] = useState<Environment | null>(null);

  const { query, setQuery, orderBy, setOrderBy, sortOrder, setSortOrder } =
    usePaginationParams<GetV1EnvironmentsOrderBy>({
      orderBy: "code",
    });

  const queryParams = {
    q: query,
    pageSize: 10,
    orderBy,
    sortOrder,
  };

  const { data, fetchNextPage, hasNextPage, mutate } = useApiEnvironmentsInfiniteQuery(queryParams);

  // When query params change, we need to refetch the data
  useDeepCompareEffect(() => {
    void mutate();
  }, [queryParams, mutate]);

  const handleRequestSort = (sortingColumn: GetV1EnvironmentsOrderBy) => {
    const isAsc = orderBy === sortingColumn && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setOrderBy(sortingColumn);
  };

  const createEnvironment = useApiEnvironmentCreate();

  const handleUpsertEnvironmentError = (e: unknown) => {
    if (e instanceof FetchError && e.status === 409) {
      displayNotification({
        type: "error",
        message: t("environmentAlreadyExistingError"),
      });
    } else {
      displayNotification({
        type: "error",
        message: t("retrieveGenericSaveError"),
      });
    }
  };

  const { trigger: updateEnvironment } = useApiEnvironmentUpdate(
    upsertEnvironmentDialog?.mode === "update" ? upsertEnvironmentDialog.environment?.id : null,
    {
      onSuccess: () => {
        void mutate();

        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertEnvironmentDialog(null);
      },
      onError: (e) => {
        void mutate();

        handleUpsertEnvironmentError(e);
      },
    },
  );

  const { trigger: deleteEnvironment } = useApiEnvironmentDelete(environmentToDelete?.id ?? null, {
    onSuccess: () => {
      void mutate();

      displayNotification({
        type: "success",
        message: t("deleteConfirmationMessage"),
      });
      setEnvironmentToDelete(null);
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
    filename: t("environments"),
    path: "/generate-export/environments",
  });

  const handleCreateClick = () => {
    setUpsertEnvironmentDialog({ mode: "create" });
  };

  const handleUpdateClick = (environment: Environment) => {
    setUpsertEnvironmentDialog({ mode: "update", environment });
  };

  const handleExportClick = () => {
    void downloadExport();
  };

  const handleCreateEnvironment = (input: UpsertEnvironmentInput) => {
    createEnvironment({ body: input })
      .then(() => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertEnvironmentDialog(null);
      })
      .catch((e) => {
        handleUpsertEnvironmentError(e);
      })
      .finally(() => {
        void mutate();
      });
  };

  const handleUpdateEnvironment = (_id: string, input: UpsertEnvironmentInput) => {
    void updateEnvironment({ body: input });
  };

  const handleDeleteEnvironment = () => {
    void deleteEnvironment();
  };

  return (
    <>
      <ManageTopBar
        title={t("environments")}
        enableCreate={user?.permissions.environment.canCreate}
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
        <MilieuTable
          environments={data?.flatMap((page) => page.data)}
          onClickUpdateEnvironment={handleUpdateClick}
          onClickDeleteEnvironment={setEnvironmentToDelete}
          hasNextPage={hasNextPage}
          onMoreRequested={fetchNextPage}
          orderBy={orderBy}
          sortOrder={sortOrder}
          handleRequestSort={handleRequestSort}
        />
      </ContentContainerLayout>
      <EntityUpsertDialog
        open={upsertEnvironmentDialog != null}
        onClose={() => setUpsertEnvironmentDialog(null)}
        title={
          upsertEnvironmentDialog?.mode === "create"
            ? t("environmentCreationTitle")
            : upsertEnvironmentDialog?.mode === "update"
              ? t("environmentEditionTitle")
              : undefined
        }
      >
        {upsertEnvironmentDialog?.mode === "create" && (
          <MilieuCreate onCancel={() => setUpsertEnvironmentDialog(null)} onSubmit={handleCreateEnvironment} />
        )}
        {upsertEnvironmentDialog?.mode === "update" && (
          <MilieuUpdate
            environment={upsertEnvironmentDialog.environment}
            onCancel={() => setUpsertEnvironmentDialog(null)}
            onSubmit={handleUpdateEnvironment}
          />
        )}
      </EntityUpsertDialog>
      <MilieuDeleteDialog
        environmentToDelete={environmentToDelete}
        onCancelDeletion={() => setEnvironmentToDelete(null)}
        onConfirmDeletion={handleDeleteEnvironment}
      />
    </>
  );
};

export default MilieuPage;
