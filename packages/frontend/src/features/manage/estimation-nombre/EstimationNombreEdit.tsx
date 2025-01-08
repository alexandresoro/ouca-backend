import Checkbox from "@components/base/Checkbox";
import TextInput from "@components/base/TextInput";
import { zodResolver } from "@hookform/resolvers/zod";
import type { UpsertNumberEstimateInput } from "@ou-ca/api/models";
import { upsertNumberEstimateInput } from "@ou-ca/common/api/number-estimate";
import type { FunctionComponent } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import EntityUpsertFormActionButtons from "../common/EntityUpsertFormActionButtons";

type EstimationNombreEditProps = {
  defaultValues?: UpsertNumberEstimateInput | null;
  onCancel?: () => void;
  onSubmit: SubmitHandler<UpsertNumberEstimateInput>;
};

const EstimationNombreEdit: FunctionComponent<EstimationNombreEditProps> = (props) => {
  const { defaultValues, onCancel, onSubmit } = props;

  const { t } = useTranslation();

  const {
    register,
    formState: { isValid, isDirty, errors },
    handleSubmit,
  } = useForm<UpsertNumberEstimateInput>({
    defaultValues: defaultValues ?? {
      libelle: "",
      nonCompte: false,
    },
    resolver: zodResolver(upsertNumberEstimateInput),
    mode: "onTouched",
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextInput
        autoFocus
        label={t("label")}
        type="text"
        required
        {...register("libelle")}
        hasError={!!errors.libelle}
      />
      <Checkbox label={t("undefinedNumber")} {...register("nonCompte")} />
      <EntityUpsertFormActionButtons className="mt-6" onCancelClick={onCancel} disabled={!isValid || !isDirty} />
    </form>
  );
};

export default EstimationNombreEdit;
