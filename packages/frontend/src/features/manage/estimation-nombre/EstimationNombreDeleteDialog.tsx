import DeletionConfirmationDialog from "@components/common/DeletionConfirmationDialog";
import type { NumberEstimate } from "@ou-ca/api/models";
import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";

type EstimationNombreDeleteDialogProps = {
  numberEstimateToDelete: NumberEstimate | null;
  onCancelDeletion?: () => void;
  onConfirmDeletion?: (numberestimate: NumberEstimate) => void;
};

const EstimationNombreDeleteDialog: FunctionComponent<EstimationNombreDeleteDialogProps> = ({
  numberEstimateToDelete,
  onCancelDeletion,
  onConfirmDeletion,
}) => {
  const { t } = useTranslation();

  const handleConfirmDeletion = (numberEstimateToDelete: NumberEstimate | null) => {
    if (numberEstimateToDelete != null) {
      onConfirmDeletion?.(numberEstimateToDelete);
    }
  };

  return (
    <DeletionConfirmationDialog
      open={numberEstimateToDelete != null}
      messageContent={t("deleteNumberPrecisionDialogMsg", {
        name: numberEstimateToDelete?.libelle,
      })}
      onCancelAction={() => onCancelDeletion?.()}
      onConfirmAction={() => handleConfirmDeletion(numberEstimateToDelete)}
    />
  );
};

export default EstimationNombreDeleteDialog;
