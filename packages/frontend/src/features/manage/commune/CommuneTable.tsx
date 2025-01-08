import InfiniteTable from "@components/base/table/InfiniteTable";
import TableSortLabel from "@components/base/table/TableSortLabel";
import type { GetV1TownsOrderBy } from "@ou-ca/api/models";
import type { SortOrder } from "@ou-ca/common/api/common/entitiesSearchParams";
import type { Town } from "@ou-ca/common/api/entities/town";
import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import TownTableRow from "./TownTableRow";

type CommuneTableProps = {
  towns: Town[] | undefined;
  onClickUpdateTown: (town: Town) => void;
  onClickDeleteTown: (town: Town) => void;
  hasNextPage?: boolean;
  onMoreRequested?: () => void;
  orderBy: GetV1TownsOrderBy | undefined;
  sortOrder: SortOrder;
  handleRequestSort: (sortingColumn: GetV1TownsOrderBy) => void;
};

const CommuneTable: FunctionComponent<CommuneTableProps> = ({
  towns,
  onClickUpdateTown,
  onClickDeleteTown,
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
          <th>
            <TableSortLabel
              active={orderBy === "departement"}
              direction={orderBy === "departement" ? sortOrder : "asc"}
              onClick={() => handleRequestSort("departement")}
            >
              {t("department")}
            </TableSortLabel>
          </th>
          <th>
            <TableSortLabel
              active={orderBy === "code"}
              direction={orderBy === "code" ? sortOrder : "asc"}
              onClick={() => handleRequestSort("code")}
            >
              {t("code")}
            </TableSortLabel>
          </th>
          <th>
            <TableSortLabel
              active={orderBy === "nom"}
              direction={orderBy === "nom" ? sortOrder : "asc"}
              onClick={() => handleRequestSort("nom")}
            >
              {t("name")}
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
          <th className="w-32 first-letter:capitalize">{t("owner")}</th>
          <th align="center" className="w-32">
            {t("actions")}
          </th>
        </>
      }
      tableRows={towns?.map((town) => (
        <TownTableRow key={town.id} town={town} onEditClicked={onClickUpdateTown} onDeleteClicked={onClickDeleteTown} />
      ))}
      enableScroll={hasNextPage}
      onMoreRequested={onMoreRequested}
    />
  );
};

export default CommuneTable;
