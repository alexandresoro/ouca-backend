import DeletionConfirmationDialog from "@components/common/DeletionConfirmationDialog";
import type { Species } from "@ou-ca/api/models";
import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";

type EspeceDeleteDialogProps = {
  speciesToDelete: Species | null;
  onCancelDeletion?: () => void;
  onConfirmDeletion?: (species: Species) => void;
};

const EspeceDeleteDialog: FunctionComponent<EspeceDeleteDialogProps> = ({
  speciesToDelete,
  onCancelDeletion,
  onConfirmDeletion,
}) => {
  const { t } = useTranslation();

  const handleConfirmDeletion = (speciesToDelete: Species | null) => {
    if (speciesToDelete != null) {
      onConfirmDeletion?.(speciesToDelete);
    }
  };

  return (
    <DeletionConfirmationDialog
      open={speciesToDelete != null}
      messageContent={t("deleteSpeciesDialogMsg", {
        name: speciesToDelete?.nomFrancais,
        code: speciesToDelete?.code,
      })}
      onCancelAction={() => onCancelDeletion?.()}
      onConfirmAction={() => handleConfirmDeletion(speciesToDelete)}
    />
  );
};

export default EspeceDeleteDialog;
