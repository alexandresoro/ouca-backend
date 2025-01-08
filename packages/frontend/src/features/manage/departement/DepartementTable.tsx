import InfiniteTable from "@components/base/table/InfiniteTable";
import TableSortLabel from "@components/base/table/TableSortLabel";
import type { GetV1DepartmentsOrderBy } from "@ou-ca/api/models";
import type { SortOrder } from "@ou-ca/common/api/common/entitiesSearchParams";
import type { Department } from "@ou-ca/common/api/entities/department";
import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import DepartmentTableRow from "./DepartmentTableRow";

type DepartementTableProps = {
  departments: Department[] | undefined;
  onClickUpdateDepartment: (department: Department) => void;
  onClickDeleteDepartment: (department: Department) => void;
  hasNextPage?: boolean;
  onMoreRequested?: () => void;
  orderBy: GetV1DepartmentsOrderBy | undefined;
  sortOrder: SortOrder;
  handleRequestSort: (sortingColumn: GetV1DepartmentsOrderBy) => void;
};

const COLUMNS = [
  {
    key: "code",
    locKey: "department",
  },
] as const;

const DepartementTable: FunctionComponent<DepartementTableProps> = ({
  departments,
  onClickUpdateDepartment,
  onClickDeleteDepartment,
  hasNextPage,
  onMoreRequested,
  orderBy,
  sortOrder,
  handleRequestSort,
}) => {
  const { t } = useTranslation();

  return (
    <InfiniteTable
      tableHead={
        <>
          {COLUMNS.map((column) => (
            <th key={column.key}>
              <TableSortLabel
                active={orderBy === column.key}
                direction={orderBy === column.key ? sortOrder : "asc"}
                onClick={() => handleRequestSort(column.key)}
              >
                {t(column.locKey)}
              </TableSortLabel>
            </th>
          ))}
          <th className="w-32">
            <TableSortLabel
              active={orderBy === "nbCommunes"}
              direction={orderBy === "nbCommunes" ? sortOrder : "asc"}
              onClick={() => handleRequestSort("nbCommunes")}
            >
              <span className="first-letter:capitalize">{t("numberOfCities")}</span>
            </TableSortLabel>
          </th>
          <th className="w-32">
            <TableSortLabel
              active={orderBy === "nbLieuxDits"}
              direction={orderBy === "nbLieuxDits" ? sortOrder : "asc"}
              onClick={() => handleRequestSort("nbLieuxDits")}
            >
              <span className="first-letter:capitalize">{t("numberOfLocalities")}</span>
            </TableSortLabel>
          </th>
          <th className="w-32">
            <TableSortLabel
              active={orderBy === "nbDonnees"}
              direction={orderBy === "nbDonnees" ? sortOrder : "asc"}
              onClick={() => handleRequestSort("nbDonnees")}
            >
              <span className="first-letter:capitalize">{t("numberOfObservations")}</span>
            </TableSortLabel>
          </th>
          <th align="center" className="w-32 first-letter:capitalize">
            {t("owner")}
          </th>
          <th align="center" className="w-32">
            {t("actions")}
          </th>
        </>
      }
      tableRows={departments?.map((department) => (
        <DepartmentTableRow
          key={department.id}
          department={department}
          onEditClicked={onClickUpdateDepartment}
          onDeleteClicked={onClickDeleteDepartment}
        />
      ))}
      enableScroll={hasNextPage}
      onMoreRequested={onMoreRequested}
    />
  );
};

export default DepartementTable;
