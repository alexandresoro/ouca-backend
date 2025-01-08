import TextInput from "@components/base/TextInput";
import Autocomplete from "@components/base/autocomplete/Autocomplete";
import type { Department, Locality, Town } from "@ou-ca/api/models";
import { altitudeServiceStatusAtom } from "@services/altitude/altitude-service";
import { useApiDepartmentQuery, useApiDepartmentsQuery } from "@services/api/department/api-department-queries";
import { useApiLocalitiesQuery } from "@services/api/locality/api-locality-queries";
import { useApiTownQuery, useApiTownsQuery } from "@services/api/town/api-town-queries";
import { InfoCircle } from "@styled-icons/boxicons-regular";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { RESET } from "jotai/utils";
import { type ChangeEventHandler, type FunctionComponent, useEffect, useState } from "react";
import { type UseFormReturn, useController, useFormState } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  areCoordinatesCustomizedFromLocalityAtom,
  inventoryAltitudeAtom,
  inventoryLatitudeAtom,
  inventoryLocalityAtom,
  inventoryLongitudeAtom,
} from "../../inventoryFormAtoms";
import { departmentIdAtom, townIdAtom } from "../../inventoryMapAtom";
import type { InventoryFormState } from "./InventoryFormState";

type InventoryFormLocationProps = Pick<UseFormReturn<InventoryFormState>, "register" | "control"> & {
  defaultDepartment?: Department;
};

const renderDepartment = (department: Department | null): string => {
  return department?.code ?? "";
};

const renderTown = (town: Town | null): string => {
  return town?.nom ?? "";
};

const renderLocality = (locality: Locality | null): string => {
  return locality?.nom ?? "";
};

const InventoryFormLocation: FunctionComponent<InventoryFormLocationProps> = ({
  register,
  control,
  defaultDepartment,
}) => {
  const { t } = useTranslation();

  const [departmentId, setDepartmentId] = useAtom(departmentIdAtom);

  const [departmentsInput, setDepartmentsInput] = useState("");
  const { data: department } = useApiDepartmentQuery(departmentId, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnMount: true,
  });
  useEffect(() => {
    setDepartmentsInput(renderDepartment(department ?? null));
  }, [department]);

  const [townId, setTownId] = useAtom(townIdAtom);
  const [townsInput, setTownsInput] = useState("");
  const { data: town } = useApiTownQuery(townId, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnMount: true,
  });
  useEffect(() => {
    setTownsInput(renderTown(town ?? null));
  }, [town]);

  const [localityInput, setLocalityInput] = useState("");
  const [locality, setLocality] = useAtom(inventoryLocalityAtom);
  useEffect(() => {
    setLocalityInput(renderLocality(locality ?? null));
  }, [locality]);

  // On init, reset the fields
  useEffect(() => {
    setDepartmentId(defaultDepartment?.id ?? RESET);
    setTownId(RESET);
  }, [defaultDepartment, setDepartmentId, setTownId]);

  const setLatitude = useSetAtom(inventoryLatitudeAtom);
  const setLongitude = useSetAtom(inventoryLongitudeAtom);
  const setAltitude = useSetAtom(inventoryAltitudeAtom);

  const areCoordinatesCustomized = useAtomValue(areCoordinatesCustomizedFromLocalityAtom);

  const altitudeServiceStatus = useAtomValue(altitudeServiceStatusAtom);

  // Only display altitude loading service if it takes too long
  const [altitudeCallOngoing, setAltitudeCallOngoing] = useState(false);
  useEffect(() => {
    let altitudeCallOngoingTimeout: NodeJS.Timeout;
    if (altitudeServiceStatus === "ongoing") {
      altitudeCallOngoingTimeout = setTimeout(() => {
        setAltitudeCallOngoing(true);
      }, 500);
    } else {
      setAltitudeCallOngoing(false);
    }
    return () => {
      clearTimeout(altitudeCallOngoingTimeout);
    };
  }, [altitudeServiceStatus]);

  // When the locality changes, make sure that the appropriate town is displayed
  // This can happen when locality is updated from outside the component
  useEffect(() => {
    if (locality != null && locality.townId !== town?.id) {
      setTownId(locality.townId);
    }
  }, [locality, town, setTownId]);

  // When the town changes, make sure that the appropriate department is displayed
  // This can happen when town is updated from an update of locality outside the component
  useEffect(() => {
    if (town != null && town.departmentId !== department?.id) {
      setDepartmentId(town.departmentId);
    }
  }, [town, department, setDepartmentId]);

  const {
    field: { ref: refLocality, onBlur: onBlurLocality },
    fieldState: { error: errorLocality },
  } = useController({
    name: "localityId",
    control,
  });

  const { errors } = useFormState({ control });

  const { data: dataDepartments } = useApiDepartmentsQuery(
    {
      q: departmentsInput,
      pageSize: 5,
    },
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnMount: true,
    },
  );

  const { data: dataTowns } = useApiTownsQuery(
    {
      q: townsInput,
      pageSize: 5,
      departmentId: department?.id,
    },
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnMount: true,
    },
    {
      paused: !department?.id,
    },
  );

  const { data: dataLocalities } = useApiLocalitiesQuery(
    {
      q: localityInput,
      pageSize: 5,
      townId: town?.id,
    },
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnMount: true,
    },
    {
      paused: !town?.id,
    },
  );

  // Handle when department is changed by the user
  const handleDepartmentChange = (newDepartment: Department | null) => {
    setDepartmentId(newDepartment?.id ?? null);

    // On department change, reset town if it does not belong to department anymore
    if (town != null && town.departmentId !== newDepartment?.id) {
      handleTownChange(null);
    }
  };

  // Handle when town is changed by the user
  const handleTownChange = (newTown: Town | null) => {
    setTownId(newTown?.id ?? null);

    if (locality != null && locality.townId !== newTown?.id) {
      handleLocalityChange(null);
    }
  };

  // Handle when locality is changed by the user
  const handleLocalityChange = (newLocality: Locality | null) => {
    void setLocality(newLocality);
  };

  // Handlers when fields are changed manually by the user
  const handleLatitudeChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    void setLatitude(event.target.value ? Number.parseFloat(event.target.value) : null);
  };

  const handleLongitudeChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    void setLongitude(event.target.value ? Number.parseFloat(event.target.value) : null);
  };

  const handleAltitudeChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setAltitude(event.target.value ? Number.parseFloat(event.target.value) : null);
  };

  return (
    <>
      <div className="flex gap-2">
        <Autocomplete
          data={dataDepartments?.data}
          name="department"
          label={t("department")}
          onInputChange={setDepartmentsInput}
          onChange={handleDepartmentChange}
          renderValue={renderDepartment}
          value={department ?? null}
          autocompleteClassName="w-28"
          labelTextClassName="first-letter:capitalize"
        />
        <Autocomplete
          data={dataTowns?.data}
          name="town"
          label={t("town")}
          decorationKey="code"
          onInputChange={setTownsInput}
          onChange={handleTownChange}
          renderValue={renderTown}
          value={town ?? null}
          autocompleteClassName="flex-grow"
          labelTextClassName="first-letter:capitalize"
        />
      </div>
      <Autocomplete
        ref={refLocality}
        data={dataLocalities?.data}
        label={t("inventoryForm.locality")}
        required
        onInputChange={setLocalityInput}
        onChange={handleLocalityChange}
        onBlur={onBlurLocality}
        value={locality}
        renderValue={renderLocality}
        labelTextClassName="first-letter:capitalize"
        hasError={!!errorLocality}
      />
      <div className="flex gap-2">
        <TextInput
          {...register("coordinates.latitude", {
            valueAsNumber: true,
          })}
          required
          onChange={handleLatitudeChange}
          textInputClassName="flex-grow w-24 py-1"
          label={t("latitude")}
          type="number"
          step="any"
          hasError={!!errors.coordinates?.latitude}
        />
        <TextInput
          {...register("coordinates.longitude", {
            valueAsNumber: true,
          })}
          required
          onChange={handleLongitudeChange}
          textInputClassName="flex-grow w-24 py-1"
          label={t("longitude")}
          type="number"
          step="any"
          hasError={!!errors.coordinates?.longitude}
        />
        <TextInput
          {...register("coordinates.altitude", {
            valueAsNumber: true,
          })}
          required
          onChange={handleAltitudeChange}
          textInputClassName="flex-grow w-24 py-1"
          label={t("altitude")}
          type="number"
          hasError={!!errors.coordinates?.altitude}
        />
      </div>
      {areCoordinatesCustomized && (
        <div className="alert alert-info py-1 text-sm">
          <InfoCircle className="h-4 flex-shrink-0" />
          {t("inventoryForm.customCoordinatesInformation")}
        </div>
      )}
      {altitudeCallOngoing && (
        <div className="alert alert-info py-1 text-sm">
          <InfoCircle className="h-4 flex-shrink-0" />
          {t("inventoryForm.altitudeCallOngoing")}
        </div>
      )}
      {altitudeServiceStatus === "unsupportedArea" && (
        <div className="alert alert-warning py-1 text-sm">
          <InfoCircle className="h-4 flex-shrink-0" />
          {t("inventoryForm.altitudeCallUnsupportedArea")}
        </div>
      )}
      {altitudeServiceStatus === "error" && (
        <div className="alert alert-warning py-1 text-sm">
          <InfoCircle className="h-4 flex-shrink-0" />
          {t("inventoryForm.altitudeCallError")}
        </div>
      )}
    </>
  );
};

export default InventoryFormLocation;
