import DeletionConfirmationDialog from "@components/common/DeletionConfirmationDialog";
import type { SpeciesClass } from "@ou-ca/api/models";
import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";

type ClasseDeleteDialogProps = {
  speciesClassToDelete: SpeciesClass | null;
  onCancelDeletion?: () => void;
  onConfirmDeletion?: (speciesClass: SpeciesClass) => void;
};

const ClasseDeleteDialog: FunctionComponent<ClasseDeleteDialogProps> = ({
  speciesClassToDelete,
  onCancelDeletion,
  onConfirmDeletion,
}) => {
  const { t } = useTranslation();

  const handleConfirmDeletion = (speciesClassToDelete: SpeciesClass | null) => {
    if (speciesClassToDelete != null) {
      onConfirmDeletion?.(speciesClassToDelete);
    }
  };

  return (
    <DeletionConfirmationDialog
      open={speciesClassToDelete != null}
      messageContent={t("deleteClassDialogMsg", {
        name: speciesClassToDelete?.libelle,
      })}
      onCancelAction={() => onCancelDeletion?.()}
      onConfirmAction={() => handleConfirmDeletion(speciesClassToDelete)}
    />
  );
};

export default ClasseDeleteDialog;
