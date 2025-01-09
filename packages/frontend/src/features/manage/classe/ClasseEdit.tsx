import TextInput from "@components/base/TextInput";
import { zodResolver } from "@hookform/resolvers/zod";
import type { UpsertSpeciesClassInput } from "@ou-ca/api/models";
import { putV1ClassesIdBody } from "@ou-ca/api/zod/species.zod";
import type { FunctionComponent } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import EntityUpsertFormActionButtons from "../common/EntityUpsertFormActionButtons";

type ClasseEditProps = {
  defaultValues?: UpsertSpeciesClassInput | null;
  onCancel: () => void;
  onSubmit: SubmitHandler<UpsertSpeciesClassInput>;
};

const ClasseEdit: FunctionComponent<ClasseEditProps> = (props) => {
  const { defaultValues, onCancel, onSubmit } = props;

  const { t } = useTranslation();

  const {
    register,
    formState: { isValid, isDirty, errors },
    handleSubmit,
  } = useForm<UpsertSpeciesClassInput>({
    defaultValues: defaultValues ?? {
      libelle: "",
    },
    resolver: zodResolver(putV1ClassesIdBody),
    mode: "onTouched",
  });

  return (
    <>
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
    </>
  );
};

export default ClasseEdit;
