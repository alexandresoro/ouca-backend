import type { Inventory } from "@ou-ca/api/models";
import { useApiLocalityInfoQuery } from "@services/api/locality/api-locality-queries";
import { getInventaireCoordinates } from "@utils/coordinates-helper";
import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";

type InventorySummaryPanelProps = {
  inventory: Inventory;
};

const InventorySummaryPanel: FunctionComponent<InventorySummaryPanelProps> = ({ inventory }) => {
  const { t } = useTranslation();

  const { data: localityInfo } = useApiLocalityInfoQuery(inventory.locality.id);

  return (
    <div className="card gap-5 border-2 border-primary shadow-xl py-6">
      <div className="px-4">
        <div className="title-with-divider">{t("observationDetails.observers")}</div>
        <div>{inventory.observer.libelle}</div>
        <div className="opacity-70">{`${inventory.associates.map(({ libelle }) => libelle).join(", ")}`}</div>
      </div>

      <div className="px-4">
        <div className="title-with-divider">{t("observationDetails.date")}</div>
        <div>{`${new Intl.DateTimeFormat().format(new Date(inventory.date))} ${inventory.heure ?? ""}`} </div>
        {inventory.duree && (
          <div className="opacity-70 first-letter:capitalize">
            {t("observationDetails.duration")} : {inventory.duree}
          </div>
        )}
      </div>

      {(inventory.weathers.length > 0 || inventory.temperature !== null) && (
        <div className="px-4">
          <div className="title-with-divider">{t("observationDetails.weather")}</div>
          {inventory.weathers.length > 0 && (
            <div className="first-letter:capitalize">{inventory.weathers.map(({ libelle }) => libelle).join(", ")}</div>
          )}
          {inventory.temperature !== null && (
            <div className="first-letter:capitalize">
              {t("observationDetails.temperature", {
                temperature: inventory.temperature,
              })}
            </div>
          )}
        </div>
      )}

      <div className="px-4">
        <div className="title-with-divider">{t("observationDetails.locality")}</div>
        {localityInfo && (
          <div>
            {inventory.locality.nom} – {`${localityInfo?.townName} (${localityInfo?.departmentCode})`}
          </div>
        )}
        <div className="opacity-70">
          <div className="first-letter:capitalize">
            {t("observationDetails.coordinates", {
              coordinates: {
                latitude: getInventaireCoordinates(inventory).latitude,
                longitude: getInventaireCoordinates(inventory).longitude,
              },
            })}
          </div>
          <div className="first-letter:capitalize">
            {t("observationDetails.altitude", {
              altitude: getInventaireCoordinates(inventory).altitude,
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventorySummaryPanel;
