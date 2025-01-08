import InfiniteTable from "@components/base/table/InfiniteTable";
import TableSortLabel from "@components/base/table/TableSortLabel";
import type { SortOrder } from "@hooks/usePaginationParams";
import type { DistanceEstimate, GetV1DistanceEstimatesOrderBy } from "@ou-ca/api/models";
import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import DistanceEstimateTableRow from "./DistanceEstimateTableRow";

type EstimationDistanceTableProps = {
  distanceEstimates: DistanceEstimate[] | undefined;
  onClickUpdateDistanceEstimate: (distanceEstimate: DistanceEstimate) => void;
  onClickDeleteDistanceEstimate: (distanceEstimate: DistanceEstimate) => void;
  hasNextPage?: boolean;
  onMoreRequested?: () => void;
  orderBy: GetV1DistanceEstimatesOrderBy | undefined;
  sortOrder: SortOrder;
  handleRequestSort: (sortingColumn: GetV1DistanceEstimatesOrderBy) => void;
};

const COLUMNS = [
  {
    key: "libelle",
    locKey: "label",
  },
] as const;

const EstimationDistanceTable: FunctionComponent<EstimationDistanceTableProps> = ({
  distanceEstimates,
  onClickUpdateDistanceEstimate,
  onClickDeleteDistanceEstimate,
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
      tableRows={distanceEstimates?.map((distanceEstimate) => (
        <DistanceEstimateTableRow
          key={distanceEstimate.id}
          distanceEstimate={distanceEstimate}
          onEditClicked={onClickUpdateDistanceEstimate}
          onDeleteClicked={onClickDeleteDistanceEstimate}
        />
      ))}
      enableScroll={hasNextPage}
      onMoreRequested={onMoreRequested}
    />
  );
};

export default EstimationDistanceTable;
