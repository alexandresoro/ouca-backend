import InfiniteTable from "@components/base/table/InfiniteTable";
import TableSortLabel from "@components/base/table/TableSortLabel";
import type { SortOrder } from "@hooks/usePaginationParams";
import type { GetV1LocalitiesOrderBy } from "@ou-ca/api/models";
import type { Locality } from "@ou-ca/common/api/entities/locality";
import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import LocalityTableRow from "./LocalityTableRow";

type LieuDitTableProps = {
  localities: Locality[] | undefined;
  onClickUpdateLocality: (locality: Locality) => void;
  onClickDeleteLocality: (locality: Locality) => void;
  hasNextPage?: boolean;
  onMoreRequested?: () => void;
  orderBy: GetV1LocalitiesOrderBy | undefined;
  sortOrder: SortOrder;
  handleRequestSort: (sortingColumn: GetV1LocalitiesOrderBy) => void;
};

const COLUMNS = [
  {
    key: "departement",
    locKey: "department",
  },
  {
    key: "codeCommune",
    locKey: "townCode",
  },
  {
    key: "nomCommune",
    locKey: "townName",
  },
  {
    key: "nom",
    locKey: "name",
  },
  {
    key: "latitude",
    locKey: "latitude",
  },
  {
    key: "longitude",
    locKey: "longitude",
  },
  {
    key: "altitude",
    locKey: "altitude",
  },
] as const;

const LieuDitTable: FunctionComponent<LieuDitTableProps> = ({
  localities,
  onClickUpdateLocality,
  onClickDeleteLocality,
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
      tableRows={localities?.map((locality) => (
        <LocalityTableRow
          key={locality.id}
          locality={locality}
          onEditClicked={onClickUpdateLocality}
          onDeleteClicked={onClickDeleteLocality}
        />
      ))}
      enableScroll={hasNextPage}
      onMoreRequested={onMoreRequested}
    />
  );
};

export default LieuDitTable;
