import { useNotifications } from "@hooks/useNotifications";
import type { UpsertInventoryInput } from "@ou-ca/api/models";
import { useApiInventoryCreate } from "@services/api/inventory/api-inventory-queries";
import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router";
import { ENTRY_STEP, INVENTORY_STEP, type NewEntryStep } from "../new-entry-page/new-entry-hash-step-mapper";
import EntryStepContainer from "../steps/entry-step-container/EntryStepContainer";
import InventoryStepContainer from "../steps/inventory-step-container/InventoryStepContainer";

type NewEntryFormContainerProps = { currentStep: NewEntryStep };

const NewEntryFormContainer: FunctionComponent<NewEntryFormContainerProps> = ({ currentStep }) => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const inventoryIdParam =
    currentStep.id === ENTRY_STEP.id ? searchParams.get("inventoryId") : searchParams.get("createFromInventory");

  const { displayNotification } = useNotifications();

  const goToEntryStep = (inventoryId: string) => {
    navigate(`/create-new?${new URLSearchParams({ inventoryId }).toString()}#${ENTRY_STEP.id}`, { replace: true });
  };

  const createInventory = useApiInventoryCreate();

  const handleSubmitInventoryForm = (inventoryFormData: UpsertInventoryInput) => {
    createInventory({ body: inventoryFormData })
      .then((createdInventory) => {
        displayNotification({
          type: "success",
          message: t("inventoryForm.createSuccess"),
        });
        goToEntryStep(createdInventory.id);
      })
      .catch(() => {
        displayNotification({
          type: "error",
          message: t("inventoryForm.createError"),
        });
      });
  };

  return (
    <>
      {currentStep.id === INVENTORY_STEP.id && (
        <InventoryStepContainer
          fromExistingInventoryId={inventoryIdParam}
          onSubmitInventoryForm={handleSubmitInventoryForm}
        />
      )}
      {currentStep.id === ENTRY_STEP.id && inventoryIdParam && <EntryStepContainer inventoryId={inventoryIdParam} />}
    </>
  );
};

export default NewEntryFormContainer;
