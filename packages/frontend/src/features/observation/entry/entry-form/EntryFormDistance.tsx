import TextInput from "@components/base/TextInput";
import Autocomplete from "@components/base/autocomplete/Autocomplete";
import type { DistanceEstimate } from "@ou-ca/api/models";
import { useApiDistanceEstimatesQuery } from "@services/api/distance-estimate/api-distance-estimate-queries";
import { type FunctionComponent, useEffect, useState } from "react";
import { type UseFormReturn, useController, useFormState } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { EntryFormState } from "./EntryFormState";

type EntryFormDistanceProps = Pick<UseFormReturn<EntryFormState>, "control" | "register" | "setValue"> & {
  defaultDistanceEstimate?: DistanceEstimate;
  isDistanceDisplayed?: boolean;
};

const renderDistanceEstimate = (distanceEstimate: DistanceEstimate | null): string => {
  return distanceEstimate?.libelle ?? "";
};

const EntryFormDistance: FunctionComponent<EntryFormDistanceProps> = ({
  register,
  control,
  defaultDistanceEstimate,
  isDistanceDisplayed,
}) => {
  const { t } = useTranslation();

  const [distanceEstimateInput, setDistanceEstimateInput] = useState("");
  const [selectedDistanceEstimate, setSelectedDistanceEstimate] = useState<DistanceEstimate | null>(null);
  useEffect(() => {
    setSelectedDistanceEstimate(defaultDistanceEstimate ?? null);
  }, [defaultDistanceEstimate]);

  const {
    field: { ref: refDistanceEstimate, onChange: onChangeDistanceEstimateForm, onBlur: onBlurDistanceEstimate },
    fieldState: { error: errorDistanceEstimate },
  } = useController({
    name: "distanceEstimateId",
    control,
  });

  const { errors } = useFormState({ control });

  useEffect(() => {
    // When the selected distanceEstimate changes, update both the input and the form value
    setDistanceEstimateInput(renderDistanceEstimate(selectedDistanceEstimate));
    onChangeDistanceEstimateForm(selectedDistanceEstimate?.id ?? null);
  }, [selectedDistanceEstimate, onChangeDistanceEstimateForm]);

  const { data: dataDistanceEstimates } = useApiDistanceEstimatesQuery(
    {
      q: distanceEstimateInput,
      pageSize: 5,
    },
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnMount: true,
    },
    { paused: !isDistanceDisplayed },
  );

  return (
    <div className="flex gap-16 justify-between">
      {isDistanceDisplayed && (
        <div className="flex gap-4 items-center">
          <Autocomplete
            ref={refDistanceEstimate}
            data={dataDistanceEstimates?.data}
            name="distanceEstimate"
            label={t("entryForm.distancePrecision")}
            onInputChange={setDistanceEstimateInput}
            onChange={setSelectedDistanceEstimate}
            onBlur={onBlurDistanceEstimate}
            value={selectedDistanceEstimate}
            renderValue={renderDistanceEstimate}
            labelTextClassName="first-letter:capitalize"
            hasError={!!errorDistanceEstimate}
          />
          <TextInput
            {...register("distance", {
              setValueAs: (v: string) => (v?.length ? Number.parseInt(v) : typeof v === "number" ? v : null),
            })}
            className="w-32"
            suffix={t("entryForm.distanceUnit")}
            textInputClassName="py-1"
            label={t("entryForm.distance")}
            type="number"
            hasError={!!errors.distance}
          />
        </div>
      )}
    </div>
  );
};

export default EntryFormDistance;
