import Checkbox from "@components/base/Checkbox";
import TextInput from "@components/base/TextInput";
import { zodResolver } from "@hookform/resolvers/zod";
import type { UpsertNumberEstimateInput } from "@ou-ca/api/models";
import { putV1NumberEstimatesIdBody } from "@ou-ca/api/zod/quantity.zod";
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
    resolver: zodResolver(putV1NumberEstimatesIdBody),
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
