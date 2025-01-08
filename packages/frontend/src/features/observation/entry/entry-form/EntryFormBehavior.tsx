import Autocomplete from "@components/base/autocomplete/Autocomplete";
import type { Behavior } from "@ou-ca/api/models";
import { useApiBehaviorsQuery } from "@services/api/behavior/api-behavior-queries";
import { type FunctionComponent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type EntryFormBehaviorProps = {
  selectedBehavior: Behavior | null;
  onUpdateBehavior: (updatedBehavior: Behavior | null) => void;
  index: number;
};

export const renderBehavior = (behavior: Behavior | null): string => {
  return behavior?.libelle ?? "";
};

const EntryFormBehavior: FunctionComponent<EntryFormBehaviorProps> = ({
  selectedBehavior,
  onUpdateBehavior,
  index,
}) => {
  const { t } = useTranslation();

  const [behaviorInput, setBehaviorInput] = useState("");

  useEffect(() => {
    // When the selected behavior changes, update the input
    setBehaviorInput(renderBehavior(selectedBehavior));
  }, [selectedBehavior]);

  const { data: dataBehaviors } = useApiBehaviorsQuery(
    {
      q: behaviorInput,
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
      data={dataBehaviors?.data}
      name={`name-${index}`}
      label={t("entryForm.behaviorWithIndex", { index: index + 1 })}
      decorationKey="code"
      decorationKeyClassName="w-20"
      onInputChange={setBehaviorInput}
      onChange={onUpdateBehavior}
      value={selectedBehavior}
      renderValue={renderBehavior}
      labelTextClassName="first-letter:capitalize"
    />
  );
};

export default EntryFormBehavior;
