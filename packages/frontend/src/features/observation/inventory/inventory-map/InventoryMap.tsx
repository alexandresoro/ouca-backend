import type { Inventory } from "@ou-ca/api/models";
import { type FunctionComponent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Marker, Popup, type ViewState } from "react-map-gl/maplibre";
import MapInstance from "../../../maps/MapInstance";

type InventoryMapProps = {
  inventory: Inventory;
};

const InventoryMap: FunctionComponent<InventoryMapProps> = ({ inventory }) => {
  const { t } = useTranslation();

  const inventoryCoordinates = inventory.customizedCoordinates ?? inventory.locality.coordinates;

  const [viewState, setViewState] = useState<Partial<ViewState>>({
    zoom: 15,
  });
  useEffect(() => {
    const inventoryCoordinates = inventory.customizedCoordinates ?? inventory.locality.coordinates;
    setViewState((viewState) => {
      return {
        ...viewState,
        longitude: inventoryCoordinates.longitude,
        latitude: inventoryCoordinates.latitude,
      };
    });
  }, [inventory]);

  const [displayCoordinatesInfoPopup, setDisplayCoordinatesInfoPopup] = useState(false);

  return (
    <MapInstance
      mapClassName="h-80"
      controlsPosition="top"
      {...viewState}
      onMove={(evt) => setViewState(evt.viewState)}
    >
      <Marker
        longitude={inventoryCoordinates.longitude}
        latitude={inventoryCoordinates.latitude}
        color="#b9383c"
        onClick={(e) => {
          // Prevent the event from bubbling to avoid closing directly the popup after open
          e.originalEvent.stopPropagation();
          // TODO add the delete custom point
          setDisplayCoordinatesInfoPopup(true);
        }}
      />
      {displayCoordinatesInfoPopup && (
        <Popup
          longitude={inventoryCoordinates.longitude}
          latitude={inventoryCoordinates.latitude}
          offset={[-15, -5] as [number, number]}
          focusAfterOpen={false}
          onClose={() => setDisplayCoordinatesInfoPopup(false)}
          anchor="right"
          closeOnClick
        >
          <div className="flex flex-col items-center text-gray-700">
            <div>{t("inventoryMap.inventoryPosition")}</div>
          </div>
        </Popup>
      )}
    </MapInstance>
  );
};

export default InventoryMap;
