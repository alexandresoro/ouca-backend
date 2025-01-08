import type { GetV1Entries200 } from "@ou-ca/api/models";
import { useApiInventoryQuery } from "@services/api/inventory/api-inventory-queries";
import { CopyAlt } from "@styled-icons/boxicons-regular";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";
import { Link } from "react-router";
import InventorySummaryPanel from "../inventory-summary-panel/InventorySummaryPanel";

type InventoryDetailsProps = {
  inventoryId: string;
  entriesPages: GetV1Entries200[];
  hasMoreEntries?: boolean;
  onMoreEntriesRequested?: () => void;
};

const InventoryDetails = ({
  inventoryId,
  entriesPages,
  hasMoreEntries,
  onMoreEntriesRequested,
}: InventoryDetailsProps) => {
  const { t } = useTranslation();

  const { ref } = useInView({
    root: document.getElementById("scrollRoot"),
    rootMargin: "0px 0px 250px 0px",
    onChange: (inView) => {
      if (inView) {
        void onMoreEntriesRequested?.();
      }
    },
  });

  const { data: inventory } = useApiInventoryQuery(inventoryId);

  return (
    <div className="flex flex-col gap-4 pb-2">
      {inventory && (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-normal">{t("observationDetails.inventoryTitle")}</h3>
            <div
              className="tooltip tooltip-bottom"
              data-tip={t("inventoryCreateNewFromExisting.createNewButtonTooltip")}
            >
              <Link
                className="btn btn-xs btn-secondary uppercase"
                to={`/create-new?${new URLSearchParams({ createFromInventory: `${inventory.id}` }).toString()}`}
              >
                <CopyAlt className="h-4" />
                {t("inventoryCreateNewFromExisting.createNewButton")}
              </Link>
            </div>
          </div>
          <InventorySummaryPanel inventory={inventory} />
        </>
      )}
      <div className="card border-2 border-primary p-3 shadow-md">
        <div className="flex items-center gap-3 py-2">
          <h3 className="text-lg font-semibold">
            {t("inventoryPage.entriesPanel.title", { count: entriesPages?.[0]?.meta.count })}
          </h3>
          <span className="badge badge-primary badge-outline font-semibold">{entriesPages?.[0]?.meta.count}</span>
        </div>
        <ul className="flex flex-col gap-1">
          {entriesPages?.map((page) => {
            return (
              <Fragment key={page.meta.pageNumber}>
                {page.data.map((entry) => {
                  return (
                    <li key={entry.id}>
                      <div className="py-1.5">
                        <div className="flex">
                          <div className="flex items-center gap-2.5">
                            <div className="flex flex-grow flex-shrink-0 h-7 w-7 -my-2 px-1 items-center justify-center border border-primary rounded-full">
                              <div
                                className={`flex flex-grow justify-center text-primary ${
                                  entry.number != null && entry.number >= 100 ? "text-xs" : "text-sm"
                                }`}
                              >
                                {entry.numberEstimate.nonCompte ? "?" : entry.number}
                              </div>
                            </div>
                            <span>{entry.species.nomFrancais}</span>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </Fragment>
            );
          })}
        </ul>
        {hasMoreEntries && (
          <button
            ref={ref}
            type="button"
            className="btn btn-xs btn-link no-underline"
            onClick={() => onMoreEntriesRequested?.()}
          >
            {t("infiniteScroll.more")}
          </button>
        )}
      </div>
    </div>
  );
};

export default InventoryDetails;
