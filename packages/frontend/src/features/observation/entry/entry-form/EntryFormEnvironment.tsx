import Autocomplete from "@components/base/autocomplete/Autocomplete";
import type { Environment } from "@ou-ca/api/models";
import { useApiEnvironmentsQuery } from "@services/api/environment/api-environment-queries";
import { type FunctionComponent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type EntryFormEnvironmentProps = {
  selectedEnvironment: Environment | null;
  onUpdateEnvironment: (updatedEnvironment: Environment | null) => void;
  index: number;
};

export const renderEnvironment = (environment: Environment | null): string => {
  return environment?.libelle ?? "";
};

const EntryFormEnvironment: FunctionComponent<EntryFormEnvironmentProps> = ({
  selectedEnvironment,
  onUpdateEnvironment,
  index,
}) => {
  const { t } = useTranslation();

  const [environmentInput, setEnvironmentInput] = useState("");

  useEffect(() => {
    // When the selected environment changes, update the input
    setEnvironmentInput(renderEnvironment(selectedEnvironment));
  }, [selectedEnvironment]);

  const { data: dataEnvironments } = useApiEnvironmentsQuery(
    {
      q: environmentInput,
      pageSize: 5,
    },
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnMount: true,
    },
  );

  return (
    <Autocomplete
      data={dataEnvironments?.data}
      name={`name-${index}`}
      label={t("entryForm.environmentWithIndex", { index: index + 1 })}
      decorationKey="code"
      decorationKeyClassName="w-20"
      onInputChange={setEnvironmentInput}
      onChange={onUpdateEnvironment}
      value={selectedEnvironment}
      renderValue={renderEnvironment}
      labelTextClassName="first-letter:capitalize"
    />
  );
};

export default EntryFormEnvironment;
