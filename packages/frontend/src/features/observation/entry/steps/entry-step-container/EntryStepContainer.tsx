import { useNotifications } from "@hooks/useNotifications";
import type { UpsertEntryInput } from "@ou-ca/api/models";
import { useApiEntriesInfiniteQuery, useApiEntryCreate } from "@services/api/entry/api-entry-queries";
import { type FunctionComponent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import InventoryDetails from "../../../inventory/inventory-details/InventoryDetails";
import EntryForm from "../../entry-form/EntryForm";

type EntryStepContainerProps = {
  inventoryId: string;
};

const EntryStepContainer: FunctionComponent<EntryStepContainerProps> = ({ inventoryId }) => {
  const { t } = useTranslation();

  const { displayNotification } = useNotifications();

  const [entryFormKey, setEntryFormKey] = useState(0);

  const createEntry = useApiEntryCreate();

  const {
    data: entriesPages,
    hasNextPage,
    fetchNextPage,
    mutate,
  } = useApiEntriesInfiniteQuery(
    {
      pageSize: 10,
      inventoryId,
    },
    {
      revalidateOnMount: true,
    },
  );
  // When inventory id change, we need to refetch the data
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    void mutate();
  }, [inventoryId]);

  const handleSubmitEntryForm = (entryFormData: UpsertEntryInput) => {
    createEntry({ body: entryFormData })
      .then(() => {
        displayNotification({
          type: "success",
          message: t("inventoryForm.entries.createSuccess"),
        });
        setEntryFormKey(new Date().getTime());
      })
      .catch(() => {
        displayNotification({
          type: "error",
          message: t("inventoryForm.entries.createError"),
        });
      })
      .finally(() => {
        void mutate();
      });
  };

  const newEntryKey = `new-entry-inventory-${inventoryId}-${entryFormKey}`;

  return (
    <div className="container mx-auto flex gap-10 pt-4">
      <div className="basis-1/3">
        <InventoryDetails
          inventoryId={inventoryId}
          entriesPages={entriesPages ?? []}
          hasMoreEntries={hasNextPage}
          onMoreEntriesRequested={fetchNextPage}
        />
      </div>
      <div className="basis-2/3">
        <h2 className="text-xl font-semibold mb-3">{t("entryDetailsForm.title")}</h2>
        <EntryForm
          key={newEntryKey}
          mode="create"
          initialData={{ inventoryId }}
          onSubmitForm={handleSubmitEntryForm}
          submitFormText={t("entryForm.formCreate")}
        />
      </div>
    </div>
  );
};

export default EntryStepContainer;
