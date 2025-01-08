import Autocomplete from "@components/base/autocomplete/Autocomplete";
import AutocompleteMultiple from "@components/base/autocomplete/AutocompleteMultiple";
import type { Observer } from "@ou-ca/api/models";
import { useApiObserversQuery } from "@services/api/observer/api-observer-queries";
import { type FunctionComponent, useEffect, useState } from "react";
import { type UseFormReturn, useController } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { InventoryFormState } from "./InventoryFormState";

type InventoryFormObserverProps = Pick<UseFormReturn<InventoryFormState>, "control"> & {
  defaultObserver?: Observer;
  defaultAssociates?: Observer[];
  autofocusOnObserver?: boolean;
  areAssociesDisplayed?: boolean;
};

const renderObserver = (observer: Observer | null): string => {
  return observer?.libelle ?? "";
};

const InventoryFormObserver: FunctionComponent<InventoryFormObserverProps> = ({
  control,
  defaultObserver,
  defaultAssociates,
  autofocusOnObserver,
  areAssociesDisplayed,
}) => {
  const { t } = useTranslation();

  const [observateurInput, setObservateurInput] = useState("");
  const [selectedObserver, setSelectedObserver] = useState<Observer | null>(defaultObserver ?? null);

  const [associatesInput, setAssociatesInput] = useState("");
  const [selectedAssociates, setSelectedAssociates] = useState<Observer[]>(defaultAssociates ?? []);

  const {
    field: { ref: refObserver, onChange: onChangeObserverForm, onBlur: onBlurObserver },
    fieldState: { error: errorObserverId },
  } = useController({
    name: "observerId",
    control,
  });

  const {
    field: { ref: refAssociates, onChange: onChangeAssociatesForm, onBlur: onBlurAssociates },
    fieldState: { error: errorAssociateIds },
  } = useController({
    name: "associateIds",
    control,
  });

  useEffect(() => {
    // When the selected observer changes, update both the input and the form value
    setObservateurInput(renderObserver(selectedObserver));
    onChangeObserverForm(selectedObserver?.id ?? null);
  }, [selectedObserver, onChangeObserverForm]);

  useEffect(() => {
    onChangeAssociatesForm(selectedAssociates?.map((associate) => associate.id) ?? []);
  }, [selectedAssociates, onChangeAssociatesForm]);

  const { data: dataObservers } = useApiObserversQuery(
    {
      q: observateurInput,
      pageSize: 5,
    },
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnMount: true,
    },
  );

  const { data: dataAssociateObservers } = useApiObserversQuery(
    {
      q: associatesInput,
      pageSize: 5,
    },
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnMount: true,
    },
    {
      paused: !areAssociesDisplayed,
    },
  );

  return (
    <>
      <Autocomplete
        ref={refObserver}
        inputProps={{
          autoFocus: autofocusOnObserver,
        }}
        data={dataObservers?.data}
        name="observer"
        required
        label={t("observer")}
        onInputChange={setObservateurInput}
        onChange={setSelectedObserver}
        onBlur={onBlurObserver}
        value={selectedObserver}
        renderValue={renderObserver}
        labelTextClassName="first-letter:capitalize"
        hasError={!!errorObserverId}
      />
      {areAssociesDisplayed && (
        <AutocompleteMultiple
          ref={refAssociates}
          data={dataAssociateObservers?.data ?? []}
          name="associateObservers"
          label={t("associateObservers_other")}
          onInputChange={setAssociatesInput}
          onChange={setSelectedAssociates}
          onBlur={onBlurAssociates}
          values={selectedAssociates}
          renderValue={({ libelle }) => libelle}
          labelTextClassName="first-letter:capitalize"
          hasError={!!errorAssociateIds}
        />
      )}
    </>
  );
};

export default InventoryFormObserver;
