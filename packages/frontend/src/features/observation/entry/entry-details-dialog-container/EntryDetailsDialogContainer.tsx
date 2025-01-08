import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import type { Entry } from "@ou-ca/api/models";
import { useApiInventoryQuery } from "@services/api/inventory/api-inventory-queries";
import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import InventorySummaryPanel from "../../inventory/inventory-summary-panel/InventorySummaryPanel";
import EntrySummaryPanel from "../entry-summary-panel/EntrySummaryPanel";

type EntryDetailsDialogContainerProps = {
  entry?: Entry;
  open: boolean;
  onClose: (value: boolean) => void;
};

const EntryDetailsDialogContainer: FunctionComponent<EntryDetailsDialogContainerProps> = ({ entry, open, onClose }) => {
  const { t } = useTranslation();

  const { data: inventory } = useApiInventoryQuery(entry?.inventoryId ?? null);

  if (!entry) {
    return null;
  }

  return (
    <Dialog className={`modal ${open ? "modal-open" : ""}`} open={open} onClose={onClose}>
      <DialogPanel className="modal-box max-w-7xl">
        <DialogTitle className="text-2xl font-semibold py-4 first-letter:uppercase flex justify-between">
          <span>
            {entry.species.nomFrancais} – <span className="font-style: italic">{entry.species.nomLatin}</span>
          </span>
          <span className="badge badge-outline text-secondary font-normal">ID {entry.id}</span>
        </DialogTitle>
        <div className="flex gap-8">
          <div className="basis-2/5">
            <h3 className="text-xl font-normal py-4 first-letter:uppercase">
              {t("observationDetails.inventoryTitle")}
            </h3>
            {inventory && <InventorySummaryPanel inventory={inventory} />}
          </div>
          <div className="basis-3/5">
            <h3 className="py-4 text-xl font-normal first-letter:uppercase">{t("observation")}</h3>
            <EntrySummaryPanel entry={entry} />
          </div>
        </div>
      </DialogPanel>
    </Dialog>
  );
};

export default EntryDetailsDialogContainer;
