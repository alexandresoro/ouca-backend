import DeletionConfirmationDialog from "@components/common/DeletionConfirmationDialog";
import type { Town } from "@ou-ca/api/models";
import { useApiTownInfoQuery } from "@services/api/town/api-town-queries";
import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";

type CommuneDeleteDialogProps = {
  townToDelete: Town | null;
  onCancelDeletion?: () => void;
  onConfirmDeletion?: (town: Town) => void;
};

const CommuneDeleteDialog: FunctionComponent<CommuneDeleteDialogProps> = ({
  townToDelete,
  onCancelDeletion,
  onConfirmDeletion,
}) => {
  const { t } = useTranslation();

  const { data: townInfo } = useApiTownInfoQuery(townToDelete?.id ?? null);

  const handleConfirmDeletion = (townToDelete: Town | null) => {
    if (townToDelete != null) {
      onConfirmDeletion?.(townToDelete);
    }
  };

  return (
    <DeletionConfirmationDialog
      open={townToDelete != null}
      messageContent={t("deleteCityDialogMsg", {
        name: townToDelete?.nom,
        department: townInfo?.departmentCode,
      })}
      onCancelAction={() => onCancelDeletion?.()}
      onConfirmAction={() => handleConfirmDeletion(townToDelete)}
    />
  );
};

export default CommuneDeleteDialog;
