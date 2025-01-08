import type { UpsertInventoryInput } from "@ou-ca/api/models";
import type { Inventory } from "@ou-ca/common/api/entities/inventory";
import { useSetAtom } from "jotai";
import { RESET } from "jotai/utils";
import { type FunctionComponent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import EntryMap from "../../entry/entry-map/EntryMap";
import { inventorySetAtom } from "../../inventoryFormAtoms";
import InventoryForm from "../inventory-form/InventoryForm";

type InventoryFormWithMapProps =
  | {
      mode: "update";
      inventory: Inventory;
      onSubmitInventoryForm?: (inventoryFormData: UpsertInventoryInput, inventoryId: string) => void;
    }
  | {
      mode: "create";
      initialData?: Omit<Inventory, "id">;
      onSubmitInventoryForm?: (inventoryFormData: UpsertInventoryInput) => void;
    };

const InventoryFormWithMap: FunctionComponent<InventoryFormWithMapProps> = (props) => {
  const { t } = useTranslation();

  const setInventory = useSetAtom(inventorySetAtom);

  const [isInventoryReady, setIsInventoryReady] = useState(false);

  useEffect(() => {
    setIsInventoryReady(false);
    const inventoryDataToSet = props.mode === "update" ? props.inventory : (props.initialData ?? RESET);
    void setInventory(inventoryDataToSet).then(() => {
      setIsInventoryReady(true);
    });
  }, [setInventory, props]);

  return (
    <div className="container mx-auto flex gap-10">
      <div className="basis-1/3 mt-4">
        {isInventoryReady && (
          <>
            {props.mode === "update" && (
              <InventoryForm
                key={`update-inventory-${props.inventory.id}`}
                initialData={props.inventory}
                onSubmitForm={(inventoryFormData) =>
                  props.onSubmitInventoryForm?.(inventoryFormData, props.inventory.id)
                }
                submitFormText={t("inventoryForm.formUpdate")}
                disableIfNoChanges
              />
            )}
            {props.mode === "create" && (
              <InventoryForm
                key="create-inventory"
                initialData={props.initialData}
                onSubmitForm={props.onSubmitInventoryForm}
                submitFormText={t("inventoryForm.formCreate")}
              />
            )}
          </>
        )}
      </div>
      <div className="basis-2/3">
        {isInventoryReady && (
          <>
            {props.mode === "update" && (
              <EntryMap
                initialMapState={{
                  longitude:
                    props.inventory.customizedCoordinates?.longitude ?? props.inventory.locality.coordinates.longitude,
                  latitude:
                    props.inventory.customizedCoordinates?.latitude ?? props.inventory.locality.coordinates.latitude,
                  zoom: 15,
                }}
              />
            )}
            {props.mode === "create" && (
              <EntryMap
                initialMapState={
                  props.initialData
                    ? {
                        longitude:
                          props.initialData.customizedCoordinates?.longitude ??
                          props.initialData.locality.coordinates.longitude,
                        latitude:
                          props.initialData.customizedCoordinates?.latitude ??
                          props.initialData.locality.coordinates.latitude,
                        zoom: 15,
                      }
                    : undefined
                }
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default InventoryFormWithMap;
