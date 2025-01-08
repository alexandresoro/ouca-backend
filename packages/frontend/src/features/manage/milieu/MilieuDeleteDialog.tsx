import DeletionConfirmationDialog from "@components/common/DeletionConfirmationDialog";
import type { Environment } from "@ou-ca/api/models";
import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";

type MilieuDeleteDialogProps = {
  environmentToDelete: Environment | null;
  onCancelDeletion?: () => void;
  onConfirmDeletion?: (environment: Environment) => void;
};

const MilieuDeleteDialog: FunctionComponent<MilieuDeleteDialogProps> = ({
  environmentToDelete,
  onCancelDeletion,
  onConfirmDeletion,
}) => {
  const { t } = useTranslation();

  const handleConfirmDeletion = (environmentToDelete: Environment | null) => {
    if (environmentToDelete != null) {
      onConfirmDeletion?.(environmentToDelete);
    }
  };

  return (
    <DeletionConfirmationDialog
      open={environmentToDelete != null}
      messageContent={t("deleteEnvironmentDialogMsg", {
        name: environmentToDelete?.libelle,
      })}
      onCancelAction={() => onCancelDeletion?.()}
      onConfirmAction={() => handleConfirmDeletion(environmentToDelete)}
    />
  );
};

export default MilieuDeleteDialog;
