import { useNotifications } from "@hooks/useNotifications";
import usePaginationParams from "@hooks/usePaginationParams";
import { useUser } from "@hooks/useUser";
import ContentContainerLayout from "@layouts/ContentContainerLayout";
import type { GetV1DepartmentsOrderBy, UpsertDepartmentInput } from "@ou-ca/api/models";
import type { Department } from "@ou-ca/common/api/entities/department";
import {
  useApiDepartmentCreate,
  useApiDepartmentDelete,
  useApiDepartmentUpdate,
  useApiDepartmentsInfiniteQuery,
} from "@services/api/department/api-department-queries";
import { useApiDownloadExport } from "@services/api/export/api-export-queries";
import { FetchError } from "@utils/fetch-api";
import { type FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import useDeepCompareEffect from "use-deep-compare-effect";
import EntityUpsertDialog from "../common/EntityUpsertDialog";
import ManageEntitiesHeader from "../common/ManageEntitiesHeader";
import ManageTopBar from "../common/ManageTopBar";
import DepartementCreate from "./DepartementCreate";
import DepartementDeleteDialog from "./DepartementDeleteDialog";
import DepartementTable from "./DepartementTable";
import DepartementUpdate from "./DepartementUpdate";

const DepartementPage: FunctionComponent = () => {
  const { t } = useTranslation();

  const user = useUser();

  const { displayNotification } = useNotifications();

  const [upsertDepartmentDialog, setUpsertDepartmentDialog] = useState<
    null | { mode: "create" } | { mode: "update"; department: Department }
  >(null);
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);

  const { query, setQuery, orderBy, setOrderBy, sortOrder, setSortOrder } =
    usePaginationParams<GetV1DepartmentsOrderBy>({
      orderBy: "code",
    });

  const queryParams = {
    q: query,
    pageSize: 10,
    orderBy,
    sortOrder,
  };

  const { data, fetchNextPage, hasNextPage, mutate } = useApiDepartmentsInfiniteQuery(queryParams);

  // When query params change, we need to refetch the data
  useDeepCompareEffect(() => {
    void mutate();
  }, [queryParams, mutate]);

  const handleRequestSort = (sortingColumn: GetV1DepartmentsOrderBy) => {
    const isAsc = orderBy === sortingColumn && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setOrderBy(sortingColumn);
  };

  const createDepartment = useApiDepartmentCreate();

  const handleUpsertDepartmentError = (e: unknown) => {
    if (e instanceof FetchError && e.status === 409) {
      displayNotification({
        type: "error",
        message: t("departmentAlreadyExistingError"),
      });
    } else {
      displayNotification({
        type: "error",
        message: t("retrieveGenericSaveError"),
      });
    }
  };

  const { trigger: updateDepartment } = useApiDepartmentUpdate(
    upsertDepartmentDialog?.mode === "update" ? upsertDepartmentDialog.department?.id : null,
    {
      onSuccess: () => {
        void mutate();

        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertDepartmentDialog(null);
      },
      onError: (e) => {
        void mutate();

        handleUpsertDepartmentError(e);
      },
    },
  );

  const { trigger: deleteDepartment } = useApiDepartmentDelete(departmentToDelete?.id ?? null, {
    onSuccess: () => {
      void mutate();

      displayNotification({
        type: "success",
        message: t("deleteConfirmationMessage"),
      });
      setDepartmentToDelete(null);
    },
    onError: () => {
      void mutate();

      displayNotification({
        type: "error",
        message: t("deleteErrorMessage"),
      });
    },
  });

  const downloadExport = useApiDownloadExport({ filename: t("departments"), path: "/generate-export/departments" });

  const handleCreateClick = () => {
    setUpsertDepartmentDialog({ mode: "create" });
  };

  const handleUpdateClick = (department: Department) => {
    setUpsertDepartmentDialog({ mode: "update", department });
  };

  const handleExportClick = () => {
    void downloadExport();
  };

  const handleCreateDepartment = (input: UpsertDepartmentInput) => {
    createDepartment({ body: input })
      .then(() => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertDepartmentDialog(null);
      })
      .catch((e) => {
        handleUpsertDepartmentError(e);
      })
      .finally(() => {
        void mutate();
      });
  };

  const handleUpdateDepartment = (_id: string, input: UpsertDepartmentInput) => {
    void updateDepartment({ body: input });
  };

  const handleDeleteDepartment = () => {
    void deleteDepartment();
  };

  return (
    <>
      <ManageTopBar
        title={t("departments")}
        enableCreate={user?.permissions.department.canCreate}
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
        <DepartementTable
          departments={data?.flatMap((page) => page.data)}
          onClickUpdateDepartment={handleUpdateClick}
          onClickDeleteDepartment={setDepartmentToDelete}
          hasNextPage={hasNextPage}
          onMoreRequested={fetchNextPage}
          orderBy={orderBy}
          sortOrder={sortOrder}
          handleRequestSort={handleRequestSort}
        />
      </ContentContainerLayout>
      <EntityUpsertDialog
        open={upsertDepartmentDialog != null}
        onClose={() => setUpsertDepartmentDialog(null)}
        title={
          upsertDepartmentDialog?.mode === "create"
            ? t("departmentCreationTitle")
            : upsertDepartmentDialog?.mode === "update"
              ? t("departmentEditionTitle")
              : undefined
        }
      >
        {upsertDepartmentDialog?.mode === "create" && (
          <DepartementCreate onCancel={() => setUpsertDepartmentDialog(null)} onSubmit={handleCreateDepartment} />
        )}
        {upsertDepartmentDialog?.mode === "update" && (
          <DepartementUpdate
            department={upsertDepartmentDialog.department}
            onCancel={() => setUpsertDepartmentDialog(null)}
            onSubmit={handleUpdateDepartment}
          />
        )}
      </EntityUpsertDialog>
      <DepartementDeleteDialog
        departmentToDelete={departmentToDelete}
        onCancelDeletion={() => setDepartmentToDelete(null)}
        onConfirmDeletion={handleDeleteDepartment}
      />
    </>
  );
};

export default DepartementPage;
