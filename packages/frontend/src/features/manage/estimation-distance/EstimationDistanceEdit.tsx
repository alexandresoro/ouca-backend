import TextInput from "@components/base/TextInput";
import { zodResolver } from "@hookform/resolvers/zod";
import type { UpsertDistanceEstimateInput } from "@ou-ca/api/models";
import { putV1DistanceEstimatesIdBody } from "@ou-ca/api/zod/distance.zod";
import type { FunctionComponent } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import EntityUpsertFormActionButtons from "../common/EntityUpsertFormActionButtons";

type EstimationDistanceEditProps = {
  defaultValues?: UpsertDistanceEstimateInput | null;
  onCancel: () => void;
  onSubmit: SubmitHandler<UpsertDistanceEstimateInput>;
};

const EstimationDistanceEdit: FunctionComponent<EstimationDistanceEditProps> = (props) => {
  const { defaultValues, onCancel, onSubmit } = props;

  const { t } = useTranslation();

  const {
    register,
    formState: { isValid, isDirty, errors },
    handleSubmit,
  } = useForm<UpsertDistanceEstimateInput>({
    defaultValues: defaultValues ?? {
      libelle: "",
    },
    resolver: zodResolver(putV1DistanceEstimatesIdBody),
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
      <EntityUpsertFormActionButtons className="mt-6" onCancelClick={onCancel} disabled={!isValid || !isDirty} />
    </form>
  );
};

export default EstimationDistanceEdit;
