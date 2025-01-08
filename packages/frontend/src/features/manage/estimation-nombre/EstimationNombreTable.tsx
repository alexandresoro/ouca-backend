import InfiniteTable from "@components/base/table/InfiniteTable";
import TableSortLabel from "@components/base/table/TableSortLabel";
import type { GetV1NumberEstimatesOrderBy } from "@ou-ca/api/models";
import type { SortOrder } from "@ou-ca/common/api/common/entitiesSearchParams";
import type { NumberEstimate } from "@ou-ca/common/api/entities/number-estimate";
import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import NumberEstimateTableRow from "./NumberEstimateTableRow";

type EstimationNombreTableProps = {
  numberEstimates: NumberEstimate[] | undefined;
  onClickUpdateNumberEstimate: (numberEstimate: NumberEstimate) => void;
  onClickDeleteNumberEstimate: (numberEstimate: NumberEstimate) => void;
  hasNextPage?: boolean;
  onMoreRequested?: () => void;
  orderBy: GetV1NumberEstimatesOrderBy | undefined;
  sortOrder: SortOrder;
  handleRequestSort: (sortingColumn: GetV1NumberEstimatesOrderBy) => void;
};

const COLUMNS = [
  {
    key: "libelle",
    locKey: "label",
  },
  {
    key: "nonCompte",
    locKey: "undefinedNumber",
  },
] as const;

const EstimationNombreTable: FunctionComponent<EstimationNombreTableProps> = ({
  numberEstimates,
  onClickUpdateNumberEstimate,
  onClickDeleteNumberEstimate,
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
      tableRows={numberEstimates?.map((numberEstimate) => (
        <NumberEstimateTableRow
          key={numberEstimate.id}
          numberEstimate={numberEstimate}
          onEditClicked={onClickUpdateNumberEstimate}
          onDeleteClicked={onClickDeleteNumberEstimate}
        />
      ))}
      enableScroll={hasNextPage}
      onMoreRequested={onMoreRequested}
    />
  );
};

export default EstimationNombreTable;
