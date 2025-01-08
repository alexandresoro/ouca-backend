import DeletionConfirmationDialog from "@components/common/DeletionConfirmationDialog";
import type { Sex } from "@ou-ca/api/models";
import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";

type SexeDeleteDialogProps = {
  sexToDelete: Sex | null;
  onCancelDeletion?: () => void;
  onConfirmDeletion?: (sex: Sex) => void;
};

const SexeDeleteDialog: FunctionComponent<SexeDeleteDialogProps> = ({
  sexToDelete,
  onCancelDeletion,
  onConfirmDeletion,
}) => {
  const { t } = useTranslation();

  const handleConfirmDeletion = (sexToDelete: Sex | null) => {
    if (sexToDelete != null) {
      onConfirmDeletion?.(sexToDelete);
    }
  };

  return (
    <DeletionConfirmationDialog
      open={sexToDelete != null}
      messageContent={t("deleteGenderDialogMsg", {
        name: sexToDelete?.libelle,
      })}
      onCancelAction={() => onCancelDeletion?.()}
      onConfirmAction={() => handleConfirmDeletion(sexToDelete)}
    />
  );
};

export default SexeDeleteDialog;
