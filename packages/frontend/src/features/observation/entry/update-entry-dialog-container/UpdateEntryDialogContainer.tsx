import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import type { UpsertEntryInput } from "@ou-ca/api/models";
import type { Entry } from "@ou-ca/common/api/entities/entry";
import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import EntryForm from "../entry-form/EntryForm";

type UpdateEntryDialogContainerProps = {
  entry: Entry | null;
  open: boolean;
  onClose: (value: boolean) => void;
  onSubmitUpdateEntryForm?: (entryFormData: UpsertEntryInput, entryId: string) => void;
};

const UpdateEntryDialogContainer: FunctionComponent<UpdateEntryDialogContainerProps> = ({
  entry,
  open,
  onClose,
  onSubmitUpdateEntryForm,
}) => {
  const { t } = useTranslation();

  return (
    <Dialog className={`modal ${open ? "modal-open" : ""}`} open={open} onClose={onClose}>
      <DialogPanel className="modal-box max-w-7xl">
        <DialogTitle className="text-2xl font-semibold py-4">{t("inventoryPage.entriesPanel.updateEntry")}</DialogTitle>
        {entry != null && (
          <EntryForm
            mode="update"
            initialData={entry}
            submitFormText={t("entryForm.formUpdate")}
            onSubmitForm={onSubmitUpdateEntryForm}
            disableIfNoChanges
          />
        )}
      </DialogPanel>
    </Dialog>
  );
};

export default UpdateEntryDialogContainer;
