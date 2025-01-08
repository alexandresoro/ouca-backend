import type { UpsertInventoryInput } from "@ou-ca/api/models";
import { useApiInventoryQuery } from "@services/api/inventory/api-inventory-queries";
import InventoryFormWithMap from "../../../inventory/inventory-form-with-map/InventoryFormWithMap";

type InventoryStepContainerProps = {
  fromExistingInventoryId: string | null;
  onSubmitInventoryForm?: (inventoryFormData: UpsertInventoryInput) => void;
};

const InventoryStepContainer = ({ fromExistingInventoryId, onSubmitInventoryForm }: InventoryStepContainerProps) => {
  const { data: initialDataInventory, isValidating } = useApiInventoryQuery(fromExistingInventoryId);

  if (fromExistingInventoryId && isValidating) {
    return (
      <div className="flex justify-center items-center">
        <progress className="progress progress-primary w-56" />
      </div>
    );
  }

  return (
    <>
      {(!fromExistingInventoryId || initialDataInventory) && (
        <InventoryFormWithMap
          mode="create"
          initialData={initialDataInventory}
          onSubmitInventoryForm={onSubmitInventoryForm}
        />
      )}
    </>
  );
};

export default InventoryStepContainer;
