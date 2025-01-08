import DeletionConfirmationDialog from "@components/common/DeletionConfirmationDialog";
import { Menu, MenuButton, MenuItem, MenuItems, MenuSection, MenuSeparator } from "@headlessui/react";
import { useNotifications } from "@hooks/useNotifications";
import type { Inventory, UpsertInventoryInput } from "@ou-ca/api/models";
import {
  useApiInventoriesQuery,
  useApiInventoryDelete,
  useApiInventoryIndex,
  useApiInventoryUpdate,
} from "@services/api/inventory/api-inventory-queries";
import {
  ChevronLeft,
  ChevronRight,
  CopyAlt,
  DotsHorizontalRounded,
  EditAlt,
  Trash,
} from "@styled-icons/boxicons-regular";
import { type FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";
import InventoryEditDialogContainer from "../inventory-edit-dialog-container/InventoryEditDialogContainer";
import InventoryMap from "../inventory-map/InventoryMap";
import InventorySummaryPanel from "../inventory-summary-panel/InventorySummaryPanel";

type InventoryPagePanelProps = {
  inventory: Inventory;
  isInventoryDeletionAllowed?: boolean;
};

const InventoryPagePanel: FunctionComponent<InventoryPagePanelProps> = ({ inventory, isInventoryDeletionAllowed }) => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const { displayNotification } = useNotifications();

  const [deleteDialog, setDeleteDialog] = useState<Inventory | null>(null);

  const { data: inventoryCountData } = useApiInventoriesQuery({
    pageNumber: 1,
    pageSize: 1,
  });

  const totalInventories = inventoryCountData?.meta.count;

  const { data: inventoryIndex } = useApiInventoryIndex(inventory.id, {
    orderBy: "creationDate",
    sortOrder: "desc",
  });

  const previousInventoryIndex =
    inventoryIndex != null && totalInventories != null && inventoryIndex < totalInventories
      ? inventoryIndex + 1
      : undefined;
  const nextInventoryIndex = inventoryIndex != null && inventoryIndex > 1 ? inventoryIndex - 1 : undefined;

  const { data: previousInventoryData, isValidating: isValidatingPrevious } = useApiInventoriesQuery(
    {
      pageNumber: previousInventoryIndex,
      pageSize: 1,
      orderBy: "creationDate",
      sortOrder: "desc",
    },
    {},
    {
      paused: previousInventoryIndex == null,
    },
  );

  const { data: nextInventoryData, isValidating: isValidatingNext } = useApiInventoriesQuery(
    {
      pageNumber: nextInventoryIndex,
      pageSize: 1,
      orderBy: "creationDate",
      sortOrder: "desc",
    },
    {},
    {
      paused: nextInventoryIndex == null,
    },
  );

  const { trigger: triggerUpdateInventory } = useApiInventoryUpdate(inventory.id, {
    onSuccess: () => {
      displayNotification({
        type: "success",
        message: t("inventoryForm.updateSuccess"),
      });
      setInventoryEditDialogOpen(false);
    },
    onError: () => {
      displayNotification({
        type: "error",
        message: t("inventoryForm.updateError"),
      });
    },
  });

  const { trigger: triggerDeleteInventory } = useApiInventoryDelete(inventory.id, {
    onSuccess: () => {
      displayNotification({
        type: "success",
        message: t("inventoryForm.deleteSuccess"),
      });
      setDeleteDialog(null);
      if (previousInventoryId != null) {
        navigate(`../${previousInventoryId}`, { replace: true, relative: "path" });
      } else if (nextInventoryId != null) {
        navigate(`../${nextInventoryId}`, { replace: true, relative: "path" });
      } else {
        navigate("/", { replace: true });
      }
    },
    onError: () => {
      displayNotification({
        type: "error",
        message: t("inventoryForm.deleteError"),
      });
    },
  });

  const [inventoryEditDialogOpen, setInventoryEditDialogOpen] = useState<boolean>(false);

  const handleInventoryUpdate = async (inventoryFormData: UpsertInventoryInput) => {
    await triggerUpdateInventory({
      body: inventoryFormData,
    });
  };

  const previousInventoryId = previousInventoryData?.data?.[0]?.id ?? null;
  const nextInventoryId = nextInventoryData?.data?.[0]?.id ?? null;

  const hasPreviousInventory = previousInventoryIndex != null && previousInventoryId != null;
  const hasNextInventory = nextInventoryIndex != null && nextInventoryId != null;

  return (
    <>
      <div className="flex pb-4 items-center justify-between">
        <div className="tooltip tooltip-bottom" data-tip={`${t("displayData.dataId")} ${inventory.id}`}>
          <h2 className="text-2xl font-semibold">{t("inventoryPage.inventoryPanel.title")}</h2>
        </div>
        <div className="flex items-center gap-4">
          <Menu>
            <MenuButton as="div" className="flex items-center">
              {({ active }) => (
                <div className="flex relative">
                  <button
                    type="button"
                    className={`btn btn-xs btn-circle btn-primary ${
                      active ? "btn-active outline outline-2 outline-offset-2" : "btn-outline"
                    }`}
                  >
                    <DotsHorizontalRounded className="h-5" />
                  </button>
                </div>
              )}
            </MenuButton>
            <MenuItems
              anchor={{
                to: "bottom",
                gap: 8,
                padding: 12,
              }}
              className="z-10 flex flex-col gap-1.5 p-1.5 outline-none shadow-xl ring-2 ring-primary bg-base-100 dark:bg-base-300 rounded-lg w-max"
            >
              <MenuSection className="flex flex-col gap-1.5">
                <MenuItem key="edit">
                  {({ focus }) => (
                    <button
                      type="button"
                      className={`btn btn-xs text-primary uppercase ${
                        focus ? "bg-opacity-20 bg-base-content" : "btn-ghost"
                      }`}
                      onClick={() => setInventoryEditDialogOpen(true)}
                    >
                      <EditAlt className="h-5" />
                      {t("inventoryPage.inventoryPanel.edit")}
                    </button>
                  )}
                </MenuItem>
                <MenuItem key="createNewFrom">
                  {({ focus }) => (
                    <Link
                      className={`btn btn-xs text-primary uppercase ${
                        focus ? "bg-opacity-20 bg-base-content" : "btn-ghost"
                      }`}
                      to={`/create-new?${new URLSearchParams({ createFromInventory: `${inventory.id}` }).toString()}`}
                    >
                      <CopyAlt className="h-5" />
                      {t("inventoryPage.inventoryPanel.createNewFrom")}
                    </Link>
                  )}
                </MenuItem>
              </MenuSection>
              {isInventoryDeletionAllowed && (
                <>
                  <MenuSeparator className="h-px mx-4 bg-primary/70 rounded" />
                  <MenuItem key="delete">
                    {({ focus }) => (
                      <button
                        type="button"
                        className={`btn btn-xs text-error uppercase ${
                          focus ? "bg-opacity-20 bg-base-content" : "btn-ghost"
                        }`}
                        onClick={() => setDeleteDialog(inventory)}
                      >
                        <Trash className="h-5" />
                        {t("inventoryPage.inventoryPanel.delete")}
                      </button>
                    )}
                  </MenuItem>
                </>
              )}
            </MenuItems>
          </Menu>
          <div className="flex gap-2">
            <div
              className="tooltip tooltip-bottom"
              data-tip={hasPreviousInventory ? t("inventoryPage.previousInventory") : undefined}
            >
              <Link
                className={`btn btn-sm btn-square ${
                  hasPreviousInventory && !isValidatingPrevious ? "btn-primary" : "btn-disabled"
                }`}
                to={`../${previousInventoryId as string}`}
                tabIndex={hasPreviousInventory ? 0 : -1}
                relative="path"
              >
                <ChevronLeft className="h-6" />
              </Link>
            </div>
            <div
              className="tooltip tooltip-bottom"
              data-tip={hasNextInventory ? t("inventoryPage.nextInventory") : undefined}
            >
              <Link
                className={`btn btn-sm btn-square ${
                  hasNextInventory && !isValidatingNext ? "btn-primary" : "btn-disabled"
                }`}
                to={`../${nextInventoryId as string}`}
                tabIndex={hasNextInventory ? 0 : -1}
                relative="path"
              >
                <ChevronRight className="h-6" />
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <InventorySummaryPanel inventory={inventory} />
        <InventoryMap inventory={inventory} />
      </div>
      <InventoryEditDialogContainer
        inventory={inventory}
        open={inventoryEditDialogOpen}
        onClose={() => setInventoryEditDialogOpen(false)}
        onInventoryUpdate={handleInventoryUpdate}
      />
      <DeletionConfirmationDialog
        open={!!deleteDialog}
        messageContent={t("deleteInventoryDialogMsg")}
        onCancelAction={() => setDeleteDialog(null)}
        onConfirmAction={() => triggerDeleteInventory()}
      />
    </>
  );
};

export default InventoryPagePanel;
