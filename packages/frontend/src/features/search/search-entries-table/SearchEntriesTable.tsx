import InfiniteTable from "@components/base/table/InfiniteTable";
import TableSortLabel from "@components/base/table/TableSortLabel";
import { useNotifications } from "@hooks/useNotifications";
import type { GetV1EntriesOrderBy, GetV1EntriesSortOrder, UpsertEntryInput } from "@ou-ca/api/models";
import type { Entry } from "@ou-ca/common/api/entities/entry";
import { useApiEntryDelete, useApiEntryUpdate } from "@services/api/entry/api-entry-queries";
import { type FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import DeleteEntryConfirmationDialog from "../../observation/entry/delete-entry-confirmation-dialog/DeleteEntryConfirmationDialog";
import EntryDetailsDialogContainer from "../../observation/entry/entry-details-dialog-container/EntryDetailsDialogContainer";
import UpdateEntryDialogContainer from "../../observation/entry/update-entry-dialog-container/UpdateEntryDialogContainer";
import SearchEntriesTableRow from "./SearchEntriesTableRow";

const COLUMNS = [
  {
    key: "nomFrancais",
    locKey: "observationsTable.header.species",
  },
  {
    key: "nombre",
    locKey: "observationsTable.header.number",
  },
  {
    key: "lieuDit",
    locKey: "observationsTable.header.locality",
  },
  {
    key: "date",
    locKey: "observationsTable.header.date",
  },
] as const;

type SearchEntriesTableProps = {
  entries: Entry[];
  onEntryUpdated?: (entryId: string) => void;
  onEntryDeleted?: () => void;
  hasNextPage?: boolean;
  onMoreRequested?: () => void;
  orderBy: GetV1EntriesOrderBy | undefined;
  sortOrder: GetV1EntriesSortOrder;
  handleRequestSort: (sortingColumn: GetV1EntriesOrderBy) => void;
};

const SearchEntriesTable: FunctionComponent<SearchEntriesTableProps> = ({
  entries,
  onEntryUpdated,
  onEntryDeleted,
  handleRequestSort,
  hasNextPage,
  onMoreRequested,
  orderBy,
  sortOrder,
}) => {
  const { t } = useTranslation();

  const [deleteDialog, setDeleteDialog] = useState<Entry | null>(null);
  const [viewEntryDialogEntry, setViewEntryDialogEntry] = useState<Entry | undefined>();
  const [updateEntryDialogEntry, setUpdateEntryDialogEntry] = useState<Entry | null>(null);

  const { displayNotification } = useNotifications();

  const { trigger: triggerUpdateEntry } = useApiEntryUpdate(updateEntryDialogEntry?.id ?? null, {
    onSuccess: (updatedEntry) => {
      setUpdateEntryDialogEntry(null);
      displayNotification({
        type: "success",
        message: t("inventoryForm.entries.updateSuccess"),
      });
      onEntryUpdated?.(updatedEntry.id);
    },
    onError: () => {
      displayNotification({
        type: "error",
        message: t("inventoryForm.entries.updateError"),
      });
    },
  });

  const { trigger: triggerDeleteEntry } = useApiEntryDelete(deleteDialog?.id ?? null, {
    onSuccess: () => {
      setDeleteDialog(null);
      displayNotification({
        type: "success",
        message: t("deleteConfirmationMessage"),
      });
      onEntryDeleted?.();
    },
    onError: () => {
      displayNotification({
        type: "error",
        message: t("deleteErrorMessage"),
      });
    },
  });

  const handleSubmitUpdateExistingEntryForm = async (entryFormData: UpsertEntryInput) => {
    await triggerUpdateEntry({
      body: entryFormData,
    });
  };

  const handleDeleteDonnee = (donnee: Entry | null) => {
    if (donnee) {
      setDeleteDialog(donnee);
    }
  };

  return (
    <>
      <InfiniteTable
        tableHead={
          <>
            {COLUMNS.map((column) => (
              <th key={column.key}>
                <TableSortLabel
                  active={orderBy === column.key}
                  direction={orderBy === column.key ? sortOrder : "asc"}
                  onClick={() => handleRequestSort(column.key)}
                >
                  {t(column.locKey)}
                </TableSortLabel>
              </th>
            ))}
            <th align="right" className="pr-8">
              {t("actions")}
            </th>
          </>
        }
        tableRows={entries.map((entry) => {
          return (
            <SearchEntriesTableRow
              key={entry.id}
              donnee={entry}
              onViewAction={() => setViewEntryDialogEntry(entry)}
              onEditAction={() => setUpdateEntryDialogEntry(entry)}
              onDeleteAction={() => handleDeleteDonnee(entry)}
            />
          );
        })}
        enableScroll={hasNextPage}
        onMoreRequested={onMoreRequested}
      />

      <DeleteEntryConfirmationDialog
        open={!!deleteDialog}
        entry={deleteDialog}
        onCancelAction={() => setDeleteDialog(null)}
        onConfirmAction={() => triggerDeleteEntry()}
      />

      <EntryDetailsDialogContainer
        entry={viewEntryDialogEntry}
        open={viewEntryDialogEntry != null}
        onClose={() => setViewEntryDialogEntry(undefined)}
      />
      <UpdateEntryDialogContainer
        entry={updateEntryDialogEntry}
        open={updateEntryDialogEntry != null}
        onClose={() => setUpdateEntryDialogEntry(null)}
        onSubmitUpdateEntryForm={handleSubmitUpdateExistingEntryForm}
      />
    </>
  );
};

export default SearchEntriesTable;
