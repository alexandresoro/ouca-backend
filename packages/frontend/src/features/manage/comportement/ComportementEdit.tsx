import TextInput from "@components/base/TextInput";
import FormSelect from "@components/form/FormSelect";
import { zodResolver } from "@hookform/resolvers/zod";
import { BehaviorNicheur, type UpsertBehaviorInput } from "@ou-ca/api/models";
import { putV1BehaviorsIdBody } from "@ou-ca/api/zod/behavior.zod";
import type { FunctionComponent } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import EntityUpsertFormActionButtons from "../common/EntityUpsertFormActionButtons";

type ComportementEditProps = {
  defaultValues?: UpsertBehaviorInput | null;
  onCancel: () => void;
  onSubmit: SubmitHandler<UpsertBehaviorInput>;
};

const ComportementEdit: FunctionComponent<ComportementEditProps> = (props) => {
  const { defaultValues, onCancel, onSubmit } = props;

  const { t } = useTranslation();

  const {
    register,
    control,
    formState: { isValid, isDirty, errors },
    handleSubmit,
  } = useForm<UpsertBehaviorInput>({
    defaultValues: defaultValues ?? {
      code: "",
      libelle: "",
      nicheur: null,
    },
    resolver: zodResolver(putV1BehaviorsIdBody),
    mode: "onTouched",
  });

  const breedingStatuses = [
    {
      label: "---",
      value: null,
    },
    {
      label: t("breedingStatus.possible"),
      value: BehaviorNicheur.possible,
    },
    {
      label: t("breedingStatus.probable"),
      value: BehaviorNicheur.probable,
    },
    {
      label: t("breedingStatus.certain"),
      value: BehaviorNicheur.certain,
    },
  ] satisfies { label: string; value: BehaviorNicheur }[];

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextInput autoFocus label={t("code")} type="text" required {...register("code")} hasError={!!errors.code} />

      <TextInput label={t("label")} type="text" required {...register("libelle")} hasError={!!errors.libelle} />

      <FormSelect
        name="nicheur"
        label={t("breeding")}
        required
        control={control}
        data={breedingStatuses}
        by="value"
        renderValue={({ label }) => label}
      />

      <EntityUpsertFormActionButtons className="mt-6" onCancelClick={onCancel} disabled={!isValid || !isDirty} />
    </form>
  );
};

export default ComportementEdit;
