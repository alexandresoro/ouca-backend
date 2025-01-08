import InfiniteTable from "@components/base/table/InfiniteTable";
import TableSortLabel from "@components/base/table/TableSortLabel";
import type { SortOrder } from "@hooks/usePaginationParams";
import type { GetV1BehaviorsOrderBy } from "@ou-ca/api/models";
import type { Behavior } from "@ou-ca/common/api/entities/behavior";
import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import BehaviorTableRow from "./BehaviorTableRow";

type ComportementTableProps = {
  behaviors: Behavior[] | undefined;
  onClickUpdateBehavior: (behavior: Behavior) => void;
  onClickDeleteBehavior: (behavior: Behavior) => void;
  hasNextPage?: boolean;
  onMoreRequested?: () => void;
  orderBy: GetV1BehaviorsOrderBy | undefined;
  sortOrder: SortOrder;
  handleRequestSort: (sortingColumn: GetV1BehaviorsOrderBy) => void;
};

const COLUMNS = [
  {
    key: "code",
    locKey: "code",
  },
  {
    key: "libelle",
    locKey: "label",
  },
  {
    key: "nicheur",
    locKey: "breeding",
  },
] as const;

const ComportementTable: FunctionComponent<ComportementTableProps> = ({
  behaviors,
  onClickUpdateBehavior,
  onClickDeleteBehavior,
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
      tableRows={behaviors?.map((behavior) => (
        <BehaviorTableRow
          key={behavior.id}
          behavior={behavior}
          onEditClicked={onClickUpdateBehavior}
          onDeleteClicked={onClickDeleteBehavior}
        />
      ))}
      enableScroll={hasNextPage}
      onMoreRequested={onMoreRequested}
    />
  );
};

export default ComportementTable;
