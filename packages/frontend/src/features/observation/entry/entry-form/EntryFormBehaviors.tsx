import Autocomplete from "@components/base/autocomplete/Autocomplete";
import type { Behavior } from "@ou-ca/api/models";
import { useApiBehaviorsQuery } from "@services/api/behavior/api-behavior-queries";
import { findFirstFocusableElement } from "@utils/dom/find-first-focusable-element";
import { type FunctionComponent, useEffect, useRef, useState } from "react";
import { type UseFormReturn, useController } from "react-hook-form";
import { useTranslation } from "react-i18next";
import EntryFormBehavior, { renderBehavior } from "./EntryFormBehavior";
import type { EntryFormState } from "./EntryFormState";

type EntryFormBehaviorsProps = Pick<UseFormReturn<EntryFormState>, "control"> & {
  initialBehaviors?: Behavior[];
};

const EntryFormBehaviors: FunctionComponent<EntryFormBehaviorsProps> = ({ control, initialBehaviors }) => {
  const { t } = useTranslation();

  const [selectedBehaviors, setSelectedBehaviors] = useState<Behavior[]>(initialBehaviors ?? []);

  const [newBehaviorInput, setNewBehaviorInput] = useState("");
  const newBehaviorRef = useRef<HTMLElement>(null);

  const {
    field: { ref: refBehavior, onChange: onUpdateBehaviorsForm },
  } = useController({
    name: "behaviorIds",
    control,
  });

  useEffect(() => {
    // When the selected behaviors change, update the form value
    onUpdateBehaviorsForm(selectedBehaviors.map(({ id }) => id));
  }, [selectedBehaviors, onUpdateBehaviorsForm]);

  const { data: dataBehaviors } = useApiBehaviorsQuery(
    {
      q: newBehaviorInput,
      pageSize: 5,
    },
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnMount: true,
    },
  );

  const handleUpdatedBehavior = (newBehavior: Behavior | null, index: number) => {
    if (newBehavior) {
      setSelectedBehaviors((currentSelectedBehaviors) =>
        currentSelectedBehaviors.map((selectedBehavior, i) => {
          return index === i ? newBehavior : selectedBehavior;
        }),
      );
    } else {
      // Remove behavior from the list
      setSelectedBehaviors((currentSelectedBehaviors) =>
        currentSelectedBehaviors.filter((_, i) => {
          return index !== i;
        }),
      );
    }
  };

  const handleNewAddedBehavior = (newBehavior: Behavior | null) => {
    if (newBehavior) {
      setSelectedBehaviors((currentSelectedBehaviors) => [...currentSelectedBehaviors, newBehavior]);
    }
  };

  const handleFocusToNewBehavior = () => {
    findFirstFocusableElement(newBehaviorRef.current, "input")?.focus();
  };

  return (
    <>
      <div ref={refBehavior} className="flex flex-wrap gap-x-4 justify-start">
        {selectedBehaviors.map((selectedBehavior, index) => {
          return (
            <div key={`${selectedBehavior.id}-${index}`} className="basis-96">
              <EntryFormBehavior
                selectedBehavior={selectedBehaviors[index]}
                onUpdateBehavior={(newBehavior) => {
                  handleUpdatedBehavior(newBehavior, index);
                }}
                index={index}
              />
            </div>
          );
        })}
        <Autocomplete
          ref={newBehaviorRef}
          autocompleteClassName="basis-96"
          data={dataBehaviors?.data}
          name="behavior-new"
          label={t("entryForm.behaviorWithIndex", { index: selectedBehaviors.length + 1 })}
          decorationKey="code"
          decorationKeyClassName="w-20"
          onInputChange={setNewBehaviorInput}
          onChange={handleNewAddedBehavior}
          value={null}
          renderValue={renderBehavior}
          labelTextClassName="first-letter:capitalize"
        />
      </div>
      <div tabIndex={newBehaviorInput.length ? 0 : -1} onFocus={handleFocusToNewBehavior} />
    </>
  );
};

export default EntryFormBehaviors;
