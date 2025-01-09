import { zodResolver } from "@hookform/resolvers/zod";
import { useUserSettings } from "@hooks/useUser";
import type { Inventory, UpsertInventoryInput } from "@ou-ca/api/models";
import { putV1InventoriesIdBody } from "@ou-ca/api/zod/inventory.zod";
import { getMinutesFromTime } from "@ou-ca/common/utils/time-format-convert";
import { useApiDepartmentQuery } from "@services/api/department/api-department-queries";
import { useApiObserverQuery } from "@services/api/observer/api-observer-queries";
import { useAtomValue } from "jotai";
import { type FunctionComponent, useEffect, useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import {
  inventoryAltitudeAtom,
  inventoryLatitudeAtom,
  inventoryLocalityAtom,
  inventoryLongitudeAtom,
} from "../../inventoryFormAtoms";
import InventoryFormDate from "./InventoryFormDate";
import InventoryFormLocation from "./InventoryFormLocation";
import InventoryFormObserver from "./InventoryFormObserver";
import type { InventoryFormState } from "./InventoryFormState";
import InventoryFormWeather from "./InventoryFormWeather";

type InventoryFormProps = {
  initialData?: Inventory | Omit<Inventory, "id">;
  onSubmitForm?: (inventoryFormData: UpsertInventoryInput) => void;
  submitFormText?: string;
  disableIfNoChanges?: boolean;
};

const upsertInventoryFormInput = putV1InventoriesIdBody.omit({ duration: true }).extend({
  duration: z
    .union([z.string(), z.number()])
    .nullable()
    .transform((value) => {
      // biome-ignore lint/style/useBlockStatements: <explanation>
      if (typeof value === "string" && !value.length) return null;
      // biome-ignore lint/style/useBlockStatements: <explanation>
      if (typeof value === "string") return getMinutesFromTime(value);
      return value;
    })
    .refine((value) => {
      // biome-ignore lint/style/useBlockStatements: <explanation>
      if (value === null) return true;
      // biome-ignore lint/style/useBlockStatements: <explanation>
      if (typeof value === "number") return Number.isFinite(value);
    }),
});

const InventoryForm: FunctionComponent<InventoryFormProps> = ({
  initialData,
  onSubmitForm,
  submitFormText,
  disableIfNoChanges,
}) => {
  const { t } = useTranslation();

  const settings = useUserSettings();

  const { data: defaultObserver, isValidating: isValidatingObserver } = useApiObserverQuery(
    settings?.defaultObserverId ?? null,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
    },
  );
  const { data: defaultDepartment, isValidating: isValidatingDepartment } = useApiDepartmentQuery(
    settings?.defaultDepartmentId ?? null,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
    },
  );

  const isDefaultObserverReady =
    !isValidatingObserver || settings === null || (settings !== undefined && settings.defaultObserverId == null);

  const isDefaultDepartmentReady =
    !isValidatingDepartment || settings === null || (settings !== undefined && settings.defaultDepartmentId == null);

  const areSettingsLoaded = settings !== undefined && isDefaultObserverReady && isDefaultDepartmentReady;

  const defaultFormValues = (
    initialData === undefined
      ? {
          // Brand new inventory
          observerId: settings?.defaultObserverId ?? null,
          associateIds: [],
          // https://stackoverflow.com/a/37649046
          date: new Date()
            .toLocaleString("en-us", { year: "numeric", month: "2-digit", day: "2-digit" })
            .replace(/(\d+)\/(\d+)\/(\d+)/, "$3-$1-$2"),
          time: null,
          duration: null,
          localityId: null,
          coordinates: {
            latitude: null,
            longitude: null,
            altitude: null,
          },
          temperature: null,
          weatherIds: [],
        }
      : {
          // Existing inventory
          observerId: initialData.observer.id,
          associateIds: initialData.associates.map((associate) => associate.id),
          date: initialData.date,
          time: initialData.heure,
          duration: initialData.duree,
          localityId: initialData.locality.id,
          coordinates: initialData.customizedCoordinates ?? initialData.locality.coordinates,
          temperature: initialData.temperature,
          weatherIds: initialData.weathers.map((weather) => weather.id),
        }
  ) satisfies InventoryFormState;

  const locality = useAtomValue(inventoryLocalityAtom);
  const latitude = useAtomValue(inventoryLatitudeAtom);
  const altitude = useAtomValue(inventoryAltitudeAtom);
  const longitude = useAtomValue(inventoryLongitudeAtom);

  const [formValues, setFormValues] = useState<InventoryFormState>(defaultFormValues);
  useEffect(() => {
    setFormValues({
      ...getValues(),
      localityId: locality?.id ?? null,
      coordinates: {
        ...getValues().coordinates,
        latitude,
        longitude,
        altitude,
      },
    });
  }, [locality, latitude, longitude, altitude]);

  const {
    register,
    control,
    getValues,
    formState: { isValid, isDirty },
    handleSubmit,
  } = useForm<InventoryFormState>({
    // FIXME: We have a limitation in error feedback
    // Basically whenever one of [locality, latitude, longitude, altitude] changes
    // it internally triggers a reset on the form that loses all errors
    // Option keepErrors fixes that, but on the other hand will not set back as valid
    // so the opposite...
    // trigger may help but it also break other cases
    resetOptions: { keepDefaultValues: true },
    defaultValues: defaultFormValues,
    values: formValues,
    resolver: zodResolver(upsertInventoryFormInput),
    mode: "onTouched",
  });

  const onSubmit: SubmitHandler<InventoryFormState> = (inventoryFormData) => {
    // FIXME assertion is done thanks to zod resolver, however types are not inferred
    onSubmitForm?.(inventoryFormData as z.infer<typeof upsertInventoryFormInput>);
  };

  if (!areSettingsLoaded) {
    return null;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">{t("inventoryForm.title")}</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-4">
          <fieldset className="flex flex-col gap-4">
            <div className="card border-2 border-primary rounded-lg px-3 pb-3 shadow-lg">
              <InventoryFormObserver
                control={control}
                defaultObserver={
                  initialData?.observer ??
                  (defaultObserver != null
                    ? {
                        id: defaultObserver.id,
                        libelle: defaultObserver.libelle,
                        ownerId: defaultObserver.ownerId,
                      }
                    : undefined)
                }
                defaultAssociates={initialData?.associates ?? []}
                areAssociesDisplayed={settings?.displayAssociates}
                autofocusOnObserver={true}
              />
            </div>
            <div className="card border-2 border-primary rounded-lg px-3 pb-2 shadow-lg">
              <InventoryFormDate register={register} control={control} />
            </div>
            <div className="card border-2 border-primary rounded-lg px-3 pb-2 shadow-lg">
              <InventoryFormLocation
                register={register}
                control={control}
                defaultDepartment={initialData != null ? undefined : (defaultDepartment ?? undefined)}
              />
            </div>
            {settings?.displayWeather && (
              <div className="card border-2 border-primary rounded-lg px-3 pb-2 shadow-lg">
                <InventoryFormWeather
                  control={control}
                  register={register}
                  defaultWeathers={initialData?.weathers ?? []}
                />
              </div>
            )}
          </fieldset>
          <button
            type="submit"
            className="btn btn-primary btn-block uppercase mb-8"
            disabled={(disableIfNoChanges && !isDirty) || !isValid}
          >
            {submitFormText ?? t("save")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InventoryForm;
