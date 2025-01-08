import TextInput from "@components/base/TextInput";
import Autocomplete from "@components/base/autocomplete/Autocomplete";
import type { Age, NumberEstimate, Sex } from "@ou-ca/api/models";
import { useApiAgesQuery } from "@services/api/age/api-age-queries";
import { useApiNumberEstimatesQuery } from "@services/api/number-estimate/api-number-estimate-queries";
import { useApiSexesQuery } from "@services/api/sex/api-sex-queries";
import { type FunctionComponent, useEffect, useState } from "react";
import { type UseFormReturn, useController, useFormState } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { EntryFormState } from "./EntryFormState";

type EntryFormCharacteristicsProps = Pick<UseFormReturn<EntryFormState>, "control" | "register" | "setValue"> & {
  defaultNumber?: number;
  defaultNumberEstimate?: NumberEstimate;
  defaultSex?: Sex;
  defaultAge?: Age;
};

const renderNumberEstimate = (numberEstimate: NumberEstimate | null): string => {
  return numberEstimate?.libelle ?? "";
};

const renderSex = (sex: Sex | null): string => {
  return sex?.libelle ?? "";
};

const renderAge = (age: Age | null): string => {
  return age?.libelle ?? "";
};

const EntryFormCharacteristics: FunctionComponent<EntryFormCharacteristicsProps> = ({
  register,
  control,
  setValue,
  defaultNumber,
  defaultNumberEstimate,
  defaultSex,
  defaultAge,
}) => {
  const { t } = useTranslation();

  const [numberEstimateInput, setNumberEstimateInput] = useState("");
  const [selectedNumberEstimate, setSelectedNumberEstimate] = useState<NumberEstimate | null>(null);
  useEffect(() => {
    setSelectedNumberEstimate(defaultNumberEstimate ?? null);
  }, [defaultNumberEstimate]);

  const [sexInput, setSexInput] = useState("");
  const [selectedSex, setSelectedSex] = useState<Sex | null>(null);
  useEffect(() => {
    setSelectedSex(defaultSex ?? null);
  }, [defaultSex]);

  const [ageInput, setAgeInput] = useState("");
  const [selectedAge, setSelectedAge] = useState<Age | null>(null);
  useEffect(() => {
    setSelectedAge(defaultAge ?? null);
  }, [defaultAge]);

  const {
    field: { ref: refNumberEstimate, onChange: onChangeNumberEstimateForm, onBlur: onBlurNumberEstimate },
    fieldState: { error: errorNumberEstimate },
  } = useController({
    name: "numberEstimateId",
    control,
  });

  const {
    field: { ref: refSex, onChange: onChangeSexForm, onBlur: onBlurSex },
    fieldState: { error: errorSex },
  } = useController({
    name: "sexId",
    control,
  });

  const {
    field: { ref: refAge, onChange: onChangeAgeForm, onBlur: onBlurAge },
    fieldState: { error: errorAge },
  } = useController({
    name: "ageId",
    control,
  });

  const { errors } = useFormState({ control });

  useEffect(() => {
    // When the selected numberEstimate changes, update both the input and the form value
    setNumberEstimateInput(renderNumberEstimate(selectedNumberEstimate));
    onChangeNumberEstimateForm(selectedNumberEstimate?.id ?? null);
  }, [selectedNumberEstimate, onChangeNumberEstimateForm]);

  useEffect(() => {
    // When the selected sex changes, update both the input and the form value
    setSexInput(renderSex(selectedSex));
    onChangeSexForm(selectedSex?.id ?? null);
  }, [selectedSex, onChangeSexForm]);

  useEffect(() => {
    // When the selected age changes, update both the input and the form value
    setAgeInput(renderAge(selectedAge));
    onChangeAgeForm(selectedAge?.id ?? null);
  }, [selectedAge, onChangeAgeForm]);

  const handleChangeSelectedNumberEstimate = (newSelectedNumberEstimate: NumberEstimate | null) => {
    if (newSelectedNumberEstimate?.nonCompte) {
      setValue("number", null);
    } else if (selectedNumberEstimate?.nonCompte && defaultNumber != null) {
      setValue("number", defaultNumber);
    }
    setSelectedNumberEstimate(newSelectedNumberEstimate);
  };

  const { data: dataNumberEstimates } = useApiNumberEstimatesQuery(
    {
      q: numberEstimateInput,
      pageSize: 5,
    },
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnMount: true,
    },
  );

  const { data: dataSexes } = useApiSexesQuery(
    {
      q: sexInput,
      pageSize: 5,
    },
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnMount: true,
    },
  );

  const { data: dataAges } = useApiAgesQuery(
    {
      q: ageInput,
      pageSize: 5,
    },
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnMount: true,
    },
  );

  return (
    <div className="flex justify-between gap-4">
      <div className="flex gap-4">
        <TextInput
          {...register("number", {
            setValueAs: (v: string) => (v?.length ? Number.parseInt(v) : typeof v === "number" ? v : null),
          })}
          textInputClassName={`w-36 py-1 ${selectedNumberEstimate?.nonCompte ? "invisible" : ""}`}
          label={t("observationsTable.header.number")}
          type="number"
          disabled={selectedNumberEstimate?.nonCompte}
          hasError={!!errors.number}
        />
        <Autocomplete
          ref={refNumberEstimate}
          data={dataNumberEstimates?.data}
          name="numberEstimate"
          required
          label={t("entryForm.numberPrecision")}
          onInputChange={setNumberEstimateInput}
          onChange={handleChangeSelectedNumberEstimate}
          onBlur={onBlurNumberEstimate}
          value={selectedNumberEstimate}
          renderValue={renderNumberEstimate}
          labelTextClassName="first-letter:capitalize"
          hasError={!!errorNumberEstimate}
        />
      </div>
      <Autocomplete
        ref={refSex}
        data={dataSexes?.data}
        name="sex"
        required
        label={t("entryForm.gender")}
        onInputChange={setSexInput}
        onChange={setSelectedSex}
        onBlur={onBlurSex}
        value={selectedSex}
        renderValue={renderSex}
        labelTextClassName="first-letter:capitalize"
        hasError={!!errorSex}
      />
      <Autocomplete
        ref={refAge}
        data={dataAges?.data}
        name="age"
        required
        label={t("entryForm.age")}
        onInputChange={setAgeInput}
        onChange={setSelectedAge}
        onBlur={onBlurAge}
        value={selectedAge}
        renderValue={renderAge}
        labelTextClassName="first-letter:capitalize"
        hasError={!!errorAge}
      />
    </div>
  );
};

export default EntryFormCharacteristics;
