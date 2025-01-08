import DeletionConfirmationDialog from "@components/common/DeletionConfirmationDialog";
import type { Locality } from "@ou-ca/api/models";
import { useApiLocalityInfoQuery } from "@services/api/locality/api-locality-queries";
import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";

type LieuDitDeleteDialogProps = {
  localityToDelete: Locality | null;
  onCancelDeletion?: () => void;
  onConfirmDeletion?: (locality: Locality) => void;
};

const LieuDitDeleteDialog: FunctionComponent<LieuDitDeleteDialogProps> = ({
  localityToDelete,
  onCancelDeletion,
  onConfirmDeletion,
}) => {
  const { t } = useTranslation();

  const { data: localityInfo } = useApiLocalityInfoQuery(localityToDelete?.id ?? null);

  const handleConfirmDeletion = (localityToDelete: Locality | null) => {
    if (localityToDelete != null) {
      onConfirmDeletion?.(localityToDelete);
    }
  };

  return (
    <DeletionConfirmationDialog
      open={localityToDelete != null}
      messageContent={t("deleteLieuDitDialogMsg", {
        name: localityToDelete?.nom,
        city: localityInfo?.townName,
        department: localityInfo?.departmentCode,
      })}
      onCancelAction={() => onCancelDeletion?.()}
      onConfirmAction={() => handleConfirmDeletion(localityToDelete)}
    />
  );
};

export default LieuDitDeleteDialog;
