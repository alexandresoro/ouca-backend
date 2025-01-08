import { useNotifications } from "@hooks/useNotifications";
import type { Entry, GetV1Entries200, UpsertEntryInput } from "@ou-ca/api/models";
import { useApiEntryDelete, useApiEntryUpdate } from "@services/api/entry/api-entry-queries";
import { Plus } from "@styled-icons/boxicons-regular";
import { Fragment, type FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import DeleteEntryConfirmationDialog from "../../entry/delete-entry-confirmation-dialog/DeleteEntryConfirmationDialog";
import { ENTRY_STEP } from "../../entry/new-entry-page/new-entry-hash-step-mapper";
import UpdateEntryDialogContainer from "../../entry/update-entry-dialog-container/UpdateEntryDialogContainer";
import InventoryPageEntryElement from "../inventory-page-entry-element/InventoryPageEntryElement";

type InventoryPageEntriesPanelProps = {
  inventoryId: string;
  entries: GetV1Entries200[];
  onUpdateEntrySettled?: () => void;
  onDeleteEntrySettled?: () => void;
};

const InventoryPageEntriesPanel: FunctionComponent<InventoryPageEntriesPanelProps> = ({
  inventoryId,
  entries,
  onUpdateEntrySettled,
  onDeleteEntrySettled,
}) => {
  const { t } = useTranslation();

  const { displayNotification } = useNotifications();

  const [updateEntryDialogEntry, setUpdateEntryDialogEntry] = useState<Entry | null>(null);
  const [deleteEntryDialogEntry, setDeleteEntryDialogEntry] = useState<Entry | null>(null);

  const { trigger: triggerUpdateEntry } = useApiEntryUpdate(updateEntryDialogEntry?.id ?? null, {
    onSuccess: () => {
      setUpdateEntryDialogEntry(null);
      displayNotification({
        type: "success",
        message: t("inventoryForm.entries.updateSuccess"),
      });
      onUpdateEntrySettled?.();
    },
    onError: () => {
      displayNotification({
        type: "error",
        message: t("inventoryForm.entries.updateError"),
      });
      onUpdateEntrySettled?.();
    },
  });

  const { trigger: triggerDeleteEntry } = useApiEntryDelete(deleteEntryDialogEntry?.id ?? null, {
    onSuccess: () => {
      setDeleteEntryDialogEntry(null);
      displayNotification({
        type: "success",
        message: t("deleteConfirmationMessage"),
      });
      onDeleteEntrySettled?.();
    },
    onError: () => {
      displayNotification({
        type: "error",
        message: t("deleteErrorMessage"),
      });
      onDeleteEntrySettled?.();
    },
  });

  const handleSubmitUpdateExistingEntryForm = async (entryFormData: UpsertEntryInput) => {
    await triggerUpdateEntry({
      body: entryFormData,
    });
  };

  const handleDeleteExistingEntry = async () => {
    await triggerDeleteEntry();
  };

  return (
    <>
      <div className="flex items-center justify-between pb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold">
            {t("inventoryPage.entriesPanel.title", { count: entries[0]?.meta.count })}
          </h2>
          <span className="badge badge-primary badge-outline font-semibold">{entries[0]?.meta.count}</span>
        </div>
        <Link
          to={`/create-new?${new URLSearchParams({ inventoryId }).toString()}#${ENTRY_STEP.id}`}
          className="btn btn-sm btn-secondary uppercase"
        >
          <Plus className="w-5 h-5" />
          {t("inventoryPage.entriesPanel.addNewEntry")}
        </Link>
      </div>
      <ul className="flex flex-col justify-evenly gap-x-4 gap-y-2 mb-4">
        {entries.map((page) => {
          return (
            <Fragment key={page.meta.pageNumber}>
              {page.data.map((entry) => {
                return (
                  <li key={entry.id}>
                    <InventoryPageEntryElement
                      entry={entry}
                      onEditAction={(entry) => setUpdateEntryDialogEntry(entry)}
                      onDeleteAction={(entry) => setDeleteEntryDialogEntry(entry)}
                    />
                  </li>
                );
              })}
            </Fragment>
          );
        })}
      </ul>
      <UpdateEntryDialogContainer
        entry={updateEntryDialogEntry}
        open={updateEntryDialogEntry != null}
        onClose={() => setUpdateEntryDialogEntry(null)}
        onSubmitUpdateEntryForm={handleSubmitUpdateExistingEntryForm}
      />
      <DeleteEntryConfirmationDialog
        open={deleteEntryDialogEntry != null}
        entry={deleteEntryDialogEntry}
        onCancelAction={() => setDeleteEntryDialogEntry(null)}
        onConfirmAction={() => handleDeleteExistingEntry()}
      />
    </>
  );
};

export default InventoryPageEntriesPanel;
