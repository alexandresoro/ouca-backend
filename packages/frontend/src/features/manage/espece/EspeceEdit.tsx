import TextInput from "@components/base/TextInput";
import FormSelect from "@components/form/FormSelect";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNotifications } from "@hooks/useNotifications";
import type { UpsertSpeciesInput } from "@ou-ca/api/models";
import { putV1SpeciesIdBody } from "@ou-ca/api/zod/species.zod";
import { useApiSpeciesClassesQuery } from "@services/api/species-class/api-species-class-queries";
import type { FunctionComponent } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import EntityUpsertFormActionButtons from "../common/EntityUpsertFormActionButtons";

type EspeceEditProps = {
  defaultValues?: (Omit<UpsertSpeciesInput, "classId"> & { classId?: string }) | null;
  onCancel: () => void;
  onSubmit: SubmitHandler<UpsertSpeciesInput>;
};

const EspeceEdit: FunctionComponent<EspeceEditProps> = (props) => {
  const { defaultValues, onCancel, onSubmit } = props;

  const { t } = useTranslation();

  const { displayNotification } = useNotifications();

  const {
    register,
    control,
    formState: { isValid, isDirty, errors },
    handleSubmit,
  } = useForm<UpsertSpeciesInput>({
    defaultValues: defaultValues ?? {
      code: "",
      nomFrancais: "",
      nomLatin: "",
      classId: undefined,
    },
    resolver: zodResolver(putV1SpeciesIdBody),
    mode: "onTouched",
  });

  const { data: classes, isLoading: loadingClasses } = useApiSpeciesClassesQuery(
    {
      orderBy: "libelle",
      sortOrder: "asc",
    },
    {
      onError: () => {
        displayNotification({
          type: "error",
          message: t("retrieveGenericError"),
        });
      },
    },
  );

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormSelect
          autoFocus
          name="classId"
          label={t("speciesClass")}
          required
          control={control}
          data={classes?.data}
          renderValue={({ libelle }) => libelle}
        />

        <TextInput label={t("speciesCode")} type="text" required {...register("code")} hasError={!!errors.code} />
        <TextInput
          label={t("localizedName")}
          type="text"
          required
          {...register("nomFrancais")}
          hasError={!!errors.nomFrancais}
        />
        <TextInput
          label={t("scientificName")}
          type="text"
          required
          {...register("nomLatin")}
          hasError={!!errors.nomLatin}
        />

        <EntityUpsertFormActionButtons
          className="mt-6"
          onCancelClick={onCancel}
          disabled={loadingClasses || !isValid || !isDirty}
        />
      </form>
    </>
  );
};

export default EspeceEdit;
