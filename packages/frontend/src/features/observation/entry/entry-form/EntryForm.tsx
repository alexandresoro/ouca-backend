import { zodResolver } from "@hookform/resolvers/zod";
import { useUserSettings } from "@hooks/useUser";
import type { Entry, UpsertEntryInput } from "@ou-ca/api/models";
import { putV1EntriesIdBody } from "@ou-ca/api/zod/entry.zod";
import { useApiAgeQuery } from "@services/api/age/api-age-queries";
import { useApiNumberEstimateQuery } from "@services/api/number-estimate/api-number-estimate-queries";
import { useApiSexQuery } from "@services/api/sex/api-sex-queries";
import type { FunctionComponent } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import EntryFormBehaviors from "./EntryFormBehaviors";
import EntryFormCharacteristics from "./EntryFormCharacteristics";
import EntryFormComment from "./EntryFormComment";
import EntryFormDistance from "./EntryFormDistance";
import EntryFormEnvironments from "./EntryFormEnvironments";
import EntryFormSpecies from "./EntryFormSpecies";
import type { EntryFormState } from "./EntryFormState";

type EntryFormProps = {
  submitFormText?: string;
  disableIfNoChanges?: boolean;
} & (
  | {
      mode: "update";
      initialData: Entry;
      onSubmitForm?: (entryFormData: UpsertEntryInput, entryId: string) => void;
    }
  | {
      mode: "create";
      initialData: Omit<Entry, "id"> | { inventoryId: string };
      onSubmitForm?: (entryFormData: UpsertEntryInput) => void;
    }
);

const EntryForm: FunctionComponent<EntryFormProps> = (props) => {
  const { submitFormText, disableIfNoChanges } = props;
  const { t } = useTranslation();

  const settings = useUserSettings();

  const { data: defaultAge, isValidating: isValidatingAge } = useApiAgeQuery(settings?.defaultAgeId ?? null, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  });
  const { data: defaultSex, isValidating: isValidatingSex } = useApiSexQuery(settings?.defaultSexId ?? null, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  });
  const { data: defaultNumberEstimate, isValidating: isValidatingNumberEstimate } = useApiNumberEstimateQuery(
    settings?.defaultNumberEstimateId ?? null,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
    },
  );

  const isDefaultAgeReady =
    !isValidatingAge || settings === null || (settings !== undefined && settings.defaultAgeId == null);
  const isDefaultSexReady =
    !isValidatingSex || settings === null || (settings !== undefined && settings.defaultSexId == null);
  const isDefaultNumberEstimateReady =
    !isValidatingNumberEstimate ||
    settings === null ||
    (settings !== undefined && settings.defaultNumberEstimateId == null);

  const areSettingsLoaded =
    settings !== undefined && isDefaultAgeReady && isDefaultSexReady && isDefaultNumberEstimateReady;

  const defaultFormValues = (
    props.mode === "create"
      ? {
          // New entry
          inventoryId: props.initialData.inventoryId,
          speciesId: null,
          sexId: settings?.defaultSexId ?? null,
          ageId: settings?.defaultAgeId ?? null,
          numberEstimateId: settings?.defaultNumberEstimateId ?? null,
          number: settings?.defaultNumber ?? null,
          distanceEstimateId: null,
          distance: null,
          behaviorIds: [],
          environmentIds: [],
          comment: null,
        }
      : {
          // Existing entry
          inventoryId: props.initialData.inventoryId,
          speciesId: props.initialData.species.id,
          sexId: props.initialData.sex.id,
          ageId: props.initialData.age.id,
          numberEstimateId: props.initialData.numberEstimate.id,
          number: props.initialData.number,
          distanceEstimateId: props.initialData.distanceEstimate?.id ?? null,
          distance: props.initialData.distance,
          behaviorIds: props.initialData.behaviors.map((behavior) => behavior.id),
          environmentIds: props.initialData.environments.map((environment) => environment.id),
          comment: props.initialData.comment,
        }
  ) satisfies EntryFormState;

  const {
    register,
    control,
    setValue,
    formState: { isValid, isDirty },
    handleSubmit,
  } = useForm<EntryFormState>({
    resetOptions: { keepDefaultValues: true },
    defaultValues: defaultFormValues,
    values: defaultFormValues,
    // FIX: case where number is not provided but estimate is not "nonCompte" is considered valid and should not
    resolver: zodResolver(putV1EntriesIdBody),
    mode: "onTouched",
  });

  const onSubmit: SubmitHandler<EntryFormState> = (entryFormData) => {
    // FIXME assertion is done thanks to zod resolver, however types are not inferred
    switch (props.mode) {
      case "create":
        props.onSubmitForm?.(entryFormData as unknown as UpsertEntryInput);
        break;
      case "update":
        props.onSubmitForm?.(entryFormData as unknown as UpsertEntryInput, props.initialData.id);
        break;
      default:
        break;
    }
  };

  if (!areSettingsLoaded) {
    return null;
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-4">
          <fieldset className="flex flex-col gap-2.5">
            <div className="card border-2 border-primary rounded-lg px-3 pb-3 shadow-lg">
              <EntryFormSpecies
                control={control}
                initialSpecies={props.mode === "update" ? props.initialData.species : undefined}
                autofocusOnSpecies
              />
            </div>
            <div className="card border-2 border-primary rounded-lg px-3 pb-3 shadow-lg">
              <div className="flex flex-col">
                <EntryFormCharacteristics
                  control={control}
                  register={register}
                  setValue={setValue}
                  defaultNumber={settings?.defaultNumber ?? undefined}
                  defaultNumberEstimate={
                    (props.mode === "update" ? props.initialData.numberEstimate : undefined) ?? defaultNumberEstimate
                  }
                  defaultSex={(props.mode === "update" ? props.initialData.sex : undefined) ?? defaultSex}
                  defaultAge={(props.mode === "update" ? props.initialData.age : undefined) ?? defaultAge}
                />
                {settings?.displayDistance && (
                  <EntryFormDistance
                    control={control}
                    register={register}
                    setValue={setValue}
                    isDistanceDisplayed={settings.displayDistance}
                    defaultDistanceEstimate={
                      (props.mode === "update" ? props.initialData.distanceEstimate : undefined) ?? undefined
                    }
                  />
                )}
              </div>
            </div>
            <div className="card border-2 border-primary rounded-lg px-3 pb-3 shadow-lg">
              <EntryFormBehaviors
                control={control}
                initialBehaviors={(props.mode === "update" ? props.initialData.behaviors : []) ?? []}
              />
            </div>
            <div className="card border-2 border-primary rounded-lg px-3 pb-3 shadow-lg">
              <EntryFormEnvironments
                control={control}
                initialEnvironments={(props.mode === "update" ? props.initialData.environments : []) ?? []}
              />
            </div>
            <div className="card border-2 border-primary rounded-lg px-3 pb-3 shadow-lg">
              <EntryFormComment register={register} control={control} />
            </div>
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
    </>
  );
};

export default EntryForm;
