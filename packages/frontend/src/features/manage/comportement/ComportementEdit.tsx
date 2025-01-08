import TextInput from "@components/base/TextInput";
import FormSelect from "@components/form/FormSelect";
import { zodResolver } from "@hookform/resolvers/zod";
import type { UpsertBehaviorInput } from "@ou-ca/api/models";
import { upsertBehaviorInput } from "@ou-ca/common/api/behavior";
import { CERTAIN, type NicheurCode, POSSIBLE, PROBABLE } from "@ou-ca/common/types/nicheur.model";
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
    resolver: zodResolver(upsertBehaviorInput),
    mode: "onTouched",
  });

  const breedingStatuses = [
    {
      label: "---",
      value: null,
    },
    {
      label: t("breedingStatus.possible"),
      value: POSSIBLE,
    },
    {
      label: t("breedingStatus.probable"),
      value: PROBABLE,
    },
    {
      label: t("breedingStatus.certain"),
      value: CERTAIN,
    },
  ] satisfies { label: string; value: NicheurCode | null }[];

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
