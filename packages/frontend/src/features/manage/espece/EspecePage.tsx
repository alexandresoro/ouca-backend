import { useNotifications } from "@hooks/useNotifications";
import usePaginationParams from "@hooks/usePaginationParams";
import { useUser } from "@hooks/useUser";
import ContentContainerLayout from "@layouts/ContentContainerLayout";
import type { GetV1SpeciesOrderBy, Species, UpsertSpeciesInput } from "@ou-ca/api/models";
import { useApiDownloadExport } from "@services/api/export/api-export-queries";
import {
  useApiSpeciesCreate,
  useApiSpeciesDelete,
  useApiSpeciesInfiniteQuery,
  useApiSpeciesUpdate,
} from "@services/api/species/api-species-queries";
import { FetchError } from "@utils/fetch-api";
import { type FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import useDeepCompareEffect from "use-deep-compare-effect";
import EntityUpsertDialog from "../common/EntityUpsertDialog";
import ManageEntitiesHeader from "../common/ManageEntitiesHeader";
import ManageTopBar from "../common/ManageTopBar";
import EspeceCreate from "./EspeceCreate";
import EspeceDeleteDialog from "./EspeceDeleteDialog";
import EspeceTable from "./EspeceTable";
import EspeceUpdate from "./EspeceUpdate";

const EspecePage: FunctionComponent = () => {
  const { t } = useTranslation();

  const user = useUser();

  const { displayNotification } = useNotifications();

  const [upsertSpeciesDialog, setUpsertSpeciesDialog] = useState<
    null | { mode: "create" } | { mode: "update"; species: Species }
  >(null);
  const [speciesToDelete, setSpeciesToDelete] = useState<Species | null>(null);

  const { query, setQuery, orderBy, setOrderBy, sortOrder, setSortOrder } = usePaginationParams<GetV1SpeciesOrderBy>({
    orderBy: "nomFrancais",
  });

  const queryParams = {
    q: query,
    pageSize: 10,
    orderBy,
    sortOrder,
  };

  const { data, fetchNextPage, hasNextPage, mutate } = useApiSpeciesInfiniteQuery(queryParams);

  // When query params change, we need to refetch the data
  useDeepCompareEffect(() => {
    void mutate();
  }, [queryParams, mutate]);

  const handleRequestSort = (sortingColumn: GetV1SpeciesOrderBy) => {
    const isAsc = orderBy === sortingColumn && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setOrderBy(sortingColumn);
  };

  const createSpecies = useApiSpeciesCreate();

  const handleUpsertSpeciesError = (e: unknown) => {
    if (e instanceof FetchError && e.status === 409) {
      displayNotification({
        type: "error",
        message: t("speciesAlreadyExistingError"),
      });
    } else {
      displayNotification({
        type: "error",
        message: t("retrieveGenericSaveError"),
      });
    }
  };

  const { trigger: updateSpecies } = useApiSpeciesUpdate(
    upsertSpeciesDialog?.mode === "update" ? upsertSpeciesDialog.species?.id : null,
    {
      onSuccess: () => {
        void mutate();

        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertSpeciesDialog(null);
      },
      onError: (e) => {
        void mutate();

        handleUpsertSpeciesError(e);
      },
    },
  );

  const { trigger: deleteSpecies } = useApiSpeciesDelete(speciesToDelete?.id ?? null, {
    onSuccess: () => {
      void mutate();

      displayNotification({
        type: "success",
        message: t("deleteConfirmationMessage"),
      });
      setSpeciesToDelete(null);
    },
    onError: () => {
      void mutate();

      displayNotification({
        type: "error",
        message: t("deleteErrorMessage"),
      });
    },
  });

  const downloadExport = useApiDownloadExport({ filename: t("species"), path: "/generate-export/species" });

  const handleCreateClick = () => {
    setUpsertSpeciesDialog({ mode: "create" });
  };

  const handleUpdateClick = (species: Species) => {
    setUpsertSpeciesDialog({ mode: "update", species });
  };

  const handleExportClick = () => {
    void downloadExport();
  };

  const handleCreateSpecies = (input: UpsertSpeciesInput) => {
    createSpecies({ body: input })
      .then(() => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertSpeciesDialog(null);
      })
      .catch((e) => {
        handleUpsertSpeciesError(e);
      })
      .finally(() => {
        void mutate();
      });
  };

  const handleUpdateSpecies = (_id: string, input: UpsertSpeciesInput) => {
    void updateSpecies({ body: input });
  };

  const handleDeleteSpecies = () => {
    void deleteSpecies();
  };

  return (
    <>
      <ManageTopBar
        title={t("species")}
        enableCreate={user?.permissions.species.canCreate}
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
        <EspeceTable
          species={data?.flatMap((page) => page.data)}
          onClickUpdateSpecies={handleUpdateClick}
          onClickDeleteSpecies={setSpeciesToDelete}
          hasNextPage={hasNextPage}
          onMoreRequested={fetchNextPage}
          orderBy={orderBy}
          sortOrder={sortOrder}
          handleRequestSort={handleRequestSort}
        />
      </ContentContainerLayout>
      <EntityUpsertDialog
        open={upsertSpeciesDialog != null}
        onClose={() => setUpsertSpeciesDialog(null)}
        title={
          upsertSpeciesDialog?.mode === "create"
            ? t("speciesCreationTitle")
            : upsertSpeciesDialog?.mode === "update"
              ? t("speciesEditionTitle")
              : undefined
        }
      >
        {upsertSpeciesDialog?.mode === "create" && (
          <EspeceCreate onCancel={() => setUpsertSpeciesDialog(null)} onSubmit={handleCreateSpecies} />
        )}
        {upsertSpeciesDialog?.mode === "update" && (
          <EspeceUpdate
            species={upsertSpeciesDialog.species}
            onCancel={() => setUpsertSpeciesDialog(null)}
            onSubmit={handleUpdateSpecies}
          />
        )}
      </EntityUpsertDialog>
      <EspeceDeleteDialog
        speciesToDelete={speciesToDelete}
        onCancelDeletion={() => setSpeciesToDelete(null)}
        onConfirmDeletion={handleDeleteSpecies}
      />
    </>
  );
};

export default EspecePage;
