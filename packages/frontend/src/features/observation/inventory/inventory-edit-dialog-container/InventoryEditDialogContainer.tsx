import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import type { Inventory, UpsertInventoryInput } from "@ou-ca/api/models";
import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import InventoryFormWithMap from "../inventory-form-with-map/InventoryFormWithMap";

type InventoryEditDialogContainerProps = {
  inventory: Inventory;
  open: boolean;
  onClose: (value: boolean) => void;
  onInventoryUpdate?: (inventoryFormData: UpsertInventoryInput, inventoryId: string) => void;
};

const InventoryEditDialogContainer: FunctionComponent<InventoryEditDialogContainerProps> = ({
  inventory,
  open,
  onClose,
  onInventoryUpdate,
}) => {
  const { t } = useTranslation();

  return (
    <Dialog className={`modal ${open ? "modal-open" : ""}`} open={open} onClose={onClose}>
      <DialogPanel className="modal-box max-w-7xl">
        <DialogTitle className="text-2xl font-semibold py-4 first-letter:uppercase">
          {t("inventoryPage.inventoryEdition")}
        </DialogTitle>
        <InventoryFormWithMap mode="update" inventory={inventory} onSubmitInventoryForm={onInventoryUpdate} />
      </DialogPanel>
    </Dialog>
  );
};

export default InventoryEditDialogContainer;
