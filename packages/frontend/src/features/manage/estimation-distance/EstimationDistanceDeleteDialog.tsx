import DeletionConfirmationDialog from "@components/common/DeletionConfirmationDialog";
import type { DistanceEstimate } from "@ou-ca/api/models";
import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";

type EstimationDistanceDeleteDialogProps = {
  distanceEstimateToDelete: DistanceEstimate | null;
  onCancelDeletion?: () => void;
  onConfirmDeletion?: (distanceestimate: DistanceEstimate) => void;
};

const EstimationDistanceDeleteDialog: FunctionComponent<EstimationDistanceDeleteDialogProps> = ({
  distanceEstimateToDelete,
  onCancelDeletion,
  onConfirmDeletion,
}) => {
  const { t } = useTranslation();

  const handleConfirmDeletion = (distanceEstimateToDelete: DistanceEstimate | null) => {
    if (distanceEstimateToDelete != null) {
      onConfirmDeletion?.(distanceEstimateToDelete);
    }
  };

  return (
    <DeletionConfirmationDialog
      open={distanceEstimateToDelete != null}
      messageContent={t("deleteDistancePrecisionDialogMsg", {
        name: distanceEstimateToDelete?.libelle,
      })}
      onCancelAction={() => onCancelDeletion?.()}
      onConfirmAction={() => handleConfirmDeletion(distanceEstimateToDelete)}
    />
  );
};

export default EstimationDistanceDeleteDialog;
