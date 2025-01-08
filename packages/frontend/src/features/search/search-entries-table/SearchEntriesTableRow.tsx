import IconButton from "@components/base/IconButton";
import type { Entry } from "@ou-ca/api/models";
import { useApiInventoryQuery } from "@services/api/inventory/api-inventory-queries";
import { useApiLocalityInfoQuery } from "@services/api/locality/api-locality-queries";
import { Detail, EditAlt, Trash } from "@styled-icons/boxicons-regular";
import { Binoculars } from "@styled-icons/boxicons-solid";
import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

type SearchEntriesTableRowProps = {
  donnee: Entry;
  onViewAction: () => void;
  onEditAction?: () => void;
  onDeleteAction: () => void;
};

const SearchEntriesTableRow: FunctionComponent<SearchEntriesTableRowProps> = (props) => {
  const { donnee, onViewAction, onEditAction, onDeleteAction } = props;

  const { t } = useTranslation();

  const { data: inventory } = useApiInventoryQuery(donnee.inventoryId);

  const { data: localityInfo } = useApiLocalityInfoQuery(inventory?.locality.id ?? null);

  return (
    <>
      <tr className="table-hover">
        <td>{donnee.species?.nomFrancais}</td>
        <td>{donnee.number}</td>
        <td>
          {localityInfo?.townName} ({localityInfo?.departmentCode}), {inventory?.locality.nom}
        </td>
        <td>{inventory?.date ? new Intl.DateTimeFormat().format(new Date(inventory.date)) : ""}</td>
        <td align="right" className="w-40 flex gap-1">
          <div className="tooltip tooltip-bottom" data-tip={t("goToInventory")}>
            <Link
              className="btn btn-circle btn-sm btn-ghost text-primary"
              to={`/inventory/${donnee.inventoryId}`}
              aria-label={t("goToInventory")}
            >
              <Binoculars className="h-5" />
            </Link>
          </div>
          <IconButton
            className="text-primary"
            aria-label={t("observationsTable.header.action.view")}
            onClick={onViewAction}
          >
            <Detail className="h-5" />
          </IconButton>
          <IconButton className="text-primary" aria-label={t("aria-editButton")} onClick={onEditAction}>
            <EditAlt className="h-5" />
          </IconButton>
          <IconButton
            className="text-error"
            aria-label={t("observationsTable.header.action.delete")}
            onClick={onDeleteAction}
          >
            <Trash className="h-5" />
          </IconButton>
        </td>
      </tr>
    </>
  );
};

export default SearchEntriesTableRow;
