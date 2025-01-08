import DeletionConfirmationDialog from "@components/common/DeletionConfirmationDialog";
import type { Department } from "@ou-ca/api/models";
import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";

type DepartementDeleteDialogProps = {
  departmentToDelete: Department | null;
  onCancelDeletion?: () => void;
  onConfirmDeletion?: (department: Department) => void;
};

const DepartementDeleteDialog: FunctionComponent<DepartementDeleteDialogProps> = ({
  departmentToDelete,
  onCancelDeletion,
  onConfirmDeletion,
}) => {
  const { t } = useTranslation();

  const handleConfirmDeletion = (departmentToDelete: Department | null) => {
    if (departmentToDelete != null) {
      onConfirmDeletion?.(departmentToDelete);
    }
  };

  return (
    <DeletionConfirmationDialog
      open={departmentToDelete != null}
      messageContent={t("deleteDepartmentDialogMsg", {
        code: departmentToDelete?.code,
      })}
      onCancelAction={() => onCancelDeletion?.()}
      onConfirmAction={() => handleConfirmDeletion(departmentToDelete)}
    />
  );
};

export default DepartementDeleteDialog;
