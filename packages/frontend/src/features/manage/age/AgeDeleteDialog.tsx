import DeletionConfirmationDialog from "@components/common/DeletionConfirmationDialog";
import type { Age } from "@ou-ca/api/models";
import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";

type AgeDeleteDialogProps = {
  ageToDelete: Age | null;
  onCancelDeletion?: () => void;
  onConfirmDeletion?: (age: Age) => void;
};

const AgeDeleteDialog: FunctionComponent<AgeDeleteDialogProps> = ({
  ageToDelete,
  onCancelDeletion,
  onConfirmDeletion,
}) => {
  const { t } = useTranslation();

  const handleConfirmDeletion = (ageToDelete: Age | null) => {
    if (ageToDelete != null) {
      onConfirmDeletion?.(ageToDelete);
    }
  };

  return (
    <DeletionConfirmationDialog
      open={ageToDelete != null}
      messageContent={t("deleteAgeDialogMsg", {
        name: ageToDelete?.libelle,
      })}
      onCancelAction={() => onCancelDeletion?.()}
      onConfirmAction={() => handleConfirmDeletion(ageToDelete)}
    />
  );
};

export default AgeDeleteDialog;
