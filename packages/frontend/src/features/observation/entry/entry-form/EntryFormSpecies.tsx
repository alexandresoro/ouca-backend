import Autocomplete from "@components/base/autocomplete/Autocomplete";
import type { Species, SpeciesClass } from "@ou-ca/api/models";
import { useApiSpeciesClassesQuery } from "@services/api/species-class/api-species-class-queries";
import { useApiSpeciesQueryAll } from "@services/api/species/api-species-queries";
import { type FunctionComponent, useEffect, useState } from "react";
import { type UseFormReturn, useController } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { EntryFormState } from "./EntryFormState";

type EntryFormSpeciesProps = Pick<UseFormReturn<EntryFormState>, "control"> & {
  initialSpecies?: Species;
  autofocusOnSpecies?: boolean;
};

const renderSpeciesClass = (speciesClass: SpeciesClass | null): string => {
  return speciesClass?.libelle ?? "";
};

const renderSpecies = (species: Species | null): string => {
  return species?.nomFrancais ?? "";
};

const renderSpeciesComplete = (species: Species | null): string => {
  return species ? `${species.code} - ${species.nomFrancais} - ${species.nomLatin}` : "";
};

const EntryFormSpecies: FunctionComponent<EntryFormSpeciesProps> = ({
  control,
  initialSpecies,
  autofocusOnSpecies,
}) => {
  const { t } = useTranslation();

  const [classInput, setClassInput] = useState("");
  const [selectedClass, setSelectedClass] = useState<SpeciesClass | null>(initialSpecies?.speciesClass ?? null);

  const [speciesInput, setSpeciesInput] = useState("");
  const [selectedSpecies, setSelectedSpecies] = useState<Species | null>(initialSpecies ?? null);

  const {
    field: { ref: refSpecies, onChange: onChangeSpeciesForm, onBlur: onBlurSpecies },
    fieldState: { error: errorSpecies },
  } = useController({
    name: "speciesId",
    control,
  });

  useEffect(() => {
    // When the selected species changes, update both the input and the form value
    setSpeciesInput(renderSpecies(selectedSpecies));
    onChangeSpeciesForm(selectedSpecies?.id ?? null);
  }, [selectedSpecies, onChangeSpeciesForm]);

  const { data: dataClasses } = useApiSpeciesClassesQuery(
    {
      q: classInput,
      pageSize: 5,
    },
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnMount: true,
    },
  );

  const { data: dataSpecies } = useApiSpeciesQueryAll(
    {
      q: speciesInput,
      pageSize: 5,
      classIds: selectedClass?.id,
    },
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnMount: true,
    },
  );

  // Handle when class is changed by the user
  const handleClassChange = (newClass: SpeciesClass | null) => {
    setSelectedClass(newClass);

    // On class change, reset species if it does not belong to class anymore
    if (selectedSpecies != null && newClass != null && selectedSpecies.classId !== newClass?.id) {
      setSelectedSpecies(null);
    }
  };

  return (
    <div className="flex gap-4">
      <Autocomplete
        autocompleteClassName="basis-1/4"
        data={dataClasses?.data}
        name="class"
        label={t("speciesClass")}
        onInputChange={setClassInput}
        onChange={handleClassChange}
        value={selectedClass}
        renderValue={renderSpeciesClass}
        labelTextClassName="first-letter:capitalize"
      />
      <Autocomplete
        ref={refSpecies}
        autocompleteClassName="basis-3/4"
        inputProps={{
          autoFocus: autofocusOnSpecies,
        }}
        data={dataSpecies?.data}
        name="species"
        required
        label={t("speciesSingular")}
        decorationKey="code"
        decorationKeyClassName="w-28"
        onInputChange={setSpeciesInput}
        onChange={setSelectedSpecies}
        onBlur={onBlurSpecies}
        value={selectedSpecies}
        renderValue={renderSpecies}
        renderValueAsOption={renderSpeciesComplete}
        labelTextClassName="first-letter:capitalize"
        hasError={!!errorSpecies}
      />
    </div>
  );
};

export default EntryFormSpecies;
