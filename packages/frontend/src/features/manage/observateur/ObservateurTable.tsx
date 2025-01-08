import InfiniteTable from "@components/base/table/InfiniteTable";
import TableSortLabel from "@components/base/table/TableSortLabel";
import type { SortOrder } from "@hooks/usePaginationParams";
import type { GetV1ObserversOrderBy, Observer } from "@ou-ca/api/models";
import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import ObserverTableRow from "./ObserverTableRow";

type ObservateurTableProps = {
  observers: Observer[] | undefined;
  onClickUpdateObserver: (observer: Observer) => void;
  onClickDeleteObserver: (observer: Observer) => void;
  hasNextPage?: boolean;
  onMoreRequested?: () => void;
  orderBy: GetV1ObserversOrderBy | undefined;
  sortOrder: SortOrder;
  handleRequestSort: (sortingColumn: GetV1ObserversOrderBy) => void;
};

const COLUMNS = [
  {
    key: "libelle",
    locKey: "label",
  },
] as const;

const ObservateurTable: FunctionComponent<ObservateurTableProps> = ({
  observers,
  onClickUpdateObserver,
  onClickDeleteObserver,
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
      tableRows={observers?.map((observer) => (
        <ObserverTableRow
          observer={observer}
          key={observer.id}
          onEditClicked={onClickUpdateObserver}
          onDeleteClicked={onClickDeleteObserver}
        />
      ))}
      enableScroll={hasNextPage}
      onMoreRequested={onMoreRequested}
    />
  );
};

export default ObservateurTable;
