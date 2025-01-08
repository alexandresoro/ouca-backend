import DeletionConfirmationDialog from "@components/common/DeletionConfirmationDialog";
import type { Behavior } from "@ou-ca/api/models";
import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";

type ComportementDeleteDialogProps = {
  behaviorToDelete: Behavior | null;
  onCancelDeletion?: () => void;
  onConfirmDeletion?: (behavior: Behavior) => void;
};

const ComportementDeleteDialog: FunctionComponent<ComportementDeleteDialogProps> = ({
  behaviorToDelete,
  onCancelDeletion,
  onConfirmDeletion,
}) => {
  const { t } = useTranslation();

  const handleConfirmDeletion = (behaviorToDelete: Behavior | null) => {
    if (behaviorToDelete != null) {
      onConfirmDeletion?.(behaviorToDelete);
    }
  };

  return (
    <DeletionConfirmationDialog
      open={behaviorToDelete != null}
      messageContent={t("deleteBehaviorDialogMsg", {
        name: behaviorToDelete?.libelle,
      })}
      onCancelAction={() => onCancelDeletion?.()}
      onConfirmAction={() => handleConfirmDeletion(behaviorToDelete)}
    />
  );
};

export default ComportementDeleteDialog;
