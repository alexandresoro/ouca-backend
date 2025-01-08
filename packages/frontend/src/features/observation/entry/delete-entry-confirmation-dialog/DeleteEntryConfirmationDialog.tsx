import DeletionConfirmationDialog from "@components/common/DeletionConfirmationDialog";
import type { Entry } from "@ou-ca/api/models";
import { useApiInventoryQuery } from "@services/api/inventory/api-inventory-queries";
import { useApiLocalityInfoQuery } from "@services/api/locality/api-locality-queries";
import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";

type DeleteEntryConfirmationDialogProps = {
  open: boolean;
  entry: Entry | null;
  onCancelAction: () => void;
  onConfirmAction: () => void;
};

const DeleteEntryConfirmationDialog: FunctionComponent<DeleteEntryConfirmationDialogProps> = ({
  open,
  entry,
  onCancelAction,
  onConfirmAction,
}) => {
  const { t } = useTranslation();

  const { data: inventory } = useApiInventoryQuery(entry?.inventoryId ?? null);

  const { data: localityInfo } = useApiLocalityInfoQuery(inventory?.locality.id ?? null);

  if (!inventory) {
    return null;
  }

  return (
    <DeletionConfirmationDialog
      open={open}
      messageContent={t("deleteObservationDialogMsg", {
        species: entry?.species.nomFrancais,
        locality: inventory.locality.nom,
        city: localityInfo?.townName,
        department: localityInfo?.departmentCode,
        date: inventory.date,
      })}
      onCancelAction={onCancelAction}
      onConfirmAction={onConfirmAction}
    />
  );
};

export default DeleteEntryConfirmationDialog;
