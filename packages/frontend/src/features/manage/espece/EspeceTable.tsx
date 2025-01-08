import InfiniteTable from "@components/base/table/InfiniteTable";
import TableSortLabel from "@components/base/table/TableSortLabel";
import type { SortOrder } from "@hooks/usePaginationParams";
import type { GetV1SpeciesOrderBy } from "@ou-ca/api/models";
import type { Species } from "@ou-ca/common/api/entities/species";
import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import SpeciesTableRow from "./SpeciesTableRow";

type EspeceTableProps = {
  species: Species[] | undefined;
  onClickUpdateSpecies: (species: Species) => void;
  onClickDeleteSpecies: (species: Species) => void;
  hasNextPage?: boolean;
  onMoreRequested?: () => void;
  orderBy: GetV1SpeciesOrderBy | undefined;
  sortOrder: SortOrder;
  handleRequestSort: (sortingColumn: GetV1SpeciesOrderBy) => void;
};

const COLUMNS = [
  {
    key: "nomClasse",
    locKey: "speciesClass",
  },
  {
    key: "code",
    locKey: "code",
  },
  {
    key: "nomFrancais",
    locKey: "localizedName",
  },
  {
    key: "nomLatin",
    locKey: "scientificName",
  },
] as const;

const EspeceTable: FunctionComponent<EspeceTableProps> = ({
  species,
  onClickUpdateSpecies,
  onClickDeleteSpecies,
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
      tableRows={species?.map((oneSpecies) => (
        <SpeciesTableRow
          key={oneSpecies.id}
          species={oneSpecies}
          onEditClicked={onClickUpdateSpecies}
          onDeleteClicked={onClickDeleteSpecies}
        />
      ))}
      enableScroll={hasNextPage}
      onMoreRequested={onMoreRequested}
    />
  );
};

export default EspeceTable;
