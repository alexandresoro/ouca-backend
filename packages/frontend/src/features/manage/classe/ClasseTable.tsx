import InfiniteTable from "@components/base/table/InfiniteTable";
import TableSortLabel from "@components/base/table/TableSortLabel";
import type { SortOrder } from "@hooks/usePaginationParams";
import type { GetV1ClassesOrderBy, SpeciesClass } from "@ou-ca/api/models";
import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import SpeciesClassTableRow from "./SpeciesClassTableRow";

type ClasseTableProps = {
  speciesClasses: SpeciesClass[] | undefined;
  onClickUpdateSpeciesClass: (speciesClass: SpeciesClass) => void;
  onClickDeleteSpeciesClass: (speciesClass: SpeciesClass) => void;
  hasNextPage?: boolean;
  onMoreRequested?: () => void;
  orderBy: GetV1ClassesOrderBy | undefined;
  sortOrder: SortOrder;
  handleRequestSort: (sortingColumn: GetV1ClassesOrderBy) => void;
};

const COLUMNS = [
  {
    key: "libelle",
    locKey: "label",
  },
] as const;

const ClasseTable: FunctionComponent<ClasseTableProps> = ({
  speciesClasses,
  onClickUpdateSpeciesClass,
  onClickDeleteSpeciesClass,
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
              active={orderBy === "nbEspeces"}
              direction={orderBy === "nbEspeces" ? sortOrder : "asc"}
              onClick={() => handleRequestSort("nbEspeces")}
            >
              <span className="first-letter:capitalize">{t("numberOfSpecies")}</span>
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
      tableRows={speciesClasses?.map((speciesClass) => (
        <SpeciesClassTableRow
          speciesClass={speciesClass}
          key={speciesClass.id}
          onEditClicked={onClickUpdateSpeciesClass}
          onDeleteClicked={onClickDeleteSpeciesClass}
        />
      ))}
      enableScroll={hasNextPage}
      onMoreRequested={onMoreRequested}
    />
  );
};

export default ClasseTable;
