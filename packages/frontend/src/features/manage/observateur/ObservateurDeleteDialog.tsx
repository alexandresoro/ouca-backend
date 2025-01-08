import DeletionConfirmationDialog from "@components/common/DeletionConfirmationDialog";
import type { Observer } from "@ou-ca/api/models";
import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";

type ObservateurDeleteDialogProps = {
  observerToDelete: Observer | null;
  onCancelDeletion?: () => void;
  onConfirmDeletion?: (observer: Observer) => void;
};

const ObservateurDeleteDialog: FunctionComponent<ObservateurDeleteDialogProps> = ({
  observerToDelete,
  onCancelDeletion,
  onConfirmDeletion,
}) => {
  const { t } = useTranslation();

  const handleConfirmDeletion = (observerToDelete: Observer | null) => {
    if (observerToDelete != null) {
      onConfirmDeletion?.(observerToDelete);
    }
  };

  return (
    <DeletionConfirmationDialog
      open={observerToDelete != null}
      messageContent={t("deleteObserverDialogMsg", {
        name: observerToDelete?.libelle,
      })}
      onCancelAction={() => onCancelDeletion?.()}
      onConfirmAction={() => handleConfirmDeletion(observerToDelete)}
    />
  );
};

export default ObservateurDeleteDialog;
