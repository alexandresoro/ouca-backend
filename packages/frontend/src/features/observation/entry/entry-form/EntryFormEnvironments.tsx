import Autocomplete from "@components/base/autocomplete/Autocomplete";
import type { Environment } from "@ou-ca/api/models";
import { useApiEnvironmentsQuery } from "@services/api/environment/api-environment-queries";
import { findFirstFocusableElement } from "@utils/dom/find-first-focusable-element";
import { type FunctionComponent, useEffect, useRef, useState } from "react";
import { type UseFormReturn, useController } from "react-hook-form";
import { useTranslation } from "react-i18next";
import EntryFormEnvironment, { renderEnvironment } from "./EntryFormEnvironment";
import type { EntryFormState } from "./EntryFormState";

type EntryFormEnvironmentsProps = Pick<UseFormReturn<EntryFormState>, "control"> & {
  initialEnvironments?: Environment[];
};

const EntryFormEnvironments: FunctionComponent<EntryFormEnvironmentsProps> = ({ control, initialEnvironments }) => {
  const { t } = useTranslation();

  const [selectedEnvironments, setSelectedEnvironments] = useState<Environment[]>(initialEnvironments ?? []);

  const [newEnvironmentInput, setNewEnvironmentInput] = useState("");
  const newEnvironmentRef = useRef<HTMLElement>(null);

  const {
    field: { ref: refEnvironment, onChange: onUpdateEnvironmentsForm },
  } = useController({
    name: "environmentIds",
    control,
  });

  useEffect(() => {
    // When the selected environments change, update the form value
    onUpdateEnvironmentsForm(selectedEnvironments.map(({ id }) => id));
  }, [selectedEnvironments, onUpdateEnvironmentsForm]);

  const { data: dataEnvironments } = useApiEnvironmentsQuery(
    {
      q: newEnvironmentInput,
      pageSize: 5,
    },
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnMount: true,
    },
  );

  const handleUpdatedEnvironment = (newEnvironment: Environment | null, index: number) => {
    if (newEnvironment) {
      setSelectedEnvironments((currentSelectedEnvironments) =>
        currentSelectedEnvironments.map((selectedEnvironment, i) => {
          return index === i ? newEnvironment : selectedEnvironment;
        }),
      );
    } else {
      // Remove environment from the list
      setSelectedEnvironments((currentSelectedEnvironments) =>
        currentSelectedEnvironments.filter((_, i) => {
          return index !== i;
        }),
      );
    }
  };

  const handleNewAddedEnvironment = (newEnvironment: Environment | null) => {
    if (newEnvironment) {
      setSelectedEnvironments((currentSelectedEnvironments) => [...currentSelectedEnvironments, newEnvironment]);
    }
  };

  const handleFocusToNewEnvironment = () => {
    findFirstFocusableElement(newEnvironmentRef.current, "input")?.focus();
  };

  return (
    <>
      <div ref={refEnvironment} className="flex flex-wrap gap-x-4 justify-start">
        {selectedEnvironments.map((selectedEnvironment, index) => {
          return (
            <div key={`${selectedEnvironment.id}-${index}`} className="basis-96">
              <EntryFormEnvironment
                selectedEnvironment={selectedEnvironments[index]}
                onUpdateEnvironment={(newEnvironment) => {
                  handleUpdatedEnvironment(newEnvironment, index);
                }}
                index={index}
              />
            </div>
          );
        })}
        <Autocomplete
          ref={newEnvironmentRef}
          autocompleteClassName="basis-96"
          data={dataEnvironments?.data}
          name="environment-new"
          label={t("entryForm.environmentWithIndex", { index: selectedEnvironments.length + 1 })}
          decorationKey="code"
          decorationKeyClassName="w-20"
          onInputChange={setNewEnvironmentInput}
          onChange={handleNewAddedEnvironment}
          value={null}
          renderValue={renderEnvironment}
          labelTextClassName="first-letter:capitalize"
        />
      </div>
      <div tabIndex={newEnvironmentInput.length ? 0 : -1} onFocus={handleFocusToNewEnvironment} />
    </>
  );
};

export default EntryFormEnvironments;
